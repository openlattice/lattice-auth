/*
 * @flow
 */

import decode from 'jwt-decode';
import qs from 'qs';
import { isAfter } from 'date-fns';

import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

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

  if (typeof idToken === 'string' && idToken.trim().length) {
    try {
      // this is not sufficient validation, only confirms the token is well formed
      // TODO:
      //   validate token, verify its signature
      //   https://auth0.com/docs/tokens/id-token#verify-the-signature
      //   https://auth0.com/docs/api-auth/tutorials/verify-access-token
      decode(idToken);
      return idToken;
    }
    catch (e) {
      return null;
    }
  }

  return null;
}

export function getUserInfo() :?UserInfo {

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

export function storeAuthInfo(authInfo :?Object) :void {

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
    localStorage.setItem(AUTH0_ID_TOKEN, authInfo.idToken);
  }
  catch (e) {
    return;
  }

  if (!authInfo.idTokenPayload) {
    return;
  }

  // try to use "family_name", or else just "name", or else fall back to "email"
  let familyName :string = authInfo.idTokenPayload.family_name;
  if (!isNonEmptyString(familyName)) {
    familyName = authInfo.idTokenPayload.name;
  }
  if (!isNonEmptyString(familyName)) {
    familyName = authInfo.idTokenPayload.email;
  }

  // try to use "given_name", or else just "name", or else fall back to "email"
  let givenName :string = authInfo.idTokenPayload.given_name;
  if (!isNonEmptyString(givenName)) {
    givenName = authInfo.idTokenPayload.name;
  }
  if (!isNonEmptyString(givenName)) {
    givenName = authInfo.idTokenPayload.email;
  }

  const userInfo :UserInfo = {
    familyName,
    givenName,
    email: authInfo.idTokenPayload.email,
    id: authInfo.idTokenPayload.user_id,
    picture: authInfo.idTokenPayload.picture,
    roles: authInfo.idTokenPayload.roles,
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
    // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
    // https://auth0.com/docs/tokens/id-token#id-token-payload
    const idTokenDecoded :Object = decode(idToken);
    const expirationInMillis :number = idTokenDecoded.exp * 1000;
    return expirationInMillis;
  }
  catch (e) {
    return AUTH_TOKEN_EXPIRED;
  }
}

export function hasAuthTokenExpired(idTokenOrExpiration :?string | number) :boolean {

  try {
    if (typeof idTokenOrExpiration === 'number' && Number.isFinite(idTokenOrExpiration)) {
      // idTokenOrExpiration is the expiration
      // if the expiration is in milliseconds, isAfter() will return correctly. if the expiration is in seconds,
      // isAfter() will convert it to a Date in 1970 since Date expects milliseconds, and thus always return true.
      return isAfter(Date.now(), idTokenOrExpiration);
    }
    if (typeof idTokenOrExpiration === 'string' && idTokenOrExpiration.length) {
      // idTokenOrExpiration is the id token
      const idTokenDecoded = decode(idTokenOrExpiration);
      // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
      // https://auth0.com/docs/tokens/id-token#id-token-payload
      const expirationInMillis :number = idTokenDecoded.exp * 1000;
      return isAfter(Date.now(), expirationInMillis);
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
