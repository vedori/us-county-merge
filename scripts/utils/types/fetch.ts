/**
 * Represents the standardized response structure from a fetch or HTTP request
 * that needs to encode the HTTP status code.
 *
 * @property {any} result - The response body
 * @property {number} status - The HTTP status code
 */
export interface FetchResponseWithStatus {
  result: any,
  status: number
}
