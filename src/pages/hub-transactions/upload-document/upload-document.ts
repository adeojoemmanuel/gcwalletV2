import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams,  MenuController} from 'ionic-angular';

import { TransactionsPage } from '../transactions/transactions'
import { ViewReport } from '../view-report/view-report'
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IncreaseLimit } from '../increase-limit/increase-limit'

@IonicPage()
@Component({
  selector: 'page-upload-document',
  templateUrl: 'upload-document.html',
})
export class UploadDocumentPage {
  public pages: Array<{title: string, component: any,icon:any}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private menu: MenuController, private iab: InAppBrowser) {
  	this.pages = [
      { title: 'Dashboard', component: TransactionsPage, icon:'banki-summary' },
      { title: 'Transactions', component: TransactionsPage, icon:'banki-transfer' },
      // { title: 'Report Transaction', component: ReportTransaction, icon:'banki-exchange' },
      { title: 'View Report', component: ViewReport, icon:'banki-exchange' },
    ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadDocumentPage');
  }

  openPage(page) {
    this.menu.enable(false)
    this.navCtrl.setRoot(page);
  }

  increaseLimit(){
  	this.menu.enable(false)
    this.navCtrl.setRoot(IncreaseLimit);
  }

  openBrowser(){
    this.iab.create('https://www.getcoins.com/vipapplication/');
  }

  toggleMenu() {
    console.log("i clicked");
    this.menu.toggle(); //Add this method to your button click function
  }
}
