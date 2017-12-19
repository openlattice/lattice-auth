/* eslint-disable import/no-named-as-default-member */

import PACKAGE from '../package.json';

import LatticeSagas from './index';

describe('lets-js default export', () => {

  test('should export the correct version', () => {
    expect(LatticeSagas.version).toEqual(PACKAGE.version);
  });

});
