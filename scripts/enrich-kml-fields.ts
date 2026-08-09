import countyData from '../data/county-data.json' with { type: 'json' };

// NOTE: This file cannot contain variables that could resolve to undefined
// This is due to how mapshaper parses helper files
// For example: const gdp = county.gdp; could be undefined if the county is in a combination area

const getPop = (geoId) => {
  const county = countyData[geoId];
  if (county) {
    return county.pop;
  }
}

// If in a combination area the gdp will be represented as g:groupId
const getGDP = (geoId) => {
  const county = countyData[geoId];
  if (county && county.gdp) {
    return county.gdp;
  } else if (county && county.gdpGroupId) {
    return `g:${county.gdpGroupId}`;
  }
};


export { getPop, getGDP }
