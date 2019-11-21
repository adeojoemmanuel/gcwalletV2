import { Component } from '@angular/core';
import { NavController, MenuController, AlertController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';
import { Camera } from '@ionic-native/camera';
import { LoginProvider } from '../../../providers/hub/service';

// import { PopupProvider } from '../../providers/popup/popup';

/**
 * Generated class for the AtmLocationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-report-details',
  templateUrl: 'report-details.html'
})

export class ReportDetailsPage {
  private data: any;
  private googleMapAPIKey: string = 'AIzaSyB43uqfV0AdFqBJ-MasTqVwtuNLFasOxPg';
  public googleUrl: string;
  private encodedAddress: string;
  public gcATMName: string = 'GetCoins Bitcoin ATM';
  public googleDirectionUrl: string;
  public encodedDirection: string;
  public googleDirUrl: string;
  // public myLocation: object = { lat: 41.234648, lng: -82.254409 }; // ** for testing purpose
  public myLocation: object;
  public encodedMyLocation: string;
  public travelMode: string = 'driving';
  public address: string;
  public hours: string;
  public lat;
  public lng;
  public locid;
  public transdata;
  public userid;
  public picture;
  public base64Image;
  public onsubmitform;
  public listoption;
  public files;
  public trasacid;
  // private menu: MenuController
  public pages: Array<{title: string, component: any,icon:any}>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    private translate: TranslateService,
    private externalLinkProvider: ExternalLinkProvider,
    // private popupProvider: PopupProvider,
    private iab: InAppBrowser, // private geo: Geolocation,
    private menu: MenuController,
    public alertCtrl: AlertController,
    public camera: Camera,
    public actionsheetCtrl: ActionSheetController,
    public platform: Platform,
    private loginProvider: LoginProvider
  ) {
     this.pages = [
      { title: 'Dashboard', component: 'TransactionsPage',icon:'banki-summary' },
      { title: 'Transactions', component: 'TransactionsPage',icon:'banki-exchange' },
    ];
    // this.id = navParams.get('locationId');
    // this.serverJson = navParams.get('serverJson');
    // this.localJson = navParams.get('localJson');
    const username = localStorage.getItem('username');
    this.userid = username;
    this.data = navParams.get('locdata');
    this.lat = navParams.get('lat');
    this.lng = navParams.get('lng');
    this.locid = navParams.get('reportId');
    this.transdata = navParams.get('dataSet');
    console.log(this.transdata);
    console.log(this.data);
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad AtmLocationsPage');
  }
  /**
   * Open direction page directly without popup msg by opening a new browser, using INAppBrowser plugin
   * (The other openDirectionLink method is used as of Jan 25, 2019)
   */
  public getDirectionPage(): void {
    const browser = this.iab.create(this.googleDirUrl, '_blank');
    browser.show();
  }
  /**
   * Open direction page with popup menu
   * Another way to take user to the DIrection external page
   */

  public getstatuscondition(status){
    // console.log(status)
    if(status == null || status == undefined || status == ""){
         return "No status yet";
    }else{
      return status;
    }
  }

  public responsemsg(title, msg): void {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  public submitUpdate(file){
    const token = localStorage.getItem('token');
    this.loginProvider.updateReport(this.trasacid,file, token)
    .subscribe((res) => {
      this.onsubmitform.dismiss();
      return this.responsemsg('Success', 'your case has been updated');
      console.log(res); 
    }, (err) => {
      const error = err;
      this.onsubmitform.dismiss();
      return this.responsemsg('Error', 'there was an issue reporting your case');
      console.log(error);
    });
  }

  public presentConfirm() {
    this.onsubmitform = this.alertCtrl.create({
      title: 'Submit Update',
      message: 'Do you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          handler: () => {
            this.submitUpdate(this.base64Image);
            console.log('Buy clicked');
          }
        }
      ]
    });
    this.onsubmitform.present();
  }

  public AccessCamera(){
     this.camera.getPicture({
       targetWidth:512,
       targetHeight:512,
       correctOrientation:true,
       sourceType: this.camera.PictureSourceType.CAMERA,
       destinationType: this.camera.DestinationType.DATA_URL
     }).then((imageData) => {
         this.base64Image = 'data:image/jpeg;base64,'+imageData;
         this.picture = imageData;
         // this.listoption.dismiss();
         this.presentConfirm();
       }, (err) => {
           console.log(err);
       });

  }

  public AccessGallery(){
   this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL
     }).then((imageData) => {
       this.base64Image = 'data:image/jpeg;base64,'+imageData;
       this.picture = imageData;
       // this.listoption.dismiss();
       this.presentConfirm();
      }, (err) => {
        console.log(err);
     });
  }

  public openUpload(id) {
    this.trasacid = id;
    this.listoption = this.actionsheetCtrl.create({
     
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            this.AccessCamera();
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: !this.platform.is('ios') ? 'ios-images-outline' : null,
          handler: () => {
            this.AccessGallery();
          }
        },
    ]
    });
    this.listoption.present();
  }

  public checktag(code){
    // console.log(tagcode);
    if(code == null || code == undefined || code == ""){
        return "No update yet";
    }
    var tagcode  = code[0];
    var tag = "No update yet"
    switch (tagcode) {
      case "initialreport":
        tag = "Initial Report";
        break;
      case "processing":
         tag = "processing";
         break;
      case "readyforrefund":
          tag = "Ready for Refund";
         break;
      case "refundchecksent":
          tag = "Refund Check Sent"
          break;
      case "refundcheckreceived":
          tag = "Refund Check Received";
          break;
      default:
        break;
    }
    return tag;
  }

  public openDirectionLink(): void {
    let url = this.googleDirUrl;
    let optIn = true;
    let title = null;
    let message = this.translate.instant('Open Google Map');
    let okText = this.translate.instant('Direction');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }
  /**
   * Open customer support call popup msg
   */
  public callCustomerSupport(): void {
    let url = 'tel:+1-860-800-2646';
    let optIn = true;
    let title = null;
    let message = this.translate.instant('You can call us now at 860-800-2646');
    let okText = this.translate.instant('Call');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

  private convertdate(date) {
    return new Date(date * 1000);
  }

  public getFullCurrencyCrypto(code){
    var cur = "Unknown";
    switch (code){
        case "BTC":
            return "Bitcoin";
        case "LTC":
            return "Litecoin";
        case "ETH":
             return "Ethereum";
        default:
            break;
    }
    return cur;
  }

  public getTransactionType(code) {
    const cur = "Unknown";
    switch (code){
        case 1:
            return "BUY";
            break;
        case 2:
            return "SELL";
        default:
            break;
    }
    return cur;
  }

  public getStatus(stat){
    const cur = "STATUS_UNKNOWN";
    switch (stat){
        case 1:
            return "COMPLETE";
        case 2:
            return "ERROR";
        case  3:
            return "CANCELLED";
        case  4:
            return "FROZEN";
        case  5:
            return "SEIZED";
        case  6:
            return "BLACKLISTED";
        case 7:
            return "AUTOFROZEN";
        default:
            break;
    }
    return cur;
  }


  public getBlockChainStatus(code){
      if(code > 0){
          return "COMPLETED";
      } else{
          return "PROCESSING";
      }
  }

  public getCurrencyCrypto(code){
    const cur = "Unknown";
    switch (code){
        case 1:
            return "BTC";
        case 2:
            return "LTC";
        case 3:
            return "ETH";
        default:
            break;
    }
    return cur;
  }

  public successmessae(message) {
    const alert = this.alertCtrl.create({
      title: '',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  public getAmount(coin){
    return coin/100;//amount is now in USD not BTC 100000000;
  }

  public gototxid(crypto,txid){
    // href="https://live.blockcypher.com/{{getCurrencyCrypto(transdata.currency_crypto) | lowercase}}/tx/{{transdata.txid}}" target="_blank"
     this.successmessae("Redirecting using a third party")
    const cryptoadd = this.getCurrencyCrypto(crypto).toLowerCase();
    window.open("https://live.blockcypher.com/"+cryptoadd+"/tx/"+txid+"/",'_system', 'location=yes');
  }

  public gotoaddress(crypto,address){
    // href="https://live.blockcypher.com/{{getCurrencyCrypto(transdata.currency_crypto) | lowercase}}/address/{{transdata.address}}/" target="_blank"
    this.successmessae("Redirecting using a third party")
    const cryptoadd = this.getCurrencyCrypto(crypto).toLowerCase();
    window.open("https://live.blockcypher.com/"+cryptoadd+"/address/"+address+"/",'_system', 'location=yes');
  }

  public getCurrency(code){
    const cur = "FIAT_UNKNOWN";
    switch (code){
        case 1:
            return "$";
        case 2:
            return "¥";
        case 3:
            return "£";
        case 4:
            return "A$";
        case 5:
            return "C$";
        case 6:
            return "Лв";
        default:
            break;
    }
    return cur;
  }

  public openMenu() {
   this.menu.open();
  }

  public toggleMenu() {
    console.log("i clicked");
    this.menu.toggle(); //Add this method to your button click function
  }
}
