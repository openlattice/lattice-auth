/*
 * @flow
 */

import React from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { faCheckCircle, faSignInAlt } from '@fortawesome/fontawesome-pro-light';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as AuthUtils from './AuthUtils';

import {
  AUTH_TOKEN_EXPIRATION_NOT_SET,
  AUTH_TOKEN_EXPIRED,
  LOGIN_PATH
} from './AuthConstants';

/*
 * styled components
 */

const ContainerOuterWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  height: 100%;
  justify-content: center;
  margin: 0;
  padding: 0;
`;

const ContainerInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 900px;
`;

const LoginSuccessCheck = styled.div`
  color: #7dd322;
  display: flex;
`;

const LoginLink = styled.a`
  color: #135;
  text-decoration: none;
`;

const LoginText = styled.span`
  margin-right: 5px;
`;

/*
 * types
 */

type Props = {
  authTokenExpiration :number;
};

class LoginContainer extends React.Component<Props> {

  renderPleaseLogin = () => (
    <ContainerInnerWrapper>
      <LoginLink href={`${window.location.origin}${LOGIN_PATH}/`}>
        <LoginText>Please log in to OpenLattice</LoginText>
        <FontAwesomeIcon icon={faSignInAlt} />
      </LoginLink>
    </ContainerInnerWrapper>
  )

  renderYouAreLoggedIn = () => (
    <ContainerInnerWrapper>
      <LoginSuccessCheck>
        <FontAwesomeIcon icon={faCheckCircle} size="4x" />
      </LoginSuccessCheck>
      <p>Success! You are logged in to OpenLattice.</p>
    </ContainerInnerWrapper>
  )

  render() {

    return (
      <ContainerOuterWrapper>
        {
          AuthUtils.hasAuthTokenExpired(this.props.authTokenExpiration)
            ? this.renderPleaseLogin()
            : this.renderYouAreLoggedIn()
        }
      </ContainerOuterWrapper>
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
    authTokenExpiration
  };
}

export default withRouter(connect(mapStateToProps)(LoginContainer));
