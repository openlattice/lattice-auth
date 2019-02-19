/*
 * @flow
 */

const AUTH0_USER_INFO :'auth0_user_info' = 'auth0_user_info';

const ADMIN_ROLE :'admin' = 'admin';
const AUTH_REDUCER_KEY :'auth' = 'auth';

const AUTH_TOKEN_EXPIRED :number = -1;
const AUTH_TOKEN_EXPIRATION_NOT_SET :number = -2;

const AUTH_COOKIE :'authorization' = 'authorization';
const AUTH_HEADER :'Authorization' = 'Authorization';

const ROOT_PATH :'/' = '/';
const LOGIN_PATH :'/login' = '/login';
const LOGIN_URL :string = `${window.location.origin}${LOGIN_PATH}/`;

export {
  ADMIN_ROLE,
  AUTH0_USER_INFO,
  AUTH_COOKIE,
  AUTH_HEADER,
  AUTH_REDUCER_KEY,
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED,
  LOGIN_PATH,
  LOGIN_URL,
  ROOT_PATH,
};
