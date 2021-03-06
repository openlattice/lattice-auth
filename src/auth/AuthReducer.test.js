/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import authReducer from './AuthReducer';
import * as AuthUtils from './AuthUtils';
import { genRandomString } from '../utils/testing/TestUtils';

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
} from './AuthActions';

jest.mock('./AuthUtils', () => ({
  getAuthTokenExpiration: jest.fn()
}));

const INITIAL_STATE :Map<*, *> = fromJS({
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

      const authToken :string = genRandomString();
      const expectedExpiration :string = genRandomString();

      AuthUtils.getAuthTokenExpiration.mockImplementationOnce(() => expectedExpiration);

      const newState :Map<*, *> = authReducer(undefined, { authToken, type: AUTH_SUCCESS });
      const expectedState :Map<*, *> = INITIAL_STATE
        .set('authTokenExpiration', expectedExpiration)
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

      const initialState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', genRandomString());
      const expectedState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', AUTH_TOKEN_EXPIRED);
      const newState :Map<*, *> = authReducer(initialState, { type: LOGOUT });

      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

  describe(`${LOCATION_CHANGE}`, () => {

    test('should correctly set authTokenExpiration on route changes', () => {

      const expectedExpiration :string = genRandomString();
      AuthUtils.getAuthTokenExpiration.mockImplementationOnce(() => expectedExpiration);

      const initialState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', genRandomString());
      const expectedState :Map<*, *> = INITIAL_STATE.set('authTokenExpiration', expectedExpiration);
      const newState :Map<*, *> = authReducer(initialState, { type: LOCATION_CHANGE });

      expect(newState.toJS()).toEqual(expectedState.toJS());
    });

  });

});
