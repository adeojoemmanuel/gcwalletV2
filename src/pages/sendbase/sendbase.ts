import { Component, NgZone, ViewChild } from '@angular/core';
import { Events, NavController, Platform } from 'ionic-angular';
import * as _ from 'lodash';
import { Toast } from '@ionic-native/toast';
// Providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { AddressProvider } from '../../providers/address/address';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { Logger } from '../../providers/logger/logger';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { WalletProvider } from '../../providers/wallet/wallet';

// Pages
import { PaperWalletPage } from '../paper-wallet/paper-wallet';
import { AddressbookAddPage } from '../settings/addressbook/add/add';
import { AmountPage } from '../send/amount/amount';
import { ScanPage } from '../scan/scan';
import { Clipboard } from '@ionic-native/clipboard/';
var WAValidator = require('wallet-address-validator');

import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

// Pages
import { AddWalletPage } from '../add-wallet/add-wallet';
import { AddPage } from '../add/add';
import { CreateWalletPage } from '../add/create-wallet/create-wallet';
import { BitPayCardPage } from '../integrations/bitpay-card/bitpay-card';
import { BitPayCardIntroPage } from '../integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { CoinbasePage } from '../integrations/coinbase/coinbase';
import { ShapeshiftPage } from '../integrations/shapeshift/shapeshift';
// import { ProposalsPage } from './proposals/proposals';

// Providers
import { AppProvider } from '../../providers/app/app';
import { BitPayCardProvider } from '../../providers/bitpay-card/bitpay-card';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ClipboardProvider } from '../../providers/clipboard/clipboard';
import { Coin, CurrencyProvider } from '../../providers/currency/currency';
import { EmailNotificationsProvider } from '../../providers/email-notifications/email-notifications';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
import { InvoiceProvider } from '../../providers/invoice/invoice';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-sendbase',
  templateUrl: 'sendbase.html'
})
export class SendbasePage {
  @ViewChild('showCard')
  showCard;
  @ViewChild('showSurvey')
  showSurvey;
  @ViewChild('showEthLiveCard')
  showEthLiveCard;
  @ViewChild('priceCard')
  priceCard;
  public wallets;
  public walletsGroups;
  public readOnlyWalletsGroup;
  public txpsN: number;
  public serverMessages: any[];
  public homeIntegrations;
  public bitpayCardItems;
  public showBitPayCard: boolean = false;
  public showAnnouncement: boolean = false;
  public validDataFromClipboard;
  public payProDetailsData;
  public remainingTimeStr: string;
  public slideDown: boolean;
  public showServerMessage: boolean;

  public showRateCard: boolean;
  public showPriceChart: boolean;
  public hideHomeIntegrations: boolean;
  public showGiftCards: boolean;
  public showBitpayCardGetStarted: boolean;
  public accessDenied: boolean;
  public isBlur: boolean;
  public isCordova: boolean;
  public collapsedGroups;

  private isElectron: boolean;
  private zone;
  private countDown;
  private onResumeSubscription: Subscription;
  private onPauseSubscription: Subscription;

  
  public search: string = '';
  public walletsBtc;
  public walletsBch;
  public walletBchList;
  public walletBtcList;
  public contactsList = [];
  public filteredContactsList = [];
  public hasBtcWallets: boolean;
  public hasBchWallets: boolean;
  public searchError: boolean = false;
  public searchErrorMsg: string = '';
  public hasContacts: boolean;
  public contactsShowMore: boolean;
  private CONTACTS_SHOW_LIMIT: number = 10;
  private currentContactsPage: number = 0;

  constructor(
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private addressBookProvider: AddressBookProvider,
    private logger: Logger,
    private incomingDataProvider: IncomingDataProvider,
    private popupProvider: PopupProvider,
    private addressProvider: AddressProvider,
    private events: Events,
    private externalLinkProvider: ExternalLinkProvider,
    private clipboard: Clipboard,
    private toast: Toast,
    private plt: Platform,
    private bwcErrorProvider: BwcErrorProvider,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private persistenceProvider: PersistenceProvider,
    private feedbackProvider: FeedbackProvider,
    private bitPayCardProvider: BitPayCardProvider,
    private translate: TranslateService,
    private emailProvider: EmailNotificationsProvider,
    private clipboardProvider: ClipboardProvider,
    private statusBar: StatusBar,
    private invoiceProvider: InvoiceProvider,
    private currencyProvider: CurrencyProvider
  ) {
    this.slideDown = false;
    this.isBlur = false;
    this.isCordova = this.platformProvider.isCordova;
    this.isElectron = this.platformProvider.isElectron;
    this.collapsedGroups = {};
    // Update Wallet on Focus
    if (this.isElectron) {
      this.updateDesktopOnFocus();
    }
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.events.subscribe('Home/reloadStatus', () => {
      this._willEnter(true);
      this._didEnter();
    });
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad SendPage');
  }

