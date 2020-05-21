/*
 * @flow
 */

import _has from 'lodash/has';
import cookies from 'js-cookie';
import decode from 'jwt-decode';
import qs from 'qs';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';

import {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_NONCE_STATE,
  AUTH0_USER_INFO,
  AUTH_COOKIE,
  AUTH_TOKEN_EXPIRED,
  CSRF_COOKIE,
  LOGIN_PATH,
} from './AuthConstants';

import Logger from '../utils/Logger';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

declare type Auth0NonceState = {
  redirectUrl :string;
};

declare type UserInfo = {
  firstName ? :string;
  givenName ? :string;
  email ? :string;
  id ? :string;
  picture ? :string;
  roles ? :string[];
};

/*
 * https://auth0.com/docs/jwt
 * https://auth0.com/docs/tokens/id-token
 */

const LOG = new Logger('AuthUtils');

// https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
const BASE_UUID_PATTERN :RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

function getAuthToken() :?string {

  const authToken :?string = localStorage.getItem(AUTH0_ID_TOKEN);

  if (typeof authToken === 'string' && authToken.trim().length) {
    try {
      // this is not sufficient validation, only confirms the token is well formed
      // TODO:
      //   validate token, verify its signature
      //   https://auth0.com/docs/tokens/id-token#verify-the-signature
      //   https://auth0.com/docs/api-auth/tutorials/verify-access-token
      decode(authToken);
      return authToken;
    }
    catch (e) {
      return null;
    }
  }

  return null;
}

function getAuthTokenExpiration(maybeAuthToken :?string) :number {

  let authToken :?string = maybeAuthToken;

  if (authToken === null || authToken === undefined) {
    authToken = getAuthToken();
  }

  if (!authToken) {
    return AUTH_TOKEN_EXPIRED;
  }

  try {
    // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
    // https://auth0.com/docs/tokens/id-token#id-token-payload
    const authTokenDecoded :Object = decode(authToken);
    const expirationInMillis :number = authTokenDecoded.exp * 1000;
    return expirationInMillis;
  }
  catch (e) {
    return AUTH_TOKEN_EXPIRED;
  }
}

function getCSRFToken() :?UUID {

  const csrfToken :?UUID = cookies.get(CSRF_COOKIE);
  if (typeof csrfToken === 'string' && BASE_UUID_PATTERN.test(csrfToken)) {
    return csrfToken;
  }

  return null;
}

function getUserInfo() :?UserInfo {

  const userInfoStr :?string = localStorage.getItem(AUTH0_USER_INFO);

  if (typeof userInfoStr !== 'string' || userInfoStr.length <= 0) {
    return null;
  }

  try {
    const userInfoObj = JSON.parse(userInfoStr);
    return isNonEmptyObject(userInfoObj) ? userInfoObj : null;
  }
  catch (error) {
    return null;
  }
}

function getDomainForCookie() :string {

  const { hostname } = window.location;
  const domain :string = hostname.split('.').splice(-2).join('.');
  const prefix :string = (hostname === 'localhost') ? '' : '.';
  return `${prefix}${domain}`;
}

function clearAuthInfo() :void {

  localStorage.removeItem(AUTH0_ID_TOKEN);
  localStorage.removeItem(AUTH0_USER_INFO);

  // when deleting a cookie, we must pass the same "domain" and "path" values that were used to set the cookie
  // https://github.com/js-cookie/js-cookie
  cookies.remove(AUTH_COOKIE, {
    domain: getDomainForCookie(),
    path: '/',
  });

  cookies.remove(CSRF_COOKIE, {
    domain: getDomainForCookie(),
    path: '/',
  });
}

