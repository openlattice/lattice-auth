/*
 * @flow
 */

import {
  STORED_ORG_ID
} from './AccountConstants';

describe('AccountConstants', () => {

  test('STORED_ORG_ID', () => {
    expect(STORED_ORG_ID).toEqual('stored_organization_id');
  });

});
