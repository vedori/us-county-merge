import 'dotenv/config';
import { fetchData } from '@utils/fetch-data.ts';
import type { CensusRawResponse, PopulationEntry } from './population-types.ts';

/**
 * The base URL for the 2020 US Census Population API data
 * @type {string}
 */
const CENSUS_API_URI: string = 'https://api.census.gov/data/2020/dec/pl';

/**
 * Cleans raw API data by removing the initial header row.
 *
 * The Census API response is an array of arrays, where the first inner array
 * contains descriptive column headers. This function assumes this header row
 * is always at index 0 and removes it, returning only the data rows.
 *
 * @param apiData The raw array of array responses from the census API.
 * @returns An array of arrays containing only the data rows (header removed).
 */
function cleanApiResponse(apiData: CensusRawResponse[]): CensusRawResponse[] {
  const clean = apiData.splice(1);
  return clean;
}

/**
 * Transforms an array of census raw data rows into structured PopulationEntry objects.
 *
 * Assumes the input data has already been processed by `cleanApiResponse`.
 * Each row is mapped to an object containing the population (from index 0)
 * and a concatenated geographical identifier (State FIPS + County FIPS).
 *
 * @param apiData The raw data array (header row already removed).
 * @returns An array of structured PopulationEntry objects.
 */
function mapToPopulationEntry(apiData: CensusRawResponse[]): PopulationEntry[] {
  apiData = cleanApiResponse(apiData);

  return apiData.map(row => ({
    population: Number(row[0]),
    geoId: row[1] + row[2],
  }));
}

/**
 * Fetches the total population data for all US counties and processes the raw API
 * response into a structured array of PopulationEntry objects.
 *
 * The function uses the Census API endpoint for variable P1_001N (Total Population).
 *
 * @returns {Promise<PopulationEntry[]>} A promise that resolves to a list of structured
 *                                       county population records.
 *
 * @internal Requires the CENSUS_API_KEY environment variable to be set.
 */
export async function fetchPopulationData(): Promise<PopulationEntry[]> {
  // Gets the P1_001NA variable/dataset which records total populations for every US County
  // See: https://api.census.gov/data/2020/dec/pl/variables/P1_001NA.html
  // Counties and states are referenced with their respective FIPS code
  // Selects all counties with the * wildcard
  // Selects all states with the * wildcard
  // ?get=P1_001N&for=county:*&in=state:*
  const url = `${CENSUS_API_URI}?get=P1_001N&for=county:*&in=state:*`
    + `&key=${process.env.CENSUS_API_KEY}`;

  const response: CensusRawResponse[] = await fetchData(url);
  const data = mapToPopulationEntry(response);
  return data;
}
