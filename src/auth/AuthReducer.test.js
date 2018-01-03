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
  authTokenExpiration: AUTH_TOKEN_EXPIRATION_NOT_SET
});

describe('authReducer', () => {

  test('should be a function', () => {
    expect(authReducer).toBeInstanceOf(Function);
  });

  test('should return the initial state', () => {
    const newState :Map<*, *> = authReducer(undefined, { type: '__TEST__' });
    expect(INITIAL_STATE.equals(newState)).toEqual(true);
  });

  describe(`${AUTH_ATTEMPT}`, () => {

    test('should return the initial state', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_ATTEMPT });
      expect(newState.size).toBe(1);
      expect(INITIAL_STATE.equals(newState)).toEqual(true);
    });

  });

  describe(`${AUTH_EXPIRED}`, () => {

    test('should correctly set authTokenExpiration to -1 when the auth token has expired', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      expect(newState.size).toBe(1);
      expect(newState.get('authTokenExpiration')).toEqual(AUTH_TOKEN_EXPIRED);
    });

  });

  describe(`${AUTH_FAILURE}`, () => {

    test('should correctly set authTokenExpiration to -1 when authentication fails', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      expect(newState.size).toBe(1);
      expect(newState.get('authTokenExpiration')).toEqual(AUTH_TOKEN_EXPIRED);
    });

  });

  describe(`${AUTH_SUCCESS}`, () => {

    test('should correctly set authTokenExpiration when authentication succeeds', () => {

      const authToken :string = randomId();
      const expiration :string = randomId();

      AuthUtils.getAuthTokenExpiration.mockImplementationOnce(() => expiration);

      const newState :Map<*, *> = authReducer(undefined, { authToken, type: AUTH_SUCCESS });
      expect(AuthUtils.getAuthTokenExpiration).toHaveBeenCalledWith(authToken);
      expect(newState.get('authTokenExpiration')).toEqual(expiration);
    });

  });

  describe(`${LOGIN}`, () => {

    test('should return the initial state', () => {
      const newState :Map<*, *> = authReducer(undefined, { type: LOGIN });
      expect(INITIAL_STATE.equals(newState)).toEqual(true);
    });

  });

  describe(`${LOGOUT}`, () => {

    test('should correctly set authTokenExpiration on logout', () => {

      const initialState :Map<*, *> = Immutable.fromJS({ authTokenExpiration: 12345 });
      const expectedState :Map<*, *> = Immutable.fromJS({ authTokenExpiration: AUTH_TOKEN_EXPIRED });
      const newState :Map<*, *> = authReducer(initialState, { type: LOGOUT });

      expect(newState.size).toBe(1);
      expect(expectedState.equals(newState)).toEqual(true);
    });

  });

});
