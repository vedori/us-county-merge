import 'dotenv/config';
import { fetchData } from '@utils/fetch-data.ts';
import type { AllGdpEntries, BeaApiResponse, GdpEntry, GdpGroupedEntry } from './economic-types.ts';

// Predifined JSON of all counties grouped by GDP
import { GDP_GROUP_CONFIG, type GdpGroupConfigEntry } from '@shared/gdp-group-config/index.ts';
import type { GeoId } from '@utils/types/entry.ts';

/**
 * The base URL for the Bureau of Economic Analysis (BEA) API data.
 * @type {string}
 */
const BEA_API_URI: string = 'https://apps.bea.gov/api/data';

/**
 * The fixed year for which GDP data is being fetched.
 * @type {number}
 */
const YEAR: number = 2020;

/**
 * Processes raw raw BEA API response data into a structured map of all GDP entries.
 *
 * This function iterates over the API's data array, performing the following critical steps:
 * 1. Calculates the actual GDP value by combining `DataValue` and `UNIT_MULT`.
 * 2. Determines if the entry is a standard county-level entry or a predefined group summary.
 * 3. Populates the appropriate maps within the `AllGdpEntries` structure.
 *
 * @param {BeaApiResponse} apiData - The raw data structure received from the BEA API call.
 * @returns {AllGdpEntries} A container object holding both individual county GDP entries and grouped GDP entries.
 */
function mapToGdpData(apiData: BeaApiResponse): AllGdpEntries {
  const entries = apiData.BEAAPI.Results.Data;
  const allGdpEntries: AllGdpEntries = { gdp_entries: new Map<GeoId, GdpEntry>, grouped_gdp_entries: new Map<GeoId, GdpGroupedEntry> };
  for (const entry of entries) {
    const geoId = entry.GeoFips;

    // The DataValue is the gdp value given in thousands of dollars
    // UNIT_MULT is how many zeroes to add to the value to get it in dollars (10^3)
    const gdp = Number(entry.DataValue) * (10 ** Number(entry.UNIT_MULT));

    /// Combination areas contain a '+' in their name and should be handled differently
    const isCombinationArea = entry.GeoName.includes('+') ? true : false;

    // Some Census areas (AK, CT) were being changed
    // when the 2020 Census was collected, so the new
    // areas have a GDP of 0 and should be excluded from the data store
    if (gdp == 0) {
      continue;
    }

    if (isCombinationArea) { // Combinations should be have gdpGroupIds instead of a gdp field
      const group: GdpGroupConfigEntry = GDP_GROUP_CONFIG[geoId];

      // Creates a grouped entry for every county that is grouped
      // Then stores the counties
      group.counties.map(countyId => {
        const gdpGroupedEntry: GdpGroupedEntry = {
          geoId: countyId,
          groupId: geoId,
          gdp,
        }
        allGdpEntries.grouped_gdp_entries.set(countyId, gdpGroupedEntry);
      });
    } else { // Default GDP entry
      const gdpEntry: GdpEntry = {
        geoId,
        gdp
      };
      allGdpEntries.gdp_entries.set(geoId, gdpEntry);
    }
  }
  return allGdpEntries;
}

/**
 * Fetches the total GDP data for all US counties and processes the raw API
 * response into a container that gets normal and grouped GDP data by a string key
 *
 * The function uses the Bureau of Economic Analysis' API
 *
 * @returns {Promise<AllGdpEntries>} A promise that resolves to a container for all GDP types
 *
 * @internal Requires the BEA_API_KEY environment variable to be set.
 */
export async function fetchGdpData(): Promise<AllGdpEntries> {
  const url = `${BEA_API_URI}?Method=GetData&datasetname=Regional&GeoFips=COUNTY&LineCode=1&TableName=CAGDP2&Year=${YEAR}`
    + `&UserID=${process.env.BEA_API_KEY}`;

  const response: BeaApiResponse = await fetchData(url);
  const data = mapToGdpData(response);
  return data;
}
