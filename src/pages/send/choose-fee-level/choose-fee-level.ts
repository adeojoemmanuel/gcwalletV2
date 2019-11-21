import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewController } from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';

// Providers
import { Coin, CurrencyProvider } from '../../../providers/currency/currency';
import { FeeProvider } from '../../../providers/fee/fee';
import { PopupProvider } from '../../../providers/popup/popup';

interface FeeOpts {
  feeUnit: string;
  feeUnitAmount: number;
  blockTime: number;
}
@Component({
  selector: 'page-choose-fee-level',
  templateUrl: 'choose-fee-level.html'
})
export class ChooseFeeLevelPage {
  private blockTime: number;
  private FEE_MULTIPLIER: number = 10;
  private FEE_MIN: number = 0;
  private feeUnitAmount: number;
  public feeUnit: string;
  public maxFeeRecommended: number;
  public minFeeRecommended: number;
  private minFeeAllowed: number;
  public maxFeeAllowed: number;

  public network: string;
  public feeLevel: string;
  public customFeePerKB: string;
  public feePerSatByte: string;
  public selectedFee: string;
  public feeOpts;
  public loadingFee: boolean;
  public feeLevels;
  public coin: Coin;
  public avgConfirmationTime: number;
  public customSatPerByte: number;
  public maxFee: number;
  public minFee: number;
  public showError: boolean;
  public showMaxWarning: boolean;
  public showMinWarning: boolean;
  public okText: string;
  public cancelText: string;

  constructor(
    private currencyProvider: CurrencyProvider,
    private viewCtrl: ViewController,
    private logger: Logger,
    private popupProvider: PopupProvider,
    private feeProvider: FeeProvider,
    private translate: TranslateService
  ) {
    this.okText = this.translate.instant('Ok');
    this.cancelText = this.translate.instant('Cancel');
    // From parent controller
    this.network = this.viewCtrl.data.network;
    this.coin = this.viewCtrl.data.coin;
    this.feeLevel = this.viewCtrl.data.feeLevel;
    this.setFeeUnits();

    // IF usingCustomFee
    this.customFeePerKB = this.viewCtrl.data.customFeePerKB
      ? this.viewCtrl.data.customFeePerKB
      : null;
    this.feePerSatByte = this.viewCtrl.data.feePerSatByte
      ? this.viewCtrl.data.feePerSatByte
      : null;

    if (_.isEmpty(this.feeLevel))
      this.showErrorAndClose(
        null,
        this.translate.instant('Fee level is not defined')
      );
    this.selectedFee = this.feeLevel;

    this.feeOpts = Object.keys(this.feeProvider.getFeeOpts());
    this.loadingFee = true;
    this.feeProvider
      .getFeeLevels(this.coin)
      .then(levels => {
        this.loadingFee = false;
        if (_.isEmpty(levels)) {
          this.showErrorAndClose(
            null,
            this.translate.instant('Could not get fee levels')
          );
          return;
        }
        this.feeLevels = levels;
        this.updateFeeRate();
      })
      .catch(err => {
        this.loadingFee = false;
        this.showErrorAndClose(null, err);
        return;
      });
  }

  private showErrorAndClose(title: string, msg: string): void {
    title = title ? title : this.translate.instant('Error');
    this.logger.error(msg);
    this.popupProvider.ionicAlert(title, msg).then(() => {
      this.viewCtrl.dismiss();
    });
  }

  private setFeeUnits() {
    const {
      feeUnit,
      feeUnitAmount,
      blockTime
    }: FeeOpts = this.currencyProvider.getFeeUnits(this.coin);
    this.feeUnit = feeUnit;
    this.feeUnitAmount = feeUnitAmount;
    this.blockTime = blockTime;
  }

  public updateFeeRate() {
    let value = _.find(this.feeLevels.levels[this.network], feeLevel => {
      return feeLevel.level == this.feeLevel;
    });

    // If no custom fee
    if (value) {
      this.customFeePerKB = null;
      this.feePerSatByte = (value.feePerKb / this.feeUnitAmount).toFixed();
      let avgConfirmationTime = value.nbBlocks * this.blockTime;
      this.avgConfirmationTime = avgConfirmationTime;
    } else {
      this.avgConfirmationTime = null;
      this.customSatPerByte = this.customFeePerKB
        ? Number(this.customFeePerKB) / this.feeUnitAmount
        : Number(this.feePerSatByte);
      this.customFeePerKB = (
        +this.feePerSatByte * this.feeUnitAmount
      ).toFixed();
    }

    // Warnings
    this.setFeesRecommended();
    this.checkFees(this.feePerSatByte);
  }

  public setFeesRecommended(): void {
    this.maxFeeRecommended = this.getMaxRecommended();
    this.minFeeRecommended = this.getMinRecommended();
    this.minFeeAllowed = this.FEE_MIN;
    this.maxFeeAllowed = this.maxFeeRecommended * this.FEE_MULTIPLIER;
    this.maxFee =
      this.maxFeeRecommended > this.maxFeeAllowed
        ? this.maxFeeRecommended
        : this.maxFeeAllowed;
    this.minFee =
      this.minFeeRecommended < this.minFeeAllowed
        ? this.minFeeRecommended
        : this.minFeeAllowed;
  }

  private getMinRecommended(): number {
    let value = _.find(this.feeLevels.levels[this.network], feeLevel => {
      return feeLevel.level == 'superEconomy';
    });

    return parseInt((value.feePerKb / this.feeUnitAmount).toFixed(), 10);
  }

  private getMaxRecommended(): number {
    let value = _.find(this.feeLevels.levels[this.network], feeLevel => {
      return feeLevel.level == 'urgent';
    });

    return parseInt((value.feePerKb / this.feeUnitAmount).toFixed(), 10);
  }

  public checkFees(feePerSatByte: string): void {
    let fee = Number(feePerSatByte);
    this.showError = fee <= this.minFeeAllowed ? true : false;
    this.showMinWarning =
      fee > this.minFeeAllowed && fee < this.minFeeRecommended ? true : false;
    this.showMaxWarning =
      fee < this.maxFeeAllowed && fee > this.maxFeeRecommended ? true : false;
  }

  public ok(): void {
    this.customFeePerKB = this.customFeePerKB
      ? (this.customSatPerByte * this.feeUnitAmount).toFixed()
      : null;
    this.viewCtrl.dismiss({
      newFeeLevel: this.feeLevel,
      customFeePerKB: this.customFeePerKB
    });
  }

  public cancel(): void {
    this.viewCtrl.dismiss();
  }

  public changeSelectedFee(newFeeLevelValue: string): void {
    if (this.feeLevel != newFeeLevelValue) {
      this.logger.debug('New fee level: ' + newFeeLevelValue);
      this.feeLevel = newFeeLevelValue;
      this.updateFeeRate();
    }
  }
}
