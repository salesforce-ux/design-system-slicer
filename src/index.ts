// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import cache from '../dist/cache.json';

import { Cache } from './cache';
import { Slicer, create } from './slicer';
import * as util from './util';

export { util };
export default create(cache as Cache);
