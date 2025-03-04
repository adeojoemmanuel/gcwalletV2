/* Native modules */
export { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth';
export { Clipboard } from '@ionic-native/clipboard';
export { Device } from '@ionic-native/device';
export { FCMNG } from 'fcm-ng';
export { File } from '@ionic-native/file';
export { LaunchReview } from '@ionic-native/launch-review';
export { QRScanner } from '@ionic-native/qr-scanner';
export { ScreenOrientation } from '@ionic-native/screen-orientation';
export { SocialSharing } from '@ionic-native/social-sharing';
export { SplashScreen } from '@ionic-native/splash-screen';
export { StatusBar } from '@ionic-native/status-bar';
export { Toast } from '@ionic-native/toast';
export { TouchID } from '@ionic-native/touch-id';
export { Vibration } from '@ionic-native/vibration';
export { UserAgent } from '@ionic-native/user-agent';
export { Geolocation } from '@ionic-native/geolocation';
export { BackgroundGeolocation } from '@ionic-native/background-geolocation';
export { Network } from '@ionic-native/network';
export { HTTP } from '@ionic-native/http';
export { Camera } from '@ionic-native/camera';

export { Base64 } from '@ionic-native/base64';
export { FileChooser } from "@ionic-native/file-chooser";
export { IOSFilePicker } from "@ionic-native/file-picker";
export { FilePath } from "@ionic-native/file-path";
export { Transfer } from '@ionic-native/transfer';
export { InAppBrowser } from '@ionic-native/in-app-browser';
export { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


/* Providers */
export { ActionSheetProvider } from '../providers/action-sheet/action-sheet';
export { AddressBookProvider } from '../providers/address-book/address-book';
export { AddressProvider } from '../providers/address/address';
export { AnalyticsProvider } from '../providers/analytics/analytics';
export { AppIdentityProvider } from '../providers/app-identity/app-identity';
export { AppProvider } from '../providers/app/app';
export { BackupProvider } from '../providers/backup/backup';
export {
  BitPayAccountProvider
} from '../providers/bitpay-account/bitpay-account';
export { BitPayCardProvider } from '../providers/bitpay-card/bitpay-card';
export { BitPayProvider } from '../providers/bitpay/bitpay';
export { BwcErrorProvider } from '../providers/bwc-error/bwc-error';
export { BwcProvider } from '../providers/bwc/bwc';
export { ClipboardProvider } from '../providers/clipboard/clipboard';
export { CoinbaseProvider } from '../providers/coinbase/coinbase';
export { ConfigProvider } from '../providers/config/config';
export { CurrencyProvider } from '../providers/currency/currency';
export {
  DerivationPathHelperProvider
} from '../providers/derivation-path-helper/derivation-path-helper';
export { DomProvider } from '../providers/dom/dom';
export { DownloadProvider } from '../providers/download/download';
export {
  EmailNotificationsProvider
} from '../providers/email-notifications/email-notifications';
export { ExternalLinkProvider } from '../providers/external-link/external-link';
export { FeeProvider } from '../providers/fee/fee';
export { FeedbackProvider } from '../providers/feedback/feedback';
export { FilterProvider } from '../providers/filter/filter';
export { GiftCardProvider } from '../providers/gift-card/gift-card';
export {
  HomeIntegrationsProvider
} from '../providers/home-integrations/home-integrations';
export { HttpRequestsProvider } from '../providers/http-requests/http-requests';
export { IncomingDataProvider } from '../providers/incoming-data/incoming-data';
export { InvoiceProvider } from '../providers/invoice/invoice';
export { KeyProvider } from '../providers/key/key';
export { LanguageLoader } from '../providers/language-loader/language-loader';
export { LanguageProvider } from '../providers/language/language';
export { Logger } from '../providers/logger/logger';
export { ElectronProvider } from '../providers/electron/electron';
export {
  OnGoingProcessProvider
} from '../providers/on-going-process/on-going-process';
export { PayproProvider } from '../providers/paypro/paypro';
export { PersistenceProvider } from '../providers/persistence/persistence';
export { PlatformProvider } from '../providers/platform/platform';
export { PopupProvider } from '../providers/popup/popup';
export { PriceProvider } from '../providers/price/price';
export { ProfileProvider } from '../providers/profile/profile';
export {
  PushNotificationsProvider
} from '../providers/push-notifications/push-notifications';
export { RateProvider } from '../providers/rate/rate';
export {
  ReplaceParametersProvider
} from '../providers/replace-parameters/replace-parameters';
export { ScanProvider } from '../providers/scan/scan';
export { ShapeshiftProvider } from '../providers/shapeshift/shapeshift';
export { TimeProvider } from '../providers/time/time';
export { TouchIdProvider } from '../providers/touchid/touchid';
export {
  TxConfirmNotificationProvider
} from '../providers/tx-confirm-notification/tx-confirm-notification';
export { TxFormatProvider } from '../providers/tx-format/tx-format';
export { WalletProvider } from '../providers/wallet/wallet';
export { WalletTabsProvider } from './../pages/wallet-tabs/wallet-tabs.provider';
export { NetworkProvider } from '../providers/network/network.provider';
export { AtmLocationProvider } from '../providers/atm-location/atm-location';
export { LocationTrackerProvider } from '../providers/location-tracker/location-tracker';
export { GeolocationProvider } from '../providers/geolocation/geolocation';
export { LoginProvider } from '../providers/hub/service';
