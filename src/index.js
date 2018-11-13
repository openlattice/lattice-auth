/*
 * @flow
 */

import AuthReducer from './auth/AuthReducer';
import AuthRoute from './auth/AuthRoute';
import * as AccountUtils from './account/AccountUtils';
import * as Auth0 from './auth/Auth0';
import * as AuthActionFactory from './auth/AuthActionFactory';
import * as AuthConstants from './auth/AuthConstants';
import * as AuthSagas from './auth/AuthSagas';
import * as AuthUtils from './auth/AuthUtils';
import { configure } from './config/Configuration';

// injected by Webpack.DefinePlugin
declare var __VERSION__ :string;
const version :string = __VERSION__;

export {
  AccountUtils,
  Auth0,
  AuthActionFactory,
  AuthConstants,
  AuthReducer,
  AuthRoute,
  AuthSagas,
  AuthUtils,
  configure,
  version
};

export default {
  AccountUtils,
  Auth0,
  AuthActionFactory,
  AuthConstants,
  AuthReducer,
  AuthRoute,
  AuthSagas,
  AuthUtils,
  configure,
  version
};
