/*
 * @flow
 */

import Lattice from 'lattice';
import _isBoolean from 'lodash/isBoolean';
import { Map, fromJS } from 'immutable';

import Logger from '../utils/Logger';
import OpenLatticeLogo from '../assets/images/ol-logo-auth0.png';
import * as Auth0 from '../auth/Auth0';
import * as AuthUtils from '../auth/AuthUtils';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

type LatticeAuthConfig = {
  auth0CdnUrl ?:string;
  auth0ClientId ?:string;
  auth0Domain ?:string;
  auth0Lock ?:{
    allowSignUp ?:boolean;
    logo ?:string;
    primaryColor ?:string;
    redirectUrl ?:string;
    title ?:string;
  };
  authToken ?:?string;
  baseUrl ?:?string;
};

const LOG :Logger = new Logger('Configuration');

// TODO: import enviroment URLs from lattice
const ENV_URLS :Map<string, string> = fromJS({
  LOCAL: 'http://localhost:8080',
  STAGING: 'https://api.staging.openlattice.com',
  PRODUCTION: 'https://api.openlattice.com',
});

function getDefaultBaseUrl() :string {

  let baseUrl :string = '';

  if (window && window.location && window.location.hostname) {
    const hostname :string = window.location.hostname;
    if (hostname === 'localhost') {
      baseUrl = 'localhost';
    }
    else if (hostname.endsWith('ca.openlattice.com')) {
      baseUrl = hostname.startsWith('staging') ? 'staging_ca' : 'production_ca';
    }
    else if (hostname.endsWith('openlattice.com')) {
      baseUrl = hostname.startsWith('staging') ? 'staging' : 'production';
    }
  }

  return baseUrl;
}

let configuration :Map<string, *> = fromJS({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  auth0Lock: {
    allowSignUp: true,
    logo: OpenLatticeLogo,
    primaryColor: '#7860ff'
  },
  authToken: null,
  baseUrl: getDefaultBaseUrl(),
});

function getConfig() :Map<string, *> {

  return configuration;
}

function setAuth0ClientId(config :LatticeAuthConfig) :void {

  if (isNonEmptyString(config.auth0ClientId)) {
    configuration = configuration.set('auth0ClientId', config.auth0ClientId);
  }
  // auth0ClientId is optional, so null and undefined are allowed
  else if (config.auth0ClientId !== null && config.auth0ClientId !== undefined) {
    const errorMsg = 'invalid parameter - "auth0ClientId" must be a non-empty string';
    LOG.error(errorMsg, config.auth0ClientId);
    throw new Error(errorMsg);
  }
}

function setAuth0Domain(config :LatticeAuthConfig) :void {

  if (isNonEmptyString(config.auth0Domain)) {
    configuration = configuration.set('auth0Domain', config.auth0Domain);
  }
  // auth0Domain is optional, so null and undefined are allowed
  else if (config.auth0Domain !== null && config.auth0Domain !== undefined) {
    const errorMsg = 'invalid parameter - "auth0Domain" must be a non-empty string';
    LOG.error(errorMsg, config.auth0Domain);
    throw new Error(errorMsg);
  }
}

