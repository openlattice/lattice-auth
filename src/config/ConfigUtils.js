/*
 * @flow
 */

import Lattice from 'lattice';

// injected by Webpack.DefinePlugin
declare var __DEV__;

export function configure() {}

export function configureLattice(authToken :?string) :void {

  const { host } = window.location;
  const hostName :string = (host.startsWith('www.')) ? host.substring('www.'.length) : host;
  const baseUrl :string = (__DEV__) ? 'http://localhost:8080' : `https://api.${hostName}`;

  Lattice.configure({ authToken, baseUrl });
}