  ionViewWillLeave() {
    this.events.unsubscribe('finishIncomingDataMenuEvent');
  }

  ionViewWillEnter() {
    this.walletsBtc = this.profileProvider.getWallets({ coin: 'btc' });
    this.walletsBch = this.profileProvider.getWallets({ coin: 'bch' });
    this.hasBtcWallets = !_.isEmpty(this.walletsBtc);
    this.hasBchWallets = !_.isEmpty(this.walletsBch);

    this.events.subscribe('finishIncomingDataMenuEvent', data => {
      switch (data.redirTo) {
        case 'AmountPage':
          this.sendPaymentToAddress(data.value, data.coin);
          break;
        case 'AddressBookPage':
          this.addToAddressBook(data.value);
          break;
        case 'OpenExternalLink':
          this.goToUrl(data.value);
          break;
        case 'PaperWalletPage':
          this.scanPaperWallet(data.value);
          break;
      }
    });

    this.updateBchWalletsList();
    this.updateBtcWalletsList();
    this.updateContactsList();
  }

  ionViewDidEnter() {
    this.search = '';
  }

  public pastetoinput(){
    this.searchError = false;
    try {
      this.clipboard.paste().then(
        (resolve: string) => {
          if(resolve == undefined || resolve == null || resolve == "" || resolve == ''){
            this.popupProvider.ionicAlert('Your clipboard is empty!"');
          }
          var valid = WAValidator.validate(resolve, 'BTC');
          if(valid){
              this.search = resolve;
              this.findContact(resolve);
              console.log(resolve);
          }else{
            this.searchError = true;
            this.searchErrorMsg = "Invalid BTC Address"
          }
        },(reject: string) => {
           // console.error('Error: ' + reject);
           this.popupProvider.ionicAlert("Your clipboard is empty!");
        }
      );
    }catch(e) {
        this.popupProvider.ionicAlert("Your clipboard is empty!");
    }
  }

  private goToUrl(url: string): void {
    this.externalLinkProvider.open(url);
  }

  private sendPaymentToAddress(bitcoinAddress: string, coin: string): void {
    this.navCtrl.push(AmountPage, { toAddress: bitcoinAddress, coin });
  }

  private addToAddressBook(bitcoinAddress: string): void {
    this.navCtrl.push(AddressbookAddPage, { addressbookEntry: bitcoinAddress });
  }

  private scanPaperWallet(privateKey: string) {
    this.navCtrl.push(PaperWalletPage, { privateKey });
  }

  private updateBchWalletsList(): void {
    this.walletBchList = [];

    if (!this.hasBchWallets) return;

    _.each(this.walletsBch, v => {
      this.walletBchList.push({
        color: v.color,
        name: v.name,
        recipientType: 'wallet',
        coin: v.coin,
        network: v.network,
        m: v.credentials.m,
        n: v.credentials.n,
        isComplete: v.isComplete(),
        needsBackup: v.needsBackup,
        getAddress: (): Promise<any> => {
          return new Promise((resolve, reject) => {
            this.walletProvider
              .getAddress(v, false)
              .then(addr => {
                return resolve(addr);
              })
              .catch(err => {
                return reject(err);
              });
          });
        }
      });
    });
  }

  private updateBtcWalletsList(): void {
    this.walletBtcList = [];

    if (!this.hasBtcWallets) return;

    _.each(this.walletsBtc, v => {
      this.walletBtcList.push({
        color: v.color,
        name: v.name,
        recipientType: 'wallet',
        coin: v.coin,
        network: v.network,
        m: v.credentials.m,
        n: v.credentials.n,
        isComplete: v.isComplete(),
        needsBackup: v.needsBackup,
        getAddress: (): Promise<any> => {
          return new Promise((resolve, reject) => {
            this.walletProvider
              .getAddress(v, false)
              .then(addr => {
                return resolve(addr);
              })
              .catch(err => {
                return reject(err);
              });
          });
        }
      });
    });
  }

