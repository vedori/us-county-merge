import type { Entry } from "utils/types/entry.ts";

/**
 * Represents a structured data entry containing population metrics for a specific county.
 * Extends standard county data entry and adds the total population count.
 *
 * @property {number} population - The total population count for the county.
 */
export interface PopulationEntry extends Entry {
  population: number;
}

/**
 * Represents the raw data structure returned by the Census API for a single county.
 * This is a fixed-length tuple of three strings.
 *
 * @template [0] The population of the county.
 * @template [1] The state FIPS Code
 * @template [2] The county FIPS Code
 */
export type CensusRawResponse = [string, string, string];
