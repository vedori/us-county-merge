import fs from 'node:fs';

// Uses the ArcGIS API
// Only allows a maximum of 2000 records per request
// See: https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
//      https://services.arcgis.com/xOi1kZaI0eWDREZv/ArcGIS/rest/services/NTAD_National_Highway_System/FeatureServer
const ARCGIS_API_URL = 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_National_Network/FeatureServer/0/query';
const MAX_RECORD_COUNT = 2000; // The server limit
const OUTPUT_FILE = './data/geojson/highways.geojson';

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

// Requests highway data in batches then aggregates them
// since the API restricts the number of features per response
const getHighwayData = async () => {
  let allFeatures = [];
  let offset = 0;
  let hasMoreFeatures = true;

  console.log("Starting fetch for all Interstate highways ");

  while (hasMoreFeatures) {
    // References variable/table names in the USDOT National Network dataset
    // *Take note of ther available operations for fields and values
    // See: https://geodata.bts.gov/datasets/usdot::national-network/about
    const url = ARCGIS_API_URL
      // Includes only Interstates by filtering the **field** (SIGNT = 'I')
      // Excludes Alaska, Hawaii, and Puerto Rico highway **values** by their state FIPS (" AND STFIPS <> 15 AND STFIPS <> 2 AND STFIPS <> 72 ")
      // The query should be **url escaped besides the where field parameter** 'I'
      // So the where clause reads as
      // "SIGNT = 'I' AND STFIPS <> 15 AND STFIPS <> 2 AND STFIPS <> 72 "
      + "?where=SIGNT1%20%3D%20'I'%20AND%20STFIPS%20%3C%3E%2015%20AND%20STFIPS%20%3C%3E%202%20AND%20STFIPS%20%3C%3E%2072%20"
      + "&outFields=SIGN1" // The selected output parameters will be exported as geojson features
      + "&outSR=4326" // The output spatial reference is epsg:4326
      + "&returnGeometry=true"
      + `&resultRecordCount=${MAX_RECORD_COUNT.toString()}`
      + `&resultOffset=${offset.toString()}`
      + '&f=geojson'
      ;

    console.log('Fetching batch ...');
    const data = await fetchData(url);

    const features = data.features || [];

    if (features.length === 0) {
      console.log("No more features found. Stopping.");
      hasMoreFeatures = false;
      break;
    }

    allFeatures = allFeatures.concat(features);
    console.log(`Retrieved ${features.length} features. Total so far: ${allFeatures.length}`);

    // If the features are less than the max count, the end has been reached
    if (features.length < MAX_RECORD_COUNT) {
      hasMoreFeatures = false;
    } else {
      offset += MAX_RECORD_COUNT;
    }

    // Adds a 30 second delay for each server response
    console.log('Waiting 30s ...')
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  if (allFeatures.length == 0) {
    throw Error('No features found');
  }

  const geojsonOutput = {
    type: "FeatureCollection",
    features: allFeatures
  };

  return geojsonOutput;
}

// Builds the highway geojson and writes it to a file
const build = async () => {
  let data = await getHighwayData();
  data = JSON.stringify(data);

  fs.writeFile(OUTPUT_FILE, data, (err) => {
    if (err) {
      console.log(`Failed to write highway data to file ${OUTPUT_FILE}`);
    } else {
      console.log(`Wrote highway data to file ${OUTPUT_FILE}`);
    }
  });
};

// Must call build
build();