  private updateContactsList(): void {
    this.addressBookProvider.list().then(ab => {
      this.hasContacts = _.isEmpty(ab) ? false : true;
      if (!this.hasContacts) return;

      this.contactsList = [];
      _.each(ab, (v, k: string) => {
        this.contactsList.push({
          name: _.isObject(v) ? v.name : v,
          address: k,
          network: this.addressProvider.validateAddress(k).network,
          email: _.isObject(v) ? v.email : null,
          recipientType: 'contact',
          coin: this.addressProvider.validateAddress(k).coin,
          getAddress: () => {
            return new Promise(resolve => {
              return resolve(k);
            });
          }
        });
      });
      let shortContactsList = _.clone(
        this.contactsList.slice(
          0,
          (this.currentContactsPage + 1) * this.CONTACTS_SHOW_LIMIT
        )
      );
      this.filteredContactsList = _.clone(shortContactsList);
      this.contactsShowMore =
        this.contactsList.length > shortContactsList.length;
    });
  }

  public showMore(): void {
    this.currentContactsPage++;
    this.updateContactsList();
  }

  public openScanner(): void {
    this.navCtrl.parent.select(2);
    // this.navCtrl.push(ScanPage);
    this.navCtrl.setRoot(ScanPage);
  }

  public findContact(search: string): void {
    this.searchError = false;
    if (this.incomingDataProvider.redir(search)) return;
    var valid = WAValidator.validate(search, 'BTC');
    if(valid){
        if (search && search.trim() != '') {
          let result = _.filter(this.contactsList, item => {
            let val = item.name;
            return _.includes(val.toLowerCase(), search.toLowerCase());
          });
          this.filteredContactsList = result;
        } else {
          this.updateContactsList();
        }
    }else{
        this.searchError = true;
        this.searchErrorMsg = "Invalid BTC Address"
        //  this.toast.show(`Invalid BTC Address`, '5000', 'center').subscribe(
        //   toast => {
        //     console.log(toast);
        //   }
        // );
        // this.popupProvider.ionicAlert('Invalid BTC Address');
        // console.log('Address INVALID');
    }
  }

  public goToAmount(item): void {
    item
      .getAddress()
      .then((addr: string) => {
        if (!addr) {
          // Error is already formated
          this.popupProvider.ionicAlert('Error - no address');
          return;
        }
        this.logger.debug('Got address:' + addr + ' | ' + item.name);
        this.navCtrl.push(AmountPage, {
          recipientType: item.recipientType,
          toAddress: addr,
          name: item.name,
          email: item.email,
          color: item.color,
          coin: item.coin,
          network: item.network
        });
        return;
      })
      .catch(err => {
        this.logger.error('Send: could not getAddress', err);
      });
  }

  // home compoent impported, would cause over engineering 


  private _willEnter(shouldUpdate: boolean = false) {
    if (this.platformProvider.isIOS) {
      this.statusBar.styleDefault();
    }

    // Update list of wallets, status and TXPs
    this.setWallets(shouldUpdate);

    this.checkPriceChart();
  }

  private _didEnter() {
    this.checkClipboard();

    // Show integrations
    const integrations = this.homeIntegrationsProvider
      .get()
      .filter(i => i.show)
      .filter(i => i.name !== 'giftcards' && i.name !== 'debitcard');

    this.showGiftCards = this.homeIntegrationsProvider.shouldShowInHome(
      'giftcards'
    );

    this.showBitpayCardGetStarted = this.homeIntegrationsProvider.shouldShowInHome(
      'debitcard'
    );

    // Hide BitPay if linked
    setTimeout(() => {
      this.homeIntegrations = _.remove(_.clone(integrations), x => {
        if (x.name == 'debitcard' && x.linked) return false;
        else return x;
      });
    }, 200);

    // Only BitPay Wallet
    this.bitPayCardProvider.get({}, (_, cards) => {
      this.zone.run(() => {
        this.showBitPayCard = this.appProvider.info._enabledExtensions.debitcard
          ? true
          : false;
        this.bitpayCardItems = cards;
      });
    });
  }

