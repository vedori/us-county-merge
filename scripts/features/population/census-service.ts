import 'dotenv/config';
import { fetchData } from '@utils/fetch-data.ts';
import type { CensusRawResponse, PopulationEntry } from './population-types.ts';
const CENSUS_API_URI = 'https://api.census.gov/data/2020/dec/pl';

/**
 * Removes the first element since it is purely descriptive
 * The Census API's response is an array of arrays
 * where the first element define the key/headers
 * for the subsequent elements
 * For example
 * [
 *  ["P1_001N (population)", "state", "county"],
 *  ["58805", "01", "001"],
 *  ...
 * ]
*/
function cleanApiResponse(apiData: CensusRawResponse[]): CensusRawResponse[] {
  const clean = apiData.splice(1);
  return clean;
}

function mapToPopulationEntry(apiData: CensusRawResponse[]): PopulationEntry[] {
  apiData = cleanApiResponse(apiData);

  return apiData.map(row => ({
    population: Number(row[0]),
    geoId: row[1] + row[2],
  }));
}

export async function fetchPopulationData(): Promise<PopulationEntry[]> {
  // Gets the P1_001NA variable/dataset which records total populations for every US County
  // See: https://api.census.gov/data/2020/dec/pl/variables/P1_001NA.html
  // Counties and states are referenced with their respective FIPS code
  // Selects all counties with the * wildcard
  // Selects all states with the * wildcard
  // ?get=P1_001N&for=county:*&in=state:*
  // NOTE: Requires a census API key defined in .env
  const url = `${CENSUS_API_URI}?get=P1_001N&for=county:*&in=state:*`
    + `&key=${process.env.CENSUS_API_KEY}`;

  const response: CensusRawResponse[] = await fetchData(url);
  const data = mapToPopulationEntry(response);
  return data;
}
