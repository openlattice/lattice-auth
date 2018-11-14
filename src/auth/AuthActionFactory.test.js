/*
 * @flow
 */

import { randomStringId } from '../utils/Utils';

import {
  AUTH_ATTEMPT,
  AUTH_EXPIRED,
  AUTH_FAILURE,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT,
  authAttempt,
  authExpired,
  authFailure,
  authSuccess,
  login,
  logout
} from './AuthActionFactory';

const AUTH_ATTEMPT_ACTION_TYPE :'AUTH_ATTEMPT' = 'AUTH_ATTEMPT';
const AUTH_EXPIRED_ACTION_TYPE :'AUTH_EXPIRED' = 'AUTH_EXPIRED';
const AUTH_FAILURE_ACTION_TYPE :'AUTH_FAILURE' = 'AUTH_FAILURE';
const AUTH_SUCCESS_ACTION_TYPE :'AUTH_SUCCESS' = 'AUTH_SUCCESS';
const LOGIN_ACTION_TYPE :'LOGIN' = 'LOGIN';
const LOGOUT_ACTION_TYPE :'LOGOUT' = 'LOGOUT';

describe('AuthActionFactory', () => {

  describe('action types', () => {

    test(`${AUTH_ATTEMPT_ACTION_TYPE}`, () => {
      expect(AUTH_ATTEMPT).toEqual(AUTH_ATTEMPT_ACTION_TYPE);
    });

    test(`${AUTH_EXPIRED_ACTION_TYPE}`, () => {
      expect(AUTH_EXPIRED).toEqual(AUTH_EXPIRED_ACTION_TYPE);
    });

    test(`${AUTH_FAILURE_ACTION_TYPE}`, () => {
      expect(AUTH_FAILURE).toEqual(AUTH_FAILURE_ACTION_TYPE);
    });

    test(`${AUTH_SUCCESS_ACTION_TYPE}`, () => {
      expect(AUTH_SUCCESS).toEqual(AUTH_SUCCESS_ACTION_TYPE);
    });

    test(`${LOGIN_ACTION_TYPE}`, () => {
      expect(LOGIN).toEqual(LOGIN_ACTION_TYPE);
    });

    test(`${LOGOUT_ACTION_TYPE}`, () => {
      expect(LOGOUT).toEqual(LOGOUT_ACTION_TYPE);
    });

  });

  describe('action creators', () => {

    test('authAttempt()', () => {
      expect(authAttempt()).toEqual({ type: AUTH_ATTEMPT_ACTION_TYPE });
    });

    test('authExpired()', () => {
      expect(authExpired()).toEqual({ type: AUTH_EXPIRED_ACTION_TYPE });
    });

    test('authFailure()', () => {

      const error :string = randomStringId();
      expect(authFailure(error)).toEqual({
        error,
        type: AUTH_FAILURE_ACTION_TYPE
      });
    });

    test('authSuccess()', () => {

      const authToken :string = randomStringId();
      expect(authSuccess(authToken)).toEqual({
        authToken,
        type: AUTH_SUCCESS_ACTION_TYPE
      });
    });

    test('login()', () => {
      expect(login()).toEqual({ type: LOGIN_ACTION_TYPE });
    });

    test('logout()', () => {
      expect(logout()).toEqual({ type: LOGOUT_ACTION_TYPE });
    });

  });

});