  private walletFocusHandler = opts => {
    this.logger.debug('RECV Local/WalletFocus @home', opts);
    opts = opts || {};
    opts.alsoUpdateHistory = true;
    this.fetchWalletStatus(opts);
  };

  private walletActionHandler = opts => {
    this.logger.debug('RECV Local/TxAction @home', opts);
    opts = opts || {};
    opts.alsoUpdateHistory = true;
    this.fetchWalletStatus(opts);
  };

  ionViewDidLoad() {
    this.logger.info('Loaded: HomePage');

    // Required delay to improve performance loading
    setTimeout(() => {
      this.showSurveyCard();
      this.showEthLive();
      this.checkFeedbackInfo();
      this.checkEmailLawCompliance();
    }, 2000);

    const subscribeEvents = () => {
      // BWS Events: Update Status per Wallet -> Update txps
      // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
      // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
      this.events.subscribe('bwsEvent', this.bwsEventHandler);

      // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets -> Update txps
      this.events.subscribe('Local/WalletListChange', () =>
        this.setWallets(true)
      );

      // Reject, Remove, OnlyPublish and SignAndBroadcast -> Update Status per Wallet -> Update txps
      this.events.subscribe('Local/TxAction', this.walletActionHandler);

      // Wallet is focused on some inner view, therefore, we refresh its status and txs
      this.events.subscribe('Local/WalletFocus', this.walletFocusHandler);
    };

    subscribeEvents();
    this.onResumeSubscription = this.plt.resume.subscribe(() => {
      this.setWallets();
      this.checkClipboard();
      subscribeEvents();
    });

    this.onPauseSubscription = this.plt.pause.subscribe(() => {
      this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
      this.events.unsubscribe('Local/WalletListChange', this.setWallets);
      this.events.unsubscribe('Local/TxAction', this.walletFocusHandler);
      this.events.unsubscribe('Local/WalletFocus', this.walletFocusHandler);
    });
    this.setWallets(true);
  }

  ngOnDestroy() {
    this.onResumeSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.resetValuesForAnimationCard();
  }

  private async resetValuesForAnimationCard() {
    await Observable.timer(50).toPromise();
    this.validDataFromClipboard = null;
    this.slideDown = false;
  }

  private debounceFetchWalletStatus = _.debounce(
    async (walletId, alsoUpdateHistory) => {
      this.fetchWalletStatus({ walletId, alsoUpdateHistory });
    },
    3000
  );

  // BWS events can come many at time (publish,sign, broadcast...)
  private bwsEventHandler = (walletId, type, n) => {
    // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
    // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx

    const wallet = this.profileProvider.getWallet(walletId);
    if (wallet.copayerId == n.creatorId) {
      return;
    }

    this.logger.info(`BWS Event: ${type}: `, n);

    let alsoUpdateHistory = false;
    switch (type) {
      case 'NewAddress':
        this.walletProvider.expireAddress(walletId);
        return;
      case 'NewIncomingTx':
      case 'NewOutgoingTx':
      case 'NewBlock':
        alsoUpdateHistory = true;
    }
    this.walletProvider.invalidateCache(wallet);
    this.debounceFetchWalletStatus(walletId, alsoUpdateHistory);
  };

  private updateDesktopOnFocus() {
    const { remote } = (window as any).require('electron');
    const win = remote.getCurrentWindow();
    win.on('focus', () => {
      if (
        this.navCtrl.getActive() &&
        this.navCtrl.getActive().name == 'HomePage'
      ) {
        this.checkClipboard();
        this.setWallets();
      }
    });
  }

  private openEmailDisclaimer() {
    const message = this.translate.instant(
      'By providing your email address, you give explicit consent to BitPay to use your email address to send you email notifications about payments.'
    );
    const title = this.translate.instant('Privacy Policy update');
    const okText = this.translate.instant('Accept');
    const cancelText = this.translate.instant('Disable notifications');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then(ok => {
        if (ok) {
          // Accept new Privacy Policy
          this.persistenceProvider.setEmailLawCompliance('accepted');
        } else {
          // Disable email notifications
          this.persistenceProvider.setEmailLawCompliance('rejected');
          this.emailProvider.updateEmail({
            enabled: false,
            email: 'null@email'
          });
        }
      });
  }

