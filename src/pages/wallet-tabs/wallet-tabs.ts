import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { Events, NavParams } from 'ionic-angular';

// Pages
import { ReceivePage } from '../receive/receive';
import { SendPage } from '../send/send';
import { WalletDetailsPage } from '../wallet-details/wallet-details';

// Providers
import { PlatformProvider } from '../../providers/platform/platform';
import { WalletTabsProvider } from './wallet-tabs.provider';

@Component({
  template: `
    <ion-tabs class="hide-tabbar" [selectedIndex]="selectedTabIndex" #tabs>
      <ion-tab
        [root]="receiveRoot"
        tabTitle="{{'Receive'|translate}}"
        tabIcon="tab-receive"
      ></ion-tab>
      <ion-tab
        [root]="activityRoot"
        tabTitle="{{'Activity'|translate}}"
        tabIcon="tab-activity2"
      ></ion-tab>
      <ion-tab
        [root]="sendRoot"
        tabTitle="{{'Send'|translate}}"
        tabIcon="tab-send"
      ></ion-tab>
    </ion-tabs>
  `
})
export class WalletTabsPage {
  @ViewChild('tabs')
  walletTabs: any;

  receiveRoot = ReceivePage;
  activityRoot = WalletDetailsPage;
  sendRoot = SendPage;

  selectedTabIndex: number = 1;

  walletId: string;

  constructor(
    private navParams: NavParams,
    private walletTabsProvider: WalletTabsProvider,
    private events: Events,
    private platformProvider: PlatformProvider,
    private statusBar: StatusBar
  ) {
    if (typeof this.navParams.get('selectedTabIndex') !== 'undefined') {
      this.selectedTabIndex = this.navParams.get('selectedTabIndex');
    }
  }

  ionViewDidLoad() {
    this.walletId = this.navParams.get('walletId');
  }

  ionViewWillEnter() {
    if (this.platformProvider.isIOS) {
      setTimeout(() => this.statusBar.styleLightContent(), 300);
    }
  }

  ionViewWillLeave() {
    if (this.platformProvider.isIOS) {
      this.statusBar.styleDefault();
    }
  }

  ngAfterViewInit() {
    this.walletTabsProvider.setTabNav(this.walletTabs);
  }

  ngOnDestroy() {
    this.walletTabsProvider.clear();
    this.events.publish('Wallet/disableHardwareKeyboard');
    this.unsubscribeChildPageEvents();
  }

  private unsubscribeChildPageEvents() {
    this.events.unsubscribe('Local/AddressScan');
    this.events.unsubscribe('Wallet/disableHardwareKeyboard');
  }
}
