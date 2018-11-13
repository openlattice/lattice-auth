/*
 * @flow
 */

import {
  ORGANIZATION_ID
} from './AccountConstants';

describe('AccountConstants', () => {

  test('ORGANIZATION_ID', () => {
    expect(ORGANIZATION_ID).toEqual('stored_organization_id');
  });

});
