// import { GDP_GROUP_CONFIG } from "@shared/gdp-group-config";

const createHoverElement = () => {
  const hoverElement = document.createElement("span");
  hoverElement.id = 'hover';
  hoverElement.style.position = 'fixed'
  hoverElement.style.pointerEvents = 'none'
  hoverElement.style.visibility = 'hidden'
  document.body.appendChild(hoverElement);
}

const setupCountyInfoHover = () => {
  const counties = document.querySelector<SVGGElement>("#counties")!;
  const hoverElement = document.querySelector<HTMLSpanElement>("#hover")!;

  const xOffset = 16;
  const yOffset = 10;

  counties.addEventListener("pointermove", (event) => {
    // Set info
    const county = event.target! as SVGPathElement;
    hoverElement.innerHTML = `${county.dataset.name} ${county.dataset.state}`;

    // TODO: make position dynamic based on clientX and client Y pos
    // for example if the cursor is on the top left then the offset should be different



    // Set position
    const xPos = event.clientX + xOffset;
    const yPos = event.clientY + yOffset;
    hoverElement.style.top = `${yPos}px`;
    hoverElement.style.left = `${xPos}px`;

    // Make hover element visible
    hoverElement.style.visibility = 'visible';
  });

  // Set hover element visibility back to hidden when the pointer
  // moves out of the county SVG path element
  counties.addEventListener("pointerleave", () => {
    hoverElement.style.visibility = 'hidden';
  });


};


export function setupInfoHover() {
  createHoverElement();
  setupCountyInfoHover();
}
