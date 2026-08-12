import fs from 'node:fs';
import { getHighwayData } from '@features/highway/index.ts';
const OUTPUT_FILE = './data/geojson/highways.geojson';

// Builds the highway geojson and writes it to a file
const highwayData = await getHighwayData();
const data = JSON.stringify(highwayData);

fs.writeFile(OUTPUT_FILE, data, (err) => {
  if (err) {
    console.log(`Failed to write highway data to file ${OUTPUT_FILE}`);
  } else {
    console.log(`Wrote highway data to file ${OUTPUT_FILE}`);
  }
});
