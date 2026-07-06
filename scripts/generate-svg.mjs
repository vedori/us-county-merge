import fs from 'node:fs';
import { clean } from './clean-data.mjs';
import mapshaper from 'mapshaper';

const KML_INPUT = './data/kml/cb_2020_us_county_20m.kml';
// const KML_INPUT = './data/KML/cb_2020_us_county_5m.kml';
const ALBERS_KML = 'albers.kml';
const HELPER_FILE = './scripts/helpers.mjs';
const SVG_OUTPUT_FILE = 'wip.svg';

// Maps initial KML field names to standard application identifiers
// The field names from the KML file will eventually be exported to SVG as data attributes
const NEW_FIELD_MAPPING = {
  'NAMELSAD': 'NAME',
  'STUSPS': 'STATE'
};

// Renaming uses the format NEW=OLD
const renameFields = ' -rename-fields SNAME=NAME,'
  + `${NEW_FIELD_MAPPING.NAMELSAD}=NAMELSAD,`
  + `${NEW_FIELD_MAPPING.STUSPS}=STUSPS`;

// Adds new fields for extra data that is required by the program
// Includes a helper file which exports functions that can be directly used by the -each command.
const addNewFields = ` -require ${HELPER_FILE} `
  + `-each 'POP = getStat(NAME, STATE_NAME, "pop"), GDP = getStat(NAME, STATE_NAME, "gdp")'`;

// Filters the fields of the resulting KML
// This saves time for subsequent transactions
let filterFields = Object.values(NEW_FIELD_MAPPING);
filterFields.push('GEOID');
filterFields.push('POP');
filterFields.push('GDP');
filterFields = ` -filter-fields ${filterFields}`;

// Uses the Albers USA projection which is a composite projection
// that shows both Alaska (as smaller) and Hawaii close to the continuous US
// INPUT: the full path of the initial KML file
// OUTPUT: the full path of the modified KML file which has renamed/added fields
const projectionCmd = `${KML_INPUT} -proj albersusa`
  + renameFields
  + addNewFields
  + filterFields
  + ` -o ${ALBERS_KML}`;

// Instead of writing to a file it holds the reprojected KML in memory 
// with the form { ALBERS_KML : DATA }
// The value of ALBERS_KML is the identifier for the reprojected KML
const albersProjection = await mapshaper.applyCommands(projectionCmd);

// Configures SVG settings and exports the KML to SVG.
// Expects input in the form of
// { ALBERS_KML : DATA } (or a full path to the KML if it is a file)
// The value of ALBERS_KML is the identifier for the reprojected KML
// Each KML placemark is exported as an SVG path element
// Config:
//    Sets the path id to use the GEOID which is a concat of the state FIPS + county FIPS
//    Sets all the data-attributes for the path with a CSV of KML field names
//      for example POP -> data-pop
//    Sets the SVG scale
const svgCmd = `-i ${ALBERS_KML} name="" -o`
  + ' id-field="GEOID"'
  + ` svg-data="POP","GDP","${NEW_FIELD_MAPPING.NAMELSAD}","${NEW_FIELD_MAPPING.STUSPS}"`
  + ' svg-scale=1000'
  + ` ${SVG_OUTPUT_FILE}`;

// Input accepts { ALBERS_KML : DATA } (or full path if file)
// Runs the SVG command on that input to get an SVG
// The output would be in the form of { SVG_OUTPUT_FILE : DATA }
const svgOutput = await mapshaper.applyCommands(svgCmd, albersProjection);

// Fixes formatting issues in the generated SVG XML
const cleanSVGOutput = clean(svgOutput[SVG_OUTPUT_FILE]);

// Writes the SVG data to disk
fs.writeFile(SVG_OUTPUT_FILE, cleanSVGOutput, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
    return;
  }
  console.log(`Successfully wrote to ${SVG_OUTPUT_FILE}`);
});
