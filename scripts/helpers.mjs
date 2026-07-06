import fs from 'node:fs';

const getPop = (county, state) => {


  return 6;
}

const getGDP = (county, state) => {


  return 7;
}

// Ensures that the spelling of all counties is consistent between datasets
const normalizeCounty = (county) => {
  return county;
}

// Normalizes input data and gets the specified statistic
const getStat = (county, state, stat) => {
  stat = stat.toLowerCase();
  county = normalizeCounty(county);

  switch (stat) {
    case 'pop':
      return getPop(county, state);
    case 'gdp':
      return getGDP(county, state);
  }
}

export { getStat }
