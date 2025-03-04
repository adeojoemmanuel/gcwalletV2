import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, NavController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

import * as _ from 'lodash';

// providers
import { AppProvider } from '../../providers/app/app';
import { BitPayCardProvider } from '../../providers/bitpay-card/bitpay-card';
import { ConfigProvider } from '../../providers/config/config';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
import { LanguageProvider } from '../../providers/language/language';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { TouchIdProvider } from '../../providers/touchid/touchid';

// pages
import { AddPage } from '../add/add';
import { BitPayCardIntroPage } from '../integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { BitPaySettingsPage } from '../integrations/bitpay-card/bitpay-settings/bitpay-settings';
import { CoinbaseSettingsPage } from '../integrations/coinbase/coinbase-settings/coinbase-settings';
import { GiftCardsSettingsPage } from '../integrations/gift-cards/gift-cards-settings/gift-cards-settings';
import { ShapeshiftSettingsPage } from '../integrations/shapeshift/shapeshift-settings/shapeshift-settings';
import { PinModalPage } from '../pin/pin-modal/pin-modal';
import { AboutPage } from './about/about';
import { AddressbookPage } from './addressbook/addressbook';
import { AdvancedPage } from './advanced/advanced';
import { AltCurrencyPage } from './alt-currency/alt-currency';
import { FeePolicyPage } from './fee-policy/fee-policy';
import { LanguagePage } from './language/language';
import { LockPage } from './lock/lock';
import { NotificationsPage } from './notifications/notifications';
import { SharePage } from './share/share';
import { WalletGroupSettingsPage } from './wallet-group-settings/wallet-group-settings';
import { WalletSettingsPage } from './wallet-settings/wallet-settings';
import { ScanPage } from '../scan/scan';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  public appName: string;
  public currentLanguageName: string;
  public languages;
  public config;
  public selectedAlternative;
  public isCordova: boolean;
  public lockMethod: string;
  public integrationServices = [];
  public bitpayCardItems = [];
  public showBitPayCard: boolean = false;
  public encryptEnabled: boolean;
  public touchIdAvailable: boolean;
  public touchIdEnabled: boolean;
  public touchIdPrevValue: boolean;
  public walletsGroups: any[];

  constructor(
    private navCtrl: NavController,
    private app: AppProvider,
    private language: LanguageProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private profileProvider: ProfileProvider,
    private configProvider: ConfigProvider,
    private logger: Logger,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private bitPayCardProvider: BitPayCardProvider,
    private platformProvider: PlatformProvider,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private touchid: TouchIdProvider,
    private externalLinkProvder: ExternalLinkProvider
  ) {
    this.appName = this.app.info.nameCase;
    this.isCordova = this.platformProvider.isCordova;
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: SettingsPage');
  }

  ionViewWillEnter() {
    this.currentLanguageName = this.language.getName(
      this.language.getCurrent()
    );

    const opts = {
      showHidden: true
    };
    const wallets = this.profileProvider.getWallets(opts);
    this.walletsGroups = _.values(_.groupBy(wallets, 'keyId'));
    this.config = this.configProvider.get();
    this.selectedAlternative = {
      name: this.config.wallet.settings.alternativeName,
      isoCode: this.config.wallet.settings.alternativeIsoCode
    };
    this.lockMethod =
      this.config && this.config.lock && this.config.lock.method
        ? this.config.lock.method.toLowerCase()
        : null;
  }

  ionViewDidEnter() {
    // Show integrations
    const integrations = this.homeIntegrationsProvider.get();

    // Hide BitPay if linked
    setTimeout(() => {
      this.integrationServices = _.remove(_.clone(integrations), x => {
        if (x.name == 'debitcard' && x.linked) return false;
        else return x;
      });
    }, 200);

    // Only BitPay Wallet
    this.bitPayCardProvider.get({}, (_, cards) => {
      this.showBitPayCard = this.app.info._enabledExtensions.debitcard
        ? true
        : false;
      this.bitpayCardItems = cards;
    });
  }

  public openAltCurrencyPage(): void {
    this.navCtrl.push(AltCurrencyPage);
  }


  public openLanguagePage(): void {
    this.navCtrl.push(LanguagePage);
  }

  public openAdvancedPage(): void {
    this.navCtrl.push(AdvancedPage);
  }

  public openAboutPage(): void {
    this.navCtrl.push(AboutPage);
  }

  public openLockPage(): void {
    const config = this.configProvider.get();
    const lockMethod =
      config && config.lock && config.lock.method
        ? config.lock.method.toLowerCase()
        : null;
    if (!lockMethod || lockMethod == 'disabled') this.navCtrl.push(LockPage);
    if (lockMethod == 'pin') this.openPinModal('lockSetUp');
    if (lockMethod == 'fingerprint') this.checkFingerprint();
  }

  public openMerchantDirectorySite() {
    this.externalLinkProvder.open(
      `https://bitpay.com/directory/?hideGiftCards=true`
    );
  }

  public openAddressBookPage(): void {
    this.navCtrl.push(AddressbookPage);
  }

  public openNotificationsPage(): void {
    this.navCtrl.push(NotificationsPage);
  }

  public openFeePolicyPage(): void {
    this.navCtrl.push(FeePolicyPage);
  }

  public openWalletSettingsPage(walletId: string): void {
    this.navCtrl.push(WalletSettingsPage, { walletId });
  }

  public openSharePage(): void {
    this.navCtrl.push(SharePage);
  }

  public openSettingIntegration(name: string): void {
    switch (name) {
      case 'coinbase':
        this.navCtrl.push(CoinbaseSettingsPage);
        break;
      case 'debitcard':
        this.navCtrl.push(BitPaySettingsPage);
        break;
      case 'shapeshift':
        this.navCtrl.push(ShapeshiftSettingsPage);
        break;
      case 'giftcards':
        this.navCtrl.push(GiftCardsSettingsPage);
        break;
    }
  }

  public openCardSettings(id): void {
    this.navCtrl.push(BitPaySettingsPage, { id });
  }

  public openGiftCardsSettings() {
    this.navCtrl.push(GiftCardsSettingsPage);
  }

  public openHelpExternalLink(): void {
    const url =
      this.appName == 'Copay'
        ? 'https://www.getcoins.com'
        : 'https://www.getcoins.com';
    const optIn = true;
    const title = null;
    const message = this.translate.instant(
      'Help and support information is available at the website.'
    );
    const okText = this.translate.instant('Open');
    const cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

  public addBitpayCard() {
    this.navCtrl.push(BitPayCardIntroPage);
  }

  private openPinModal(action): void {
    const modal = this.modalCtrl.create(
      PinModalPage,
      { action },
      { cssClass: 'fullscreen-modal' }
    );
    modal.present();
    modal.onDidDismiss(cancelClicked => {
      if (!cancelClicked) this.navCtrl.push(LockPage);
    });
  }

  private checkFingerprint(): void {
    this.touchid.check().then(() => {
      this.navCtrl.push(LockPage);
    });
  }

  public openSupportEncryptPassword(): void {
    const url =
      'https://support.bitpay.com/hc/en-us/articles/360000244506-What-Does-a-Spending-Password-Do-';
    const optIn = true;
    const title = null;
    const message = this.translate.instant('Read more in our support page');
    const okText = this.translate.instant('Open');
    const cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

  public openScanner(){
    this.navCtrl.push(ScanPage);
  }

  public openScanPage(): void {
    this.navCtrl.parent.select(2);
    // this.navCtrl.push(ScanPage);
    this.navCtrl.setRoot(ScanPage);
  }

  public openWalletGroupSettings(keyId: string): void {
    this.navCtrl.push(WalletGroupSettingsPage, { keyId });
  }

  public goToAddView(): void {
    this.navCtrl.push(AddPage, {
      isZeroState: true
    });
  }
}
