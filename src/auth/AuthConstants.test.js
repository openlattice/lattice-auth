/*
 * @flow
 */

import {
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
  LOGIN_URL,
  ROOT_PATH,
} from './AuthConstants';

describe('AuthActions', () => {

  test('ADMIN_ROLE', () => {
    expect(ADMIN_ROLE).toEqual('admin');
  });

  test('AUTH0_ID_TOKEN', () => {
    expect(AUTH0_ID_TOKEN).toEqual('auth0_id_token');
  });

  test('AUTH0_NONCE_STATE', () => {
    expect(AUTH0_NONCE_STATE).toEqual('auth0_nonce_state');
  });

  test('AUTH0_USER_INFO', () => {
    expect(AUTH0_USER_INFO).toEqual('auth0_user_info');
  });

  test('AUTH_COOKIE', () => {
    expect(AUTH_COOKIE).toEqual('authorization');
  });

  test('AUTH_HEADER', () => {
    expect(AUTH_HEADER).toEqual('Authorization');
  });

  test('AUTH_REDUCER_KEY', () => {
    expect(AUTH_REDUCER_KEY).toEqual('auth');
  });

  test('AUTH_TOKEN_EXPIRATION_NOT_SET', () => {
    expect(AUTH_TOKEN_EXPIRATION_NOT_SET).toEqual(-2);
  });

  test('AUTH_TOKEN_EXPIRED', () => {
    expect(AUTH_TOKEN_EXPIRED).toEqual(-1);
  });

  test('CSRF_COOKIE', () => {
    expect(CSRF_COOKIE).toEqual('ol_csrf_token');
  });

  test('LOGIN_PATH', () => {
    expect(LOGIN_PATH).toEqual('/login');
  });

  test('LOGIN_URL', () => {
    expect(LOGIN_URL).toEqual('http://localhost/login/');
  });

  test('ROOT_PATH', () => {
    expect(ROOT_PATH).toEqual('/');
  });

});
