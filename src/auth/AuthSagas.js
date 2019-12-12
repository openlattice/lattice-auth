/*
 * @flow
 */

import Lattice, { PrincipalsApi } from 'lattice';
import { call, put, take } from '@redux-saga/core/effects';
import { push } from 'connected-react-router';

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

import Logger from '../utils/Logger';
import { getConfig } from '../config/Configuration';

const LOG = new Logger('AuthSagas');

/*
 * An interesting discussion around authentication flow with redux-saga:
 * https://github.com/redux-saga/redux-saga/issues/14#issuecomment-167038759
 */

function* watchAuthAttempt() :Generator<*, *, *> {

  while (true) {
    yield take(AUTH_ATTEMPT);
    try {
      const authInfo :Object = yield call(Auth0.authenticate);
      /*
       * our attempt to authenticate has succeeded. now, we need to store the Auth0 id token and configure lattice
       * before dispatching AUTH_SUCCESS in order to guarantee that AuthRoute will receive the correct props in the
       * next pass through its lifecycle.
       */
      AuthUtils.storeAuthInfo(authInfo);
      Lattice.configure({
        authToken: authInfo.idToken,
        baseUrl: getConfig().get('baseUrl'),
        csrfToken: AuthUtils.getCSRFToken(),
      });
      yield call(PrincipalsApi.syncUser);
      yield put(authSuccess());
    }
    catch (error) {
      LOG.error(AUTH_ATTEMPT, error);
      // TODO: need better error handling depending on the error that comes through
      yield put(authFailure(error));
      Auth0.getAuth0LockInstance().show();
    }
  }
}

function* watchAuthSuccess() :Generator<*, *, *> {

  while (true) {
    const { authToken } = yield take(AUTH_SUCCESS);
    /*
     * AUTH_SUCCESS will be dispatched in one of two possible scenarios:
     *
     *   1. the user is not authenticated, which means the Auth0 id token either is not stored locally or is expired.
     *      in this scenario, AUTH_ATTEMPT *will* be dispatched, which means AuthUtils.storeAuthInfo() and
     *      Lattice.configure() will have already been invoked, so we don't need to do anything else here.
     *
     *   2. the user is already authenticated, which means the Auth0 id token is already stored locally, which means
     *      we don't need to dispatch AUTH_ATTEMPT, which means AuthRoute is able to pass along the Auth0 id token
     *      via componentWillMount(). in this scenario, AUTH_ATTEMPT *will not* be dispatched, but we still need
     *      to invoke Lattice.configure().
     */
    if (authToken) {
      Lattice.configure({
        authToken,
        baseUrl: getConfig().get('baseUrl'),
        csrfToken: AuthUtils.getCSRFToken(),
      });
    }
  }
}

function* watchAuthExpired() :Generator<*, *, *> {

  while (true) {
    yield take(AUTH_EXPIRED);
    yield call(AuthUtils.clearAuthInfo);
  }
}

function* watchAuthFailure() :Generator<*, *, *> {

  while (true) {
    yield take(AUTH_FAILURE);
    yield call(AuthUtils.clearAuthInfo);
  }
}

function* watchLogin() :Generator<*, *, *> {

  while (true) {
    yield take(LOGIN);
    yield put(push(LOGIN_PATH));
  }
}

function* watchLogout() :Generator<*, *, *> {

  while (true) {
    yield take(LOGOUT);
    yield call(AuthUtils.clearAuthInfo);
    yield put(push(ROOT_PATH));
  }
}

export {
  watchAuthAttempt,
  watchAuthExpired,
  watchAuthFailure,
  watchAuthSuccess,
  watchLogin,
  watchLogout,
};
