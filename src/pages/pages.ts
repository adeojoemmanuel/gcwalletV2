/* Pages */
import { AddWalletPage } from '../pages/add-wallet/add-wallet';
import { AddPage } from '../pages/add/add';
import { CopayersPage } from '../pages/add/copayers/copayers';
import { CreateWalletPage } from '../pages/add/create-wallet/create-wallet';
import { ImportWalletPage } from '../pages/add/import-wallet/import-wallet';
import { JoinWalletPage } from '../pages/add/join-wallet/join-wallet';
import { LoginPage } from '../pages/hub/login';
import { SelectCurrencyPage } from '../pages/add/select-currency/select-currency';
import { BackupGamePage } from '../pages/backup/backup-game/backup-game';
import { BackupKeyPage } from '../pages/backup/backup-key/backup-key';
import { ForgotpassPage } from '../pages/hub/forgotpass/forgotpass';
import { SendFeedbackPage } from '../pages/feedback/send-feedback/send-feedback';
import { FinishModalPage } from '../pages/finish/finish';
import { CollectEmailPage } from '../pages/onboarding/collect-email/collect-email';
import { DisclaimerPage } from '../pages/onboarding/disclaimer/disclaimer';
import { OnboardingPage } from '../pages/onboarding/onboarding';
import { PaperWalletPage } from '../pages/paper-wallet/paper-wallet';
import { RegisterPage } from '../pages/hub/register/register';
import { ReportDetailsPage } from '../pages/hub-transactions/report-details/report-details';
import { ReportTransaction } from '../pages/hub-transactions/report-transaction/report-transaction';
import { SlideToAcceptPage } from '../pages/slide-to-accept/slide-to-accept';
import { TransactionDetailsPage } from '../pages/hub-transactions/transaction-details/transaction-details';
import { TabsPage } from '../pages/tabs/tabs';
import { TransactionsPage } from '../pages/hub-transactions/transactions/transactions';
import { TxDetailsPage } from '../pages/tx-details/tx-details';
import { TxpDetailsPage } from '../pages/txp-details/txp-details';
import { SearchTxModalPage } from '../pages/wallet-details/search-tx-modal/search-tx-modal';

import { ViewReport } from '../pages/hub-transactions/view-report/view-report';
import { WalletBalancePage } from '../pages/wallet-details/wallet-balance/wallet-balance';
import { WalletDetailsPage } from '../pages/wallet-details/wallet-details';
import { WalletTabsPage } from '../pages/wallet-tabs/wallet-tabs';
import { ConfirmInvoicePage } from './integrations/invoice/confirm-invoice/confirm-invoice';
import { AtmLocationsPage } from './atm-locations/atm-locations';




// Integrations: Coinbase
import { BuyCoinbasePage } from '../pages/integrations/coinbase/buy-coinbase/buy-coinbase';
import { CoinbasePage } from '../pages/integrations/coinbase/coinbase';
import { CoinbaseSettingsPage } from '../pages/integrations/coinbase/coinbase-settings/coinbase-settings';
import { CoinbaseTxDetailsPage } from '../pages/integrations/coinbase/coinbase-tx-details/coinbase-tx-details';
import { SellCoinbasePage } from '../pages/integrations/coinbase/sell-coinbase/sell-coinbase';

// Integrations: ShapeShift
import { ShapeshiftPage } from '../pages/integrations/shapeshift/shapeshift';
import { ShapeshiftConfirmPage } from '../pages/integrations/shapeshift/shapeshift-confirm/shapeshift-confirm';
import { ShapeshiftDetailsPage } from '../pages/integrations/shapeshift/shapeshift-details/shapeshift-details';
import { ShapeshiftSettingsPage } from '../pages/integrations/shapeshift/shapeshift-settings/shapeshift-settings';
import { ShapeshiftShiftPage } from '../pages/integrations/shapeshift/shapeshift-shift/shapeshift-shift';

// Integrations: BitPayCard
import { BitPayCardPage } from '../pages/integrations/bitpay-card/bitpay-card';
import { BitPayCardHome } from '../pages/integrations/bitpay-card/bitpay-card-home/bitpay-card-home';
import { BitPayCardIntroPage } from '../pages/integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { BitPayCardTopUpPage } from '../pages/integrations/bitpay-card/bitpay-card-topup/bitpay-card-topup';
import { BitPaySettingsPage } from '../pages/integrations/bitpay-card/bitpay-settings/bitpay-settings';

