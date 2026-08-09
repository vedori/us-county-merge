import 'dotenv/config';
import { fetchData } from '@utils/fetch-data.ts';
import type { AllGdpEntries, BeaApiResponse, GdpEntry, GdpGroupedEntry } from './economic-types.ts';

// Predifined JSON of all counties grouped by GDP
import { GDP_GROUP_CONFIG } from '@shared/gdp-group-config/index.ts';
import type { GdpGroupConfigEntry } from '@shared/gdp-group-config/gdp-group-config-types.ts';

const BEA_API_URI = 'https://apps.bea.gov/api/data';
const YEAR = 2020;

function mapToGdpData(apiData: BeaApiResponse): AllGdpEntries {
  const entries = apiData.BEAAPI.Results.Data;
  const allGdpEntries: AllGdpEntries = { gdp_entries: new Map<string, GdpEntry>, grouped_gdp_entries: new Map<string, GdpGroupedEntry> };
  for (const entry of entries) {
    const geoId = entry.GeoFips;

    // The DataValue is the gdp value given in thousands of dollars
    // UNIT_MULT is how many zeroes to add to the value to get it in dollars (10^3)
    const gdp = Number(entry.DataValue) * (10 ** Number(entry.UNIT_MULT));

    /// Combination areas contain a '+' in their name and should be handled differently
    const isCombinationArea = entry.GeoName.includes('+') ? true : false;

    if (gdp == 0) {
      // Some Census areas (AK, CT) were being changed
      // when the 2020 Census was collected, so the alternative
      // areas have a gdp of 0 and should be excluded from the data store
    } else if (isCombinationArea) { // Combinations should be have gdpGroupIds instead of a gdp field
      const group: GdpGroupConfigEntry = GDP_GROUP_CONFIG[geoId];
      // Creates a grouped entry for every county that is grouped
      // Then stores the counties
      group.counties.map(countyId => {
        const gdpGroupedEntry: GdpGroupedEntry = {
          groupId: geoId,
          geoId: countyId,
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

export async function fetchGdpData(): Promise<AllGdpEntries> {
  const url = `${BEA_API_URI}?Method=GetData&datasetname=Regional&GeoFips=COUNTY&LineCode=1&TableName=CAGDP2&Year=${YEAR}`
    + `&UserID=${process.env.BEA_API_KEY}`;

  const response: BeaApiResponse = await fetchData(url);
  const data = mapToGdpData(response);
  return data;
}