  private checkEmailLawCompliance(): void {
    setTimeout(() => {
      if (this.emailProvider.getEmailIfEnabled()) {
        this.persistenceProvider.getEmailLawCompliance().then(value => {
          if (!value) this.openEmailDisclaimer();
        });
      }
    }, 2000);
  }

  private debounceSetWallets = _.debounce(
    async () => {
      this.setWallets(true);
    },
    5000,
    {
      leading: true
    }
  );

  private setWallets = (shouldUpdate: boolean = false) => {
    // TEST
    /* 
    setTimeout(() => {
      this.logger.info('##### Load BITCOIN URI TEST');
      this.incomingDataProvider.redir('bitcoin:3KeJU7VxSKC451pPNSWjF6zK3gm2x7re7q?amount=0.0001');
    },100);
    */

    this.wallets = this.profileProvider.getWallets();
    this.walletsGroups = _.values(
      _.groupBy(
        _.filter(this.wallets, wallet => {
          return wallet.keyId != 'read-only';
        }),
        'keyId'
      )
    );

    this.readOnlyWalletsGroup = this.profileProvider.getWalletsFromGroup({
      keyId: 'read-only'
    });

    this.profileProvider.setLastKnownBalance();

    // Avoid heavy tasks that can slow down the unlocking experience
    if (!this.appProvider.isLockModalOpen && shouldUpdate) {
      this.fetchAllWalletsStatus();
    }
  };

  private async showSurveyCard() {
    const hideSurvey = await this.persistenceProvider.getSurveyFlag();
    this.showSurvey.setShowSurveyCard(!hideSurvey);
  }

  private async showEthLive() {
    const hideEthLiveCard = await this.persistenceProvider.getEthLiveCardFlag();
    if (!hideEthLiveCard) {
      let hasNoLegacy = false;
      this.walletsGroups.forEach((walletsGroup: any[]) => {
        if (walletsGroup[0].canAddNewAccount) {
          hasNoLegacy = true;
        }
      });
      this.showEthLiveCard.setShowEthLiveCard(hasNoLegacy);
    }
  }

  private checkFeedbackInfo() {
    // Hide feeback card if survey card is shown
    // TODO remove this condition
    if (this.showSurvey) return;
    this.persistenceProvider.getFeedbackInfo().then(info => {
      if (!info) {
        this.initFeedBackInfo();
      } else {
        const feedbackInfo = info;
        // Check if current version is greater than saved version
        const currentVersion = this.appProvider.info.version;
        const savedVersion = feedbackInfo.version;
        const isVersionUpdated = this.feedbackProvider.isVersionUpdated(
          currentVersion,
          savedVersion
        );
        if (!isVersionUpdated) {
          this.initFeedBackInfo();
          return;
        }
        const now = moment().unix();
        const timeExceeded = now - feedbackInfo.time >= 24 * 7 * 60 * 60;
        this.showRateCard = timeExceeded && !feedbackInfo.sent;
        this.showCard.setShowRateCard(this.showRateCard);
      }
    });
  }

  private checkPriceChart() {
    this.persistenceProvider.getHiddenFeaturesFlag().then(res => {
      this.showPriceChart = res === 'enabled' ? true : false;
      this.updateCharts();
    });
  }

  private updateCharts() {
    if (this.showPriceChart && this.priceCard) this.priceCard.updateCharts();
  }

  public onWalletAction(wallet, action, slidingItem) {
    const tabMap = {
      receive: 0,
      view: 1,
      send: 2
    };
    const selectedTabIndex = tabMap[action];
    this.goToWalletDetails(wallet, { selectedTabIndex });
    slidingItem.close();
  }

