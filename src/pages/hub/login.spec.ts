import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';

import { TestUtils } from '../../test';

import { AddressBookProvider } from '../../providers/address-book/address-book';
import { ConfigProvider } from './../../providers/config/config';
import { LoginPage } from './login';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
  ],
})
export class WelcomePageModule {}
