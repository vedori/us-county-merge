import 'dotenv/config';
import fs from 'node:fs';
// import data from './config.json' with { type: 'json' };
import { GDP_COMBINATION_AREAS } from '../data/constants.mjs';

const CENSUS_API_URI = 'https://api.census.gov/data/2020/dec/pl';
const BEA_API_URI = 'https://apps.bea.gov/api/data';
const DATA_FILE_PATH = './data/county-data.json';

// Single source of truth for all county data
// This will be exported as a JSON file
// which the rest of the program will rely on
let dataStore = {};

// Gets some stat entry and adds it to the data store
// It expects that the stat has an id key that stores the geoID
// and either a population,gdp,... key that stores its respective value
// It will conditionally add the stat entry value to the datastore
// if it is present in the argument
const updateStore = (stat) => {
  dataStore[stat.id] = {
    ...dataStore[stat.id],
    ...(stat.pop !== undefined && { pop: stat.pop }),
    ...(stat.gdp !== undefined && { gdp: stat.gdp }),
    ...(stat.gdpGroupId !== undefined && { gdpGroupId: stat.gdpGroupId }),
  };
};

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} status: Could not fetch ${url}`);
    }

    const result = await response.json();
    console.log(`Fetched ${url}`);
    return result;
  } catch (error) {
    console.error(`Error fetching ${url}`, error.message);
  }
};

// Takes the raw JSON response returned by fetching the Census API
// Normalizes the data such that each entry/county can be used
// to update the data store
//
// The response argument is an array of arrays
// where the first element define the key/headers
// for the subsequent elements
// For example
// [
//  ["P1_001N (population)", "state", "county"],
//  ["58805", "01", "001"],
//  ...
// ]
const injestPopulation = (response) => {
  const [POPULATION_INDEX, STATE_FIPS_INDEX, COUNTY_FIPS_INDEX] = [0, 1, 2];

  // Removes the first element from the array which just contains the headers
  response = response.slice(1);

  // Adds all populations to the data store
  response.forEach((entry) => {
    const geoId = entry[STATE_FIPS_INDEX] + entry[COUNTY_FIPS_INDEX];

    const stat = {
      id: geoId,
      pop: Number(entry[POPULATION_INDEX])
    };
    updateStore(stat);
  });
};

// Fetches then injests the population data
const addPopulation = async () => {

  // Gets the P1_001NA variable/dataset which records total populations for every US County
  // See: https://api.census.gov/data/2020/dec/pl/variables/P1_001NA.html
  // Counties and states are referenced with their respective FIPS code
  // Selects all counties with the * wildcard
  // Selects all states with the * wildcard
  // ?get=P1_001N&for=county:*&in=state:*
  // NOTE: Requires a census API key defined in .env
  const url = `${CENSUS_API_URI}?get=P1_001N&for=county:*&in=state:*`
    + `&key=${process.env.CENSUS_API_KEY}`;

  const response = await fetchData(url);

  injestPopulation(response);
};

// Takes the raw JSON response returned by fetching the BEA API
// Normalizes the data such that each entry/county can be used
// to update the data store
// { id: geoid, gdp: gdp }
//
const injestGDP = (response) => {
  // The raw response is heavily nested but has a "Data" Array which contains the relevant data
  const dataArray = response.BEAAPI?.Results?.Data || [];

  // Each entry/county in the data array is an object that has the following
  // { {'GeoFips' : geoFips}, ... {'DataValue' : gdp} }
  // Transforms the entry into a format suitable for storing it in the data store
  dataArray.forEach((entry) => {
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
      // GDP_COMBINATION_AREAS contains the geoIDs of every combination area
      // When accessing with the combination areas geoID it will give an object that contains
      // { gdp: gdp, groupedCounties: [countyGeoId1, countyGeoId2, ...] }
      const gdpGroup = GDP_COMBINATION_AREAS[geoId];
      const groupedCounties = gdpGroup.groupedCounties;

      // Will store every county in the groupedCounties array
      // as an statistic with gdpGroupId identifier instead of the gdp value
      groupedCounties.forEach(countyId => {
        const stat = {
          id: countyId,
          gdpGroupId: geoId
        }

        updateStore(stat)
      });
    } else { // Defaults to using the GeoValue as the gdp
      const stat = {
        id: geoId,
        gdp: gdp
      };
      updateStore(stat);
    }
  });
};

// Fetches then injests the gdp data
const addGDP = async () => {
  const year = 2020;

  const url = `${BEA_API_URI}?Method=GetData&datasetname=Regional&GeoFips=COUNTY&LineCode=1&TableName=CAGDP2&Year=${year}`
    + `&UserID=${process.env.BEA_API_KEY}`;

  const response = await fetchData(url);

  injestGDP(response);
};

// Builds the county data and writes it to a file
const build = async () => {
  await addPopulation();
  await addGDP();

  const data = JSON.stringify(dataStore);

  fs.writeFile(DATA_FILE_PATH, data, (err) => {
    if (err) {
      console.log(`Failed to write county data to file ${DATA_FILE_PATH}`);
    } else {
      console.log(`Wrote county data to file ${DATA_FILE_PATH}`);
    }
  });
};

// Must call build
build();