  public checkClipboard() {
    return this.clipboardProvider
      .getData()
      .then(async data => {
        this.validDataFromClipboard = this.incomingDataProvider.parseData(data);
        if (!this.validDataFromClipboard) {
          return;
        }
        const dataToIgnore = [
          'BitcoinAddress',
          'BitcoinCashAddress',
          'EthereumAddress',
          'PlainUrl'
        ];
        if (dataToIgnore.indexOf(this.validDataFromClipboard.type) > -1) {
          this.validDataFromClipboard = null;
          return;
        }
        if (this.validDataFromClipboard.type === 'PayPro') {
          const coin = this.incomingDataProvider.getCoinFromUri(data);
          this.incomingDataProvider
            .getPayProDetails(data)
            .then(payProDetails => {
              if (!payProDetails) {
                throw this.translate.instant('No wallets available');
              }
              this.payProDetailsData = payProDetails;
              this.payProDetailsData.host = new URL(
                payProDetails.payProUrl
              ).host;
              this.payProDetailsData.coin = coin;
              this.clearCountDownInterval();
              this.paymentTimeControl(this.payProDetailsData.expires);
            })
            .catch(err => {
              this.payProDetailsData = {};
              this.payProDetailsData.error = err;
              this.logger.warn('Error in Payment Protocol', err);
            });
        } else if (this.validDataFromClipboard.type === 'InvoiceUri') {
          const invoiceId: string = data.replace(
            /https:\/\/(www.)?(test.)?bitpay.com\/i\//,
            ''
          );
          this.invoiceProvider
            .getBitPayInvoice(invoiceId)
            .then(invoice => {
              if (!invoice) {
                throw this.translate.instant('No wallets available');
              }
              const { selectedTransactionCurrency } = invoice.buyerProvidedInfo;
              const {
                price,
                currency,
                expirationTime,
                paymentTotals
              } = invoice;
              let unitToSatoshi;
              if (Coin[currency]) {
                unitToSatoshi = this.currencyProvider.getPrecision(
                  currency.toLowerCase()
                ).unitToSatoshi;
              }
              this.payProDetailsData = invoice;
              this.payProDetailsData.verified = true;
              this.payProDetailsData.isFiat =
                selectedTransactionCurrency || Coin[currency.toUpperCase()]
                  ? false
                  : true;
              this.payProDetailsData.host = 'Bitpay';
              this.payProDetailsData.coin = selectedTransactionCurrency
                ? Coin[selectedTransactionCurrency]
                : currency;
              this.payProDetailsData.amount = selectedTransactionCurrency
                ? paymentTotals[selectedTransactionCurrency]
                : Coin[currency]
                ? price / unitToSatoshi
                : price;
              this.clearCountDownInterval();
              this.paymentTimeControl(expirationTime);
            })
            .catch(err => {
              this.payProDetailsData = {};
              this.payProDetailsData.error = err;
              this.logger.warn('Error in Fetching Invoice', err);
            });
        }
        await Observable.timer(50).toPromise();
        this.slideDown = true;
      })
      .catch(err => {
        this.logger.warn('Paste from clipboard: ', err);
      });
  }

  public hideClipboardCard() {
    this.validDataFromClipboard = null;
    this.clipboardProvider.clear();
    this.slideDown = false;
  }

  public processClipboardData(data): void {
    this.clearCountDownInterval();
    this.incomingDataProvider.redir(data, { fromHomeCard: true });
  }

  private clearCountDownInterval(): void {
    if (this.countDown) clearInterval(this.countDown);
  }

  private paymentTimeControl(expires): void {
    const expirationTime = Math.floor(new Date(expires).getTime() / 1000);
    const setExpirationTime = (): void => {
      const now = Math.floor(Date.now() / 1000);
      if (now > expirationTime) {
        this.remainingTimeStr = this.translate.instant('Expired');
        this.clearCountDownInterval();
        return;
      }
      const totalSecs = expirationTime - now;
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      this.remainingTimeStr = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    };

    setExpirationTime();

    this.countDown = setInterval(() => {
      setExpirationTime();
    }, 1000);
  }

  private initFeedBackInfo() {
    this.persistenceProvider.setFeedbackInfo({
      time: moment().unix(),
      version: this.appProvider.info.version,
      sent: false
    });
    this.showRateCard = false;
  }

