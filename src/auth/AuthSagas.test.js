/*
 * @flow
 */

import jwt from 'jsonwebtoken';
import Lattice, { PrincipalsApi } from 'lattice';
import { call, put, take } from '@redux-saga/core/effects';
import { push } from 'connected-react-router';
import { DateTime } from 'luxon';

import * as Auth0 from './Auth0';
import * as AuthUtils from './AuthUtils';
import {
  AUTH_ATTEMPT,
  AUTH_EXPIRED,
  AUTH_FAILURE,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT,
  authFailure,
  authSuccess,
} from './AuthActions';
import { LOGIN_PATH, ROOT_PATH } from './AuthConstants';
import {
  watchAuthAttempt,
  watchAuthExpired,
  watchAuthFailure,
  watchAuthSuccess,
  watchLogin,
  watchLogout,
} from './AuthSagas';

import { genRandomString } from '../utils/testing/TestUtils';

jest.mock('lattice', () => ({
  PrincipalsApi: {
    syncUser: jest.fn(),
  },
  configure: jest.fn(),
}));

jest.mock('./AuthUtils', () => ({
  clearAuthInfo: jest.fn(),
  clearNonceState: jest.fn(),
  getCSRFToken: jest.fn(),
  getNonceState: jest.fn(),
  storeAuthInfo: jest.fn(),
}));

const GENERATOR_TAG = '[object Generator]';

describe('AuthSagas', () => {

  beforeEach(() => {
    AuthUtils.clearAuthInfo.mockClear();
    AuthUtils.clearNonceState.mockClear();
    AuthUtils.getCSRFToken.mockClear();
    AuthUtils.getNonceState.mockClear();
    AuthUtils.storeAuthInfo.mockClear();
    Lattice.configure.mockClear();
  });

  describe('watchAuthAttempt()', () => {

    test('attempt success', () => {

      const expInSecondsSinceEpoch :number = DateTime.local().plus({ days: 1 }).toMillis(); // 1 day ahead
      const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
      const mockAuthInfo = { accessToken: genRandomString(), idToken: mockAuthToken };
      const mockNonceState = genRandomString();

      AuthUtils.getNonceState.mockImplementationOnce(() => {});

      const iterator = watchAuthAttempt();
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(take(AUTH_ATTEMPT));

      step = iterator.next();
      expect(step.value).toEqual(call(Auth0.authenticate));

      step = iterator.next({ authInfo: mockAuthInfo, state: mockNonceState });
      expect(AuthUtils.storeAuthInfo).toHaveBeenCalledTimes(1);
      expect(AuthUtils.storeAuthInfo).toHaveBeenCalledWith(mockAuthInfo);
      expect(AuthUtils.getCSRFToken).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledWith(expect.objectContaining({ authToken: mockAuthToken }));
      expect(step.value).toEqual(call(PrincipalsApi.syncUser));

      step = iterator.next();
      expect(AuthUtils.getNonceState).toHaveBeenCalledTimes(1);
      expect(AuthUtils.getNonceState).toHaveBeenCalledWith(mockNonceState);

      expect(step.value).toEqual(put(authSuccess()));
    });

    test('attempt success - redirectUrl', () => {

      const expInSecondsSinceEpoch :number = DateTime.local().plus({ days: 1 }).toMillis(); // 1 day ahead
      const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
      const mockAuthInfo = { accessToken: genRandomString(), idToken: mockAuthToken };
      const mockNonceState = genRandomString();
      const mockRedirectUrl = 'https://openlattice.com/test/#/hello/world';

      AuthUtils.getNonceState.mockImplementationOnce(() => ({ redirectUrl: mockRedirectUrl }));

      const iterator = watchAuthAttempt();
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(take(AUTH_ATTEMPT));

      step = iterator.next();
      expect(step.value).toEqual(call(Auth0.authenticate));

      step = iterator.next({ authInfo: mockAuthInfo, state: mockNonceState });
      expect(AuthUtils.storeAuthInfo).toHaveBeenCalledTimes(1);
      expect(AuthUtils.storeAuthInfo).toHaveBeenCalledWith(mockAuthInfo);
      expect(AuthUtils.getCSRFToken).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledWith(expect.objectContaining({ authToken: mockAuthToken }));
      expect(step.value).toEqual(call(PrincipalsApi.syncUser));

      step = iterator.next();
      expect(AuthUtils.getNonceState).toHaveBeenCalledTimes(1);
      expect(AuthUtils.getNonceState).toHaveBeenCalledWith(mockNonceState);
      expect(step.value).toEqual(put(push('/hello/world')));

      step = iterator.next();
      expect(step.value).toEqual(put(authSuccess()));
    });

    test('attempt failure', () => {

      const iterator = watchAuthAttempt();
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(take(AUTH_ATTEMPT));

      step = iterator.next();
      expect(step.value).toEqual(call(Auth0.authenticate));

      step = iterator.next();
      expect(step.value).toEqual(put(authFailure(expect.any(Error))));
    });

  });

  describe('watchAuthSuccess()', () => {

    test('authenticated', () => {

      const expInSecondsSinceEpoch :number = DateTime.local().plus({ days: 1 }).toMillis(); // 1 day ahead
      const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');

      const iterator = watchAuthSuccess();
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(take(AUTH_SUCCESS));

      step = iterator.next({ authToken: mockAuthToken });
      expect(Lattice.configure).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledWith(expect.objectContaining({ authToken: mockAuthToken }));
      expect(step.done).toEqual(false);
    });

    test('not authenticated', () => {

      const iterator = watchAuthSuccess();
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(take(AUTH_SUCCESS));

      step = iterator.next({});
      expect(Lattice.configure).toHaveBeenCalledTimes(0);
      expect(step.done).toEqual(false);
    });

  });

  test('watchAuthExpired()', () => {

    const iterator = watchAuthExpired();
    expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

    let step = iterator.next();
    expect(step.value).toEqual(take(AUTH_EXPIRED));

    step = iterator.next();
    expect(step.value).toEqual(call(AuthUtils.clearAuthInfo));

    step = iterator.next();
    expect(step.done).toEqual(false);
  });

  test('watchAuthFailure()', () => {

    const iterator = watchAuthFailure();
    expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

    let step = iterator.next();
    expect(step.value).toEqual(take(AUTH_FAILURE));

    step = iterator.next();
    expect(step.value).toEqual(call(AuthUtils.clearAuthInfo));

    step = iterator.next();
    expect(step.done).toEqual(false);
  });

  test('watchLogin()', () => {

    const iterator = watchLogin();
    expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

    let step = iterator.next();
    expect(step.value).toEqual(take(LOGIN));

    step = iterator.next();
    expect(step.value).toEqual(put(push(LOGIN_PATH)));

    step = iterator.next();
    expect(step.done).toEqual(false);
  });

  test('watchLogout()', () => {

    const iterator = watchLogout();
    expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

    let step = iterator.next();
    expect(step.value).toEqual(take(LOGOUT));

    step = iterator.next();
    expect(step.value).toEqual(call(AuthUtils.clearAuthInfo));

    step = iterator.next();
    expect(step.value).toEqual(put(push(ROOT_PATH)));

    step = iterator.next();
    expect(step.done).toEqual(false);
  });

});
