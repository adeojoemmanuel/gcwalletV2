import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  WalletOptions,
  WalletProvider
} from '../../../providers/wallet/wallet';

import * as _ from 'lodash';
import { RegisterPage } from './../register/register';
import { LoginPage } from './../login';
import { TransactionsPage } from '../../hub-transactions/transactions/transactions';


@Component({
  selector: 'page-forgotpass',
  templateUrl: 'forgotpass.html'
})
export class ForgotpassPage implements OnInit {
  /* For compressed keys, m*73 + n*34 <= 496 */
 /* For compressed keys, m*73 + n*34 <= 496 */

  private createForm: FormGroup;
  private defaults;
  private tc: number;
  private derivationPathByDefault: string;
  private derivationPathForTestnet: string;
  private phone = true;
  private passwordkey = false;
  private otp = false;
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
  public username = "";
  public password = "";
  public token;
  public passkey;
  public message = "";
  public userid = "";
  public savepassword = false;

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
  }

  ngOnInit() {
  }

  // https://api.customer-portal.getcns.tech/confirm
  // pn: 14438134964 pass: 123456
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

  //404 => no custirmer record
  //409 => 
  public loginToWallet(){
    console.log(this.uname);
    if(this.Register === "Reset"){
        const data2 = JSON.stringify({"user_id": this.userid, "code":this.ootp, "password":this.pass});
        this.loginProvider.updateUser(data2)
        .subscribe((res2:HttpResponse<any>) => {
          const response2 = res2;
          this.successmessae("Password reset successfull");
          this.navCtrl.setRoot(RegisterPage);
          // this.Register = "Proceed";
          // this.passwordkey = false;
          // this.phone = true;
          // this.otp = false;
          return;
        }, (err) => {
          this.showATMLocationsError(err.error.message);
          // this.message = "there was an issue"
          const error = err;
          console.log(error);
      });
        // this.navCtrl.push(TransactionsPage);
        // console.log(response);
      return;
    } 

    if(this.Register === "Confirm"){
        this.Register = "Reset";
        this.passwordkey = true;
        this.phone = false;
        this.otp = false;
       return;
    }
    const resetdata = JSON.stringify({"phone_number":this.uname})
    this.loginProvider.reset(resetdata)
        .subscribe((res:HttpResponse<any>) => {
          const response = res;
          console.log(response)
           if(response.status == 200){
            this.Register = "Confirm";
            this.userid = response.body.id;
            this.passwordkey = false;
            this.phone = false;
            this.otp = true;
          }else if(response.status == 404){
            // this.showATMLocationsError(response.body.message);
            this.Register = "Register";
            this.passwordkey = false;
            this.phone = false;
            this.otp = true;
          }else{
              this.showATMLocationsError(response.body.message);
          }
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
            this.showATMLocationsError(error.error.message);
            // this.Register = "Register";
            // this.passwordkey = false;
            // this.phone = false;
            // this.otp = true;
          }else{
              this.showATMLocationsError(error.error.message);
          }
     });

  }

  public goToregister(){
     this.navCtrl.push(RegisterPage);
     console.log("going to register")
  }

  public goTofp(){
    this.navCtrl.push(ForgotpassPage);
  }

  public datachanged(e:any){
    console.log(e);
    console.log(e.checked);
    this.savepassword = e.checked;
  } 
}
