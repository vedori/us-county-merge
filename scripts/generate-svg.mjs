import mapshaper from 'mapshaper';
import fs from 'node:fs';
import { clean } from './clean-svg-data.mjs';

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
const SVG_OUTPUT_FILE = 'data/svg/map.svg';
const SVG_SCALE = 10000; // Smaller values "zooms in" larger values "zooms out"

const COUNTY_KML = './data/kml/cb_2020_us_county_500k.kml';
const HIGHWAY_GEOJSON = './data/geojson/highways.geojson';
const HELPER_FILE = './scripts/enrich-kml-fields.mjs';

const COUNTY_DATA_LABEL = 'counties.kml';
const HIGHWAY_DATA_LABEL = 'highways.kml';
const STATE_BORDER_DATA_LABEL = 'borders.kml';

// Maps initial KML field names to standard application identifiers
// The field names from the KML file will eventually be exported to SVG as data attributes
const NEW_FIELD_MAPPING = {
  'NAMELSAD': 'NAME',
  'STUSPS': 'STATE'
};

// NOTE: Ensure that IDE formatting does not alter spacing for command strings `- seems to be an issue

// Builds the command for taking in the county file and
// transforming it into a kml file projected in albers usa
const buildCountyCommand = () => {

  // Imports required fields from the KML file
  // const importFields = ' ' + 'string-fields="GEOID","NAMELSAD","STUSPS"';
  const importFields = ' ' + 'string-fields=*';

  // Defines the desired projection
  const applyProjection = ' ' + '-proj albersusa';

  // Renaming uses the format NEW=OLD
  const renameFields = ' -rename-fields' + ' '
    + `${NEW_FIELD_MAPPING.NAMELSAD}=NAMELSAD`
    + `,${NEW_FIELD_MAPPING.STUSPS}=STUSPS`;

  // Add required KML data fields to each placemark
  // The -each command takes in a quoted string that has access to all data fields defined in the KML
  // JS can then be ran in the quoted string
  // Includes a helper file which exports functions that can be directly used by the -each command.
  const addNewFields = ' -require ' + `${HELPER_FILE}`
    + ' -each '
    + '"'
    + "POP=" + "getPop(GEOID), "
    + "GDP=" + "getGDP(GEOID)"
    + '"';

  // Simplifies the polygons to get a lower file size
  // Explicityly uses the default smoothing algorithm (visvalingam). See:
  // https://mapshaper.org/docs/reference.html#-simplify
  const simplifyPolygons = ' -simplify visvalingam'
    + ' keep-shapes'
    + ' percentage=' + `${SVG_SIMPLIFICATION_PERCENTAGE}`
    + ' weighting=0'

  const stylePolygons = ' -style clear';

  // Uses the Albers USA projection which is a composite projection
  // that shows both Alaska (as smaller) and Hawaii close to the continuous US
  // Also adds other commands that shape the KML into having the fields required by the program
  // INPUT: the full path of the initial KML file
  // OUTPUT: An object in the form of { DATA_LABEL : DATA } 
  //        (or a file by the name of DATA_LABEL if ran with `mapshaper.runCommands()`)
  const countyKmlCmd = '-i ' + `${COUNTY_KML}`
    + ' ' + 'name="counties"'
    + importFields
    + applyProjection
    + renameFields
    + addNewFields
    + simplifyPolygons
    + stylePolygons
    + ' -o '
    + `${COUNTY_DATA_LABEL}`
    ;

  // console.log('[buildCountyCommand] renameFields:', renameFields);
  // console.log('[buildCountyCommand] addNewFields:', addNewFields);
  // console.log('[buildCountyCommand] filterFields:', filterFields);
  // console.log('[buildCountyCommand] simplifyPolygons:', simplifyPolygons);

  return countyKmlCmd;
};

// Builds the command for taking in the highway file 
// and transforming it into a kml file projected in albers usa
const buildHighwayCommand = () => {
  const applyProjection = ' -proj albersusa';
  const mergePolylineByInterstate = ' -dissolve fields="SIGN1"';
  const styleLines = ' -style clear';
  const simplifyPolyline = ' -simplify visvalingam'
    + ' percentage=' + `${SVG_SIMPLIFICATION_PERCENTAGE}`
    + ' weighting=0' // Smoothness
    ;

  // INPUT: the full path of the initial highway geojson file
  // OUTPUT: An object in the form of { DATA_LABEL : DATA } 
  //        (or a file by the name of DATA_LABEL if ran with `mapshaper.runCommands()`)
  const highwayKmlCmd = ' -i ' + `${HIGHWAY_GEOJSON}`
    + ' name="highways" -target highways'
    + applyProjection
    + simplifyPolyline
    + mergePolylineByInterstate
    + styleLines
    // + ' -classify field="SIGN1" colors=random' // Assigns a random color to every Interstate
    + ' -o '
    + `${HIGHWAY_DATA_LABEL}`;
  return highwayKmlCmd;
};

