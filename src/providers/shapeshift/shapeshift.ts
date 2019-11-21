import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Logger } from '../../providers/logger/logger';

// providers
import { AppProvider } from '../app/app';
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { HttpRequestsProvider } from '../http-requests/http-requests';
import { PersistenceProvider } from '../persistence/persistence';

@Injectable()
export class ShapeshiftProvider {
  private credentials;

  constructor(
    private appProvider: AppProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private httpNative: HttpRequestsProvider,
    private logger: Logger,
    private configProvider: ConfigProvider,
    private persistenceProvider: PersistenceProvider
  ) {
    this.logger.debug('ShapeshiftProvider Provider initialized');
    this.credentials = {};
  }

  public setCredentials() {
    // (Mandatory) Affiliate PUBLIC KEY, for volume tracking, affiliate payments, split-shifts, etc.
    if (
      !this.appProvider.servicesInfo ||
      !this.appProvider.servicesInfo.shapeshift
    ) {
      return;
    }
    const shapeshift = this.appProvider.servicesInfo.shapeshift;

    /*
     * Development: 'testnet'
     * Production: 'livenet'
     */
    this.credentials.NETWORK = 'livenet';
    this.credentials.API_URL =
      this.credentials.NETWORK === 'testnet'
        ? ''
        : // CORS: cors.shapeshift.io
          'https://shapeshift.io';

    this.credentials.REDIRECT_URI = shapeshift.production.redirect_uri;
    this.credentials.HOST = shapeshift.production.host;
    this.credentials.API = shapeshift.production.api;
    this.credentials.CLIENT_ID = shapeshift.production.client_id;
    this.credentials.CLIENT_SECRET = shapeshift.production.client_secret;
    this.credentials.API_KEY = shapeshift.api_key || null;
  }

  public getNetwork() {
    return this.credentials.NETWORK;
  }

  public shift(data, cb) {
    const dataSrc = {
      withdrawal: data.withdrawal,
      pair: data.pair,
      returnAddress: data.returnAddress,
      apiKey: this.credentials.API_KEY
    };

    const url = this.credentials.API_URL + '/shift';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + data.token
    };

