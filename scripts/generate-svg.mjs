import fs from 'node:fs';
import { clean } from './clean-data.mjs';
import mapshaper from 'mapshaper';

// Simplifies the output SVG
// Higher values keep more vertices 
// The SVG *file size* at the following percentages are equivalent to official US census KML variants
//    3%=20m (1:20million scale)
//    17%=5m (1:5million scale)
// 1:20m is advisable for large viewing distances / small-scale maps
// 1:5m is standard for national or regional views
// 1:500k is used for local-level analysis and captures intricate borders but at the cost of file size
// Simplifying the SVG ouput from the 1:500k KML file provides more detail
// despite being the same filesize
const SVG_SIMPLIFICATION_PERCENTAGE = '5%';
const SVG_SCALE = 1000;
const SVG_SMOOTHING_COEF = 0.0; // Higher values produce smoother output, default is 0.7
const SVG_OUTPUT_FILE = 'data/svg/map.svg';

const KML_INPUT = './data/kml/cb_2020_us_county_500k.kml';
const HELPER_FILE = './scripts/enrich-kml-fields.mjs';

// Maps initial KML field names to standard application identifiers
// The field names from the KML file will eventually be exported to SVG as data attributes
const NEW_FIELD_MAPPING = {
  'NAMELSAD': 'NAME',
  'STUSPS': 'STATE'
};

// Renaming uses the format NEW=OLD
const renameFields = ' -rename-fields SNAME=NAME,'
  + `${NEW_FIELD_MAPPING.NAMELSAD}=NAMELSAD`
  + `,${NEW_FIELD_MAPPING.STUSPS}=STUSPS`;

// Add required KML data fields to each placemark
// The -each command takes in a quoted string that has access to all data fields defined in the KML
// JS can also run in the quoted string
// Includes a helper file which exports functions that can be directly used by the -each command.
// NOTE: Ensure that IDE formatting does not alter spacing for command strings `- seems to be an issue
const addNewFields = ' -require ' + `${HELPER_FILE}`
  + ' -each '
  + '"'
  + "POP=" + "getPop(GEOID), "
  + "GDP=" + "getGDP(GEOID)"
  + '"';

// Simplifies the polygons to get a lower file size
// Explicityly uses the default smoothing algorithm (visvalingam). See:
// https://mapshaper.org/docs/reference.html#-simplify
const simplifyPolygons = ' -simplify visvalingam keep-shapes '
  + 'percentage=' + `${SVG_SIMPLIFICATION_PERCENTAGE} `
  + 'weighting=' + `${SVG_SMOOTHING_COEF} `;

// Filters the fields of the resulting KML
// This saves time for subsequent transactions
let filterFields = Object.values(NEW_FIELD_MAPPING);
filterFields.push('GEOID');
filterFields.push('POP');
filterFields.push('GDP');
filterFields = ' -filter-fields ' + `${filterFields} `;

// Uses the Albers USA projection which is a composite projection
// that shows both Alaska (as smaller) and Hawaii close to the continuous US
// Also adds other commands that shape the KML into having the fields required by the program
// INPUT: the full path of the initial KML file
const kmlCmd = `${KML_INPUT} -proj albersusa`
  + renameFields
  + addNewFields
  + filterFields
  + simplifyPolygons;

// console.log('renameFields:', renameFields);
// console.log('addNewFields:', addNewFields);
// console.log('filterFields:', filterFields);
// console.log('simplifyPolygons:', simplifyPolygons);



// Configures SVG settings and exports the KML to SVG.
// Each KML placemark is exported as an SVG path element
// Config:
//    Sets the path id to use the GEOID which is a concat of the state FIPS + county FIPS
//    Sets all the data-attributes for the path with a CSV of KML field names
//      for example POP -> data-pop
//    Sets the SVG scale
// NOTE: Ensure that IDE formatting does not alter spacing for command strings `- seems to be an issue
const svgCmd = kmlCmd
  + ' -o'
  + ' id-field="GEOID"'
  + ' svg-data=POP,GDP,' + `"${NEW_FIELD_MAPPING.NAMELSAD}","${NEW_FIELD_MAPPING.STUSPS}"`
  + ' svg-scale=' + `${SVG_SCALE}`
  + ` ${SVG_OUTPUT_FILE} `;

// Runs the SVG command on that input to get an SVG
// The output would be in the form of { SVG_OUTPUT_FILE : DATA }
console.log('Converting KML to SVG');
const svgOutput = await mapshaper.applyCommands(svgCmd);

// Fixes formatting issues in the generated SVG XML
const cleanSVGOutput = clean(svgOutput[SVG_OUTPUT_FILE]);

// Writes the SVG data to a file
fs.writeFile(SVG_OUTPUT_FILE, cleanSVGOutput, (err) => {
  if (err) {
    console.error('Error writing to SVG file:', err);
    return;
  }
  console.log(`Successfully wrote SVG to ${SVG_OUTPUT_FILE} `);
});
