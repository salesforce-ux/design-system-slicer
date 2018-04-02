// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

// @ts-ignore
import cache from '../dist/cache.json';
// @ts-ignore
import ui from '@salesforce-ux/design-system/ui.json';

import { Cache } from './cache';
import { Slicer, create as createSlicer } from './slicer';
import { Util, create as createUtil } from './util';

export { createSlicer, createUtil };

export const slicer = createSlicer(cache as Cache);
export const util = createUtil(ui);
