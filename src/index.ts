// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

// @ts-ignore
import cache from '../dist/cache.json';
// @ts-ignore
import ui from '@salesforce-ux/design-system/ui.json';

import { Cache } from './types';
import { Slicer, create as createSlicer } from './run-time/slicer';
import { Util, create as createUtil } from './run-time/util';

export { createSlicer, createUtil };

export const slicer = createSlicer(cache as Cache);
export const util = createUtil(ui);
