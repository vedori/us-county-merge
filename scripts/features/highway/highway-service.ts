import { fetchData, fetchDataAndStatus } from "@utils/fetch-data.ts";
import type { HighwayGeoJson, HighwayFeature, HighwayApiResponse, HighwayMetadataApi, HighwayApiBatchProps } from "./highway-type.ts";
import { sleep } from "@utils/sleep.ts";

// Uses the ArcGIS API

/**
 * The base URL for quering the NTAD National Highway System dataset from the ARCGIS API
 * @type {string}
 */
// See: https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
//      https://services.arcgis.com/xOi1kZaI0eWDREZv/ArcGIS/rest/services/NTAD_National_Highway_System/FeatureServer
const ARCGIS_API_URL: string = 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_National_Network/FeatureServer/0/query';

/**
 * The URL for getting the metadata of the NTAD National Network
 * @type {string}
 */
// See: https://developers.arcgis.com/rest/services-reference/enterprise/feature-service/
const ARCGIS_METADATA_URL: string = 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_National_Network/FeatureServer/0?f=json';


/**
 * Internally fetches highway features in paginated batches from the ArcGIS API and aggregates them.
 * Continues polling until all records are retrieved or the API signals completion.
 *
 * @param {HighwayApiBatchProps} batchProps - Configuration for pagination, rate limiting, and request parameters.
 * @returns {Promise<HighwayFeature[]>} Array of all successfully fetched highway feature objects.
 * @private
 */
async function batchFeatures(batchProps: HighwayApiBatchProps): Promise<HighwayFeature[]> {
  const totalFeatures: HighwayFeature[] = []
  let offset = 0;
  let timeoutMs = 6000;
  let previousUrl: string = '';

  console.log("Starting fetch for all Interstate highways ");
  while (true) {
    console.log("Fetching data");
    // References variable/table names in the USDOT National Network dataset
    // See: https://geodata.bts.gov/datasets/usdot::national-network/about
    const url = batchProps.baseUrl
      // Includes only interstates by filtering the **field** (SIGNT1 = 'I')
      // Excludes Hawaii, Alaska, and Puerto Rico interstates by their state FIPS (15, 2, 72)
      + "?where=SIGNT1='I' AND STFIPS!=15 AND STFIPS!=2 AND STFIPS!=72"
      + "&outFields=SIGN1" // The selected output parameters will be exported as geojson features
      + "&outSR=4326" // The output spatial reference is epsg:4326
      + `&resultRecordCount=${batchProps.numberPerBatch.toString()}`
      + `&resultOffset=${offset.toString()}`
      + `&geometryPrecision=${batchProps.decimalPrecision}`
      + '&f=geojson'
      ;


    const fetchedData = await fetchDataAndStatus(url);
    const response: HighwayApiResponse = fetchedData.result;
    const features: HighwayFeature[] = response.features || [];

    // If the fetch is not 200 or 304 wait before sending next query
    if (fetchedData.status !== 200 && fetchedData.status !== 304) {
      timeoutMs = (previousUrl === url) ? timeoutMs * 2 : 6000;
      console.log(`Too many requests. Will wait for ${timeoutMs / 1000}s`);
      await sleep(timeoutMs);
      continue;
    }

    if (features.length === 0) {
      console.log("No features found. Stopping.");
      break;
    }

    totalFeatures.push(...features);
    console.log(`Retrieved ${features.length} features. Total so far: ${totalFeatures.length}`);

    // The response has an optional flag that indicates that the final features has NOT been fetched
    // based on the maxRecordCount
    if (response.properties !== undefined && response.properties.exceededTransferLimit) {
      offset += batchProps.numberPerBatch;

      // Adds a delay after each server response
      await sleep(batchProps.timeMsPerBatch);

      // Used to check if it is querying the same data due to a server error / timeout
      previousUrl = url;
    } else {
      break;
    }
  }

  return totalFeatures;
};

/**
 * Fetches the complete National Highway System Interstate network from the ArcGIS REST API.
 * Automatically handles API pagination, rate limiting (429 retries), and response aggregation.
 *
 * @returns {Promise<HighwayGeoJson>} A standard GeoJSON FeatureCollection containing all retrieved highway segments.
 * @example
 * const highwayData = await getHighwayData();
 * console.log(`Loaded ${highwayData.features.length} highway features.`);
 */
export async function getHighwayData(): Promise<HighwayGeoJson> {
  const apiMetadata: HighwayMetadataApi = await fetchData(ARCGIS_METADATA_URL);

  const batchProps: HighwayApiBatchProps = {
    baseUrl: ARCGIS_API_URL,
    numberPerBatch: apiMetadata.maxRecordCount,
    timeMsPerBatch: 6000,
    offset: 0,
    decimalPrecision: 2
  };

  const totalFeatures = await batchFeatures(batchProps);

  const geojsonOutput: HighwayGeoJson = {
    type: "FeatureCollection",
    features: totalFeatures
  };

  return geojsonOutput;
}
