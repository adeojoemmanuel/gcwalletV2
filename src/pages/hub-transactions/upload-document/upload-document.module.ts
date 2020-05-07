import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UploadDocumentPage } from './upload-document';

@NgModule({
  declarations: [
    UploadDocumentPage,
  ],
  imports: [
    IonicPageModule.forChild(UploadDocumentPage),
  ],
})
export class UploadDocumentPageModule {}
