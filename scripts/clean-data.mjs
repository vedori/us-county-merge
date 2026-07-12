// Cleans the svg data so it can work as expected
const clean = (svg_data) => {
  let data = svg_data;

  // Normalize names that have the word city
  data = data.replaceAll('city', 'City');

  // Removes the first <g> that contains all the other paths alongside the newline
  data = data.replace(/<g[^>]*>\r?\n/gi, '');

  // Removes the last </g> alongside the new line
  data = data.replace(/<\/g>\r?\n/gi, '');

  // Rewrites the top level svg attributes
  const fillColor = '#bcc';
  const strokeColor = '#fff';
  const strokeWidth = 1;
  const svgHeader = '<svg id="us-map" xmlns="http://www.w3.org/2000/svg" version="1.2"'
    + ' baseProfile="tiny"'
    + ' viewBox="0 0 4644 2901"'
    + ` stroke="${strokeColor}" stroke-width="${strokeWidth}"`
    + ' stroke-linecap="round" stroke-linejoin="round"'
    + ` fill="${fillColor}"`
    + '>'
  data = data.replace(/<svg[^>]*>/, svgHeader);

  return data;
}

export { clean }