/*Includes */
import { CardItemPage } from '../pages/includes/card-item/card-item';
import { CoinSelectorPage } from '../pages/includes/coin-selector/coin-selector';
import { CreateNewWalletPage } from '../pages/includes/create-new-wallet/create-new-wallet';
import { EthLiveCardPage } from '../pages/includes/eth-live-card/eth-live-card';
import { FeedbackCardPage } from '../pages/includes/feedback-card/feedback-card';
import { GravatarPage } from '../pages/includes/gravatar/gravatar';
import { MultipleOutputsPage } from '../pages/includes/multiple-outputs/multiple-outputs';
import { SurveyCardPage } from '../pages/includes/survey-card/survey-card';
import { TxpPage } from '../pages/includes/txp/txp';

/* Tabs */
import { HomePage } from '../pages/home/home';
import { ReceivePage } from '../pages/receive/receive';
import { ReceivelistPage } from '../pages/receivelist/receivelist';
import { ScanPage } from '../pages/scan/scan';
import { SendPage } from '../pages/send/send';
import { SendbasePage } from '../pages/sendbase/sendbase';
import { SettingsPage } from '../pages/settings/settings';

/* Home */
import { ProposalsPage } from '../pages/home/proposals/proposals';

/* Settings */
import { FingerprintModalPage } from '../pages/fingerprint/fingerprint';
import { PIN_COMPONENTS } from '../pages/pin/pin';
import { AboutPage } from '../pages/settings/about/about';
import { SessionLogPage } from '../pages/settings/about/session-log/session-log';
import { AddressbookAddPage } from '../pages/settings/addressbook/add/add';
import { AddressbookPage } from '../pages/settings/addressbook/addressbook';
import { AddressbookViewPage } from '../pages/settings/addressbook/view/view';
import { AdvancedPage } from '../pages/settings/advanced/advanced';
import { AltCurrencyPage } from '../pages/settings/alt-currency/alt-currency';
import { FeePolicyPage } from '../pages/settings/fee-policy/fee-policy';
import { LanguagePage } from '../pages/settings/language/language';
import { LockPage } from '../pages/settings/lock/lock';
import { NotificationsPage } from '../pages/settings/notifications/notifications';
import { SharePage } from '../pages/settings/share/share';

/* Wallet Group Settings */
import { WalletGroupDeletePage } from '../pages/settings/wallet-group-settings/wallet-group-delete/wallet-group-delete';
import { WalletGroupExtendedPrivateKeyPage } from '../pages/settings/wallet-group-settings/wallet-group-extended-private-key/wallet-group-extended-private-key';
import { WalletGroupNamePage } from '../pages/settings/wallet-group-settings/wallet-group-name/wallet-group-name';
import { WalletGroupOnboardingPage } from '../pages/settings/wallet-group-settings/wallet-group-onboarding/wallet-group-onboarding';
import { WalletGroupQrExportPage } from '../pages/settings/wallet-group-settings/wallet-group-qr-export/wallet-group-qr-export';
import { WalletGroupSettingsPage } from '../pages/settings/wallet-group-settings/wallet-group-settings';

/* Wallet Settings */
import { WalletDeletePage } from '../pages/settings/wallet-settings/wallet-delete/wallet-delete';
import { WalletNamePage } from '../pages/settings/wallet-settings/wallet-name/wallet-name';
import { WalletSettingsPage } from '../pages/settings/wallet-settings/wallet-settings';
import { WalletMnemonicRecoverPage } from './settings/advanced/wallet-recover-page/wallet-mnemonic-recover-page/wallet-mnemonic-recover-page';
import { WalletRecoverPage } from './settings/advanced/wallet-recover-page/wallet-recover-page';

