

class CSSRBlock extends HTMLElement {

}

class CSSRPlane extends HTMLElement {

  static get observedAttributes() { return ["w","h","x","y","z","bg","axis"] }

  connectedCallback() { this.update() }
  attributeChangedCallback() { this.update() }

  update() {
    const wAttr = Number(this.getAttribute("w") || 1);
    const hAttr = Number(this.getAttribute("h") || 1);
    const xAttr = Number(this.getAttribute("x") || 0);
    const yAttr = Number(this.getAttribute("y") || 0);
    const zAttr = Number(this.getAttribute("z") || 0);
    const w = `calc(var(--unit) * ${wAttr})`;
    const h = `calc(var(--unit) * ${hAttr})`;
    const x = `calc(var(--unit) * ${xAttr})`;
    const y = `calc(var(--unit) * ${yAttr})`;
    const z = `calc(var(--unit) * ${zAttr})`;
    const bg = this.getAttribute("bg") || "";
    const axis: "x" | "y" | "z" = this.getAttribute("axis") as any || "z";

    this.style.display = "inline-block";
    this.style.width = w;
    this.style.height = h;
    this.style.background = bg;
    this.style.backgroundSize = "cover";
    this.style.transform = `translate3d(${x},${y},${z})`;
    switch (axis) {
      case "z":
        this.style.transformOrigin = "100% 100%";
        this.style.transform += " rotateZ(180deg)"
        this.style.top = `calc(-1 * ${h})`;
        this.style.left = `calc(-1 * ${w})`;
        break;
      case "y":
        this.style.transformOrigin = "100% 100%";
        this.style.transform += " rotateZ(180deg) rotateX(-90deg)";
        this.style.top = `calc(-1 * ${h})`;
        this.style.left = `calc(-1 * ${w})`;
        this.style.backgroundColor = "#ccc";
        //@ts-expect-error
        this.style.backgroundBlendMode = "multiply";
        break;
      case "x":
        this.style.transformOrigin = "0 100%";
        this.style.transform += " rotateY(-90deg) rotateZ(90deg)";
        this.style.top = `calc(-1 * ${h})`;
        this.style.backgroundColor = "#999";
        //@ts-expect-error
        this.style.backgroundBlendMode = "multiply";
        break;
    }
  }
}

class CSSRenderer extends HTMLElement {
  
  shadowRoot = this.attachShadow({mode:"closed"});
  internalStyle = document.createElement("style");

  static get observedAttributes() { return ["width","height"] }

  constructor() {
    super();
    const cobblestoneTex = "url(./img/block/cobblestone.png)";
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    wrapper.insertAdjacentHTML("beforeend",`<css-renderer-plane w="16" h="16" z="16" axis="z" bg="${cobblestoneTex}"></css-renderer-plane>`);
    wrapper.insertAdjacentHTML("beforeend",`<css-renderer-plane w="16" h="16" axis="y" bg="${cobblestoneTex}"></css-renderer-plane>`);
    wrapper.insertAdjacentHTML("beforeend",`<css-renderer-plane w="16" h="16" axis="x" bg="${cobblestoneTex}"></css-renderer-plane>`);
    this.shadowRoot.append(this.internalStyle, wrapper);
  }

  connectedCallback() { this.update() }
  attributeChangedCallback() { this.update() }

  update() {
    const widthAttr = this.getAttribute("width") || null;
    const heightAttr = this.getAttribute("height") || null;
    const fontSize = window.getComputedStyle(this).fontSize;
    const width = parseFloat(widthAttr ?? fontSize);
    const height = parseFloat(heightAttr ?? fontSize);
    this.style.display = "inline-block";
    this.style.verticalAlign = "top";
    this.style.position = "relative";
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
    const unit = Math.min(width, height) / 25.2;
    this.internalStyle.textContent = `
      .wrapper {
        display: block;
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        transform: rotateX(${60}deg) rotateZ(${225}deg);
        transform-style: preserve-3d;
      }
      css-renderer-plane {
        --unit: ${unit}px;
        position: absolute; top: 0; left: 0;
        backface-visibility: auto;
        transform-style: preserve-3d;
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
    `;
    // this.style.boxShadow = "0px 0px 2px 4px #0ff";
  }
}

customElements.define("css-renderer", CSSRenderer);
customElements.define("css-renderer-plane", CSSRPlane);
customElements.define("css-renderer-block", CSSRBlock);
