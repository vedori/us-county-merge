/**
 * Represents the unique identifier for a US county.
 * This value must be formatted as a concatenation of the state FIPS code and the county FIPS code.
 * Example: Los Angeles County, California: "06" (California) + "037" (LA County) = "06037"
 */
export type GeoId = string;
/**
 * The foundational contract for any data entry that must be tied to a US county
 * By extending GeoId, this interface guarantees that the entry contains the mandatory
 * county reference.
 */
export interface Entry {
  geoId: string;
}