function storeAuthInfo(authInfo :?Object) :void {

  if (!authInfo || !authInfo.idToken) {
    return;
  }

  try {
    // this is not sufficient validation, only confirms the token is well formed
    // TODO:
    //   validate token, verify its signature
    //   https://auth0.com/docs/tokens/id-token#verify-the-signature
    //   https://auth0.com/docs/api-auth/tutorials/verify-access-token
    decode(authInfo.idToken);

    const { hostname } = window.location;
    const authCookie :string = `Bearer ${authInfo.idToken}`;
    const authTokenExpiration :number = getAuthTokenExpiration(authInfo.idToken);
    if (authTokenExpiration !== AUTH_TOKEN_EXPIRED) {
      localStorage.setItem(AUTH0_ID_TOKEN, authInfo.idToken);
      cookies.set(AUTH_COOKIE, authCookie, {
        SameSite: 'strict',
        domain: getDomainForCookie(),
        expires: new Date(authTokenExpiration),
        path: '/',
        secure: (hostname !== 'localhost'),
      });
      cookies.set(CSRF_COOKIE, uuid(), {
        SameSite: 'strict',
        domain: getDomainForCookie(),
        expires: new Date(authTokenExpiration),
        path: '/',
        secure: (hostname !== 'localhost'),
      });
    }
    else {
      LOG.warn(`not setting "${AUTH_COOKIE}" cookie because auth token is expired`);
    }
  }
  catch (e) {
    LOG.error(`caught exception while setting "${AUTH_COOKIE}" cookie`, e);
    return;
  }

  if (!isNonEmptyObject(authInfo.idTokenPayload)) {
    return;
  }

  const userInfo :UserInfo = {
    email: authInfo.idTokenPayload.email,
    familyName: authInfo.idTokenPayload.family_name,
    givenName: authInfo.idTokenPayload.given_name,
    id: authInfo.idTokenPayload.user_id,
    name: authInfo.idTokenPayload.name,
    picture: authInfo.idTokenPayload.picture,
    roles: authInfo.idTokenPayload.roles,
  };

  localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(userInfo));
}

function clearNonceState() :void {

  localStorage.removeItem(AUTH0_NONCE_STATE);
}

function getNonceState(state :string) :?Auth0NonceState {

  const nonce :?string = localStorage.getItem(AUTH0_NONCE_STATE);
  if (typeof nonce !== 'string' || nonce.length <= 0) {
    return null;
  }

  try {
    const nonceObj = JSON.parse(nonce);
    if (_has(nonceObj, state)) {
      return nonceObj[state];
    }
  }
  catch (e) {
    return null;
  }

  return null;
}

function storeNonceState(state :string, value :Auth0NonceState) :void {

  if (!isNonEmptyString(state)) {
    return;
  }

  localStorage.setItem(AUTH0_NONCE_STATE, JSON.stringify({ [state]: value }));
}

function hasAuthTokenExpired(authTokenOrExpiration :?string | number) :boolean {

  try {
    if (typeof authTokenOrExpiration === 'number' && Number.isFinite(authTokenOrExpiration)) {
      // authTokenOrExpiration is the expiration
      // if the expiration is in milliseconds, isAfter() will return correctly. if the expiration is in seconds,
      // isAfter() will convert it to a Date in 1970 since Date expects milliseconds, and thus always return true.
      return DateTime.local().valueOf() > DateTime.fromMillis(authTokenOrExpiration).valueOf();
    }
    if (typeof authTokenOrExpiration === 'string' && authTokenOrExpiration.length) {
      // authTokenOrExpiration is the id token
      const authTokenDecoded = decode(authTokenOrExpiration);
      // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
      // https://auth0.com/docs/tokens/id-token#id-token-payload
      const expirationInMillis :number = authTokenDecoded.exp * 1000;
      return DateTime.local().valueOf() > DateTime.fromMillis(expirationInMillis).valueOf();
    }
    return true;
  }
  catch (e) {
    return true;
  }
}

function isAuthenticated() :boolean {

  return !hasAuthTokenExpired(getAuthTokenExpiration());
}

function isAdmin() :boolean {

  let hasAdminRole :boolean = false;
  const userInfo :?UserInfo = getUserInfo();

  if (userInfo && userInfo.roles && userInfo.roles.length > 0) {

    userInfo.roles.forEach((role :string) => {
      if (role === ADMIN_ROLE) {
        hasAdminRole = true;
      }
    });
  }

  return hasAdminRole;
}

function redirectToLogin(location :Location) :void {

  const { href, origin } = location;
  const queryString = qs.stringify(
    { redirectUrl: href },
    { addQueryPrefix: true },
  );

  window.location.replace(`${origin}${LOGIN_PATH}/${queryString}`);
}

export {
  clearAuthInfo,
  clearNonceState,
  getAuthToken,
  getAuthTokenExpiration,
  getCSRFToken,
  getNonceState,
  getUserInfo,
  hasAuthTokenExpired,
  isAdmin,
  isAuthenticated,
  redirectToLogin,
  storeAuthInfo,
  storeNonceState,
};

export type {
  Auth0NonceState,
  UserInfo,
};
