/*
 * @flow
 */

import React, { Component, createElement } from 'react';
import type { ComponentType } from 'react';

import { Map } from 'immutable';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';

import Spinner from './Spinner';
import * as Auth0 from './Auth0';
import * as AuthActions from './AuthActions';
import * as AuthUtils from './AuthUtils';
import {
  AUTH_REDUCER_KEY,
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED,
  LOGIN_PATH,
  ROOT_PATH,
} from './AuthConstants';

/*
 * types
 */

type Props = {
  actions :{
    authAttempt :() => void;
    authExpired :() => void;
    authSuccess :(authToken :?string) => void;
  };
  authTokenExpiration :number;
  component :ComponentType<*>;
  isAuthenticating :boolean;
  redirectToLogin ?:boolean;
};

type State = {
  isSpinnerDelayComplete :boolean;
};

class AuthRoute extends Component<Props, State> {

  static defaultProps = {
    redirectToLogin: false,
  }

  state = {
    isSpinnerDelayComplete: false,
  }

  componentDidMount() {

    const { actions, authTokenExpiration, redirectToLogin } = this.props;

    if (!AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
      actions.authSuccess(AuthUtils.getAuthToken());
    }
    /*
     * 1. if we don't want to redirect, it's safe to attempt authentication
     * 2. if we do want to redirect, we might actually want to attempt authentication anyway. it's possible that we've
     *    just returned here from a previous redirect and the URL already contains authentication info, in which case
     *    we might not need to redirect
     */
    else if (!redirectToLogin || Auth0.urlAuthInfoAvailable()) {
      actions.authAttempt();
    }

    setTimeout(() => {
      this.setState({
        isSpinnerDelayComplete: true,
      });
    }, 250); // arbitrary timeout value
  }

  componentDidUpdate() {

    // TODO: AuthRoute needs unit tests

    const {
      actions,
      authTokenExpiration,
    } = this.props;

    // TODO: need to spend more time thinking about how to handle this case
    if (AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
      // if authTokenExpiration === -1, we've already dispatched AUTH_EXPIRED or LOGOUT
      if (authTokenExpiration !== AUTH_TOKEN_EXPIRED) {
        actions.authExpired();
      }
    }
    else {
      // TODO: need to spend more time thinking about how to handle this case
      Auth0.getAuth0LockInstance().hide();
    }
  }

  componentWillUnmount() {

    // TODO: minor edge case: lock.hide() only needs to be invoked if the lock is already showing
    // TODO: extreme edge case: lock.show() will not actually show the lock if invoked immediately after lock.hide()
    // TODO: https://github.com/auth0/lock/issues/1089
    Auth0.getAuth0LockInstance().hide();
  }

  render() {

    const {
      authTokenExpiration,
      component,
      isAuthenticating,
      redirectToLogin,
      ...wrappedComponentProps
    } = this.props;
    const { isSpinnerDelayComplete } = this.state;

    if (!AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
      if (component) {
        return createElement(component, wrappedComponentProps);
      }
      // TODO: is this the right action to take?
      return (
        <Redirect to={ROOT_PATH} />
      );
    }

    // TODO: is this the right action to take?
    // TODO: this is an ugly check... how can we improve on this?
    if (redirectToLogin && !isAuthenticating && !Auth0.urlAuthInfoAvailable()) {
      AuthUtils.redirectToLogin(window.location.href);
      return null;
    }

    /*
     * NOTE: 2019-12-17 - now that we requre calling PrincipalsApi.syncUser() on every login, we have to handle the
     * case where the auth attempt is successful but we're waiting on PrincipalsApi.syncUser() to respond. when this
     * happens, we don't want to show the lock because the Auth0 part is done, but we also don't have anything else
     * to render at the moment... so we'll show a simple spinner for now. in addition, to help avoid a quick flicker
     * of the spinner when PrincipalsApi.syncUser() responds quickly, we'll delay rendering the spinner for a fraction
     * of a second. yes, there is still the possibility of a quick flicker of the spinner, but this should only ever
     * happen during login, which is infrequent.
     *
     * despite all of this, we can do better.
     */
    if (isAuthenticating && isSpinnerDelayComplete) {
      return <Spinner />;
    }

    return (
      <Switch>
        <Route exact strict path={LOGIN_PATH} />
        <Redirect to={LOGIN_PATH} />
      </Switch>
    );
  }
}

const mapStateToProps = (state :Map) :Object => {

  let authTokenExpiration :number = state.getIn([AUTH_REDUCER_KEY, 'authTokenExpiration']);

  if (authTokenExpiration === AUTH_TOKEN_EXPIRATION_NOT_SET) {
    authTokenExpiration = AuthUtils.getAuthTokenExpiration();
  }

  if (AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
    authTokenExpiration = AUTH_TOKEN_EXPIRED;
  }

  return {
    authTokenExpiration,
    isAuthenticating: state.getIn([AUTH_REDUCER_KEY, 'isAuthenticating'])
  };
};

const mapActionsToProps = (dispatch :Dispatch<*>) :Object => ({
  actions: bindActionCreators({
    authAttempt: AuthActions.authAttempt,
    authExpired: AuthActions.authExpired,
    authSuccess: AuthActions.authSuccess,
  }, dispatch)
});

export default withRouter<*>(
  connect(mapStateToProps, mapActionsToProps)(AuthRoute)
);
