import { DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  App,
  Events,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';

// Pages
import { FinishModalPage } from '../../finish/finish';
import { TabsPage } from '../../tabs/tabs';
import { ChooseFeeLevelPage } from '../choose-fee-level/choose-fee-level';

// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { AddressProvider } from '../../../providers/address/address';
import { AppProvider } from '../../../providers/app/app';
import { BwcErrorProvider } from '../../../providers/bwc-error/bwc-error';
import { BwcProvider } from '../../../providers/bwc/bwc';
import { ClipboardProvider } from '../../../providers/clipboard/clipboard';
import { ConfigProvider } from '../../../providers/config/config';
import { Coin, CurrencyProvider } from '../../../providers/currency/currency';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { FeeProvider } from '../../../providers/fee/fee';
import { KeyProvider } from '../../../providers/key/key';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { PlatformProvider } from '../../../providers/platform/platform';
import { PopupProvider } from '../../../providers/popup/popup';
import { ProfileProvider } from '../../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../../providers/replace-parameters/replace-parameters';
import { TxConfirmNotificationProvider } from '../../../providers/tx-confirm-notification/tx-confirm-notification';
import { TxFormatProvider } from '../../../providers/tx-format/tx-format';
import {
  TransactionProposal,
  WalletProvider
} from '../../../providers/wallet/wallet';
import { WalletTabsChild } from '../../wallet-tabs/wallet-tabs-child';
import { WalletTabsProvider } from '../../wallet-tabs/wallet-tabs.provider';
@Component({
  selector: 'page-confirm',
  templateUrl: 'confirm.html'
})
export class ConfirmPage extends WalletTabsChild {
  @ViewChild('slideButton')
  slideButton;
  protected bitcoreCash;

  public countDown = null;
  public CONFIRM_LIMIT_USD: number;
  protected FEE_TOO_HIGH_LIMIT_PER: number;

  public tx;
  public wallet;
  public wallets;
  public noWalletMessage: string;
  public criticalError: boolean;
  public showAddress: boolean;
  public walletSelectorTitle: string;
  public buttonText: string;
  public successText: string;
  public paymentExpired: boolean;
  public remainingTimeStr: string;
  public hideSlideButton: boolean;
  public amount;
  public showMultiplesOutputs: boolean;
  public fromMultiSend: boolean;
  public recipients;
  public coin: Coin;
  public appName: string;
  public merchantFeeLabel: string;

  // Config Related values
  public config;
  public configFeeLevel: string;

  // Platform info
  public isCordova: boolean;

  // custom fee flag
  public usingCustomFee: boolean = false;
  public usingMerchantFee: boolean = false;

  public isOpenSelector: boolean;

  constructor(
    protected addressProvider: AddressProvider,
    protected app: App,
    protected actionSheetProvider: ActionSheetProvider,
    protected bwcErrorProvider: BwcErrorProvider,
    protected bwcProvider: BwcProvider,
    protected configProvider: ConfigProvider,
    protected currencyProvider: CurrencyProvider,
    protected decimalPipe: DecimalPipe,
    protected externalLinkProvider: ExternalLinkProvider,
    protected feeProvider: FeeProvider,
    protected logger: Logger,
    protected modalCtrl: ModalController,
    navCtrl: NavController,
    protected navParams: NavParams,
    protected onGoingProcessProvider: OnGoingProcessProvider,
    protected platformProvider: PlatformProvider,
    profileProvider: ProfileProvider,
    protected popupProvider: PopupProvider,
    protected replaceParametersProvider: ReplaceParametersProvider,
    protected translate: TranslateService,
    protected txConfirmNotificationProvider: TxConfirmNotificationProvider,
    protected txFormatProvider: TxFormatProvider,
    protected walletProvider: WalletProvider,
    walletTabsProvider: WalletTabsProvider,
    protected clipboardProvider: ClipboardProvider,
    protected events: Events,
    protected appProvider: AppProvider,
    protected keyProvider: KeyProvider,
    protected statusBar: StatusBar
  ) {
    super(navCtrl, profileProvider, walletTabsProvider);
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.CONFIRM_LIMIT_USD = 20;
    this.FEE_TOO_HIGH_LIMIT_PER = 15;
    this.config = this.configProvider.get();
    this.configFeeLevel = this.config.wallet.settings.feeLevel
      ? this.config.wallet.settings.feeLevel
      : 'normal';
    this.isCordova = this.platformProvider.isCordova;
    this.hideSlideButton = false;
    this.showMultiplesOutputs = false;
    this.recipients = this.navParams.data.recipients;
    this.fromMultiSend = this.navParams.data.fromMultiSend;
    this.appName = this.appProvider.info.nameCase;
  }

  ngOnInit() {
    // Overrides the ngOnInit logic of WalletTabsChild
  }

  ionViewWillLeave() {
    if (this.isCordova) {
      this.statusBar.styleBlackOpaque();
    }
    this.navCtrl.swipeBackEnabled = true;
  }

  ionViewWillEnter() {
    if (this.isCordova) {
      this.statusBar.styleDefault();
    }
    this.navCtrl.swipeBackEnabled = false;
    this.isOpenSelector = false;
    this.coin = this.navParams.data.coin;
    let networkName;
    let amount;
    if (this.fromMultiSend) {
      networkName = this.navParams.data.network;
      amount = this.navParams.data.totalAmount;
    } else {
      amount = this.navParams.data.amount;
      try {
        networkName = this.addressProvider.getCoinAndNetwork(
          this.navParams.data.toAddress,
          this.navParams.data.network
        ).network;
      } catch (e) {
        const message = this.replaceParametersProvider.replace(
          this.translate.instant(
            '{{appName}} only supports Bitcoin Cash using new version numbers addresses.'
          ),
          { appName: this.appName }
        );
        const backText = this.translate.instant('Go back');
        const learnText = this.translate.instant('Learn more');
        this.popupProvider
          .ionicConfirm(null, message, backText, learnText)
          .then(back => {
            if (!back) {
              const url =
                'https://support.bitpay.com/hc/en-us/articles/115004671663';
              this.externalLinkProvider.open(url);
            }
            this.navCtrl.pop();
          });
        return;
      }
    }

    this.tx = {
      toAddress: this.navParams.data.toAddress,
      sendMax: this.navParams.data.useSendMax ? true : false,
      amount: this.navParams.data.useSendMax ? 0 : parseInt(amount, 10),
      description: this.navParams.data.description,
      paypro: this.navParams.data.paypro,
      data: this.navParams.data.data, // eth
      payProUrl: this.navParams.data.payProUrl,
      spendUnconfirmed: this.config.wallet.spendUnconfirmed,

      // Vanity tx info (not in the real tx)
      recipientType: this.navParams.data.recipientType,
      name: this.navParams.data.name,
      email: this.navParams.data.email,
      color: this.navParams.data.color,
      network: this.navParams.data.network
        ? this.navParams.data.network
        : networkName,
      coin: this.navParams.data.coin,
      txp: {}
    };
    this.tx.origToAddress = this.tx.toAddress;

    if (this.navParams.data.requiredFeeRate) {
      this.usingMerchantFee = true;
      this.tx.feeRate = +this.navParams.data.requiredFeeRate;
    } else {
      this.tx.feeLevel =
        this.tx.coin && this.tx.coin == 'bch' ? 'normal ' : this.configFeeLevel;
    }

    if (this.tx.coin && this.tx.coin == 'bch' && !this.fromMultiSend) {
      this.tx.toAddress = this.bitcoreCash
        .Address(this.tx.toAddress)
        .toString(true);
    }

    this.getAmountDetails();

    const feeOpts = this.feeProvider.getFeeOpts();
    this.tx.feeLevelName = feeOpts[this.tx.feeLevel];
    this.showAddress = false;
    this.walletSelectorTitle = this.translate.instant('Send from');

    this.setWalletSelector(this.tx.coin, this.tx.network, this.tx.amount)
      .then(() => {
        this.afterWalletSelectorSet();
      })
      .catch(err => {
        this.showErrorInfoSheet(err, null, true);
      });

    if (this.isCordova) {
      window.addEventListener('keyboardWillShow', () => {
        this.hideSlideButton = true;
      });

      window.addEventListener('keyboardWillHide', () => {
        this.hideSlideButton = false;
      });
    }
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: ConfirmPage');
  }

  private getAmountDetails() {
    this.amount = this.decimalPipe.transform(
      this.tx.amount /
        this.currencyProvider.getPrecision(this.coin).unitToSatoshi,
      '1.2-6'
    );
  }

  private afterWalletSelectorSet() {
    const parentWallet = this.getParentWallet();
    if (
      parentWallet &&
      this.tx.coin === parentWallet.coin &&
      this.tx.network === parentWallet.network
    ) {
      this.setWallet(parentWallet);
    } else if (this.wallets.length > 1) {
      return this.showWallets();
    } else if (this.wallets.length) {
      this.setWallet(this.wallets[0]);
    }
  }

  private setWalletSelector(
    coin: string,
    network: string,
    minAmount: number
  ): Promise<any> {
    const parentWallet = this.getParentWallet();
    if (
      parentWallet &&
      (parentWallet.network == network && parentWallet.coin == coin)
    ) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      // no min amount? (sendMax) => look for no empty wallets
      minAmount = minAmount ? minAmount : 1;

      this.wallets = this.profileProvider.getWallets({
        onlyComplete: true,
        hasFunds: true,
        network,
        coin
      });

      return resolve();
    });
  }

  /* sets a wallet on the UI, creates a TXPs for that wallet */

  private setWallet(wallet): void {
    this.wallet = wallet;

    // If select another wallet
    this.tx.coin = this.wallet.coin;

    if (!this.usingCustomFee && !this.usingMerchantFee) {
      this.tx.feeLevel = wallet.coin == 'bch' ? 'normal' : this.configFeeLevel;
    }

    this.setButtonText(this.wallet.credentials.m > 1, !!this.tx.paypro);

    if (this.tx.paypro) this.paymentTimeControl(this.tx.paypro.expires);

    const feeOpts = this.feeProvider.getFeeOpts();
    this.tx.feeLevelName = feeOpts[this.tx.feeLevel];
    this.updateTx(this.tx, this.wallet, { dryRun: true }).catch(err => {
      const previousView = this.navCtrl.getPrevious().name;
      switch (err) {
        case 'insufficient_funds':
          if (this.showUseUnconfirmedMsg()) {
            this.showErrorInfoSheet(
              this.translate.instant(
                'You do not have enough confirmed funds to make this payment. Wait for your pending transactions to confirm or enable "Use unconfirmed funds" in Advanced Settings.'
              ),
              this.translate.instant('No enough confirmed funds'),
              true
            );
          } else if (previousView === 'AmountPage') {
            // Do not allow user to change or use max amount if previous view is not Amount
            this.showInsufficientFundsInfoSheet();
          } else {
            this.showErrorInfoSheet(
              this.translate.instant(
                'You are trying to send more funds than you have available. Make sure you do not have funds locked by pending transaction proposals.'
              ),
              this.translate.instant('Insufficient funds'),
              true
            );
          }
          break;
        default:
          this.showErrorInfoSheet(err);
          break;
      }
    });
  }

  private showUseUnconfirmedMsg(): boolean {
    return (
      this.wallet.cachedStatus &&
      this.wallet.cachedStatus.balance.totalAmount >=
        this.tx.amount + this.tx.feeRate &&
      !this.tx.spendUnconfirmed
    );
  }

  private setButtonText(isMultisig: boolean, isPayPro: boolean): void {
    if (isPayPro) {
      this.buttonText = this.isCordova
        ? this.translate.instant('Slide to pay')
        : this.translate.instant('Click to pay');
    } else if (isMultisig) {
      this.buttonText = this.isCordova
        ? this.translate.instant('Slide to accept')
        : this.translate.instant('Click to accept');
      this.successText =
        this.wallet.credentials.n == 1
          ? this.translate.instant('Payment Sent')
          : this.translate.instant('Proposal created');
    } else {
      this.buttonText = this.isCordova
        ? this.translate.instant('Slide to send')
        : this.translate.instant('Click to send');
      this.successText = this.translate.instant('Payment Sent');
    }
  }

  protected paymentTimeControl(expires: string): void {
    const expirationTime = Math.floor(new Date(expires).getTime() / 1000);
    this.paymentExpired = false;
    this.setExpirationTime(expirationTime);

    const countDown = setInterval(() => {
      this.setExpirationTime(expirationTime, countDown);
    }, 1000);
  }

  private setExpirationTime(expirationTime: number, countDown?): void {
    const now = Math.floor(Date.now() / 1000);

    if (now > expirationTime) {
      this.paymentExpired = true;
      this.remainingTimeStr = this.translate.instant('Expired');
      if (countDown) {
        /* later */
        clearInterval(countDown);
      }
      return;
    }

    const totalSecs = expirationTime - now;
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    this.remainingTimeStr = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }

  private updateTx(tx, wallet, opts): Promise<any> {
    return new Promise((resolve, reject) => {
      if (opts.clearCache) {
        tx.txp = {};
      }

      this.tx = tx;

      // End of quick refresh, before wallet is selected.
      if (!wallet) {
        return resolve();
      }

      this.onGoingProcessProvider.set('calculatingFee');
      this.feeProvider
        .getFeeRate(
          wallet.coin,
          tx.network,
          this.usingMerchantFee
            ? this.currencyProvider.getMaxMerchantFee(wallet.coin)
            : this.tx.feeLevel
        )
        .then(feeRate => {
          let msg;
          if (this.usingCustomFee) {
            msg = this.translate.instant('Custom');
            tx.feeLevelName = msg;
          } else if (this.usingMerchantFee) {
            const maxAllowedFee = feeRate * 5;
            this.logger.info(
              `Using Merchant Fee: ${
                tx.feeRate
              } vs. referent level (5 * feeRate) ${maxAllowedFee}`
            );
            if (tx.network != 'testnet' && tx.feeRate > maxAllowedFee) {
              this.onGoingProcessProvider.set('calculatingFee');
              this.showHighFeeSheet();
            }

            msg = this.translate.instant(
              'This payment requires a miner fee of:'
            );
            this.merchantFeeLabel = msg;
          } else {
            const feeOpts = this.feeProvider.getFeeOpts();
            tx.feeLevelName = feeOpts[tx.feeLevel];
            tx.feeRate = feeRate;
          }

          // call getSendMaxInfo if was selected from amount view
          if (tx.sendMax) {
            this.useSendMax(tx, wallet, opts)
              .then(() => {
                return resolve();
              })
              .catch(err => {
                return reject(err);
              });
          } else {
            // txp already generated for this wallet?
            if (tx.txp[wallet.id]) {
              this.onGoingProcessProvider.clear();
              return resolve();
            }

            this.buildTxp(tx, wallet, opts)
              .then(() => {
                this.onGoingProcessProvider.clear();
                return resolve();
              })
              .catch(err => {
                this.onGoingProcessProvider.clear();
                return reject(err);
              });
          }
        })
        .catch(err => {
          this.logger.warn('Error getting fee rate', err);
          this.onGoingProcessProvider.clear();
          return reject(this.translate.instant('Error getting fee rate'));
        });
    });
  }

  private useSendMax(tx, wallet, opts) {
    return new Promise((resolve, reject) => {
      this.getSendMaxInfo(_.clone(tx), wallet)
        .then(sendMaxInfo => {
          if (sendMaxInfo) {
            this.logger.debug('Send max info', sendMaxInfo);

            if (sendMaxInfo.amount <= 0) {
              this.showErrorInfoSheet(
                this.translate.instant('Not enough funds for fee')
              );
              return resolve();
            }
            tx.sendMaxInfo = sendMaxInfo;
            tx.amount = tx.sendMaxInfo.amount;
            this.getAmountDetails();
          }
          this.showSendMaxWarning(wallet, sendMaxInfo);
          // txp already generated for this wallet?
          if (tx.txp[wallet.id]) {
            return resolve();
          }

          this.buildTxp(tx, wallet, opts)
            .then(() => {
              return resolve();
            })
            .catch(err => {
              return reject(err);
            });
        })
        .catch(() => {
          const msg = this.translate.instant(
            'Error getting SendMax information'
          );
          return reject(msg);
        });
    });
  }

  protected getFeeRate(amount: number, fee: number) {
    return (fee / (amount + fee)) * 100;
  }

  protected isHighFee(amount: number, fee: number) {
    return this.getFeeRate(amount, fee) > this.FEE_TOO_HIGH_LIMIT_PER;
  }

  protected showHighFeeSheet() {
    const minerFeeInfoSheet = this.actionSheetProvider.createInfoSheet(
      'miner-fee'
    );
    minerFeeInfoSheet.present();
  }

  private buildTxp(tx, wallet, opts): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTxp(_.clone(tx), wallet, opts.dryRun)
        .then(txp => {
          const per = this.getFeeRate(txp.amount, txp.fee);
          txp.feeRatePerStr = per.toFixed(2) + '%';
          txp.feeTooHigh = this.isHighFee(txp.amount, txp.fee);

          if (txp.feeTooHigh) {
            this.showHighFeeSheet();
          }

          tx.txp[wallet.id] = txp;
          this.tx = tx;
          this.logger.debug(
            'Confirm. TX Fully Updated for wallet:' +
              wallet.id +
              ' Txp:' +
              txp.id
          );
          return resolve();
        })
        .catch(err => {
          if (err.message == 'Insufficient funds') {
            return reject('insufficient_funds');
          } else {
            return reject(err);
          }
        });
    });
  }

  private getSendMaxInfo(tx, wallet): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!tx.sendMax) return resolve();

      this.onGoingProcessProvider.set('retrievingInputs');
      this.walletProvider
        .getSendMaxInfo(wallet, {
          feePerKb: tx.feeRate,
          excludeUnconfirmedUtxos: !tx.spendUnconfirmed,
          returnInputs: true
        })
        .then(res => {
          this.onGoingProcessProvider.clear();
          return resolve(res);
        })
        .catch(err => {
          this.onGoingProcessProvider.clear();
          this.logger.warn('Error getting send max info', err);
          return reject(err);
        });
    });
  }

  private showSendMaxWarning(wallet, sendMaxInfo): void {
    if (!sendMaxInfo) return;

    const warningMsg = this.verifyExcludedUtxos(wallet, sendMaxInfo);

    const coinName = this.currencyProvider.getCoinName(this.wallet.coin);

    const { unitToSatoshi } = this.currencyProvider.getPrecision(this.tx.coin);

    const fee = sendMaxInfo.fee / unitToSatoshi;

    const minerFeeNoticeInfoSheet = this.actionSheetProvider.createInfoSheet(
      'miner-fee-notice',
      {
        coinName,
        fee,
        coin: this.tx.coin.toUpperCase(),
        msg: !_.isEmpty(warningMsg) ? warningMsg : ''
      }
    );
    minerFeeNoticeInfoSheet.present();
  }

  private verifyExcludedUtxos(_, sendMaxInfo) {
    const warningMsg = [];
    if (sendMaxInfo.utxosBelowFee > 0) {
      const amountBelowFeeStr =
        sendMaxInfo.amountBelowFee /
        this.currencyProvider.getPrecision(this.tx.coin).unitToSatoshi;
      const message = this.replaceParametersProvider.replace(
        this.translate.instant(
          'A total of {{amountBelowFeeStr}} {{coin}} were excluded. These funds come from UTXOs smaller than the network fee provided.'
        ),
        { amountBelowFeeStr, coin: this.tx.coin.toUpperCase() }
      );
      warningMsg.push(message);
    }

    if (sendMaxInfo.utxosAboveMaxSize > 0) {
      const amountAboveMaxSizeStr =
        sendMaxInfo.amountAboveMaxSize /
        this.currencyProvider.getPrecision(this.tx.coin).unitToSatoshi;
      const message = this.replaceParametersProvider.replace(
        this.translate.instant(
          'A total of {{amountAboveMaxSizeStr}} {{coin}} were excluded. The maximum size allowed for a transaction was exceeded.'
        ),
        { amountAboveMaxSizeStr, coin: this.tx.coin.toUpperCase() }
      );
      warningMsg.push(message);
    }
    return warningMsg.join('\n');
  }

  private getTxp(tx, wallet, dryRun: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      // ToDo: use a credential's (or fc's) function for this
      if (tx.description && !wallet.credentials.sharedEncryptingKey) {
        const msg = this.translate.instant(
          'Could not add message to imported wallet without shared encrypting key'
        );
        return reject(msg);
      }
      if (
        this.currencyProvider.isUtxoCoin(tx.coin) &&
        tx.amount > Number.MAX_SAFE_INTEGER
      ) {
        const msg = this.translate.instant('Amount too big');
        return reject(msg);
      }

      const txp: Partial<TransactionProposal> = {};

      if (this.fromMultiSend) {
        txp.outputs = [];
        this.navParams.data.recipients.forEach(recipient => {
          if (tx.coin && tx.coin == 'bch') {
            recipient.toAddress = this.bitcoreCash
              .Address(recipient.toAddress)
              .toString(true);

            recipient.addressToShow = this.walletProvider.getAddressView(
              tx.coin,
              tx.network,
              recipient.toAddress
            );
          }

          txp.outputs.push({
            toAddress: recipient.toAddress,
            amount: recipient.amount,
            message: tx.description
          });
        });
      } else {
        txp.outputs = [
          {
            toAddress: tx.toAddress,
            amount: tx.amount,
            message: tx.description
          }
        ];
      }

      if (tx.sendMaxInfo) {
        txp.inputs = tx.sendMaxInfo.inputs;
        txp.fee = tx.sendMaxInfo.fee;
      } else {
        if (this.usingCustomFee || this.usingMerchantFee) {
          txp.feePerKb = tx.feeRate;
        } else txp.feeLevel = tx.feeLevel;
      }

      txp.message = tx.description;

      if (tx.paypro) {
        txp.payProUrl = tx.payProUrl;
        tx.paypro.host = new URL(tx.payProUrl).host;
      }
      txp.excludeUnconfirmedUtxos = !tx.spendUnconfirmed;
      txp.dryRun = dryRun;

      txp.data = tx.data; // eth
      if (tx.recipientType == 'wallet') {
        txp.customData = {
          toWalletName: tx.name ? tx.name : null
        };
      }

      this.walletProvider
        .getAddress(this.wallet, false)
        .then(address => {
          txp.from = address;
          this.walletProvider
            .createTx(wallet, txp)
            .then(ctxp => {
              return resolve(ctxp);
            })
            .catch(err => {
              return reject(err);
            });
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  private showInsufficientFundsInfoSheet(): void {
    const insufficientFundsInfoSheet = this.actionSheetProvider.createInfoSheet(
      'insufficient-funds'
    );
    insufficientFundsInfoSheet.present();
    insufficientFundsInfoSheet.onDidDismiss(option => {
      if (option || typeof option === 'undefined') {
        this.isWithinWalletTabs()
          ? this.navCtrl.pop()
          : this.app.getRootNavs()[0].setRoot(TabsPage); // using setRoot(TabsPage) as workaround when coming from scanner
      } else {
        this.tx.sendMax = true;
        this.setWallet(this.wallet);
      }
    });
  }

  public showErrorInfoSheet(
    error: Error | string,
    title?: string,
    exit?: boolean
  ): void {
    if (!error) return;
    this.logger.warn('ERROR:', error);
    if (this.isCordova) this.slideButton.isConfirmed(false);
    if (
      (error as Error).message === 'FINGERPRINT_CANCELLED' ||
      (error as Error).message === 'PASSWORD_CANCELLED'
    ) {
      this.hideSlideButton = false;
      return;
    }
    const infoSheetTitle = title ? title : this.translate.instant('Error');

    const errorInfoSheet = this.actionSheetProvider.createInfoSheet(
      'default-error',
      { msg: this.bwcErrorProvider.msg(error), title: infoSheetTitle }
    );
    errorInfoSheet.present();
    errorInfoSheet.onDidDismiss(() => {
      this.hideSlideButton = false;
      if (exit) {
        this.isWithinWalletTabs()
          ? this.navCtrl.popToRoot()
          : this.navCtrl.last().name == 'ConfirmCardPurchasePage'
          ? this.navCtrl.pop()
          : this.app.getRootNavs()[0].setRoot(TabsPage); // using setRoot(TabsPage) as workaround when coming from scanner
      }
    });
  }

  public toggleAddress(): void {
    this.showAddress = !this.showAddress;
  }

  public onWalletSelect(wallet): void {
    this.setWallet(wallet);
  }

  public approve(tx, wallet): Promise<void> {
    if (!tx || !wallet) return undefined;

    this.hideSlideButton = true;
    if (this.paymentExpired) {
      this.showErrorInfoSheet(
        this.translate.instant('This bitcoin payment request has expired.')
      );
      return undefined;
    }

    this.onGoingProcessProvider.set('creatingTx');
    return this.getTxp(_.clone(tx), wallet, false)
      .then(txp => {
        return this.confirmTx(txp, wallet).then((nok: boolean) => {
          if (nok) {
            if (this.isCordova) {
              this.slideButton.isConfirmed(false);
              this.hideSlideButton = false;
            }
            this.onGoingProcessProvider.clear();
            return;
          }
          this.publishAndSign(txp, wallet);
        });
      })
      .catch(err => {
        this.onGoingProcessProvider.clear();
        this.logger.warn('Error getting transaction proposal', err);
      });
  }

  private confirmTx(txp, wallet) {
    return new Promise<boolean>(resolve => {
      if (wallet.isPrivKeyEncrypted) return resolve(false);
      this.txFormatProvider.formatToUSD(wallet.coin, txp.amount).then(val => {
        const amountUsd = parseFloat(val);
        if (amountUsd <= this.CONFIRM_LIMIT_USD) return resolve(false);
        const unit = txp.coin.toUpperCase();
        const amount = (
          this.tx.amount /
          this.currencyProvider.getPrecision(txp.coin).unitToSatoshi
        ).toFixed(8);
        const name = wallet.name;
        const message = this.replaceParametersProvider.replace(
          this.translate.instant(
            'Sending {{amount}} {{unit}} from your {{name}} wallet'
          ),
          { amount, unit, name }
        );
        const okText = this.translate.instant('Confirm');
        const cancelText = this.translate.instant('Cancel');
        this.popupProvider
          .ionicConfirm(null, message, okText, cancelText)
          .then((ok: boolean) => {
            return resolve(!ok);
          });
      });
    });
  }

  protected publishAndSign(txp, wallet) {
    if (!wallet.canSign) {
      return this.onlyPublish(txp, wallet);
    }

    return this.walletProvider
      .publishAndSign(wallet, txp)
      .then(txp => {
        this.onGoingProcessProvider.clear();
        if (
          this.config.confirmedTxsNotifications &&
          this.config.confirmedTxsNotifications.enabled
        ) {
          this.txConfirmNotificationProvider.subscribe(wallet, {
            txid: txp.txid
          });
        }
        return this.openFinishModal();
      })
      .catch(err => {
        if (this.isCordova) this.slideButton.isConfirmed(false);
        this.onGoingProcessProvider.clear();
        this.showErrorInfoSheet(err);
        if (txp.payProUrl) {
          this.logger.warn('Paypro error: removing payment proposal');
          this.walletProvider.removeTx(wallet, txp).catch(() => {
            this.logger.warn('Could not delete payment proposal');
          });
        }
      });
  }

  private onlyPublish(txp, wallet): Promise<void> {
    this.logger.info('No signing proposal: No private key');
    this.onGoingProcessProvider.set('sendingTx');
    return this.walletProvider
      .onlyPublish(wallet, txp)
      .then(() => {
        this.onGoingProcessProvider.clear();
        this.openFinishModal(true);
      })
      .catch(err => {
        this.onGoingProcessProvider.clear();
        this.showErrorInfoSheet(err);
      });
  }

  protected async openFinishModal(onlyPublish?: boolean) {
    let params: { finishText: string; finishComment?: string } = {
      finishText: this.successText
    };
    if (onlyPublish) {
      const finishText = this.translate.instant('Payment Published');
      const finishComment = this.translate.instant(
        'You could sign the transaction later in your wallet details'
      );
      params = { finishText, finishComment };
    }
    const modal = this.modalCtrl.create(FinishModalPage, params, {
      showBackdrop: true,
      enableBackdropDismiss: false,
      cssClass: 'finish-modal'
    });
    await modal.present();

    this.clipboardProvider.clearClipboardIfValidData([
      'PayPro',
      'BitcoinUri',
      'BitcoinCashUri',
      'InvoiceUri'
    ]);

    if (this.isWithinWalletTabs()) {
      this.close().then(() => {
        this.events.publish('OpenWallet', this.wallet);
      });
    } else {
      // using setRoot(TabsPage) as workaround when coming from scanner
      this.app
        .getRootNavs()[0]
        .setRoot(TabsPage)
        .then(() => {
          setTimeout(() => {
            this.events.publish('OpenWallet', this.wallet);
          }, 1000);
        });
    }
  }

  public chooseFeeLevel(): void {
    if (this.tx.coin == 'bch') return;
    if (this.usingMerchantFee) return; // TODO: should we allow override?

    const txObject = {
      network: this.tx.network,
      feeLevel: this.tx.feeLevel,
      noSave: true,
      coin: this.tx.coin,
      customFeePerKB: this.usingCustomFee ? this.tx.feeRate : undefined,
      feePerSatByte: this.usingCustomFee ? this.tx.feeRate / 1000 : undefined
    };

    const myModal = this.modalCtrl.create(ChooseFeeLevelPage, txObject, {
      showBackdrop: true,
      enableBackdropDismiss: false
    });

    myModal.present();

    myModal.onDidDismiss(data => {
      this.onFeeModalDismiss(data);
    });
  }

  private onFeeModalDismiss(data) {
    if (_.isEmpty(data)) return;

    this.logger.debug(
      'New fee level chosen:' + data.newFeeLevel + ' was:' + this.tx.feeLevel
    );
    this.usingCustomFee = data.newFeeLevel == 'custom' ? true : false;

    if (this.tx.feeLevel == data.newFeeLevel && !this.usingCustomFee) {
      return;
    }

    this.tx.feeLevel = data.newFeeLevel;
    const feeOpts = this.feeProvider.getFeeOpts();
    this.tx.feeLevelName = feeOpts[this.tx.feeLevel];
    if (this.usingCustomFee)
      this.tx.feeRate = parseInt(data.customFeePerKB, 10);

    this.updateTx(this.tx, this.wallet, {
      clearCache: true,
      dryRun: true
    }).catch(err => {
      this.logger.warn('Error updateTx', err);
    });
  }

  public showWallets(): void {
    this.isOpenSelector = true;
    const id = this.wallet ? this.wallet.credentials.walletId : null;
    const params = {
      wallets: this.wallets,
      selectedWalletId: id,
      title: this.walletSelectorTitle
    };
    const walletSelector = this.actionSheetProvider.createWalletSelector(
      params
    );
    walletSelector.present();
    walletSelector.onDidDismiss(wallet => {
      this.onSelectWalletEvent(wallet);
    });
  }

  private onSelectWalletEvent(wallet): void {
    if (!_.isEmpty(wallet)) this.onWalletSelect(wallet);
    this.isOpenSelector = false;
  }
}
