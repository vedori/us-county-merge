/**
 * Represents a continuous sequence of connected points (a line) in GeoJSON format.
 * Typically used to model individual road segments, routes, or paths.
 *
 * @property {string} type - Always "LineString", conforming to the GeoJSON specification.
 * @property {[number, number][]} coordinates - Array of `[longitude, latitude]` pairs defining the line's vertices.
 */
interface LineString {
  type: "LineString",
  coordinates: [number, number][]
}
/**
 * Represents a collection of independent line strings in GeoJSON format.
 * Used when a single geographic feature consists of multiple disconnected segments.
 *
 * @property {string} type - Always "MultiLineString", conforming to the GeoJSON specification.
 * @property {[number, number][][]} coordinates - Nested array where each inner array defines a separate connected path
 *                                                where the coordinates are [longitude, latitude] pairs.
 */
interface MultiLineString {
  type: "MultiLineString",
  coordinates: [number, number][][]
}

/**
 * Represents a single highway segment in standard GeoJSON format.
 * Each feature corresponds to a portion of the USDOT National Highway System.
 *
 * @property {string} type - Always "Feature", conforming to the GeoJSON spec
 * @property {LineString | MultiLineString} geometry - Spatial data describing the highway segment
 *                                                     Either a GeoJson LineString or MultiLineString
 */
export interface HighwayFeature {
  type: "Feature",
  geometry: LineString | MultiLineString
}

/**
 * A standard GeoJSON FeatureCollection containing all fetched highway features.
 * Used as the final output format for mapping and visualization.
 *
 * @property {string} type - Always "FeatureCollection", conforming to the GeoJSON spec.
 * @property {HighwayFeature[]} features - Array of individual highway feature objects.
 */
export interface HighwayGeoJson {
  type: "FeatureCollection"
  features: HighwayFeature[];
}
/**
 * The raw response structure returned by the ArcGIS REST API for feature queries.
 * Extends the base GeoJSON structure with ArcGIS-specific metadata required for pagination and spatial context.
 *
 * @property {{ exceededTransferLimit: boolean } | undefined} properties - ArcGIS pagination metadata.
 *                                                                         `exceededTransferLimit: true` signals that more records are
 *                                                                         available and the query offset should be incremented.
 * @property {{ properties: { name: "EPSG:4326" } }} crs - Coordinate Reference System definition confirming WGS84 geographic coordinates.
 */
export interface HighwayApiResponse extends HighwayGeoJson {
  properties?: {
    exceededTransferLimit: boolean | undefined
  },
  crs: {
    properties: {
      name: "EPSG:4326"
    }
  }
}

/**
 * Metadata response from the ArcGIS feature service endpoint.
 * Contains API constraints used to safely configure request batching.
 *
 * @property {number} maxRecordCount - The maximum number of features the API allows per single request.
 *                                     Used to set `numberPerBatch` to avoid 500/400 errors from oversized payloads.
 */
export interface HighwayMetadataApi {
  maxRecordCount: number;
}

/**
 * Configuration parameters for paginated/batched requests to the ArcGIS highway API.
 *
 * @property {string} baseUrl - The base endpoint URL for feature queries.
 * @property {number} numberPerBatch - Maximum features to request per API call (typically matches `maxRecordCount`).
 * @property {number} timeMsPerBatch - Delay in milliseconds between batch requests to respect ArcGIS rate limits.
 * @property {number} offset - Current pagination offset used during sequential fetching.
 * @property {number | undefined} decimalPrecision - Optional precision for geometry coordinates.
 *                                                   Currently reserved for future payload optimization.
 */
export interface HighwayApiBatchProps {
  baseUrl: string;
  numberPerBatch: number;
  timeMsPerBatch: number;
  offset: number;
  decimalPrecision?: number; // TODO: implement to see if cutting precision affects map quality
}
