import { Component, ViewChild } from '@angular/core';
import { 
  Nav, 
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
import { FormBuilder,AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { Logger } from '../../../providers/logger/logger';


import { TransactionsPage } from '../transactions/transactions'
import { ViewReport } from '../view-report/view-report'


import { LoginProvider } from '../../../providers/hub/service';

// import { PopupProvider } from '../../providers/popup/popup';
import { IOSFilePicker } from "@ionic-native/file-picker";
import { FileChooser } from "@ionic-native/file-chooser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Base64 } from "@ionic-native/base64";
import { FilePath } from "@ionic-native/file-path";

import { File } from '@ionic-native/file';

import { normalizeURL } from 'ionic-angular';

import { UploadDocumentPage } from '../upload-document/upload-document'

// import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { DomSanitizer } from '@angular/platform-browser';
// import { Base64 } from '@ionic-native/base64';

declare var cordova: any;

@Component({
  selector: 'increase-limit',
  templateUrl: 'increase-limit.html'
})

export class IncreaseLimit {
  @ViewChild(Nav) nav: Nav;
  private createForm: FormGroup;
  public customYearValues = [2020, 2016, 2008, 2004, 2000, 1996];
  public customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  public customPickerOptions: any;
  public transactionData;
  public pages: Array<{title: string, component: any,icon:any}>;
  public tfiat;
  public tcrypto;
  public picture;
  public base64Image = null;
  public onsubmitform;
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
  rarray: Array<{Filename: any}> = [];


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    // private popupProvider: PopupProvider,
    private menu: MenuController,
    public alertCtrl: AlertController,
    private fb: FormBuilder,
    private loginProvider: LoginProvider,

    private base64: Base64,
    private camera: Camera,
    private fileChooser: FileChooser,
    private plt: Platform,
    private filePicker: IOSFilePicker,
    private filePath: FilePath,
    private toastCtrl: ToastController,
    public actionsheetCtrl: ActionSheetController,
    public platform: Platform,
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
      { title: 'View Report', component: ViewReport, icon:'banki-exchange' },
      { title: 'Increase Limit', component: UploadDocumentPage, icon:'banki-user' }
    ];
    this.files = this.base64Image;
    // const token = localStorage.getItem('token');
    // alert(token);
  }

  openPage(page) {
    // this.navCtrl.push(page);
    this.menu.enable(false)
    this.navCtrl.setRoot(page);
    // this.navCtrl.getRootNav().setRoot(page);
    // this.navCtrl.popToRoot();
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

  browseFile(){
    console.log("file browse triggered");
    this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  openCam(){
    console.log("open camera triggered");
    this.takePicture(this.camera.PictureSourceType.CAMERA);
  }

  public getAmount(coin){
    return coin/100;//amount is now in USD not BTC 100000000;
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
   
  public successCallback(entry) {
      // console.log("New Path: ");
      this.presentToast("Success");
  }

  public errorCallback(error) {
      console.log("Error:")
      this.presentToast(error);
  }

  private copyFileToLocalDir3(namePath, currentName, newFileName) {
    this.filew.copyFile(namePath, currentName, this.filew.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
      let filePath = this.pathForImage2(this.lastImage);
      // Write code for save data to database
    }, error => {
       console.log(error);
       this.presentToast("Error while storing file 2");
    });
  }

  // Always get the accurate path to your apps folder
  public pathForImage2(img) {
    if (img === null) {
      return '';
    } else {
      return this.filew.dataDirectory + img;
    }
  }

  public async copyFileToLocalDir(namePath, currentName, newFileName): Promise<any> {
    const externalStoragePath: string = cordova.file.dataDirectory;
    try {
        const entry = await this.filew.resolveLocalFilesystemUrl(namePath + currentName);
        const dirEntry: any = await this.filew.resolveLocalFilesystemUrl(externalStoragePath);

        entry.copyTo(dirEntry, newFileName, () => { }, () => {
            this.presentToast("Error while storing file 1.");
        });
        (async () => {
          await this.prepareAll(newFileName);
          this.uploadFileCount = this.rarray.length;
          return newFileName;
        })()  
        console.log(this.imageArr.length)
        
    } catch (error) {
        this.presentToast("Error while storing file 2.");
    }
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
        this.presentToast("base64" + err);
        console.log("base46 err "+err);
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
    const options: CameraOptions = {
        sourceType: sourceType,
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        correctOrientation: true,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetWidth: 1024,
        targetHeight: 1024
    }
    // Get the data of an image DATA_URL
    this.camera.getPicture(options).then((imagePath) => {
      // let imageSrc = imagePath.split(",");
      let picture =   imagePath;
      let fileName = this.createFileName();
      // Push to array
      this.imageArr.push({
          "Filename": fileName,
          "data": picture
      })

      this.uploadFileCount = this.imageArr.length;

    }, (err) => {
      console.log(err)
      // this.uploadFileCount = 0;
      this.presentToast(err);
    });
  }


  //  public takePicture(sourceType) {
  //   // Create options for the Camera Dialog
  //   var options = {
  //     quality: 100,
  //     sourceType: sourceType,
  //     saveToPhotoAlbum: false,
  //     correctOrientation: true,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     destinationType : this.camera.DestinationType.FILE_URI
  //   };
  //   // Get the data of an image DATA_URL
  //   this.camera.getPicture(options).then((imagePath) => {
  //     // Special handling for Android library
  //     this.encoded_files = imagePath
  //     if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
  //       this.filePath.resolveNativePath(imagePath)
  //         .then(filePath => {
  //           this.encoded_files = filePath
  //           this.correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
  //           this.currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
  //           this.photoSrc  = 'data:image/jpg;base64,' + imagePath;
  //           this.cameraPhoto = this._DomSanitizer.bypassSecurityTrustUrl(this.photoSrc)
  //           this.copyFileToLocalDir(this.correctPath, this.currentName, this.createFileName());
  //           // this.prepareAll(this.lastImage);
  //           // console.log
  //         }, (err) => {
  //           console.log(err)
  //           this.presentToast(err + " 2");
  //         });
  //     } else {
  //       this.correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
  //       this.currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
  //       this.photoSrc  = 'data:image/jpg;base64,' + imagePath;
  //       this.cameraPhoto = this._DomSanitizer.bypassSecurityTrustUrl(this.photoSrc)
  //       this.copyFileToLocalDir(this.correctPath, this.currentName, this.createFileName());
  //     }
  //     this.rarray.push({"Filename": this.currentName})
  //     // this.lastImage = null;
  //     console.log(this.imageArr);
  //   }, (err) => {
  //     console.log(err)
  //     this.presentToast(err);
  //   });
  // }

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

  private convertdate() {
    return new Date();
  }

  public submitform(){
    if (this.imageArr.length < 1) {
      // this.presentToast('Error Kindly Upload Your Document.');
      return this.reporTransactionerror('Error', 'Error Kindly Upload Your Document.');
    }

    // File for Upload
    // const targetPath = this.pathForImage(this.lastImage);
   
    // File name only 
    // var filename = this.lastImage;
    let d = this.convertdate();
    const unixTime = d.valueOf();
    d = new Date(unixTime);
    const rd = d.toISOString();

      const data = {
        transaction_date: new Date(),
        kiosk_id: 0,
        amount_fiat: 0,
        amount_crypto: 0,
        status:"COMPLETE",
        address: "",
        atm_id: 0,
        transaction_id: "0",
        info: "user verfication info",
        email: "verfication@getcoins.com",
        phone: "",
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
        console.log(error);
        return this.reporTransactionerror('Error', error.message);
         this.rarray.length = 0;
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