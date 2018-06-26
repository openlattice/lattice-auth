/*
 * @flow
 */

import Auth0Lock from 'auth0-lock';
import isEmpty from 'lodash/isEmpty';
import qs from 'qs';
import { Map } from 'immutable';

import Logger from '../utils/Logger';
import * as AuthUtils from './AuthUtils';
import { LOGIN_PATH } from './AuthConstants';
import { isNonEmptyString } from '../utils/LangUtils';

import {
  ERR_INVALID_CONFIG,
  ERR_A0L_FRAGMENT_NOT_PARSED,
  ERR_A0L_NOT_INITIALIZED,
  ERR_A0L_ON_AUTHORIZATION_ERROR,
  ERR_A0L_ON_UNRECOVERABLE_ERROR,
  ERR_A0L_ON_AUTH__AUTH_INFO_MISSING,
  ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED,
  ERR_A0L_ON_HASH__AUTH_INFO_MISSING,
  ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED
} from '../utils/Errors';

const LOG = new Logger('Auth0');

let parsedUrl :Object = {
  fragment: '',
  redirectUrl: ''
};

/*
 * https://auth0.com/docs/libraries/lock/v10
 * https://auth0.com/docs/libraries/lock/v10/api
 * https://auth0.com/docs/libraries/lock/v10/customization
 */
let auth0Lock :?Auth0Lock;

export function getAuth0LockInstance() :Auth0Lock {

  if (auth0Lock === null || auth0Lock === undefined) {
    throw new Error(ERR_A0L_NOT_INITIALIZED);
  }

  return auth0Lock;
}

export function urlAuthInfoAvailable() :boolean {

  // TODO: just checking for the existence of "access_token" and "id_token" isn't strong enough validation
  return parsedUrl.fragment.indexOf('access_token') !== -1 && parsedUrl.fragment.indexOf('id_token') !== -1;
}

/*
 * ideally, we should be using browser history and OIDC conformant authentication. until then, we have to take extra
 * steps in the auth flow to handle the Auth0 redirect. Auth0 redirects back to "#access_token...", which will be
 * immediately replaced with "#/access_token..." when hash history is initializing:
 *
 * https://github.com/ReactTraining/history/blob/master/modules/createHashHistory.js#L38
 * https://github.com/ReactTraining/history/blob/master/modules/createHashHistory.js#L49
 *
 * Here, we grab the Auth0 response from the URL and redirect to "#/login", which avoids the need for hash history
 * to invoke window.location.replace().
 */
export function parseUrl(location :Object) :Object {

  if (isEmpty(location)) {
    return {
      fragment: '',
      redirectUrl: ''
    };
  }

  const { href, search } = location;

  const { redirectUrl } = qs.parse(search, { ignoreQueryPrefix: true });
  if (isNonEmptyString(redirectUrl)) {
    parsedUrl.redirectUrl = redirectUrl;
  }

  const hashIndex :number = href.lastIndexOf('#');
  const fragment :string = hashIndex === -1 ? '' : href.substring(hashIndex + 1);
  parsedUrl.fragment = fragment;

  if (urlAuthInfoAvailable()) {
    const urlBeforeHash :string = href.slice(0, hashIndex >= 0 ? hashIndex : 0);
    if (urlBeforeHash.endsWith('/')) {
      window.location.replace(`${urlBeforeHash}#${LOGIN_PATH}`);
    }
    else {
      window.location.replace(`${urlBeforeHash}/#${LOGIN_PATH}`);
    }
  }

  return parsedUrl;
}

export function initialize(config :Map<string, *>) :void {

  // TODO: need better validation on the configuration object
  if (!config || config.isEmpty()) {
    LOG.error(ERR_INVALID_CONFIG, config);
    throw new Error(ERR_INVALID_CONFIG);
  }

  parsedUrl = parseUrl(window.location);

  auth0Lock = new Auth0Lock(
    config.get('auth0ClientId'),
    config.get('auth0Domain'),
    {
      auth: {
        autoParseHash: false,
        params: {
          scope: 'openid email user_id user_metadata app_metadata nickname roles'
        },
        redirectUrl: parsedUrl.redirectUrl,
        responseType: 'token'
      },
      closable: false,
      hashCleanup: false,
      languageDictionary: {
        title: config.getIn(['auth0Lock', 'title'], '')
      },
      rememberLastLogin: false,
      theme: {
        logo: config.getIn(['auth0Lock', 'logo'], '')
      }
    }
  );

  if (AuthUtils.hasAuthTokenExpired(AuthUtils.getAuthToken())) {
    AuthUtils.clearAuthInfo();
  }
}

export function authenticate() :Promise<*> {

  // TODO: just checking for the existence of "access_token" and "id_token" isn't strong enough validation
  if (!urlAuthInfoAvailable()) {
    return Promise.reject(new Error(ERR_A0L_FRAGMENT_NOT_PARSED));
  }

  return new Promise((resolve :Function, reject :Function) => {

    if (auth0Lock === null || auth0Lock === undefined) {
      LOG.error(ERR_A0L_NOT_INITIALIZED);
      reject(new Error(ERR_A0L_NOT_INITIALIZED));
      return;
    }

    auth0Lock.on('authorization_error', (error) => {
      LOG.error(ERR_A0L_ON_AUTHORIZATION_ERROR, error);
      reject(new Error(ERR_A0L_ON_AUTHORIZATION_ERROR));
    });

    auth0Lock.on('unrecoverable_error', (error) => {
      LOG.error(ERR_A0L_ON_UNRECOVERABLE_ERROR, error);
      reject(new Error(ERR_A0L_ON_UNRECOVERABLE_ERROR));
    });

    auth0Lock.on('authenticated', (authInfo :Object) => {
      if (!authInfo || !authInfo.accessToken || !authInfo.idToken) {
        LOG.error(ERR_A0L_ON_AUTH__AUTH_INFO_MISSING);
        reject(new Error(ERR_A0L_ON_AUTH__AUTH_INFO_MISSING));
      }
      else if (AuthUtils.hasAuthTokenExpired(authInfo.idToken)) {
        LOG.error(ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED);
        reject(new Error(ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED));
      }
      else {
        parsedUrl.fragment = '';
        parsedUrl.redirectUrl = '';
        resolve(authInfo);
      }
    });

    auth0Lock.on('hash_parsed', (authInfo :Object) => {
      if (!authInfo || !authInfo.accessToken || !authInfo.idToken) {
        LOG.error(ERR_A0L_ON_HASH__AUTH_INFO_MISSING);
        reject(new Error(ERR_A0L_ON_HASH__AUTH_INFO_MISSING));
      }
      else if (AuthUtils.hasAuthTokenExpired(authInfo.idToken)) {
        LOG.error(ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED);
        reject(new Error(ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED));
      }
    });

    // TODO: consider implementing the callback function any special error handling
    auth0Lock.resumeAuth(parsedUrl.fragment, () => {});
  });
}
