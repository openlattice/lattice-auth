import PACKAGE from '../package.json';

import * as LatticeSagas from './index';

describe('lattice-sagas named exports', () => {

  test('should export the correct version', () => {
    expect(LatticeSagas.version).toEqual(PACKAGE.version);
  });

});