    this.httpNative.post(url, dataSrc, headers).subscribe(
      data => {
        this.logger.info('Shapeshift SHIFT: SUCCESS');
        return cb(null, data);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error('Shapeshift SHIFT ERROR: ' + error);
        return cb(error);
      }
    );
  }

  public sendamount(data, cb) {
    const dataSrc = {
      withdrawal: data.withdrawal,
      pair: data.pair,
      returnAddress: data.returnAddress,
      apiKey: this.credentials.API_KEY,
      depositAmount: data.depositAmount
    };

    const url = this.credentials.API_URL + '/sendamount';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + data.token
    };

    this.httpNative.post(url, dataSrc, headers).subscribe(
      data => {
        this.logger.info('Shapeshift SENDAMOUNT: SUCCESS');
        return cb(data.error, data.success);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error('Shapeshift SENDAMOUNT ERROR: ' + error);
        return cb(error);
      }
    );
  }

  public saveShapeshift(data, opts, cb): void {
    const network = this.getNetwork();
    this.persistenceProvider
      .getShapeshift(network)
      .then(oldData => {
        if (_.isString(oldData)) {
          oldData = JSON.parse(oldData);
        }
        if (_.isString(data)) {
          data = JSON.parse(data);
        }
        let inv = oldData ? oldData : {};
        inv[data.address] = data;
        if (opts && (opts.error || opts.status)) {
          inv[data.address] = _.assign(inv[data.address], opts);
        }
        if (opts && opts.remove) {
          delete inv[data.address];
        }

        inv = JSON.stringify(inv);

        this.persistenceProvider.setShapeshift(network, inv);
        return cb(null);
      })
      .catch(err => {
        return cb(err);
      });
  }

  public getShapeshift(cb) {
    const network = this.getNetwork();
    this.persistenceProvider
      .getShapeshift(network)
      .then(ss => {
        return cb(null, ss);
      })
      .catch(err => {
        return cb(err, null);
      });
  }

  public getRate(pair: string, cb) {
    this.httpNative.get(this.credentials.API_URL + '/rate/' + pair).subscribe(
      data => {
        this.logger.info('Shapeshift PAIR: SUCCESS');
        return cb(null, data);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error('Shapeshift PAIR ERROR: ' + error);
        return cb(data);
      }
    );
  }

  public getLimit(pair: string, cb) {
    this.httpNative.get(this.credentials.API_URL + '/limit/' + pair).subscribe(
      data => {
        this.logger.info('Shapeshift LIMIT: SUCCESS');
        return cb(null, data);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error('Shapeshift LIMIT ERROR: ' + error);
        return cb(data);
      }
    );
  }

  public getMarketInfo(pair: string, cb) {
    this.httpNative
      .get(this.credentials.API_URL + '/marketinfo/' + pair)
      .subscribe(
        data => {
          this.logger.info('Shapeshift MARKET INFO: SUCCESS');
          return cb(null, data);
        },
        data => {
          const error = this.parseError(data);
          this.logger.error('Shapeshift MARKET INFO ERROR: ', error);
          return cb(data);
        }
      );
  }

  public getStatus(addr: string, token: string, cb) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    };
    this.httpNative
      .get(this.credentials.API_URL + '/txStat/' + addr, null, headers)
      .subscribe(
        data => {
          this.logger.info('Shapeshift STATUS: SUCCESS');
          return cb(null, data);
        },
        data => {
          const error = this.parseError(data);
          this.logger.error('Shapeshift STATUS ERROR: ' + error);
          return cb(data.error);
        }
      );
  }

  private isActive(cb) {
    if (_.isEmpty(this.credentials.CLIENT_ID)) return cb(false);

    this.persistenceProvider
      .getShapeshiftToken(this.credentials.NETWORK)
      .then(accessToken => {
        return cb(!!accessToken);
      });
  }

  public register(): void {
    this.isActive(isActive => {
      this.homeIntegrationsProvider.register({
        name: 'shapeshift',
        title: 'ShapeShift',
        icon: 'assets/img/shapeshift/icon-shapeshift.svg',
        logo: 'assets/img/shapeshift/logo-white-shapeshift.svg',
        background:
          'linear-gradient(to bottom,rgba(13,23,44,1) 0,rgba(16,29,58,1) 100%)',
        page: 'ShapeshiftPage',
        show: !!this.configProvider.get().showIntegration['shapeshift'],
        linked: isActive
      });
    });
  }

  public getOauthCodeUrl() {
    return (
      this.credentials.HOST +
      '/oauth/authorize?response_type=code&scope=users:read&client_id=' +
      this.credentials.CLIENT_ID +
      '&redirect_uri=' +
      this.credentials.REDIRECT_URI
    );
  }

  public getSignupUrl() {
    return this.credentials.HOST + '/signup';
  }

  public getStoredToken(cb) {
    this.persistenceProvider
      .getShapeshiftToken(this.credentials.NETWORK)
      .then(accessToken => {
        if (!accessToken) return cb();
        return cb(accessToken);
      })
      .catch(() => {
        return cb();
      });
  }

  public getToken(code, cb) {
    const url = this.credentials.HOST + '/oauth/token';
    const data = {
      grant_type: 'authorization_code',
      code,
      client_id: this.credentials.CLIENT_ID,
      client_secret: this.credentials.CLIENT_SECRET,
      redirect_uri: this.credentials.REDIRECT_URI
    };
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    this.httpNative.post(url, data, headers).subscribe(
      data => {
        this.logger.info('ShapeShift: GET Access Token: SUCCESS');
        // Show pending task from the UI
        this._afterTokenReceived(data, cb);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error(
          'ShapeShift: GET Access Token: ERROR ' + data.status + '. ' + error
        );
        return cb(error);
      }
    );
  }

  private _afterTokenReceived(data, cb) {
    if (data && data.access_token) {
      this.persistenceProvider.setShapeshiftToken(
        this.credentials.NETWORK,
        data.access_token
      );
      this.homeIntegrationsProvider.updateLink('shapeshift', data.access_token); // Name, Token
      return cb(null, data.access_token);
    } else {
      return cb('Could not get the access token');
    }
  }

  public init = _.throttle(cb => {
    if (_.isEmpty(this.credentials.CLIENT_ID)) {
      return cb('ShapeShift is Disabled. Missing credentials.');
    }
    this.logger.debug('Trying to initialize ShapeShift...');

    this.getStoredToken(accessToken => {
      if (!accessToken) {
        this.logger.debug('ShapeShift not linked');
        return cb();
      }
      this.logger.debug('ShapeShift already has Token.');
      this.getAccessTokenDetails(accessToken, (err, data) => {
        if (err) {
          this.logout(accessToken);
          return cb(err);
        }
        if (data.user.verificationStatus == 'NONE') {
          return cb('unverified_account');
        } else {
          return cb(null, {
            accessToken
          });
        }
      });
    });
  }, 10000);

  private getAccessTokenDetails(token, cb) {
    if (!token) return cb('Invalid Token');

    const url = this.credentials.HOST + '/oauth/token/details';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    };

    this.httpNative.get(url, null, headers).subscribe(
      data => {
        this.logger.info('ShapeShift: Get Access Token Details SUCCESS');
        return cb(null, data);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error(
          'ShapeShift: Get Access Token Details ERROR ' +
            data.status +
            '. ' +
            error
        );
        return cb(data.error);
      }
    );
  }

  public getAccount(token, cb) {
    if (!token) return cb('Invalid Token');

    const url = this.credentials.HOST + '/api/v1/users/me';
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    };

    this.httpNative.get(url, null, headers).subscribe(
      data => {
        this.logger.info('ShapeShift: Get Account SUCCESS');
        return cb(null, data);
      },
      data => {
        const error = this.parseError(data);
        this.logger.error(
          'ShapeShift: Get Account ERROR ' + data.status + '. ' + error
        );
        return cb(data.error);
      }
    );
  }

  public revokeAccessToken(token) {
    const url = this.credentials.HOST + '/oauth/token/revoke';
    const data = new HttpParams().set('token', token);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        btoa(this.credentials.CLIENT_ID + ':' + this.credentials.CLIENT_SECRET)
    };

    this.httpNative.post(url, data, headers).subscribe(
      () => {
        this.logger.info('ShapeShift: Revoke Access Token SUCCESS');
      },
      data => {
        const error = this.parseError(data);
        this.logger.warn(
          'ShapeShift: Revoke Access Token ERROR ' + data.status + '. ' + error
        );
      }
    );
  }

  public logout(token) {
    this.revokeAccessToken(token);
    this.persistenceProvider.removeShapeshiftToken(this.credentials.NETWORK);
    this.homeIntegrationsProvider.updateLink('shapeshift', null); // Name, Token
  }

  private parseError(err: any): string {
    if (!err) return 'Unknow Error';
    if (!err.error) return err.message ? err.message : 'Unknow Error';

    const parsedError = err.error.error_description
      ? err.error.error_description
      : err.error.error && err.error.error.message
      ? err.error.error.message
      : err.error;
    return parsedError;
  }
}
