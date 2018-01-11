/*
 * @flow
 */

export const ADMIN_ROLE :'admin' = 'admin';
export const AUTH0_ID_TOKEN :'auth0_id_token' = 'auth0_id_token';
export const AUTH0_USER_INFO :'auth0_user_info' = 'auth0_user_info';

export const AUTH_TOKEN_EXPIRATION_NOT_SET :number = -2;
export const AUTH_TOKEN_EXPIRED :number = -1;

export const ROOT_PATH :'/' = '/';
export const LOGIN_PATH :'/login' = '/login';
export const LOGIN_URL :string = `${window.location.origin}${LOGIN_PATH}/`;
