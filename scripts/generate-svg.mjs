import fs from 'node:fs';
import { clean } from './clean-data.mjs';
import mapshaper from 'mapshaper';

const KML_INPUT = './data/kml/cb_2020_us_county_20m.kml';
// const KML_INPUT = './data/kml/cb_2020_us_county_5m.kml';
const ALBERS_KML = 'albers_projection.kml';
const HELPER_FILE = './scripts/helpers.mjs';
const SVG_OUTPUT_FILE = 'wip.svg';

// Renames the fields names that come with the KML to be a bit better
// The field names from the KML file will eventually be exported to SVG as data attributes
const NEW_FIELD_MAPPING = {
  'NAMELSAD': 'NAME',
  'STUSPS': 'STATE'
};

// Renaming uses the format NEW=OLD
const renameFields = 'SNAME=NAME,'
  + `${NEW_FIELD_MAPPING.NAMELSAD}=NAMELSAD,`
  + `${NEW_FIELD_MAPPING.STUSPS}=STUSPS`;

// Adds new fields for extra data that is required by the program
// Includes a helper file which exports functions that can be directly used by the -each command.
const addNewFields = `-require ${HELPER_FILE} `
  + '-each "POP = 0, GDP = 0"';

// Filters the fields of the resulting KML
// This saves time for subsequent transactions
const filterFields = Object.values(NEW_FIELD_MAPPING);
filterFields.push('GEOID');
filterFields.push('POP');
filterFields.push('GDP');


// Uses the Albers USA projection which is a composite projection
// that shows both Alaska (as smaller) and Hawaii close to the continuous US
// OUTPUT: a kml file with a filename of KML_OUTPUT and renamed fields
const projectionCmd = `${KML_INPUT} -proj albersusa -rename-fields ${renameFields}
                      ${addNewFields} -filter-fields ${filterFields} -o ${ALBERS_KML}`;

// Instead of writing to a file it holds the reprojected kml in memory 
// with the form { file_name: DATA }
// const albersProjection = await mapshaper.applyCommands(projectionCmd);
const albersProjection = await mapshaper.applyCommands(projectionCmd);

// Outputs the data as an svg string, ensuring the ids from the KML are exported as path ids in the SVG
const svgCmd = `-i ${ALBERS_KML} name="" -o `
  + 'id-field="GEOID" '
  + `svg-data="POP","GDP","${NEW_FIELD_MAPPING.NAMELSAD}","${NEW_FIELD_MAPPING.STUSPS}" `
  + 'svg-scale=1000 '
  + `${SVG_OUTPUT_FILE}`;
const svgOutput = await mapshaper.applyCommands(svgCmd, albersProjection);

// Transforms the svg data so it can match exact casings/naming of other data such as 2020-gdp.csv
const cleanSVGOutput = clean(svgOutput[SVG_OUTPUT_FILE]);

// Writes the svg data
fs.writeFile(SVG_OUTPUT_FILE, cleanSVGOutput, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
    return;
  }
  console.log(`Successfully wrote to ${SVG_OUTPUT_FILE}`);
});
