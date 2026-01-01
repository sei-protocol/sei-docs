'use client';

import { ENABLE_CHRISTMAS_THEME, ENABLE_NEW_YEAR_THEME } from '../../constants/featureFlags';

// Build-time conditional exports - bundler eliminates dead code paths
export const Snowflakes = ENABLE_CHRISTMAS_THEME ? require('./Snowflakes').Snowflakes : () => null;

export const Confetti = ENABLE_NEW_YEAR_THEME ? require('./Confetti').Confetti : () => null;
