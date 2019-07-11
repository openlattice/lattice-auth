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

class AuthRoute extends Component<Props> {

  static defaultProps = {
    redirectToLogin: false,
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
  }

  componentDidUpdate() {

    // NOTE: the side effects of switching to componentDidUpdate() are not entirely clear
    // TODO: AuthRoute needs unit tests

    const { actions, authTokenExpiration, redirectToLogin } = this.props;

    // TODO: need to spend more time thinking about how to handle this case
    if (AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
      // if authTokenExpiration === -1, we've already dispatched AUTH_EXPIRED or LOGOUT
      if (authTokenExpiration !== AUTH_TOKEN_EXPIRED) {
        actions.authExpired();
      }
      // do not show the lock if we're in redirect mode
      if (!redirectToLogin) {
        Auth0.getAuth0LockInstance().show();
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

    return (
      <Switch>
        <Route exact strict path={LOGIN_PATH} />
        <Redirect to={LOGIN_PATH} />
      </Switch>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

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
}

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    authAttempt: AuthActions.authAttempt,
    authExpired: AuthActions.authExpired,
    authSuccess: AuthActions.authSuccess,
  }, dispatch)
});

export default withRouter<*>(
  connect(mapStateToProps, mapDispatchToProps)(AuthRoute)
);
