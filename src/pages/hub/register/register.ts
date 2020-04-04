import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, AlertController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// Providers
import { ConfigProvider } from '../../../providers/config/config';
import { DerivationPathHelperProvider } from '../../../providers/derivation-path-helper/derivation-path-helper';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../../providers/popup/popup';
import { ProfileProvider } from '../../../providers/profile/profile';
import { LoginProvider } from '../../../providers/hub/service';
import { PushNotificationsProvider } from '../../../providers/push-notifications/push-notifications';
import { 
  WalletProvider
} from '../../../providers/wallet/wallet';

import * as _ from 'lodash';
import { ForgotpassPage } from './../forgotpass/forgotpass';
import { TransactionsPage } from '../../hub-transactions/transactions/transactions';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage implements OnInit {
 
  private createForm: FormGroup;
  private defaults;
  private tc: number;
  private derivationPathByDefault: string;
  private derivationPathForTestnet: string;
  private phone: boolean;
  private passwordkey :boolean;
  private passwordkeysave:boolean;
  private otp :boolean;
  private Register = "Proceed"
  public copayers: number[];
  public signatures: number[];
  public showAdvOpts: boolean;
  public seedOptions;
  public isShared: boolean;
  public title: string;
  public okText: string;
  public cancelText: string;
  public data;
  public username = localStorage.getItem('saveuserlogin');
  public password = localStorage.getItem('saveuserpassword');
  public token;
  public passkey;
  public message = "";
  public savepassword = false;
  public checkpassword;
  public userid = "";
  public arrowforward = false;

  constructor(
    public http: HttpClient,
    private navCtrl: NavController,
    private navParams: NavParams,
    private fb: FormBuilder,
    private profileProvider: ProfileProvider,
    private loginProvider: LoginProvider,
    private configProvider: ConfigProvider,
    private derivationPathHelperProvider: DerivationPathHelperProvider,
    private popupProvider: PopupProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private logger: Logger,
    private walletProvider: WalletProvider,
    private translate: TranslateService,
    private events: Events,
    private pushNotificationsProvider: PushNotificationsProvider,
    public alertCtrl: AlertController
  ) {
    this.phone = true;
    this.passwordkey = false;
    this.passwordkeysave = false;
    this.otp = false;

    if(localStorage.getItem('saveuserlogin') != ""){
      this.savepassword = true;
      this.checkpassword = true;
    }else{
      this.checkpassword = false;
    }
    this.okText = this.translate.instant('Ok');
    this.cancelText = this.translate.instant('Cancel');
    this.isShared = this.navParams.get('isShared');
    this.defaults = this.configProvider.getDefaults();
    this.tc = this.isShared ? this.defaults.wallet.totalCopayers : 1;

    this.copayers = _.range(2, this.defaults.limits.totalCopayers + 1);
    this.derivationPathByDefault = this.derivationPathHelperProvider.default;
    this.derivationPathForTestnet = this.derivationPathHelperProvider.defaultTestnet;
    this.showAdvOpts = false;

    this.createForm = this.fb.group({
      phone_number: [this.username],
      password: [this.password],
      otp: [null]
    });

    // if(this.pass != null || this.pass != ""){
    //   if(this.Register == "login"){
    //     this.arrowforward = true;
    //   }
    // }
  }

  ngOnInit() {
  }

  // https://api.customer-portal.getcns.tech/confirm
  // pn: 14438134964 pass: 123456  12404958086
  get uname(): string {
    if(this.createForm.value['phone_number'].length < 11){
      return "1"+this.createForm.value['phone_number'];
    }else{
      return this.createForm.value['phone_number'];
    }
  }

  get pass(): string {
    return this.createForm.value['password'];
  }

  get ootp(): string {
    return this.createForm.value['otp'];
  }

  public showATMLocationsError(message) {
    const alert = this.alertCtrl.create({
      title: 'Some  errors Occured',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  public successmessae(message) {
    const alert = this.alertCtrl.create({
      title: 'Successfull',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  onChangeps(data) {
    if(data.target.value == "" || data.target.value == null){
        this.arrowforward = false;
    }else{
      this.arrowforward = true;
    }
    console.log(data.target.value);        
  }

  //404 => no custirmer record
  //409 => 
  public loginToWallet(){
    console.log(this.uname);

    if(this.Register === "Register"){
        console.log(this.userid+' '+this.ootp+' '+this.pass);
        const data2 = JSON.stringify({"user_id": this.userid, "code":this.ootp, "password":this.pass});
        this.loginProvider.updateUser(data2)
        .subscribe((res2:HttpResponse<any>) => {
          const response2 = res2;
          this.successmessae("Registration is successfull, please login");
          this.Register = "Proceed";
          this.passwordkey = false;
          this.passwordkeysave = false;
          this.phone = true;
          this.otp = false;
          return;
        }, (err) => {
          this.showATMLocationsError(err.error.message);
          // this.message = "there was an issue"
          const error = err;
          console.log(error);
      });
      return;
    } 

    if(this.Register === "Confirm"){
        this.passwordkeysave = false;
        this.Register = "Register";
        this.passwordkey = true;
        this.phone = false;
        this.otp = false;
       return;
    }

    if(this.Register === "login"){
      this.data = {"phone_number":this.uname, "password":this.pass}
      console.log(this.data);
      this.loginProvider.login(this.uname, this.pass, '/app-auth')
        .subscribe((res:HttpResponse<any>) => {
          const response = res;
          this.token = res.body;
          console.log(this.token);
          if(response.status === 200 || response.status === 202){
            localStorage.setItem('token', this.token);
            localStorage.setItem('username', this.uname);
            localStorage.setItem('password', this.pass);
            console.log("user logged in")
            console.log(res.headers);
            if(this.savepassword == true){
              localStorage.setItem('saveuserlogin', this.uname);
              localStorage.setItem('saveuserpassword', this.pass);
              localStorage.setItem('issessionactive', "yes");
            }else{
              localStorage.setItem('saveuserlogin', '');
              localStorage.setItem('saveuserpassword', '');
            }

            this.navCtrl.setRoot(TransactionsPage);
          }else if(response.status == 201){
              const data = JSON.stringify({"phone_number":this.uname});
              this.loginProvider.register(this.data)
              .subscribe((res) => {
                const response = res;
                this.phone = false;
                this.otp = true;
                this.Register = "Register";
                console.log(response); 
              }, (err) => {
                const error = err;
                console.log(error);
              });
              console.log("create  account")
          }else if(response.status == 401){
              console.log(response)
              this.showATMLocationsError("incorrect password");
          }else{
              console.log("unexpected error " + response)
          }
        }, (err) => {
          const error = err;
          if(error.status == 404 || error.status == 201){
            console.log("create  account error")
          }else if(error.status == 401){
             this.showATMLocationsError(error.error.message);
              console.log(error)
          }else{
              console.log(error)
          }
        });
       return;
    }

    // if(this.Register === "proceed"){
   
    // }

    this.loginProvider.check(this.uname)
        .subscribe((res:HttpResponse<any>) => {
          const response = res;
           if(response.status == 200){
            if(this.pass != null || this.pass != ""){
              this.arrowforward = true;
            }
            this.Register = "login";
            this.passwordkey = true;
            this.passwordkeysave = true;
            this.phone = false;
            this.otp = false;
          }else if(response.status == 404){
            // this.showATMLocationsError(response.body.message);
            const data = JSON.stringify({"phone_number":this.uname});
            this.loginProvider.register(data)
            .subscribe((res:HttpResponse<any>) => {
              const data = JSON.stringify({"phone_number":this.uname});
              const response = res;
              this.userid = response.body.id;
              this.Register = "Confirm";
              this.passwordkey = false;
              this.phone = false;
              this.otp = true;
              console.log(response);
            }, (err) => {
              // this.message = "there was an issue"
              const error = err;
              this.showATMLocationsError(error.error.message);
              console.log(error);
            });
            // this.Register = "Register";
            // this.passwordkey = false;
            // this.passwordkeysave = false;
            // this.phone = false;
            // this.otp = true;
          }else{
              console.log(response)
          }
          // 2404958086
     }, (err) => {
          const error = err;
          console.log(error)
          if(error.status == 200){
            this.Register = "login";
            console.log("create  account error")
            this.passwordkey = true;
            this.phone = false;
            this.otp = false;
          }else if(error.status == 404){
            // this.showATMLocationsError(error.error.message);
            const data = JSON.stringify({"phone_number":this.uname});
            this.loginProvider.register(data)
            .subscribe((res:HttpResponse<any>) => {
              const data = JSON.stringify({"phone_number":this.uname});
              const response = res;
              this.userid = response.body.id;
              this.Register = "Confirm";
              this.passwordkey = false;
              this.phone = false;
              this.otp = true;
              console.log(response);
            }, (err) => {
              // this.message = "there was an issue"
              const error = err;
              this.showATMLocationsError(error.error.message);
              console.log(error);
            });
          }else{
              console.log(error)
          }
     });

  }

  public goToregister(){
     this.navCtrl.push(RegisterPage);
     console.log("going to register")
  }

  public goTofp(){
    // this.navCtrl.setRoot(ForgotpassPage);
    this.navCtrl.push(ForgotpassPage);
  }

  public datachanged(e:any){
    console.log(e);
    console.log(e.checked);
    this.savepassword = e.checked;
  } 
}
