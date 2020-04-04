import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import * as _ from 'lodash';
import { RegisterPage } from './register/register';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  constructor(public navCtrl: NavController, public navParams: NavParams){}

  ngOnInit() {
    if(localStorage.getItem('issessionactive') != null ){
     this.navCtrl.push(RegisterPage);
     console.log(localStorage.getItem('issessionactive'));
    }else{
      console.log(localStorage.getItem('issessionactive'));
    }
  }
  // goTo Function 
  goTo(){
    this.navCtrl.setRoot(RegisterPage);
  }
}