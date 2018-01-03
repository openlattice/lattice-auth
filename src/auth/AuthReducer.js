/*
 * @flow
 */

import Immutable from 'immutable';

import * as AuthUtils from './AuthUtils';
import {
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED
} from './AuthConstants';
import {
  AUTH_EXPIRED,
  AUTH_FAILURE,
  AUTH_SUCCESS,
  LOGOUT
} from './AuthActionFactory';

const INITIAL_STATE :Map<*, *> = Immutable.fromJS({
  authTokenExpiration: AUTH_TOKEN_EXPIRATION_NOT_SET
});

export default function authReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case AUTH_SUCCESS:
      return state.set('authTokenExpiration', AuthUtils.getAuthTokenExpiration(action.authToken));

    case AUTH_EXPIRED:
    case AUTH_FAILURE:
    case LOGOUT:
      return state.set('authTokenExpiration', AUTH_TOKEN_EXPIRED);

    default:
      return state;
  }
}
