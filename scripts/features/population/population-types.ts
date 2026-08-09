import type { Entry } from "utils/types/entry.ts";

/**
 * Represents a population entry for a config
 */
export interface PopulationEntry extends Entry {
  population: number;
}

/**
 * The Census API's represents each county as an array
 * The first element represents the population
 * The second element represents the state FIPS code
 * The second element represents the county FIPS code
 * For example
 *  ["58805", "01", "001"],
 */
export type CensusRawResponse = [string, string, string];
// export interface PopulationData {
//   population: number;
//   stateId: string;
//   countyId: string;
// }
