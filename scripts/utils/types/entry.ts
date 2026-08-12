/**
 * Represents a data entry that must include a geographic identifier to uniquely reference a county.
 *
 * @property {string} geoId - The unique GEOID string used to identify a specific county.
 */
export interface Entry {
  geoId: string;
}

