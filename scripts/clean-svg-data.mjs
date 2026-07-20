// Cleans the svg data so it can work as expected
const clean = (svg_data) => {
  let data = svg_data;

  // Removes the svg version comment
  data = data.replace('<?xml version="1.0"?>\n', '');

  // Adds id to the svg
  data = data.replace('<svg', '<svg id="map"');


  // Removes empty <g/> elements
  data = data.replaceAll(/\<g\/\>\r?\n/g, '');

  // Normalize names that have the word city
  data = data.replaceAll('city', 'City');

  // Adds default style attributes to the top level county group
  {
    const fillColor = '#bcc';
    const strokeColor = '#000';
    const strokeWidth = 0.1;
    const styles = '<g id="counties"'
      + ` fill="${fillColor}"`
      + ` stroke="${strokeColor}"`
      + ` stroke-width="${strokeWidth}"`
      + '>';
    data = data.replace(/<g id="counties"[^>]*>/, styles);
  }

  // Adds default style attributes to the top level highway group
  {
    const fillColor = 'none';
    const strokeColor = '#ff0';
    const strokeWidth = 0.3;
    const opacity = 0.8;
    const styles = '<g id="highways"'
      + ` fill="${fillColor}"`
      + ` stroke="${strokeColor}"`
      + ` stroke-width="${strokeWidth}"`
      + ` opacity="${opacity}"`
      + '>';
    data = data.replace(/<g id="highways"[^>]*>/, styles);
  }

  // Adds default style attributes to the top level state borders group
  {
    const fillColor = 'none';
    const strokeColor = '#000';
    const strokeWidth = 0.5;
    const opacity = 1.0;
    const styles = '<g id="borders"'
      + ` fill="${fillColor}"`
      + ` stroke="${strokeColor}"`
      + ` stroke-width="${strokeWidth}"`
      + ` opacity="${opacity}"`
      + '>';
    data = data.replace(/<g id="borders"[^>]*>/, styles);
  }

  return data;
}

export { clean }
