import fs from 'node:fs';

// Uses the ArcGIS API
// See: https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
const ARCGIS_API = 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_National_Network/FeatureServer/0/query';

const DATA_PATH = './data/geojson/highways.geojson';

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


// Queries an API for the highway GEOJSON data
const getHighwayData = async () => {
  // References variable/table names in the USDOT National Network dataset
  // *Take note of ther available operations for fields and values
  // See: https://geodata.bts.gov/datasets/usdot::national-network/about
  //
  // Includes only Interstates by filtering the **field** (SIGNT = 'I')
  // Excludes Alaska, Hawaii, and Puerto Rico highway **values** by their state FIPS (" AND STFIPS <> 15 AND STFIPS <> 2 AND STFIPS <> 72 ")
  // The query should be **url escaped besides the where field parameter** 'I'
  // So the full query reads as
  // "SIGNT = 'I' AND STFIPS <> 15 AND STFIPS <> 2 AND STFIPS <> 72 "
  // Additionally, the selected output parameters will be exported as geojson features
  const query = "https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_National_Network/FeatureServer/0/query?where=SIGNT1%20%3D%20'I'%20AND%20STFIPS%20%3C%3E%2015%20AND%20STFIPS%20%3C%3E%202%20AND%20STFIPS%20%3C%3E%2072%20&outFields=ID,LNAME,SIGN1&outSR=4326&f=geojson";

  const result = await fetchData(query);

  return result;
}

// Builds the highway geojson and writes it to a file
const build = async () => {
  let data = await getHighwayData();
  data = JSON.stringify(data);

  fs.writeFile(DATA_PATH, data, (err) => {
    if (err) {
      console.log(`Failed to write highway data to file ${DATA_PATH}`);
    } else {
      console.log(`Wrote highway data to file ${DATA_PATH}`);
    }
  });
};

// Must call build
build();
