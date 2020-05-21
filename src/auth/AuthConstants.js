/*
 * @flow
 */

const AUTH0_ID_TOKEN :'auth0_id_token' = 'auth0_id_token';
const AUTH0_NONCE_STATE :'auth0_nonce_state' = 'auth0_nonce_state';
const AUTH0_USER_INFO :'auth0_user_info' = 'auth0_user_info';

const ADMIN_ROLE :'admin' = 'admin';
const AUTH_REDUCER_KEY :'auth' = 'auth';

const AUTH_TOKEN_EXPIRED :number = -1;
const AUTH_TOKEN_EXPIRATION_NOT_SET :number = -2;

const AUTH_COOKIE :'authorization' = 'authorization';
const AUTH_HEADER :'Authorization' = 'Authorization';
const CSRF_COOKIE :'ol_csrf_token' = 'ol_csrf_token';

const ROOT_PATH :'/' = '/';
const LOGIN_PATH :'/login' = '/login';

export {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_NONCE_STATE,
  AUTH0_USER_INFO,
  AUTH_COOKIE,
  AUTH_HEADER,
  AUTH_REDUCER_KEY,
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED,
  CSRF_COOKIE,
  LOGIN_PATH,
  ROOT_PATH,
};
