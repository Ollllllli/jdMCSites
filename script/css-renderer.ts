// minecraft uses a y_up, -z_forward, (x_right) coord system
// therefore: z=0 front, y=0 bottom, x=0 left
// simple as mc(x,y,z) => css(x,-y,z)

const theMissingTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVBhXY/gPhBDwn+E/ABvyA/1Bas9NAAAAAElFTkSuQmCC";

// TODO: do shading with a sun vector.
class CSSRPlane extends HTMLElement {

  static get observedAttributes() { return ["w","h","x","y","z","bg","face"] }

  connectedCallback() { this.update() }
  attributeChangedCallback() { this.update() }

  update() {
    const w = `calc(var(--unit) * ${parseFloat(this.getAttribute("w") || "1")})`;
    const h = `calc(var(--unit) * ${parseFloat(this.getAttribute("h") || "1")})`;
    const x = `calc(var(--unit) * ${parseFloat(this.getAttribute("x") || "0")})`;
    const y = `calc(var(--unit) * ${-parseFloat(this.getAttribute("y") || "0")})`;
    const z = `calc(var(--unit) * ${parseFloat(this.getAttribute("z") || "0")})`;
    const bg = this.getAttribute("bg") || theMissingTexture;
    const face: "north" | "south" | "east" | "west" | "up" | "down" = this.getAttribute("face") as any || "north";

    this.style.display = "inline-block";
    this.style.width = w;
    this.style.height = h;
    this.style.backgroundImage = `url(${bg})`;
    this.style.backgroundSize = "cover";
    this.style.transform = `translate3d(${x},${y},${z})`;
    this.style.transformOrigin = "0% 100%";
    this.style.bottom = "0";
    switch (face) {
      case "north":
        this.style.transform += "rotateY(-180deg)";
        break;
      case "east":
        this.style.transform += "rotateY(90deg)";
        break;
      case "south":
        break;
      case "west":
        this.style.transform += "rotateY(-90deg)";
        break;
      case "up":
        this.style.transform += "rotateY(-180deg) rotateX(90deg)";
        break;
      case "down":
        this.style.transform += "rotateY(-180deg) rotateX(-90deg)";
        break;
    }
  }
}

class CSSROrigin extends HTMLElement {
  static get observedAttributes() { return ["x","y","z"] }
  connectedCallback() { this.update() }
  attributeChangedCallback() { this.update() }
  update() {
    const x = `calc(var(--unit) * ${parseFloat(this.getAttribute("x") || "0")})`;
    const y = `calc(var(--unit) * ${-parseFloat(this.getAttribute("y") || "0")})`;
    const z = `calc(var(--unit) * ${parseFloat(this.getAttribute("z") || "0")})`;
    this.style.transform = `translate3d(${x},${y},${z})`;
  }
}

