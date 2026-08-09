import fs from 'node:fs';
import { CountyService } from "@features/county/index.ts";
const DATA_FILE_PATH = './data/county-data.json';

const countyService = CountyService.getInstance();
const countyData = await countyService.getAllCountyData();

const data = JSON.stringify(countyData, null, 2);
fs.writeFile(DATA_FILE_PATH, data, (err) => {
  if (err) {
    console.log(`Failed to write county data to file ${DATA_FILE_PATH}`);
  } else {
    console.log(`Wrote county data to file ${DATA_FILE_PATH}`);
  }
});
