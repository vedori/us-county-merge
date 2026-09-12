import './style.css'
import hero from '@sections/hero.html?raw'
import countyMap from '@data/svg/map.svg?raw'
import { setupZoom } from '@utils/zoom'
import { setupInfoHover } from '@utils/infoHover'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
${hero}
<section id="map-canvas">
  ${countyMap}
</section>

<div class="spacer"></div>
`

// Use panzoom
const map = document.querySelector<SVGElement>('#map')!
setupZoom(map)

// Shows info of map on hover/over event
// Includes county and highway info
setupInfoHover();
