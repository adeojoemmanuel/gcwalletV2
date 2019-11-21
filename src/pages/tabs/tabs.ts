import { Component, ViewChild } from '@angular/core';
import { HomePage } from '../home/home';
import { ReceivelistPage } from '../receivelist/receivelist';
import { ScanPage } from '../scan/scan';
import { SendPage } from '../send/send';
import { SendbasePage } from '../sendbase/sendbase';
import { SettingsPage } from '../settings/settings';
import { LoginPage } from '../hub/login';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs')
  tabs;

  homeRoot = HomePage;
  receiveRoot = ReceivelistPage;
  scanRoot = ScanPage;
  sendRoot = SendbasePage;
  settingsRoot = SettingsPage;
  LoginRoot = LoginPage;

  constructor() {}
}
