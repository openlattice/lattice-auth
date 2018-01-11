/*
 * @flow
 */

import Immutable from 'immutable';

import authReducer from './AuthReducer';
import * as AuthUtils from './AuthUtils';
import { randomId } from '../utils/Utils';

import {
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED
} from './AuthConstants';

import {
  AUTH_ATTEMPT,
  AUTH_EXPIRED,
  AUTH_FAILURE,
  AUTH_SUCCESS,
  LOGIN,
  LOGOUT
} from './AuthActionFactory';

jest.mock('./AuthUtils', () => ({
  getAuthTokenExpiration: jest.fn()
}));

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  authTokenExpiration: AUTH_TOKEN_EXPIRATION_NOT_SET,
  isAuthenticating: false
});

describe('authReducer', () => {

  test('should be a function', () => {
    expect(authReducer).toBeInstanceOf(Function);
  });

  test('should return the initial state', () => {
    const newState :Map<*, *> = authReducer(undefined, { type: '__TEST__' });
    expect(newState.toJS()).toEqual(INITIAL_STATE.toJS());
  });

  describe(`${AUTH_ATTEMPT}`, () => {

    test('should correctly set isAuthenticating to true', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_ATTEMPT });
      const expectedState :Map<*, *> = INITIAL_STATE.set('isAuthenticating', true);
      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

  describe(`${AUTH_EXPIRED}`, () => {

    test('should correctly set authTokenExpiration to -1 when the auth token has expired', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      const expectedState :Map<*, *> = INITIAL_STATE
        .set('authTokenExpiration', AUTH_TOKEN_EXPIRED)
        .set('isAuthenticating', false);
      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

  describe(`${AUTH_FAILURE}`, () => {

    test('should correctly set authTokenExpiration to -1 when authentication fails', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      const expectedState :Map<*, *> = INITIAL_STATE
        .set('authTokenExpiration', AUTH_TOKEN_EXPIRED)
        .set('isAuthenticating', false);
      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

  describe(`${AUTH_SUCCESS}`, () => {

    test('should correctly set authTokenExpiration when authentication succeeds', () => {

      const authToken :string = randomId();
      const expiration :string = randomId();

      AuthUtils.getAuthTokenExpiration.mockImplementationOnce(() => expiration);

      const newState :Map<*, *> = authReducer(undefined, { authToken, type: AUTH_SUCCESS });
      const expectedState :Map<*, *> = INITIAL_STATE
        .set('authTokenExpiration', expiration)
        .set('isAuthenticating', false);
      expect(AuthUtils.getAuthTokenExpiration).toHaveBeenCalledWith(authToken);
      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

  describe(`${LOGIN}`, () => {

    test('should return the initial state', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: LOGIN });
      expect(newState.toJS()).toEqual(INITIAL_STATE.toJS());
    });

  });

  describe(`${LOGOUT}`, () => {

    test('should correctly set authTokenExpiration on logout', () => {

      const initialState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', 12345);
      const expectedState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', AUTH_TOKEN_EXPIRED);
      const newState :Map<*, *> = authReducer(initialState, { type: LOGOUT });

      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

});
