import { Component, OnInit, ViewChild } from '@angular/core';
import { 
  Nav, 
  Events,
  IonicPage,  
  NavController, 
  MenuController, 
  NavParams, 
  AlertController, 
  Alert, 
  ActionSheetController, 
  Platform, 
  ToastController,
  LoadingController,
  Loading
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder,AbstractControl, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';

import { TransactionDetailsPage } from '../transaction-details/transaction-details';

import { TransactionsPage } from '../transactions/transactions'
import { ViewReport } from '../view-report/view-report'

import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { LoginProvider } from '../../../providers/hub/service';

// import { PopupProvider } from '../../providers/popup/popup';
import * as moment from 'moment'
import { IOSFilePicker } from "@ionic-native/file-picker";
import { FileChooser } from "@ionic-native/file-chooser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Base64 } from "@ionic-native/base64";
import { FilePath } from "@ionic-native/file-path";

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';

// import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { DomSanitizer } from '@angular/platform-browser';
// import { Base64 } from '@ionic-native/base64';

declare var cordova: any;

@Component({
  selector: 'report-transaction',
  templateUrl: 'report-transaction.html'
})
export class ReportTransaction {
  @ViewChild(Nav) nav: Nav;
  private createForm: FormGroup;
  public customYearValues = [2020, 2016, 2008, 2004, 2000, 1996];
  public customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  public customPickerOptions: any;
  private passkey;
  private cookie;
  public transactionData;
  public pages: Array<{title: string, component: any,icon:any}>;
  public tfiat;
  public tcrypto;
  public picture;
  public base64Image = null;
  public onsubmitform;
  private alert: Alert;
  public buttonDisabled: boolean = false;
  public tempfile;
  public transaction_date;
  public kiosk_id;
  public amount_fiat;
  public amount_crypto;
  public status;
  public address;
  public atm_id;
  public transaction_id;
  public info;
  public email;
  public phone;
  public files;
  public encoded_files;
  public lastImage: string = null;
  public base64enc;
  public newfpath;
  public newfname;
  public loading: Loading;
  public correctPath;
  public currentName;
  public photoSrc;
  public cameraPhoto;
  public uploadFileCount = 0;

  fileArray: Array<{ displayFile: any; base64File: string }> = [];
  imageArr: Array<{ Filename: any; data: any }> = [];


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
    private fb: FormBuilder,
    private loginProvider: LoginProvider,

    private base64: Base64,
    private camera: Camera,
    private fileChooser: FileChooser,
    private plt: Platform,
    private filePicker: IOSFilePicker,
    private actionSheetCtrl: ActionSheetController,
    private filePath: FilePath,
    private toastCtrl: ToastController,
    public actionsheetCtrl: ActionSheetController,
    public platform: Platform,
    private transfer: Transfer, 
    private filew: File, 
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer

    // private base64: Base64
  ) {
    this.customPickerOptions = {
      buttons: [{
        text: 'Save',
        handler: () => console.log('Clicked Save!')
      }, {
        text: 'Log',
        handler: () => {
          console.log('Clicked Log. Do not Dismiss.');
          return false;
        }
      }]
    }
    // this.filePermission()
    this.pages = [
      { title: 'Dashboard', component: TransactionsPage, icon:'banki-summary' },
      { title: 'Transactions', component: TransactionsPage, icon:'banki-transfer' },
      // { title: 'Report Transaction', component: ReportTransaction, icon:'banki-exchange' },
      { title: 'View Report', component: ViewReport, icon:'banki-exchange' }
    ];
    this.transactionData = navParams.get('dataSet');
    this.tfiat = this.getAmount(this.transactionData.amount_fiat);
    this.tcrypto = this.transactionData.amount_crypto/100000000;
    console.log(this.transactionData);
    let d = this.convertdate(this.transactionData.created_at);
    const unixTime = d.valueOf();
    d = new Date(unixTime);
    var n = d.toISOString();
    const stats = this.getStatus(this.transactionData.status);
    this.transaction_date =  n;
    this.kiosk_id =  this.transactionData.kiosk_id;
    this.amount_fiat =  this.tfiat;
    this.amount_crypto = this.tcrypto;
    this.status =  stats;
    this.address = this.transactionData.address;
    this.atm_id =  this.transactionData.kiosk_id;
    this.transaction_id = this.transactionData.txid;
    this.info = null;
    this.email =  null;
    this.phone = null;
    this.files = this.base64Image;
    // this.createForm = this.fb.group({
    //   transaction_date: new FormControl({value: n, disabled: true}, Validators.required),
    //   kiosk_id: new FormControl({value: this.transactionData.kiosk_id, disabled: true}, Validators.required),
    //   amount_fiat: new FormControl({value: this.tfiat, disabled: true}, Validators.required),
    //   amount_crypto: new FormControl({value: this.tcrypto, disabled: true}, Validators.required),
    //   status: new FormControl({value: stats, disabled: true}, Validators.required),
    //   address: new FormControl({value: this.transactionData.address, disabled: true}, Validators.required),
    //   atm_id: new FormControl({value: this.transactionData.kiosk_id, disabled: true}, Validators.required),
    //   transaction_id: new FormControl({value: this.transactionData.txid, disabled: true}, Validators.required),
    //   info: [null],
    //   email: [null],
    //   phone: [null],
    //   files: new FormControl([])
    // });
    const token = localStorage.getItem('token');
    // alert(token);
  }

  // files: new FormArray([]) 
  // We will create multiple form controls inside defined form controls photos.
  createItem(data): FormGroup {
      return this.fb.group(data);
  }

  //Help to get all photos controls as form array.
  get photos(): FormArray {
      return this.createForm.get('files') as FormArray;
  };

  public openUpload(event) {
    this.tempfile = event;
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            // this.AccessCamera();
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: !this.platform.is('ios') ? 'ios-images-outline' : null,
          handler: () => {
            // this.AccessGallery();
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        }
    ]
    });
    actionSheet.present();
  }

  public getAmount(coin){
    return coin/100;//amount is now in USD not BTC 100000000;
  }

  private convertdate(date) {
    return new Date(date * 1000);
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

  public reporTransactionResponce(title, msg): void {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: [
        {
          text: 'OK',
          role: 'destructive',
          handler: () => {
            this.pushtoreport();
          }
        }
      ]
    });
    alert.present();
  }

  public onsubmit(title, msg): void {
     this.onsubmitform = this.alertCtrl.create({
      title: title,
      subTitle: msg
    });
    this.onsubmitform.present();
  }

  public reporTransactionerror(title, msg): void {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  public pushtoreport(){
    this.menu.enable(false)
     this.navCtrl.setRoot(ViewReport);
  }

  get tdate(): string {
    return this.createForm.value['datetime'];
  }

  chooseFile() {
    if (this.plt.is("ios")) {
      this.chooseFileForIos();
    } else {
      this.chooseFileForAndroid();
    }
  }

  chooseFileForIos() {
    this.filePicker
      .pickFile()
      .then(uri => {
        console.log(uri);
        this.presentToast("File chosen successfully");
        this.convertToBase64(uri,false)
      })
      .catch(err => console.log("Error", err));
  }

  chooseFileForAndroid() {
    this.fileChooser
      .open()
      .then(uri => {
        console.log(uri);
        this.presentToast("File chosen successfully");
        this.convertToBase64(uri,false)
      })
      .catch(e => {
        console.log(e);
      });
  }

  convertToBase64(imageUrl, isImage) {
    this.filePath
      .resolveNativePath(imageUrl)
      .then(filePath => {
        console.log(filePath);
        this.base64.encodeFile(filePath).then(
          (base64File: string) => {
            console.log("BASE 64 IS", filePath.split(".").pop());
            if (isImage == false) {
              this.fileArray.push({
                displayFile: filePath.split("/").pop(),
                base64File: base64File.split(",").pop() //split(",").pop() depends on the requirement, if back end API is able to extract
                //the file mime type then you can do this, if back end expects  UI update the Mime type
                //  then don't use split(",").pop()
              });
            } else {
              // this.imageArr.push({
              //   displayImg: filePath,
              //   base64Img: base64File.split(",").pop() //same comment for image follows here.
              // });
            }
            console.log("LENGTH OF BASE64ARR", this.fileArray.length);
          },
          err => {
            console.log(err);
          }
        );
      })
      .catch(err => console.log(err));
  }


  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  public AccessCamera(){
    const options: CameraOptions = {
      quality: 100,
      correctOrientation: true,
      cameraDirection: 1
    };
    this.camera
      .getPicture(options)
      .then(imageData => {
        console.log("IMAGE DATA IS", imageData);
        this.presentToast("Image chosen successfully");
        this.convertToBase64(imageData, true);
      })
      .catch(e => {
        console.log("Error while picking from camera", e);
      });
  }

  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
    n = d.getTime(),
    newFileName =  n + ".jpg";
    return newFileName;
  }
   
  // Copy the image to a local folder
  private copyFileToLocalDir2(namePath, currentName, newFileName) {
    this.filew.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
    }, error => {
      console.log(error)
      this.presentToast('Error while storing file.');
    });
  }

  public successCallback(entry) {
      // console.log("New Path: ");
      this.presentToast("Success");
  }

  public errorCallback(error) {
      console.log("Error:")
      this.presentToast(error);
  }

  public copyFileToLocalDir(namePath, currentName, newFileName) {
    // cordova.file.dataDirectory
    let externalStoragePath: string =  cordova.file.dataDirectory;
    this.filew.resolveLocalFilesystemUrl(namePath + currentName)
      .then((entry: any)=>{
        // console.log('entry',entry);
        // this.presentToast(entry);
        this.filew.resolveLocalFilesystemUrl(externalStoragePath)
          .then((dirEntry: any)=>{
            this.newfpath = dirEntry;
            this.presentToast("successfull storage");
            entry.copyTo(dirEntry, newFileName, this.successCallback, this.errorCallback);
            this.lastImage = newFileName;
            (async () => {
              await this.prepareAll(newFileName);
             })()  
             this.uploadFileCount = this.imageArr.length + 1;
             console.log(this.imageArr.length)
          }).catch((error)=>{
            console.log(error);
            this.presentToast("Error while storing file 1");      
          });
      }).catch((error)=>{
        console.log(error);
        this.presentToast("Error while storing file 2");
      });
  }

  async prepareAll(newFilename){
    new Promise((resolve, reject) => {
      var targetPath = this.pathForImage(newFilename);
      var filename = newFilename;
      this.base64.encodeFile(targetPath).then((base64File: string) => {
        this.base64enc = base64File;
        let imageSrc = base64File.split(",");
        // console.log("---Splitted image string----" + imageSrc[1]);
        resolve(this.imageArr.push({
          "Filename": filename,
          "data": imageSrc[1]
        }));
      }, (err) => {
        reject(err)
        console.log(err);
      });
    });
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType : this.camera.DestinationType.FILE_URI
    };
    // Get the data of an image DATA_URL
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      this.encoded_files = imagePath
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            this.encoded_files = filePath
            this.correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            this.currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.photoSrc  = 'data:image/jpg;base64,' + imagePath;
            this.cameraPhoto = this._DomSanitizer.bypassSecurityTrustUrl(this.photoSrc)
            this.copyFileToLocalDir(this.correctPath, this.currentName, this.createFileName());
            // this.prepareAll(this.lastImage);
            // console.log
          });
      } else {
        this.correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        this.photoSrc  = 'data:image/jpg;base64,' + imagePath;
        this.cameraPhoto = this._DomSanitizer.bypassSecurityTrustUrl(this.photoSrc)
        this.copyFileToLocalDir(this.correctPath, this.currentName, this.createFileName());
      }
      // this.lastImage = null;
      console.log(this.imageArr);
    }, (err) => {
      console.log(err)
      this.presentToast('Error while selecting image.');
    });
  }

  public AccessGallery(){
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI
    };
    this.camera
      .getPicture(options)
      .then(imageData => {
        console.log("IMAGE DATA IS", imageData);
        this.presentToast("Image chosen successfully");
        this.convertToBase64(imageData, true);
      })
      .catch(e => {
        console.log("Error while picking from gallery", e);
      });
  }

  changeListener(event){
    console.log(event.target.value);
  }

  // public dismiss() {
  //   if (this.alert && !this.alert._detached) this.alert.dismiss();
  // }

  get file(): AbstractControl {
    return this.createForm.get('files').value;
  }


  public submitform(){

    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);
   
    // File name only
    var filename = this.lastImage;

      const data = {
        transaction_date: this.transaction_date,
        kiosk_id: this.kiosk_id,
        amount_fiat: this.amount_fiat,
        amount_crypto: this.amount_crypto,
        status:this.status,
        address: this.address,
        atm_id: this.atm_id,
        transaction_id: this.transaction_id,
        info: this.info,
        email: this.email,
        phone: this.phone,
        files: this.imageArr
      }


      this.loading = this.loadingCtrl.create({
        content: 'hold on while we upload your file...',
      });
      this.loading.present();

      const token = localStorage.getItem('token');
      this.buttonDisabled = true;
      this.loginProvider.report(data, token)
      .subscribe((res) => {
         console.log(res);
        this.buttonDisabled = false;
        // this.onsubmitform.dismiss();
        this.loading.dismissAll()
        this.info = null;
        this.email =  null;
        this.phone = null;
        this.files = null;
        this.imageArr.splice(0, this.imageArr.length);
        this.presentToast('Image succesful uploaded.');
        return this.reporTransactionResponce('Success', 'your case has been submitted');
      }, (err) => {
        this.buttonDisabled = false;
        const error = err;
         this.loading.dismissAll()
        console.log(error);
        this.info = null;
        this.email =  null;
        this.phone = null;
        this.files = null;
        this.imageArr.splice(0, this.imageArr.length);
        this.presentToast('Error while uploading file.');
        return this.reporTransactionerror('Error', 'there was an issue reporting your case');
        
      });
  }
     
  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad AtmLocationsPage');
  }

  toggleMenu() {
    console.log("i clicked");
    this.menu.toggle(); //Add this method to your button click function
  }
}
