import type { GdpGroupConfig, GdpGroupConfigEntry } from "./gdp-group-config-types";
import rawGdpGroupData from '@data/gdp-grouped-counties.json';

export type { GdpGroupConfig, GdpGroupConfigEntry }

/**
 * Defines the immutable structure representing the collective GDP of the individual counties
 * that are grouped under one unique geoID
 * Uses the gdp-grouped-counties.json as a single source of truth
 */
export const GDP_GROUP_CONFIG: GdpGroupConfig = rawGdpGroupData as GdpGroupConfig;
