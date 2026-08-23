import type { Entry, GeoId } from "utils/types/entry.ts";

/**
 * Represents a standalone GDP entry for a specific county
 * This structure extends the core geographical identifier (`Entry`).
 *
 * @property {number} gdp - The Gross Domestic Product value for the entry.
 */
export interface GdpEntry extends Entry {
  gdp: number;
}

/**
 * Represents a specialized GDP entry summarizing the value across a group of counties.
 * This structure is used when calculating an aggregate GDP for a defined group.
 *
 * @property {GeoId} groupId - The unique identifier (code) for the group to which this GDP belongs.
 */
export interface GdpGroupedEntry extends GdpEntry {
  groupId: GeoId
}

/**
 * Represents a single row of data retrieved from the BEA API.
 * All fields are strings because they represent raw, unparsed API results.
 * The specific meaning of each string field is critical for correct parsing.
 *
 * @property {string} Code - The geographical or categorical code used by the BEA.
 * @property {string} GeoFips - The 5-digit Federal Information Processing Standard code.
 * @property {string} GeoName - The name of the geographical unit given by the BEA.
 * @property {string} TimePeriod - The year it was reported.
 * @property {string} CL_UNIT - The name or label of the unit of measurement (ex "Thousands").
 * @property {string} UNIT_MULT - What power to raise 10 by to get the gdp value (ex 3 -> 10^3 * GDP).
 * @property {string} DataValue - The raw reported numeric value without UNIT_MULT applied (must be converted to a number).
 */
export interface BeaApiData {
  Code: string,
  GeoFips: string,
  GeoName: string,
  TimePeriod: string,
  CL_UNIT: string,
  UNIT_MULT: string,
  DataValue: string
}

/**
 * Encapsulates the full structure of the response received from the BEA API.
 * The primary data payload is nested within the `BEAAPI` object.
 */
export interface BeaApiResponse {
  BEAAPI: {
    Results: {
      Statistic: string,
      UnitOfMeasure: string,
      PublicTable: string,
      NoteRef: string,
      Data: BeaApiData[]
    }
  }
}

/**
 * A comprehensive container holding all processed GDP data.
 * Data is stored using Maps for efficient retrieval by a string key
 *
 * The key used in the Maps must be the GEOID
 *
 * @property {Map<GeoId, GdpEntry>} gdp_entries - Map of individual, county-level GDP records.
 * @property {Map<GeoId, GdpGroupedEntry>} grouped_gdp_entries - Map of GDP records of a GDP group
 */
export interface AllGdpEntries {
  gdp_entries: Map<GeoId, GdpEntry>;
  grouped_gdp_entries: Map<GeoId, GdpGroupedEntry>;
}
