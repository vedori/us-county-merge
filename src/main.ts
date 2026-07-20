import './style.css'
import countyMap from '../data/svg/map.svg?raw'
import { setupZoom } from './map'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

<section id="map-canvas">
  ${countyMap}
</section>

<div id="spacer"></div>
`

// Use panzoom
const map = document.querySelector<SVGElement>('#map')!
setupZoom(map)
