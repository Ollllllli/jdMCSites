class CSSRBlock extends HTMLElement {
}
class CSSRPlane extends HTMLElement {
    static get observedAttributes() {
        return [
            "w",
            "h",
            "x",
            "y",
            "z",
            "bg",
            "axis"
        ];
    }
    connectedCallback() {
        this.update();
    }
    attributeChangedCallback() {
        this.update();
    }
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
        const axis = this.getAttribute("axis") || "z";
        this.style.display = "inline-block";
        this.style.width = w;
        this.style.height = h;
        this.style.background = bg;
        this.style.backgroundSize = "cover";
        this.style.transform = `translate3d(${x},${y},${z})`;
        switch(axis){
            case "z":
                this.style.transformOrigin = "100% 100%";
                this.style.transform += " rotateZ(180deg)";
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
    shadowRoot = this.attachShadow({
        mode: "closed"
    });
    internalStyle = document.createElement("style");
    static get observedAttributes() {
        return [
            "width",
            "height"
        ];
    }
    constructor(){
        super();
        const cobblestoneTex = "url(./img/block/cobblestone.png)";
        const wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        wrapper.insertAdjacentHTML("beforeend", `<css-renderer-plane w="16" h="16" z="16" axis="z" bg="${cobblestoneTex}"></css-renderer-plane>`);
        wrapper.insertAdjacentHTML("beforeend", `<css-renderer-plane w="16" h="16" axis="y" bg="${cobblestoneTex}"></css-renderer-plane>`);
        wrapper.insertAdjacentHTML("beforeend", `<css-renderer-plane w="16" h="16" axis="x" bg="${cobblestoneTex}"></css-renderer-plane>`);
        this.shadowRoot.append(this.internalStyle, wrapper);
    }
    connectedCallback() {
        this.update();
    }
    attributeChangedCallback() {
        this.update();
    }
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
        this.internalStyle.textContent = `\n      .wrapper {\n        display: block;\n        position: absolute;\n        bottom: 0;\n        left: 50%;\n        width: 0;\n        height: 0;\n        transform: rotateX(${60}deg) rotateZ(${225}deg);\n        transform-style: preserve-3d;\n      }\n      css-renderer-plane {\n        --unit: ${unit}px;\n        position: absolute; top: 0; left: 0;\n        backface-visibility: auto;\n        transform-style: preserve-3d;\n        image-rendering: -moz-crisp-edges;\n        image-rendering: -webkit-crisp-edges;\n        image-rendering: pixelated;\n        image-rendering: crisp-edges;\n      }\n    `;
    }
}
customElements.define("css-renderer", CSSRenderer);
customElements.define("css-renderer-plane", CSSRPlane);
customElements.define("css-renderer-block", CSSRBlock);
