/*
 * @flow
 */

import Auth0Lock from 'auth0-lock';

import Logger from '../utils/Logger';
import * as AuthUtils from './AuthUtils';
import { getConfig } from '../config/Configuration';

import {
  ERR_A0L_NOT_INITIALIZED,
  ERR_A0L_ON_AUTHORIZATION_ERROR,
  ERR_A0L_ON_UNRECOVERABLE_ERROR,
  ERR_A0L_ON_AUTH__AUTH_INFO_MISSING,
  ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED,
  ERR_A0L_ON_HASH__AUTH_INFO_MISSING,
  ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED,
  ERR_URL_HASH_PATH_MISSING
} from '../utils/Errors';

import {
  LOGIN_PATH
} from './AuthConstants';

const LOG = new Logger('Auth0');

/*
 * https://auth0.com/docs/libraries/lock/v10
 * https://auth0.com/docs/libraries/lock/v10/api
 * https://auth0.com/docs/libraries/lock/v10/customization
 */
let auth0Lock :?Auth0Lock;
let auth0HashPath :?string;

export function getAuth0LockInstance() :Auth0Lock {

  if (auth0Lock === null || auth0Lock === undefined) {
    throw new Error(ERR_A0L_NOT_INITIALIZED);
  }

  return auth0Lock;
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
export function parseHashPath(href :?string) :?string {

  if (!href) {
    return null;
  }

  const hashIndex :number = href.indexOf('#');
  const hashPath :string = hashIndex === -1 ? '' : href.substring(hashIndex + 1);

  // TODO: just checking for the existence of "access_token" and "id_token" isn't strong enough validation
  if (hashPath.indexOf('access_token') !== -1 && hashPath.indexOf('id_token') !== -1) {

    const urlBeforeHash :string = href.slice(0, hashIndex >= 0 ? hashIndex : 0);
    if (urlBeforeHash.endsWith('/')) {
      window.location.replace(`${urlBeforeHash}#${LOGIN_PATH}`);
    }
    else {
      window.location.replace(`${urlBeforeHash}/#${LOGIN_PATH}`);
    }
    return hashPath;
  }

  return null;
}

export function initialize() :void {

  auth0Lock = new Auth0Lock(
    getConfig().get('auth0ClientId'),
    getConfig().get('auth0Domain'),
    {
      auth: {
        autoParseHash: false,
        params: {
          scope: 'openid email user_id user_metadata app_metadata nickname roles'
        },
        responseType: 'token'
      },
      closable: false,
      hashCleanup: false,
      languageDictionary: {
        title: getConfig().getIn(['auth0Lock', 'title'], '')
      },
      redirectUrl: getConfig().getIn(['auth0Lock', 'redirectUrl'], ''),
      theme: {
        logo: getConfig().getIn(['auth0Lock', 'logo'], '')
      }
    }
  );

  auth0HashPath = parseHashPath(window.location.href);

  if (AuthUtils.hasAuthTokenExpired(AuthUtils.getAuthToken())) {
    AuthUtils.clearAuthInfo();
  }
}

export function authenticate() :Promise<*> {

  if (!auth0HashPath) {
    return Promise.reject(new Error(ERR_URL_HASH_PATH_MISSING));
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
        auth0HashPath = null;
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
    auth0Lock.resumeAuth(auth0HashPath, () => {});
  });
}
