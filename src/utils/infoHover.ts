// import { GDP_GROUP_CONFIG } from "@shared/gdp-group-config";

const setupCountyInfoHover = () => {
  const counties: SVGGElement = document.querySelector("#counties")!;

  counties.addEventListener("pointerover", (event) => {
    const county = event.target! as SVGPathElement;
    console.log(county.dataset);
  });

};


export function setupInfoHover() {
  setupCountyInfoHover();

}
