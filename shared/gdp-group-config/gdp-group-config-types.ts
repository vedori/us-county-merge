/**
 * Represents the data structure for a single gdp group.
 * The key is the group GEOID (e.g. "15901").
 */
export interface GdpGroupConfigEntry {
  /** The total GDP value for this group. */
  gdp: number;
  /** An array of constituent county/area GEOIDs (all strings). */
  counties: string[];
}

/**
 * Represents the predefined JSON of all grouped counties
 * Each entry is accessed by the group's geoID
 * The entry contains the gdp value and an array of all the county geoIDs associated with it
 */
export interface GdpGroupConfig {
  [groupGeoId: string]: GdpGroupConfigEntry;
}
