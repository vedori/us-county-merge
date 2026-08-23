import 'dotenv/config';

// Required to initialize counties
import { fetchPopulationData } from "@features/population/index.ts";
import { fetchGdpData } from "@features/economics/index.ts";

// Class that contains all the relevant entry statistics
import { County } from '@features/county/county-model.ts';

/**
 * Provides a centralized, singleton service layer for fetching, caching, and accessing all
 * county-level statistics.
 */
export class CountyService {

  /** Singleton instance */
  private static instance: CountyService;

  /**
   * Represents the single source of truth for all county data
   * It is a data store map where the key is the county GEOID
   * and the value an instance of a County
   */
  countyStore: Map<string, County>;

  private constructor() {
    this.countyStore = new Map<string, County>();
  }

  /**
   * Returns the single instance of the CountyService ensuring that
   * only one instance of CountyService exists throughout the application
   */
  public static getInstance(): CountyService {
    if (!CountyService.instance) {
      CountyService.instance = new CountyService();
    }
    return CountyService.instance;
  }

  /**
   * Fetches all required county data to an object containing all county data.
   */
  public async getAllCountyData() {
    const [population, gdp] = await Promise.all([
      fetchPopulationData(),
      fetchGdpData()
    ]);

    // Initialize all counties with their respective population entries
    population.map(populationEntry => {
      const county = new County(populationEntry);

      const gdpEntry = gdp.gdp_entries.get(county.geoId);
      const gdpGroupedEntry = gdp.grouped_gdp_entries.get(county.geoId);

      // Adds a regular GDP entry if there is an entry with the county's geoId
      if (gdpEntry) {
        county.gdpEntry = gdpEntry;
      } else if (gdpGroupedEntry) { // Otherwise adds a GDP grouped entry to the county
        county.gdpGroupedEntry = gdpGroupedEntry;
      }

      // Add the new county to the data store with its geoId as the key
      this.countyStore.set(county.geoId, county);
    });
    return this.toJSON();
  }

  /**
   * Converts the internal Map into a serializable JavaScript object.
   */
  public toJSON(): object {
    return Object.fromEntries(this.countyStore);
  }
}
