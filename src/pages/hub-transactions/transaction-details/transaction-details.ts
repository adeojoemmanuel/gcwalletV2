import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController, AlertController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';
import { ReportTransaction } from '../report-transaction/report-transaction'

// import { PopupProvider } from '../../providers/popup/popup';

/**
 * Generated class for the AtmLocationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-transaction-details',
  templateUrl: 'transaction-details.html'
})
export class TransactionDetailsPage {
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
  public toShowMap: boolean = true;
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
    public alertCtrl: AlertController
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
    
    this.transdata = navParams.get('dataSet');
    this.lat = navParams.get('lat');
    this.lng = navParams.get('lng');
    this.locid = navParams.get('locationId');
    console.log(this.transdata);
    console.log(this.data);
    if (this.lat == null && this.lng == null) {
      this.toShowMap = false;
    }else{
      this.encodedAddress = encodeURIComponent(
        this.gcATMName +
          ' ' +
          this.data.street +
          ' ' +
          this.data.city +
          ', ' +
          this.data.state +
          ' ' +
          this.data.zipcode
      );
      this.encodedMyLocation = encodeURIComponent(
        this.lat + ',' + this.lng
      );
      this.encodedDirection = encodeURIComponent(
        this.gcATMName +
          ' ' +
          this.data.street +
          ' ' +
          this.data.city +
          ', ' +
          this.data.state +
          ' ' +
          this.data.zipcode
      );
      this.googleUrl =
        'https://www.google.com/maps/embed/v1/place?key=' +
        this.googleMapAPIKey +
        '&q=' +
        this.encodedAddress +
        '&zoom=14';

    this.googleDirUrl =
      'https://www.google.com/maps/dir/?api=1&origin=' +
      this.encodedMyLocation +
      '&destination=' +
      this.encodedDirection +
      '&travelmode=' +
      this.travelMode;
    }
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

  public reportTransaction(){
    this.navCtrl.push(ReportTransaction, {
        dataSet: this.transdata
    });
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

  openMenu() {
   this.menu.open();
  }

  toggleMenu() {
    console.log("i clicked");
    this.menu.toggle(); //Add this method to your button click function
  }
}
