// minecraft uses a y_up, -z_forward, (x_right) coord system
// therefore: z=0 front, y=0 bottom, x=0 left
// simple as mc(x,y,z) => css(x,-y,z)
const theMissingTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVBhXY/gPhBDwn+E/ABvyA/1Bas9NAAAAAElFTkSuQmCC";
async function urlExists(url) {
    console.log("urlTest", url);
    try {
        const res = await fetch(url, {
            method: "HEAD"
        });
        return res.status == 200;
    } catch (e) {
        return false;
    }
}
// TODO: do shading with a sun vector.
class CSSRPlane extends HTMLElement {
    static get observedAttributes() {
        return [
            "w",
            "h",
            "x",
            "y",
            "z",
            "bg",
            "face"
        ];
    }
    attrValues = {
    };
    connectedCallback() {
        this.style.display = "inline-block";
        this.style.backgroundSize = "cover";
        this.style.transformOrigin = "0% 100%";
        this.style.bottom = "0";
    }
    attributeChangedCallback(name) {
        this.update(name);
    }
    update(attr) {
        switch(attr){
            case "w":
                this.attrValues.w = `calc(var(--unit) * ${parseFloat(this.getAttribute("w") || "1")})`;
                this.style.width = this.attrValues.w;
                break;
            case "h":
                this.attrValues.h = `calc(var(--unit) * ${parseFloat(this.getAttribute("h") || "1")})`;
                this.style.height = this.attrValues.h;
                break;
            case "x":
                this.attrValues.x = `calc(var(--unit) * ${parseFloat(this.getAttribute("x") || "0")})`;
                break;
            case "y":
                this.attrValues.y = `calc(var(--unit) * ${-parseFloat(this.getAttribute("y") || "0")})`;
                break;
            case "z":
                this.attrValues.z = `calc(var(--unit) * ${parseFloat(this.getAttribute("z") || "0")})`;
                break;
            case "bg":
                this.attrValues.bg = this.getAttribute("bg") || theMissingTexture;
                if (this.attrValues.bg == theMissingTexture) {
                    this.style.backgroundImage = `url(${theMissingTexture})`;
                } else {
                    urlExists(this.attrValues.bg).then((v)=>{
                        if (v) this.style.backgroundImage = `url(${this.getAttribute("bg")})`;
                        else this.style.backgroundImage = `url(${theMissingTexture})`;
                    });
                }
                break;
            case "face":
                this.attrValues.face = this.getAttribute("face") || "north";
                break;
        }
        switch(attr){
            case "x":
            case "y":
            case "z":
            case "face":
                {
                    this.style.transform = `translate3d(${this.attrValues.x},${this.attrValues.y},${this.attrValues.z})`;
                    switch(this.attrValues.face){
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
                break;
        }
    }
}
class CSSROrigin extends HTMLElement {
    static get observedAttributes() {
        return [
            "x",
            "y",
            "z"
        ];
    }
    connectedCallback() {
        this.update();
    }
    attributeChangedCallback() {
        this.update();
    }
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
    cssrElementOrigin = document.createElement("css-renderer-origin");
    attrValues = {
    };
    static get observedAttributes() {
        return [
            "from",
            "to",
            "north",
            "south",
            "east",
            "west",
            "up",
            "down",
            "noshade"
        ];
    }
    constructor(){
        super();
        this.attrValues.to = [
            16,
            16,
            16
        ];
        this.attrValues.from = [
            0,
            0,
            0
        ];
    }
    connectedCallback() {
        this.append(this.cssrElementOrigin);
    }
    attributeChangedCallback(name) {
        this.update(name);
    }
    update(attr) {
        switch(attr){
            case "from":
                this.attrValues.from = (this.getAttribute("from") || "0,0,0").split(",").map(parseFloat);
                break;
            case "to":
                this.attrValues.to = (this.getAttribute("to") || "16,16,16").split(",").map(parseFloat);
                break;
            case "north":
            case "south":
            case "east":
            case "west":
            case "up":
            case "down":
                if (!this[attr + "Face"]) {
                    this[attr + "Face"] = document.createElement("css-renderer-plane");
                    this.cssrElementOrigin.append(this[attr + "Face"]);
                    this[attr + "Face"].setAttribute("face", attr);
                }
                this.attrValues[attr] = this.getAttribute(attr) || "";
                this[attr + "Face"].setAttribute("bg", this.attrValues[attr]);
                break;
            case "noshade":
                this.attrValues.noshade = this.hasAttribute("noshade");
                break;
        }
        // used for shifting for element rotation origin, aswell as general positioning
        // this.cssrElementOrigin.setAttribute("x", String(from[0]));
        // this.cssrElementOrigin.setAttribute("y", String(from[1]));
        // this.cssrElementOrigin.setAttribute("z", String(from[2]));
        this.northFace?.setAttribute("w", String(this.attrValues.to[0] - this.attrValues.from[0]));
        this.northFace?.setAttribute("h", String(this.attrValues.to[1] - this.attrValues.from[1]));
        this.northFace?.setAttribute("x", String(this.attrValues.to[0]));
        this.southFace?.setAttribute("w", String(this.attrValues.to[0] - this.attrValues.from[0]));
        this.southFace?.setAttribute("h", String(this.attrValues.to[1] - this.attrValues.from[1]));
        this.southFace?.setAttribute("z", String(this.attrValues.to[2]));
        this.eastFace?.setAttribute("w", String(this.attrValues.to[2] - this.attrValues.from[2]));
        this.eastFace?.setAttribute("h", String(this.attrValues.to[1] - this.attrValues.from[1]));
        this.eastFace?.setAttribute("x", String(this.attrValues.to[0]));
        this.eastFace?.setAttribute("z", String(this.attrValues.to[2]));
        this.westFace?.setAttribute("w", String(this.attrValues.to[2] - this.attrValues.from[2]));
        this.westFace?.setAttribute("h", String(this.attrValues.to[1] - this.attrValues.from[1]));
        this.westFace?.setAttribute("z", String(this.attrValues.to[2]));
        this.upFace?.setAttribute("w", String(this.attrValues.to[0] - this.attrValues.from[0]));
        this.upFace?.setAttribute("h", String(this.attrValues.to[2] - this.attrValues.from[2]));
        this.upFace?.setAttribute("x", String(this.attrValues.to[0]));
        this.upFace?.setAttribute("z", String(this.attrValues.to[2]));
        this.downFace?.setAttribute("w", String(this.attrValues.to[0] - this.attrValues.from[0]));
        this.downFace?.setAttribute("h", String(this.attrValues.to[2] - this.attrValues.from[2]));
        this.downFace?.setAttribute("x", String(this.attrValues.to[0]));
        this.downFace?.setAttribute("z", String(this.attrValues.to[2]));
    }
}
// show as minecraft models display = gui
class CSSRenderer extends HTMLElement {
    shadowRoot = this.attachShadow({
        mode: "closed"
    });
    internalStyle = document.createElement("style");
    wrapper = document.createElement("css-renderer-wrapper");
    rootOrigin = document.createElement("css-renderer-origin");
    static get observedAttributes() {
        return [
            "width",
            "height",
            "rotate",
            "scale",
            "translate"
        ];
    }
    constructor(){
        super();
        this.rootOrigin.setAttribute("x", "-8");
        this.rootOrigin.setAttribute("y", "-8");
        this.rootOrigin.setAttribute("z", "-8");
        this.wrapper.append(this.rootOrigin);
        this.shadowRoot.append(this.internalStyle, this.wrapper);
    }
    connectedCallback() {
        this.update();
    }
    attributeChangedCallback() {
        this.update();
    }
    update() {
        const fontSize = window.getComputedStyle(this).fontSize;
        const width = parseFloat(this.getAttribute("width") || fontSize);
        const height = parseFloat(this.getAttribute("height") || fontSize);
        const rotateComponents = this.getAttribute("rotate")?.split(",").map((v)=>parseFloat(v)
        ) || [
            0,
            0,
            0
        ];
        const scaleComponents = this.getAttribute("scale")?.split(",").map((v)=>parseFloat(v)
        ) || [
            0,
            0,
            0
        ];
        const translateComponents = this.getAttribute("translate")?.split(",").map((v)=>parseFloat(v)
        ) || [
            0,
            0,
            0
        ];
        const unit = (Math.min(width, height) / 15.75).toFixed(3);
        // set self styling
        this.style.display = "inline-block";
        this.style.verticalAlign = "top";
        this.style.position = "relative";
        this.style.width = `${width}px`;
        this.style.height = `${height}px`;
        this.internalStyle.textContent = `\n      css-renderer-wrapper * { transform-style: preserve-3d; position: absolute; }\n\n      /* used to rotate whole model around centre, and to hold unit variable */\n      css-renderer-wrapper {\n        --unit: ${unit}px;\n        position: absolute;\n        top: 50%; left: 50%;\n        width: 0; height: 0;\n        transform:\n          scaleX(${scaleComponents[0]})\n          scaleY(${scaleComponents[1]})\n          scaleZ(${scaleComponents[2]})\n          rotateX(${-1 * rotateComponents[0]}deg)\n          rotateY(${-1 * rotateComponents[1]}deg)\n          rotateZ(${-1 * rotateComponents[2]}deg)\n          translateX(calc(var(--unit)*${translateComponents[0]}))\n          translateY(calc(var(--unit)*${-translateComponents[1]}))\n          translateZ(calc(var(--unit)*${translateComponents[2]}))\n          ;\n        transform-style: preserve-3d;\n      }\n      css-renderer-plane {\n        image-rendering: -moz-crisp-edges;\n        image-rendering: -webkit-crisp-edges;\n        image-rendering: pixelated;\n        image-rendering: crisp-edges;\n        backface-visibility: hidden;\n      }\n    `;
    }
}
customElements.define("css-renderer", CSSRenderer);
customElements.define("css-renderer-plane", CSSRPlane);
customElements.define("css-renderer-origin", CSSROrigin);
customElements.define("css-renderer-element", CSSRElement);
