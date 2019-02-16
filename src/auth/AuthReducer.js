/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router';

import * as AuthUtils from './AuthUtils';
import {
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED
} from './AuthConstants';
import {
  AUTH_ATTEMPT,
  AUTH_EXPIRED,
  AUTH_FAILURE,
  AUTH_SUCCESS,
  LOGOUT
} from './AuthActionFactory';

const INITIAL_STATE :Map<*, *> = fromJS({
  authTokenExpiration: AUTH_TOKEN_EXPIRATION_NOT_SET,
  isAuthenticating: false
});

export default function authReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case AUTH_ATTEMPT:
      return state.set('isAuthenticating', true);

    case AUTH_SUCCESS:
      return state
        .set('authTokenExpiration', AuthUtils.getAuthTokenExpiration(action.authToken))
        .set('isAuthenticating', false);

    case AUTH_EXPIRED:
    case AUTH_FAILURE:
    case LOGOUT:
      return state
        .set('authTokenExpiration', AUTH_TOKEN_EXPIRED)
        .set('isAuthenticating', false);

    case LOCATION_CHANGE:
      return state.set('authTokenExpiration', AuthUtils.getAuthTokenExpiration());

    default:
      return state;
  }
}
