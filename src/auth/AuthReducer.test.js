/*
 * @flow
 */

import Immutable from 'immutable';

import authReducer from './AuthReducer';
import * as AuthUtils from './AuthUtils';
import { randomId } from '../utils/Utils';
import { AUTH_TOKEN_EXPIRED } from './AuthConstants';

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
  authTokenExpiration: AUTH_TOKEN_EXPIRED
});

describe('authReducer', () => {

  test('should be a function', () => {
    expect(authReducer).toBeInstanceOf(Function);
  });

  test('should return the initial state', () => {
    const state :Map<*, *> = authReducer(undefined, { type: '__TEST__' });
    expect(state).toEqual(INITIAL_STATE);
  });

  describe(`${AUTH_ATTEMPT}`, () => {

    test('should return the initial state', () => {
      const state :Map<*, *> = authReducer(undefined, { type: AUTH_ATTEMPT });
      expect(state.size).toBe(1);
      expect(state).toEqual(INITIAL_STATE);
    });

  });

  describe(`${AUTH_EXPIRED}`, () => {

    test('should correctly set authTokenExpiration to -1 when the auth token has expired', () => {
      const state :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      expect(state.size).toBe(1);
      expect(state.get('authTokenExpiration')).toEqual(AUTH_TOKEN_EXPIRED);
    });

  });

  describe(`${AUTH_FAILURE}`, () => {

    test('should correctly set authTokenExpiration to -1 when authentication fails', () => {
      const state :Map<*, *> = authReducer(undefined, { type: AUTH_EXPIRED });
      expect(state.size).toBe(1);
      expect(state.get('authTokenExpiration')).toEqual(AUTH_TOKEN_EXPIRED);
    });

  });

  describe(`${AUTH_SUCCESS}`, () => {

    test('should correctly set authTokenExpiration when authentication succeeds', () => {

      const authToken :string = randomId();
      const expiration :string = randomId();

      AuthUtils.getAuthTokenExpiration.mockImplementationOnce(() => expiration);

      const state :Map<*, *> = authReducer(undefined, { authToken, type: AUTH_SUCCESS });
      expect(AuthUtils.getAuthTokenExpiration).toHaveBeenCalledWith(authToken);
      expect(state.get('authTokenExpiration')).toEqual(expiration);
    });

  });

  describe(`${LOGIN}`, () => {

    test('should return the initial state', () => {
      const state :Map<*, *> = authReducer(undefined, { type: LOGIN });
      expect(state.size).toBe(1);
      expect(state).toEqual(INITIAL_STATE);
    });

  });

  describe(`${LOGOUT}`, () => {

    test('should correctly set authTokenExpiration on logout', () => {

      const initialState :Map<*, *> = Immutable.fromJS({
        authTokenExpiration: 12345
      });
      const state :Map<*, *> = authReducer(initialState, { type: LOGOUT });

      expect(state.size).toBe(1);
      expect(state).toEqual(
        Immutable.fromJS({
          authTokenExpiration: AUTH_TOKEN_EXPIRED
        })
      );
    });

  });

});
