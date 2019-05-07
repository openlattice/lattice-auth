/*
 * @flow
 */

import cookies from 'js-cookie';
import decode from 'jwt-decode';
import qs from 'qs';
import uuid from 'uuid/v4';
import { isAfter } from 'date-fns';

import Logger from '../utils/Logger';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

import {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_USER_INFO,
  AUTH_COOKIE,
  AUTH_TOKEN_EXPIRED,
  LOGIN_URL,
  CSRF_COOKIE,
} from './AuthConstants';

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

function hasAuthTokenExpired(authTokenOrExpiration :?string | number) :boolean {

  try {
    if (typeof authTokenOrExpiration === 'number' && Number.isFinite(authTokenOrExpiration)) {
      // authTokenOrExpiration is the expiration
      // if the expiration is in milliseconds, isAfter() will return correctly. if the expiration is in seconds,
      // isAfter() will convert it to a Date in 1970 since Date expects milliseconds, and thus always return true.
      return isAfter(Date.now(), authTokenOrExpiration);
    }
    if (typeof authTokenOrExpiration === 'string' && authTokenOrExpiration.length) {
      // authTokenOrExpiration is the id token
      const authTokenDecoded = decode(authTokenOrExpiration);
      // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
      // https://auth0.com/docs/tokens/id-token#id-token-payload
      const expirationInMillis :number = authTokenDecoded.exp * 1000;
      return isAfter(Date.now(), expirationInMillis);
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

function redirectToLogin(redirectUrl :?string) :void {

  let queryString :string = '';

  if (isNonEmptyString(redirectUrl)) {
    queryString = qs.stringify(
      { redirectUrl },
      { addQueryPrefix: true },
    );
  }
  else {
    const { origin, pathname, hash } = window.location;
    queryString = qs.stringify(
      { redirectUrl: `${origin}${pathname}${hash}` },
      { addQueryPrefix: true },
    );
  }

  window.location.replace(`${LOGIN_URL}${queryString}`);
}

export {
  clearAuthInfo,
  getAuthToken,
  getAuthTokenExpiration,
  getCSRFToken,
  getUserInfo,
  hasAuthTokenExpired,
  isAdmin,
  isAuthenticated,
  redirectToLogin,
  storeAuthInfo,
};

export type {
  UserInfo,
};
