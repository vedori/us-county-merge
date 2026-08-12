import type { FetchResponseWithStatus } from "./types/fetch.ts";

/**
 * Fetches JSON data from the specified URL and returns it
 *
 * @param {string} url - The target URL to fetch data from.
 * @returns {Promise<any>} Resolves to an object containing the JSON response
 * On failure, console logs the error and returns nothing
 */
export const fetchData = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} status: Could not fetch ${url}`);
    }
    const result = await response.json();
    console.log(`Fetched ${url}`);
    return result;
  } catch (error: any) {
    console.error(`Error fetching ${url}`, error.message);
  }
};

/**
 * Fetches JSON data from the specified URL and returns it alongside the HTTP status code.
 *
 * @param {string} url - The target URL to fetch data from.
 * @returns {Promise<FetchResponseWithStatus>} Resolves to an object containing the parsed response and status code.
 * On failure, returns the error object in `result` and its status code.
 */
export const fetchDataAndStatus = async (url: string): Promise<FetchResponseWithStatus> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} status: Could not fetch ${url}`);
    }
    const result = await response.json();
    return { result, status: response.status }
  } catch (error: any) {
    console.error(`Error fetching ${url}`, error.message);
    return { result: error, status: error.status }
  }
};
