/*
 * @flow
 */

import {
  ADMIN_ROLE,
  AUTH_TOKEN_EXPIRED,
  AUTH0_ID_TOKEN,
  AUTH0_USER_INFO,
  LOGIN_PATH,
  ROOT_PATH
} from './AuthConstants';

describe('AuthActionFactory', () => {

  test('ADMIN_ROLE', () => {
    expect(ADMIN_ROLE).toEqual('admin');
  });

  test('AUTH_TOKEN_EXPIRED', () => {
    expect(AUTH_TOKEN_EXPIRED).toEqual(-1);
  });

  test('AUTH0_ID_TOKEN', () => {
    expect(AUTH0_ID_TOKEN).toEqual('auth0_id_token');
  });

  test('AUTH0_USER_INFO', () => {
    expect(AUTH0_USER_INFO).toEqual('auth0_user_info');
  });

  test('LOGIN_PATH', () => {
    expect(LOGIN_PATH).toEqual('/login');
  });

  test('ROOT_PATH', () => {
    expect(ROOT_PATH).toEqual('/');
  });

});