  private fetchTxHistory(opts: UpdateWalletOptsI) {
    if (!opts.walletId) {
      this.logger.error('Error no walletId in update History');
      return;
    }
    const wallet = this.profileProvider.getWallet(opts.walletId);

    const progressFn = ((_, newTxs) => {
      let args = {
        walletId: opts.walletId,
        finished: false,
        progress: newTxs
      };
      this.events.publish('Local/WalletHistoryUpdate', args);
    }).bind(this);

    // Fire a startup event, to allow UI to show the spinner
    this.events.publish('Local/WalletHistoryUpdate', {
      walletId: opts.walletId,
      finished: false
    });
    this.walletProvider
      .fetchTxHistory(wallet, progressFn, opts)
      .then(txHistory => {
        wallet.completeHistory = txHistory;
        this.events.publish('Local/WalletHistoryUpdate', {
          walletId: opts.walletId,
          finished: true
        });
      })
      .catch(err => {
        if (err != 'HISTORY_IN_PROGRESS') {
          this.logger.warn('WalletHistoryUpdate ERROR', err);
          this.events.publish('Local/WalletHistoryUpdate', {
            walletId: opts.walletId,
            finished: false,
            error: err
          });
        }
      });
  }

  // Names:
  // .fetch => from BWS
  // .update => to UI
  /* This is the only .getStatus call in Copay */
  private fetchWalletStatus = (opts: UpdateWalletOptsI): void => {
    if (!opts.walletId) {
      this.logger.error('Error no walletId in update Wallet');
      return;
    }
    this.events.publish('Local/WalletUpdate', {
      walletId: opts.walletId,
      finished: false
    });

    this.logger.debug(
      'fetching status for: ' +
        opts.walletId +
        ' alsohistory:' +
        opts.alsoUpdateHistory
    );
    const wallet = this.profileProvider.getWallet(opts.walletId);
    if (!wallet) return;

    this.walletProvider
      .fetchStatus(wallet, opts)
      .then(status => {
        wallet.cachedStatus = status;
        wallet.error = wallet.errorObj = null;

        this.persistenceProvider.setLastKnownBalance(
          wallet.id,
          wallet.cachedStatus.availableBalanceStr
        );

        // Update txps
        this.updateTxps();
        this.events.publish('Local/WalletUpdate', {
          walletId: opts.walletId,
          finished: true
        });

        if (opts.alsoUpdateHistory) {
          this.fetchTxHistory({ walletId: opts.walletId, force: opts.force });
        }
      })
      .catch(err => {
        if (err == 'INPROGRESS') return;

        this.logger.warn('Update error:', err);

        this.processWalletError(wallet, err);

        this.events.publish('Local/WalletUpdate', {
          walletId: opts.walletId,
          finished: true,
          error: wallet.error
        });

        if (opts.alsoUpdateHistory) {
          this.fetchTxHistory({ walletId: opts.walletId, force: opts.force });
        }
      });
  };

