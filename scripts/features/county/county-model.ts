import type { Entry } from "@utils/types/entry.ts";
import type { PopulationEntry } from "@features/population/population-types.ts";
import type { GdpEntry, GdpGroupedEntry } from "@features/economics/economic-types.ts";

// /**
//  * The object representation of the County.
//  * This is the form that will be used to serialize the object.
//  * @param {number} pop - The population count.
//  * @param {number | undefined } gdp - The GDP for the individual county. Most counties have a GDP count.
//  * @param {string | undefined } gdpGroupId - Some counties do not have individual GDP counts.
//  *                                           This is the GEOID of the GDP group this county belongs
//  *                                           to. The collective gdp is accessed using GDP_GROUP_CONFIG
//  */
export interface CountyData {
  pop: number,
  gdp?: number,
  gdpGroupId?: string
}

/**
 * Represents a county with all relevant statistics
 * All counties must be constructed with a population entry
 * It will derive its GEOID from the population entry
 */
export class County implements Entry {
  geoId: string;
  populationEntry: PopulationEntry;
  gdpEntry?: GdpEntry;
  gdpGroupedEntry?: GdpGroupedEntry;

  /**
   * All counties will get their ids from their population entry
   * @param {PopulationEntry} p - Counties are required to have a population entry.
   *                              The properties of this entry will be used to set the same properties
   *                              in the County class.
   */
  constructor(p: PopulationEntry) {
    this.geoId = p.geoId;
    this.populationEntry = p;
  }

  toJSON() {
    const result: CountyData = {
      pop: this.populationEntry.population
    };

    if (this.gdpGroupedEntry) {
      result.gdpGroupId = this.gdpGroupedEntry.groupId
    }
    else if (this.gdpEntry) {
      result.gdp = this.gdpEntry.gdp;
    }

    return result;
  }
}
