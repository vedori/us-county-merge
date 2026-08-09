import type { Entry } from "utils/types/entry.ts";

/**
 * Represents a gdp entry for a county
 */
export interface GdpEntry extends Entry {
  gdp: number;
}

/**
 * Represents a gdp entry that is part of a gdp group
 * The gdp value is the gdp of the whole group
 */
export interface GdpGroupedEntry extends GdpEntry {
  gdp: number;
  groupId: string;
}

export interface BeaApiData {
  Code: string,
  GeoFips: string,
  GeoName: string,
  TimePeriod: string,
  CL_UNIT: string,
  UNIT_MULT: string,
  DataValue: string
}

export interface BeaApiResponse {
  BEAAPI: {
    Results: {
      Statistic: string,
      UnitOfMeasure: string,
      PublicTable: string,
      NoteRef: string,
      Data: BeaApiData[]
    }
  }
}

export interface AllGdpEntries {
  gdp_entries: Map<string, GdpEntry>;
  grouped_gdp_entries: Map<string, GdpGroupedEntry>;
}