class CSSRElement extends HTMLElement {
  // creates geometry for a cube
  // specifies widths/heights/x/y for each face
  // each face only drawn
  //
  // takes a lower coord, and upper coord
  private cssrElementOrigin = document.createElement("css-renderer-origin");
  static get observedAttributes() { return ["from","to","north","south","east","west","up","down","noshade"] }
  constructor() {
    super();
  }
  connectedCallback() {
    this.append(this.cssrElementOrigin);
    this.update();
  }
  attributeChangedCallback() { this.update() }
  update() {
    const from = this.getAttribute("from")?.split(",").map(parseFloat) || [0,0,0];
    const to = this.getAttribute("to")?.split(",").map(parseFloat) || [16,16,16];
    const northBg = this.getAttribute("north") || "";
    const eastBg = this.getAttribute("east") || "";
    const southBg = this.getAttribute("south") || "";
    const westBg = this.getAttribute("west") || "";
    const upBg = this.getAttribute("up") || "";
    const downBg = this.getAttribute("down") || "";
    const noShade = this.hasAttribute("noshade");
    // used for shifting for element rotation origin, aswell as general positioning
    this.cssrElementOrigin.setAttribute("x", String(from[0]));
    this.cssrElementOrigin.setAttribute("y", String(from[1]));
    this.cssrElementOrigin.setAttribute("z", String(from[2]));
    this.cssrElementOrigin.innerHTML = "";
    if (to[0] - from[0] > 0 && to[1] - from[1] > 0) {
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[0]-from[0]}" h="${to[1]-from[1]}" bg="${northBg}" x="16" face="north"></css-renderer-plane>`);
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[0]-from[0]}" h="${to[1]-from[1]}" bg="${southBg}" z="16" face="south"></css-renderer-plane>`);
    }
    if (to[2] - from[2] > 0 && to[1] - from[1] > 0) {
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[2]-from[2]}" h="${to[1]-from[1]}" bg="${eastBg}" x="16" z="16" face="east"></css-renderer-plane>`);
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[2]-from[2]}" h="${to[1]-from[1]}" bg="${westBg}" face="west"></css-renderer-plane>`);
    }
    if (to[0] - from[0] > 0 && to[2] - from[2] > 0) {
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[0]-from[0]}" h="${to[2]-from[2]}" bg="${upBg}" x="16" y="16" face="up"></css-renderer-plane>`);
      this.cssrElementOrigin.insertAdjacentHTML("beforeend", `<css-renderer-plane w="${to[0]-from[0]}" h="${to[2]-from[2]}" bg="${downBg}" x="16" z="16" face="down"></css-renderer-plane>`);
    }
  }
}

// show as minecraft models display = gui
class CSSRenderer extends HTMLElement {
  
  shadowRoot = this.attachShadow({mode:"closed"});
  private internalStyle = document.createElement("style");
  private wrapper = document.createElement("css-renderer-wrapper");
  rootOrigin = document.createElement("css-renderer-origin") as CSSROrigin;

  static get observedAttributes() { return ["width", "height", "rotate"] }

  constructor() {
    super();
    this.rootOrigin.setAttribute("x", "-8");
    this.rootOrigin.setAttribute("y", "-8");
    this.rootOrigin.setAttribute("z", "-8");
    this.wrapper.append(this.rootOrigin);
    this.shadowRoot.append(this.internalStyle, this.wrapper);
  }

  connectedCallback() { this.update() }
  attributeChangedCallback() { this.update() }

  update() {
    const fontSize = window.getComputedStyle(this).fontSize;
    const width = parseFloat(this.getAttribute("width") || fontSize);
    const height = parseFloat(this.getAttribute("height") || fontSize);
    const rotateComponents = this.getAttribute("rotate")?.split(",").map(v=>parseFloat(v)) || [0, 0, 0];
    const unit = (Math.min(width, height) / 25.2).toFixed(3);
    // set self styling
    this.style.display = "inline-block";
    this.style.verticalAlign = "top";
    this.style.position = "relative";
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
    this.internalStyle.textContent = `
      css-renderer-wrapper * { transform-style: preserve-3d; position: absolute; }

      /* used to rotate whole model around centre, and to hold unit variable */
      css-renderer-wrapper {
        --unit: ${unit}px;
        position: absolute;
        top: 50%; left: 50%;
        width: 0; height: 0;
        transform: rotateX(${-1*rotateComponents[0]}deg) rotateY(${-1*rotateComponents[1]}deg)  rotateZ(${-1*rotateComponents[2]}deg);
        transform-style: preserve-3d;
      }
      css-renderer-plane {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        backface-visibility: hidden;
      }
    `;
    // this.style.boxShadow = "0px 0px 2px 4px #0ff";
  }
}

customElements.define("css-renderer", CSSRenderer);
customElements.define("css-renderer-plane", CSSRPlane);
customElements.define("css-renderer-origin", CSSROrigin);
customElements.define("css-renderer-element", CSSRElement);