  private updateTxps() {
    this.profileProvider
      .getTxps({ limit: 3 })
      .then(data => {
        this.zone.run(() => {
          this.txpsN = data.n;
        });
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private fetchAllWalletsStatus(): void {
    let foundMessage = false;

    if (_.isEmpty(this.wallets)) return;

    this.logger.debug('fetchAllWalletsStatus');
    const pr = wallet => {
      return this.walletProvider
        .fetchStatus(wallet, {})
        .then(async status => {
          wallet.cachedStatus = status;
          wallet.error = wallet.errorObj = null;

          if (!foundMessage && !_.isEmpty(status.serverMessages)) {
            this.serverMessages = _.orderBy(
              status.serverMessages,
              ['priority'],
              ['asc']
            );
            this.serverMessages.forEach(serverMessage => {
              this.checkServerMessage(serverMessage);
            });
            foundMessage = true;
          }

          this.persistenceProvider.setLastKnownBalance(
            wallet.id,
            wallet.cachedStatus.availableBalanceStr
          );

          this.events.publish('Local/WalletUpdate', {
            walletId: wallet.id,
            finished: true
          });

          return Promise.resolve();
        })
        .catch(err => {
          this.processWalletError(wallet, err);
          return Promise.resolve();
        });
    };

    const promises = [];

    _.each(this.profileProvider.wallet, wallet => {
      promises.push(pr(wallet));
    });

    Promise.all(promises).then(() => {
      this.updateTxps();
    });
  }

  private processWalletError(wallet, err): void {
    wallet.error = wallet.errorObj = null;

    if (!err || err == 'INPROGRESS') return;

    wallet.cachedStatus = null;
    wallet.errorObj = err;

    if (err.message === '403') {
      this.accessDenied = true;
      wallet.error = this.translate.instant('Access denied');
    } else if (err === 'WALLET_NOT_REGISTERED') {
      wallet.error = this.translate.instant('Wallet not registered');
    } else {
      wallet.error = this.bwcErrorProvider.msg(err);
    }
    this.logger.warn(
      this.bwcErrorProvider.msg(
        wallet.error,
        'Error updating status for ' + wallet.id
      )
    );
  }

  private removeServerMessage(id): void {
    this.serverMessages = _.filter(this.serverMessages, s => s.id !== id);
  }

  public dismissServerMessage(serverMessage): void {
    this.showServerMessage = false;
    this.logger.debug(`Server message id: ${serverMessage.id} dismissed`);
    this.persistenceProvider.setServerMessageDismissed(serverMessage.id);
    this.removeServerMessage(serverMessage.id);
  }

  public checkServerMessage(serverMessage): void {
    if (serverMessage.app && serverMessage.app != this.appProvider.info.name) {
      this.removeServerMessage(serverMessage.id);
      return;
    }

    if (
      serverMessage.id === 'bcard-atm' &&
      (!this.showBitPayCard ||
        !this.bitpayCardItems ||
        !this.bitpayCardItems[0])
    ) {
      this.removeServerMessage(serverMessage.id);
      return;
    }

    this.persistenceProvider
      .getServerMessageDismissed(serverMessage.id)
      .then((value: string) => {
        if (value === 'dismissed') {
          this.removeServerMessage(serverMessage.id);
          return;
        }
        this.showServerMessage = true;
      });
  }

  public openServerMessageLink(url): void {
    this.externalLinkProvider.open(url);
  }

  public openCountryBannedLink(): void {
    const url =
      "https://github.com/bitpay/copay/wiki/Why-can't-I-use-BitPay's-services-in-my-country%3F";
    this.externalLinkProvider.open(url);
  }

  public goToWalletDetails(wallet, params): void {
    this.events.publish('OpenWallet', wallet, params);
  }

  // public openProposalsPage(): void {
  //   this.navCtrl.push(ProposalsPage);
  // }

  public goTo(page: string): void {
    const pageMap = {
      BitPayCardIntroPage,
      CoinbasePage,
      ShapeshiftPage
    };
    this.navCtrl.push(pageMap[page]);
  }

  public goToCard(cardId): void {
    this.navCtrl.push(BitPayCardPage, { id: cardId });
  }

  public doRefresh(refresher): void {
    this.debounceSetWallets();
    setTimeout(() => {
      this.updateCharts();
      refresher.complete();
    }, 2000);
  }

  public scan(): void {
    this.navCtrl.parent.select(1);
  }

  public settings(): void {
    this.navCtrl.push(SettingsPage);
  }

  public collapseGroup(keyId: string) {
    this.collapsedGroups[keyId] = this.collapsedGroups[keyId] ? false : true;
  }

  public isCollapsed(keyId: string): boolean {
    return this.collapsedGroups[keyId] ? true : false;
  }

  public addWallet(fromEthCard?: boolean): void {
    let keyId;
    const compatibleKeyWallets = _.values(
      _.groupBy(
        _.filter(this.wallets, wallet => {
          if (wallet.canAddNewAccount && wallet.keyId != 'read-only') {
            keyId = wallet.keyId;
            return true;
          } else return false;
        }),
        'keyId'
      )
    );

    if (fromEthCard && compatibleKeyWallets.length == 1) {
      this.navCtrl.push(CreateWalletPage, {
        isShared: false,
        coin: 'eth',
        keyId
      });
    } else if (fromEthCard && compatibleKeyWallets.length > 1) {
      this.navCtrl.push(AddWalletPage, {
        isCreate: true,
        isMultipleSeed: true,
        fromEthCard
      });
    } else {
      this.navCtrl.push(AddPage, {
        // Select currency to add to the same key (1 single seed compatible key)
        keyId: compatibleKeyWallets.length == 1 ? keyId : null,
        // Creates new key (same flow as onboarding)
        isZeroState: compatibleKeyWallets.length == 0 ? true : false,
        // Select currency and Key or creates a new Key
        isMultipleSeed: compatibleKeyWallets.length > 1 ? true : false
      });
    }
  }

}
