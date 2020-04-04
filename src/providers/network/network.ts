import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';

@Injectable()
export class NetworkProvider2 {

  constructor(private _network: Network) { }

  isConnectInternet() {
    return this._network.onConnect();
  }

  isDisconnect() {
    return this._network.onDisconnect();
  }

    // enter code here

  connectionType() {
    if (this._network.type == 'none' ) {
      return false;
    } else {
      return true;
    }
  }

}