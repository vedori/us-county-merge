import './style.css'
import countyMap from '../data/svg/map.svg?raw'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

<section id="map-canvas">
  ${countyMap}
</section>

<div id="spacer"></div>
`
