import 'dotenv/config';

// Required to initialize counties
import { fetchPopulationData } from "@features/population/index.ts";
import { fetchGdpData } from "@features/economics/index.ts";

// Class that contains all the relevant entry statistics
import { County } from '@features/county/county-model.ts';

// Used to store all the counties
export class CountyService {

  /** Singleton instance */
  private static instance: CountyService;

  /**
   * Represents the single source of truth for all county data
   * It is a data store map where the key is the county geoID
   * and the value an instance of a County
   */
  countyStore: Map<string, County>;

  private constructor() {
    this.countyStore = new Map<string, County>();
  }

  public static getInstance(): CountyService {
    if (!CountyService.instance) {
      CountyService.instance = new CountyService();
    }
    return CountyService.instance;
  }

  public async getAllCountyData() {
    // If the data store is already populated return it
    if (this.countyStore.size > 0) {
      return this.toJSON()
    }

    const [population, gdp] = await Promise.all([
      fetchPopulationData(),
      fetchGdpData()
    ]);

    // Initialize all counties with their respective population entries
    population.map(populationEntry => {
      const county = new County(populationEntry);
      const gdpEntry = gdp.gdp_entries.get(county.geoId)
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

  // The county store will be the representation of this class when emitting it as JSON
  public toJSON(): object {
    return Object.fromEntries(this.countyStore);
  }
}
