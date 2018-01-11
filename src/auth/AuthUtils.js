/*
 * @flow
 */

import decode from 'jwt-decode';
import moment from 'moment';
import qs from 'qs';

import { isNonEmptyString } from '../utils/LangUtils';

import {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_USER_INFO,
  AUTH_TOKEN_EXPIRED,
  LOGIN_URL
} from './AuthConstants';

/*
 * https://auth0.com/docs/jwt
 * https://auth0.com/docs/tokens/id-token
 */

export function getAuthToken() :?string {

  const idToken :?string = localStorage.getItem(AUTH0_ID_TOKEN);

  // TODO: validate token, verify its signature
  // https://auth0.com/docs/tokens/id-token#verify-the-signature
  // https://auth0.com/docs/api-auth/tutorials/verify-access-token
  if (typeof idToken === 'string' && idToken.trim().length) {
    return idToken;
  }

  return null;
}

export function getUserInfo() :?UserInfo {

  const userInfoStr :?string = localStorage.getItem(AUTH0_USER_INFO);

  if (typeof userInfoStr !== 'string' || userInfoStr.length <= 0) {
    return null;
  }

  try {
    return JSON.parse(userInfoStr);
  }
  catch (error) {
    return null;
  }
}

export function storeAuthInfo(authInfo :?Object) :void {

  if (!authInfo || !authInfo.idToken) {
    return;
  }

  // TODO: id token validation
  localStorage.setItem(AUTH0_ID_TOKEN, authInfo.idToken);

  if (!authInfo.idTokenPayload) {
    return;
  }

  const userInfo :UserInfo = {
    email: authInfo.idTokenPayload.email,
    id: authInfo.idTokenPayload.user_id,
    picture: authInfo.idTokenPayload.picture,
    roles: authInfo.idTokenPayload.roles
  };

  localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(userInfo));
}

export function clearAuthInfo() :void {

  localStorage.removeItem(AUTH0_ID_TOKEN);
  localStorage.removeItem(AUTH0_USER_INFO);
}

export function getAuthTokenExpiration(maybeIdToken :?string) :number {

  let idToken :?string = maybeIdToken;

  if (idToken === null || idToken === undefined) {
    idToken = getAuthToken();
  }

  if (!idToken) {
    return AUTH_TOKEN_EXPIRED;
  }

  try {
    // it looks like Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
    // https://auth0.com/docs/tokens/id-token#id-token-payload
    const idTokenDecoded :Object = decode(idToken);
    return moment.unix(idTokenDecoded.exp).valueOf();
  }
  catch (e) {
    return AUTH_TOKEN_EXPIRED;
  }
}

export function hasAuthTokenExpired(idTokenOrExpiration :?string | number) :boolean {

  try {
    if (typeof idTokenOrExpiration === 'number' && Number.isFinite(idTokenOrExpiration)) {
      // idTokenOrExpiration is the expiration
      return moment().isAfter(idTokenOrExpiration);
    }
    else if (typeof idTokenOrExpiration === 'string' && idTokenOrExpiration.length) {
      // idTokenOrExpiration is the id token
      const idTokenDecoded = decode(idTokenOrExpiration);
      const expiration = moment.unix(idTokenDecoded.exp);
      return moment().isAfter(expiration);
    }
    return true;
  }
  catch (e) {
    return true;
  }
}

export function isAuthenticated() :boolean {

  return !hasAuthTokenExpired(getAuthTokenExpiration());
}

export function isAdmin() :boolean {

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

export function redirectToLogin(redirectUrl :?string) :void {

  console.log(window.location);

  let queryString :string = '';

  if (isNonEmptyString(redirectUrl)) {
    queryString = qs.stringify(
      { redirectUrl },
      { addQueryPrefix: true }
    );
  }
  else {
    queryString = qs.stringify(
      { redirectUrl: `${window.location.origin}${window.location.pathname}` },
      { addQueryPrefix: true }
    );
  }

  window.location.replace(`${LOGIN_URL}${queryString}`);
}