/* Wallet Advanced Settings */
import { AllAddressesPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-addresses/all-addresses/all-addresses';
import { WalletAddressesPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-addresses/wallet-addresses';
import { WalletDuplicatePage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-duplicate/wallet-duplicate';
import { WalletExportPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-export/wallet-export';
import { WalletInformationPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-information/wallet-information';
import { WalletServiceUrlPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-service-url/wallet-service-url';
import { WalletTransactionHistoryPage } from '../pages/settings/wallet-settings/wallet-settings-advanced/wallet-transaction-history/wallet-transaction-history';

/* Send */
import { AmountPage } from '../pages/send/amount/amount';
import { ChooseFeeLevelPage } from '../pages/send/choose-fee-level/choose-fee-level';
import { ConfirmPage } from '../pages/send/confirm/confirm';
import { MultiSendPage } from '../pages/send/multi-send/multi-send';
import { TransferToModalPage } from '../pages/send/transfer-to-modal/transfer-to-modal';
import { TransferToPage } from '../pages/send/transfer-to/transfer-to';

/* Receive */
import { CustomAmountPage } from '../pages/receive/custom-amount/custom-amount';
import { WideHeaderPage } from './templates/wide-header-page/wide-header-page';
import { WalletTabsChild } from './wallet-tabs/wallet-tabs-child';

import { CardCatalogPage } from './integrations/gift-cards/card-catalog/card-catalog';
import { GIFT_CARD_PAGES } from './integrations/gift-cards/gift-cards';


export const PAGES = [
  AddPage,
  AddWalletPage,
  AmountPage,
  AddressbookPage,
  AddressbookAddPage,
  AddressbookViewPage,
  AboutPage,
  AtmLocationsPage,
  AdvancedPage,
  AllAddressesPage,
  AltCurrencyPage,
  BitPayCardHome,
  BitPayCardIntroPage,
  BitPayCardPage,
  BitPaySettingsPage,
  BitPayCardTopUpPage,
  ForgotpassPage,
  BuyCoinbasePage,
  CardCatalogPage,
  ChooseFeeLevelPage,
  CreateWalletPage,
  CreateNewWalletPage,
  CoinbasePage,
  CoinbaseTxDetailsPage,
  ConfirmInvoicePage,
  CopayersPage,
  EthLiveCardPage,
  FeedbackCardPage,
  SharePage,
  ImportWalletPage,
  JoinWalletPage,
  LoginPage,
  BackupGamePage,
  BackupKeyPage,
  ConfirmPage,
  MultiSendPage,
  TransferToModalPage,
  TransferToPage,
  CustomAmountPage,
  DisclaimerPage,
  CollectEmailPage,
  ...GIFT_CARD_PAGES,
  GravatarPage,
  FingerprintModalPage,
  HomePage,
  LanguagePage,
  LockPage,
  MultipleOutputsPage,
  OnboardingPage,
  PaperWalletPage,
  ...PIN_COMPONENTS,
  ProposalsPage,
  ReceivePage,
  ReceivelistPage
  ScanPage,
  SendPage,
  SendbasePage,
  SettingsPage,
  SellCoinbasePage,
  SelectCurrencyPage,
  CoinbaseSettingsPage,
  ShapeshiftConfirmPage,
  ShapeshiftDetailsPage,
  ShapeshiftSettingsPage,
  ShapeshiftPage,
  ShapeshiftShiftPage,
  NotificationsPage,
  FeePolicyPage,
  SearchTxModalPage,
  SessionLogPage,
  SendFeedbackPage,
  SurveyCardPage,
  FinishModalPage,
  RegisterPage,
  ReportDetailsPage,
  ReportTransaction,
  TabsPage,
  TransactionDetailsPage,
  TransactionsPage,
  TxpDetailsPage,
  TxDetailsPage,
  TxpPage,
  ViewReport,
  WalletSettingsPage,
  WalletDeletePage,
  WalletNamePage,
  WalletInformationPage,
  WalletAddressesPage,
  WalletExportPage,
  WalletServiceUrlPage,
  WalletTransactionHistoryPage,
  WalletDuplicatePage,
  WalletGroupExtendedPrivateKeyPage,
  WalletGroupDeletePage,
  WalletGroupQrExportPage,
  WalletGroupSettingsPage,
  WalletGroupNamePage,
  WalletGroupOnboardingPage,
  WalletDetailsPage,
  WalletRecoverPage,
  WalletMnemonicRecoverPage,
  WalletTabsChild,
  WalletTabsPage,
  WalletBalancePage,
  WideHeaderPage,
  CardItemPage,
  CoinSelectorPage,
  SlideToAcceptPage
];
