// import { GDP_GROUP_CONFIG } from "@shared/gdp-group-config";

const setupCountyInfoHover = () => {
  const counties: SVGGElement = document.querySelector("#counties")!;

  counties.addEventListener("pointerover", (event) => {
    const c: SVGPathElement = event.target!;
    console.log(c.dataset);
  });

};


export function setupInfoHover() {
  setupCountyInfoHover();

}
