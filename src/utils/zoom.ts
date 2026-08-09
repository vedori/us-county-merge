import Panzoom from "@panzoom/panzoom"

export function setupZoom(map: SVGElement) {

  // Use panzoom
  const panzoom = Panzoom(map)
  panzoom.setOptions({
    animate: false,
    panOnlyWhenZoomed: true,
    step: 1,
    maxScale: 100,
    minScale: 1
  })

  // Center/reset the zoom when scrolling all the way out
  map.parentElement!.addEventListener('wheel', function(event) {
    panzoom.zoomWithWheel(event)
    const scale = panzoom.getScale()
    // console.log(`Scrolled wheel to scale: ${scale}`)
    if (scale <= 1) {
      panzoom.reset()
      // console.log('Snapped back to place');
    }
  })
}