function setAuth0Lock(config :LatticeAuthConfig) :void {

  // auth0Lock is optional, so null and undefined are allowed
  if (config.auth0Lock === null || config.auth0Lock === undefined) {
    return;
  }

  const { auth0Lock } = config;
  if (!isNonEmptyObject(auth0Lock)) {
    const errorMsg = 'invalid parameter - "auth0Lock" must be a non-empty object';
    LOG.error(errorMsg, auth0Lock);
    throw new Error(errorMsg);
  }

  const { logo } = auth0Lock;
  if (isNonEmptyString(logo)) {
    configuration = configuration.setIn(['auth0Lock', 'logo'], logo);
  }
  // auth0Lock.logo is optional, so null and undefined are allowed
  else if (logo !== null && logo !== undefined) {
    const errorMsg = 'invalid parameter - "auth0Lock.logo" must be a non-empty string';
    LOG.error(errorMsg, logo);
    throw new Error(errorMsg);
  }

  const { title } = auth0Lock;
  if (isNonEmptyString(title)) {
    configuration = configuration.setIn(['auth0Lock', 'title'], title);
  }
  // auth0Lock.title is optional, so null and undefined are allowed
  else if (title !== null && title !== undefined) {
    const errorMsg = 'invalid parameter - "auth0Lock.title" must be a non-empty string';
    LOG.error(errorMsg, title);
    throw new Error(errorMsg);
  }

  const { primaryColor } = auth0Lock;
  if (isNonEmptyString(primaryColor)) {
    configuration = configuration.setIn(['auth0Lock', 'primaryColor'], primaryColor);
  }
  // auth0Lock.primaryÇolor is optional, so null and undefined are allowed
  else if (primaryColor !== null && primaryColor !== undefined) {
    const errorMsg = 'invalid parameter - "auth0Lock.primaryColor" must be a non-empty string';
    LOG.error(errorMsg, primaryColor);
    throw new Error(errorMsg);
  }

  const { allowSignUp } = auth0Lock;
  if (_isBoolean(allowSignUp)) {
    configuration = configuration.setIn(['auth0Lock', 'allowSignUp'], allowSignUp);
  }
  // auth0Lock.allowSignUp is optional, so null and undefined are allowed
  else if (allowSignUp !== null && allowSignUp !== undefined) {
    const errorMsg = 'invalid parameter - "auth0Lock.allowSignUp" must be a boolean';
    LOG.error(errorMsg, allowSignUp);
    throw new Error(errorMsg);
  }
}

function setAuthToken(config :LatticeAuthConfig) :void {

  const { authToken } = config;

  // authToken is optional, so null and undefined are allowed
  if (authToken === null || authToken === undefined) {
    configuration = configuration.delete('authToken');
  }
  else if (isNonEmptyString(authToken)) {
    configuration = configuration.set('authToken', authToken);
  }
  else {
    const errorMsg = 'invalid parameter - "authToken" must be a non-empty string';
    LOG.error(errorMsg, authToken);
    throw new Error(errorMsg);
  }
}

function setBaseUrl(config :LatticeAuthConfig) :void {

  const { baseUrl } = config;

  if (isNonEmptyString(baseUrl)) {
    if (baseUrl === 'localhost' || baseUrl === ENV_URLS.get('LOCAL')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('LOCAL'));
    }
    else if (baseUrl === 'staging' || baseUrl === ENV_URLS.get('STAGING')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('STAGING'));
    }
    else if (baseUrl === 'production' || baseUrl === ENV_URLS.get('PRODUCTION')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('PRODUCTION'));
    }
    else {
      configuration = configuration.set('baseUrl', baseUrl);
    }
  }
  // baseUrl is optional, so null and undefined are allowed
  else if (baseUrl !== null && baseUrl !== undefined) {
    const errorMsg = 'invalid parameter - "baseUrl" must be a non-empty string';
    LOG.error(errorMsg, baseUrl);
    throw new Error(errorMsg);
  }
}

function configure(config :LatticeAuthConfig) :void {

  if (!isNonEmptyObject(config)) {
    const errorMsg = 'invalid parameter - "config" must be a non-empty configuration object';
    LOG.error(errorMsg, config);
    throw new Error(errorMsg);
  }

  setAuth0ClientId(config);
  setAuth0Domain(config);
  setAuth0Lock(config);
  setAuthToken(config);
  setBaseUrl(config);

  if (config.auth0CdnUrl) {
    configuration.set('auth0CdnUrl', config.auth0CdnUrl);
  }

  Lattice.configure({
    authToken: configuration.get('authToken'),
    baseUrl: configuration.get('baseUrl'),
    csrfToken: AuthUtils.getCSRFToken(),
  });

  Auth0.initialize(configuration);
}

export {
  configure,
  getConfig,
};

export type {
  LatticeAuthConfig,
};