// Builds the command for taking in the county KML file
// and transforming it into a kml file projected in albers usa
// *It uses the county kml file to define state borders
const buildStateBordersCommand = () => {
  const applyProjection = ' -proj albersusa';
  const mergePolygonsByState = ' -dissolve fields="STUSPS"';
  const styleLines = ' -style clear';
  const simplifyPolyline = ' -simplify visvalingam'
    + ' percentage=5%' // Less removes more
    + ' weighting=0' // Smoothness
    // + ' -filter-islands min-area="10km2"'
    ;

  const defineBorder = ' -innerlines'

  // INPUT: the full path of the initial highway geojson file
  // OUTPUT: An object in the form of { DATA_LABEL : DATA } 
  //        (or a file by the name of DATA_LABEL if ran with `mapshaper.runCommands()`)
  const stateBorderKmlCmd = ' -i ' + `${COUNTY_KML}`
    + ' name="borders" -target borders'
    + applyProjection
    + simplifyPolyline
    + mergePolygonsByState
    + defineBorder
    + styleLines
    + ' -o '
    + `${STATE_BORDER_DATA_LABEL}`;
  return stateBorderKmlCmd;
};
// console.log('[Debug]: You should only see this message if you uncommented this code');
// console.log(`Writing to ./${COUNTY_DATA_LABEL} and ./${HIGHWAY_DATA_LABEL}`);
// await mapshaper.runCommands(buildCountyCommand());
// await mapshaper.runCommands(buildHighwayCommand());
// console.log(`Wrote to ./${COUNTY_DATA_LABEL} and ./${HIGHWAY_DATA_LABEL}`);
// console.log('[Debug]: You should only see this message if you uncommented this code');

console.log('Projecting county data to Albers USA');
const countyProjected = await mapshaper.applyCommands(buildCountyCommand());
console.log('Projecting state border data to Albers USA');
const stateBordersProjected = await mapshaper.applyCommands(buildStateBordersCommand());
console.log('Projecting highway data to Albers USA');
const highwayProjected = await mapshaper.applyCommands(buildHighwayCommand());

// Configures SVG settings and exports all KML input to a single SVG file.
// Each input will be in  a seperate g element with their name attribute as the identifier
// Each KML placemark is exported as an SVG path element
// Config:
//    Sets the path id to use the GEOID which is a concat of the state FIPS + county FIPS
//    Sets all the data-attributes for the path with a CSV of KML field names
//      for example POP -> data-pop
// INPUT: An object that contains the data of all the files to be combined
//        in the form { FILE1_LABEL:FILE1_DATA, FILE2_LABEL:FILE2_DATA ... }
//        (or a comma seperated string of all the filepaths if on disk)
// OUTPUT: An object in the form of { DATA_LABEL : DATA } 
//        (or a file by the name of DATA_LABEL if ran with `mapshaper.runCommands()`)
const svgCmd =
  ' -i combine-files '
  // The order of the inputs here defines the order in the svg output
  + `${COUNTY_DATA_LABEL} ${STATE_BORDER_DATA_LABEL} ${HIGHWAY_DATA_LABEL}`
  + ' -o'
  + ' id-field="GEOID","SIGN1"'
  + ' svg-data=POP,GDP,' + `"${NEW_FIELD_MAPPING.NAMELSAD}","${NEW_FIELD_MAPPING.STUSPS}"`
  + ` svg-scale=${SVG_SCALE}`
  + ` ${SVG_OUTPUT_FILE} `
  ;
console.log('Exporting data to SVG');
const svgOutput = await mapshaper.applyCommands(svgCmd, { ...countyProjected, ...stateBordersProjected, ...highwayProjected });

// Fixes formatting issues in the generated SVG XML
// and applies additional styling to certain elements
console.log('Cleaning SVG data');
const cleanSvgOutput = clean(svgOutput[SVG_OUTPUT_FILE]);

// Writes the SVG data to a file
fs.writeFile(SVG_OUTPUT_FILE, cleanSvgOutput, (err) => {
  if (err) {
    console.error('Error writing to SVG file:', err);
    return;
  }
  console.log(`Successfully wrote SVG to ${SVG_OUTPUT_FILE} `);
});
