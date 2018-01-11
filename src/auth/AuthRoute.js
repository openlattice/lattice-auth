/*
 * @flow
 */

import React from 'react';

import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Auth0 from './Auth0';
import * as AuthUtils from './AuthUtils';

import {
  authAttempt,
  authExpired,
  authSuccess
} from './AuthActionFactory';

import {
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED,
  LOGIN_PATH,
  ROOT_PATH
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
  component :Function;
  isAuthenticating :boolean;
  redirectToLogin :boolean;
};

class AuthRoute extends React.Component<Props> {

  static defaultProps = {
    redirectToLogin: false
  }

  componentWillMount() {

    if (!AuthUtils.hasAuthTokenExpired(this.props.authTokenExpiration)) {
      this.props.actions.authSuccess(AuthUtils.getAuthToken());
    }
    /*
     * 1. if we don't want to redirect, it's safe to attempt authentication
     * 2. if we do want to redirect, we might actually want to attempt authentication anyway. it's possible that we've
     *    just returned here from a previous redirect and the URL already contains authentication info, in which case
     *    we might not need to redirect
     */
    else if (!this.props.redirectToLogin || Auth0.urlAuthInfoAvailable()) {
      this.props.actions.authAttempt();
    }
  }

  componentWillUnmount() {

    // TODO: minor edge case: lock.hide() only needs to be invoked if the lock is already showing
    // TODO: extreme edge case: lock.show() will not actually show the lock if invoked immediately after lock.hide()
    // TODO: https://github.com/auth0/lock/issues/1089
    Auth0.getAuth0LockInstance().hide();
  }

  componentWillReceiveProps(nextProps :Props) {

    // TODO: need to spend more time thinking about how to handle this case
    if (AuthUtils.hasAuthTokenExpired(nextProps.authTokenExpiration)) {
      // if nextProps.authTokenExpiration === -1, we've already dispatched AUTH_EXPIRED or LOGOUT
      if (nextProps.authTokenExpiration !== AUTH_TOKEN_EXPIRED) {
        this.props.actions.authExpired();
      }
      // do not show the lock if we're in redirect mode
      if (!this.props.redirectToLogin) {
        Auth0.getAuth0LockInstance().show();
      }
    }
    else {
      // TODO: need to spend more time thinking about how to handle this case
      Auth0.getAuth0LockInstance().hide();
    }
  }

  render() {

    const {
      component: WrappedComponent,
      isAuthenticating,
      redirectToLogin,
      ...wrappedComponentProps
    } = this.props;

    if (!AuthUtils.hasAuthTokenExpired(this.props.authTokenExpiration)) {
      // TODO: is there a way to definitively check if a prop is a Component?
      if (WrappedComponent !== null && WrappedComponent !== undefined && typeof WrappedComponent === 'function') {
        return (
          <WrappedComponent {...wrappedComponentProps} />
        );
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

  let authTokenExpiration :number = state.getIn(['auth', 'authTokenExpiration']);

  if (authTokenExpiration === AUTH_TOKEN_EXPIRATION_NOT_SET) {
    authTokenExpiration = AuthUtils.getAuthTokenExpiration();
  }

  if (AuthUtils.hasAuthTokenExpired(authTokenExpiration)) {
    authTokenExpiration = AUTH_TOKEN_EXPIRED;
  }

  return {
    authTokenExpiration,
    isAuthenticating: state.getIn(['auth', 'isAuthenticating'])
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    authAttempt,
    authExpired,
    authSuccess
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuthRoute));
