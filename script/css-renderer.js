// minecraft uses a y_up, -z_forward, (x_right) coord system
// therefore: z=0 front, y=0 bottom, x=0 left
// simple as mc(x,y,z) => css(x,-y,z)
class OnceCache {
    dataStore = new Map();
    get(key) {
        return this.dataStore.get(key);
    }
    has(key) {
        return this.dataStore.has(key);
    }
    add(key, value) {
        if (!this.has(key)) {
            if (value instanceof Function) this.dataStore.set(key, value());
            else this.dataStore.set(key, value);
        }
        return this.get(key);
    }
}
const THE_MISSING_TEXTURE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVBhXY/gPhBDwn+E/ABvyA/1Bas9NAAAAAElFTkSuQmCC";
const __urlCache = new Map();
const __imgBlobCache = new OnceCache();
async function loadUrl(url) {
    const currCache = __urlCache.get(url);
    if (currCache === undefined) {
        __urlCache.set(url, fetch(url, {
            method: "GET"
        }));
    } else if (currCache === null) {
        return currCache;
    } else if (currCache instanceof Response) {
        return currCache;
    }
    const res = await __urlCache.get(url);
    if (res.status == 200) {
        __urlCache.set(url, res);
        return res;
    } else {
        __urlCache.set(url, null);
        return null;
    }
}
const __faceDirections = [
    "north",
    "south",
    "east",
    "west",
    "up",
    "down"
];
class CSSRPlane extends HTMLElement {
    static get observedAttributes() {
        return [
            "w",
            "h",
            "x",
            "y",
            "z",
            "bg",
            "uv",
            "face",
            "brightness"
        ];
    }
    props = {
        w: 16,
        h: 16,
        x: 0,
        y: 0,
        z: 0,
        bg: "",
        brightness: 1,
        uv: [
            0,
            0,
            16,
            16
        ],
        face: "north"
    };
    get w() {
        return this.props.w;
    }
    get h() {
        return this.props.h;
    }
    get x() {
        return this.props.x;
    }
    get y() {
        return this.props.y;
    }
    get z() {
        return this.props.z;
    }
    get uv() {
        return this.props.uv;
    }
    get face() {
        return this.props.face;
    }
    get bg() {
        return this.props.bg;
    }
    get brightness() {
        return this.props.brightness;
    }
    set w(val) {
        this.setAttribute("w", String(val));
    }
    set h(val) {
        this.setAttribute("h", String(val));
    }
    set x(val) {
        this.setAttribute("x", String(val));
    }
    set y(val) {
        this.setAttribute("y", String(val));
    }
    set z(val) {
        this.setAttribute("z", String(val));
    }
    set uv(val) {
        this.setAttribute("uv", val.join(","));
    }
    set face(val) {
        this.setAttribute("face", val);
    }
    set bg(val) {
        this.setAttribute("bg", val);
    }
    set brightness(val) {
        this.setAttribute("brightness", String(val));
    }
    connectedCallback() {
        this.style.display = "inline-block";
        this.style.backgroundSize = "cover";
        this.style.transformOrigin = "0% 100%";
        this.style.bottom = "0";
    }
    async attributeChangedCallback(attr, _, attrValue) {
        if (attr == "w") this.props.w = parseFloat(attrValue || "16");
        else if (attr == "h") this.props.h = parseFloat(attrValue || "16");
        else if (attr == "x") this.props.x = parseFloat(attrValue || "0");
        else if (attr == "y") this.props.y = parseFloat(attrValue || "0");
        else if (attr == "z") this.props.z = parseFloat(attrValue || "0");
        else if (attr == "brightness") this.props.brightness = parseFloat(attrValue || "1");
        else if (attr == "face") {
            const faceAttr = attrValue || "";
            this.props.face = __faceDirections.includes(faceAttr) ? faceAttr : "north";
        } else if (attr == "uv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.uv[0] = parseFloat(uvAttr[0] || "0");
            this.props.uv[1] = parseFloat(uvAttr[1] || "0");
            this.props.uv[2] = parseFloat(uvAttr[2] || "16");
            this.props.uv[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "bg") {
            const bgAttr = attrValue;
            if (!bgAttr) {
                this.props.bg = THE_MISSING_TEXTURE;
            } else {
                const imgRes = await loadUrl(bgAttr);
                if (imgRes == null) {
                    this.props.bg = THE_MISSING_TEXTURE;
                } else {
                    // const imgUri = await __imgBlobCache.add(bgAttr, async()=>{
                    //   const imgBlob = await imgRes.blob();
                    //   return URL.createObjectURL(imgBlob);
                    // });
                    this.props.bg = bgAttr;
                }
            }
        }
        let transform = "";
        transform += "translate3d(";
        transform += `calc( var(--unit) * ${this.x} ),`;
        transform += `calc( var(--unit) * ${-this.y} ),`;
        transform += `calc( var(--unit) * ${this.z} )`;
        transform += `)`;
        if (this.face == "north") transform += "rotateY(-180deg)";
        else if (this.face == "east") transform += "rotateY(90deg)";
        else if (this.face == "west") transform += "rotateY(-90deg)";
        else if (this.face == "up") transform += "rotateY(-180deg)rotateX(90deg)";
        else if (this.face == "down") transform += "rotateX(-90deg)";
        this.style.width = `calc( var(--unit) * ${this.w} )`;
        this.style.height = `calc( var(--unit) * ${this.h} )`;
        this.style.transform = transform;
        this.style.backgroundSize = `${(100 * 16 / (this.uv[2] - this.uv[0])).toFixed(3)}% ${(100 * 16 / (this.uv[3] - this.uv[1])).toFixed(3)}%`;
        this.style.backgroundPositionX = `calc( var(--unit) * ${this.w} * ${(-this.uv[0] / (this.uv[2] - this.uv[0])).toFixed(3)})`;
        this.style.backgroundPositionY = `calc( var(--unit) * ${this.h} * ${(-this.uv[1] / (this.uv[3] - this.uv[1])).toFixed(3)})`;
        this.style.backgroundImage = `url(${this.bg})`;
        if (this.brightness == 1) {
            this.style.filter = "";
            this.style.backgroundBlendMode = "";
        } else {
            this.style.filter = `brightness(${this.brightness})`;
            this.style.backgroundBlendMode = "multiply";
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
    props = {
        x: 0,
        y: 0,
        z: 0
    };
    get x() {
        return this.props.x;
    }
    get y() {
        return this.props.y;
    }
    get z() {
        return this.props.z;
    }
    set x(val) {
        this.setAttribute("x", String(val));
    }
    set y(val) {
        this.setAttribute("y", String(val));
    }
    set z(val) {
        this.setAttribute("z", String(val));
    }
    attributeChangedCallback(attr, _, attrValue) {
        if (attr == "x") this.props.x = parseFloat(this.getAttribute("x") || "0");
        else if (attr == "y") this.props.y = parseFloat(this.getAttribute("y") || "0");
        else if (attr == "z") this.props.z = parseFloat(this.getAttribute("z") || "0");
        this.style.transform = "translate3d(" + `calc(var(--unit) * ${this.x}),` + `calc(var(--unit) * ${-this.y}),` + `calc(var(--unit) * ${this.z})` + ")";
    }
}
class CSSRElement extends HTMLElement {
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
            "noshade",
            "northuv",
            "southuv",
            "eastuv",
            "westuv",
            "upuv",
            "downuv", 
        ];
    }
    //shadowRoot = this.attachShadow({mode: "open"});
    props = {
        from: [
            0,
            0,
            0
        ],
        to: [
            16,
            16,
            16
        ],
        north: null,
        south: null,
        east: null,
        west: null,
        up: null,
        down: null,
        northUV: [
            0,
            0,
            16,
            16
        ],
        southUV: [
            0,
            0,
            16,
            16
        ],
        eastUV: [
            0,
            0,
            16,
            16
        ],
        westUV: [
            0,
            0,
            16,
            16
        ],
        upUV: [
            0,
            0,
            16,
            16
        ],
        downUV: [
            0,
            0,
            16,
            16
        ],
        noshade: true
    };
    get from() {
        return this.props.from;
    }
    get to() {
        return this.props.to;
    }
    get north() {
        return this.props.north;
    }
    get south() {
        return this.props.south;
    }
    get east() {
        return this.props.east;
    }
    get west() {
        return this.props.west;
    }
    get up() {
        return this.props.up;
    }
    get down() {
        return this.props.down;
    }
    get noshade() {
        return this.props.noshade;
    }
    get northUV() {
        return this.props.northUV;
    }
    get southUV() {
        return this.props.southUV;
    }
    get eastUV() {
        return this.props.eastUV;
    }
    get westUV() {
        return this.props.westUV;
    }
    get upUV() {
        return this.props.upUV;
    }
    get downUV() {
        return this.props.downUV;
    }
    set from(val) {
        this.setAttribute("from", val.join(","));
    }
    set to(val) {
        this.setAttribute("to", val.join(","));
    }
    set north(val) {
        this.setAttribute("north", val || "");
    }
    set south(val) {
        this.setAttribute("south", val || "");
    }
    set east(val) {
        this.setAttribute("east", val || "");
    }
    set west(val) {
        this.setAttribute("west", val || "");
    }
    set up(val) {
        this.setAttribute("up", val || "");
    }
    set down(val) {
        this.setAttribute("down", val || "");
    }
    set noshade(val) {
        val ? this.setAttribute("noshade", "") : this.removeAttribute("noshade");
    }
    set northUV(val) {
        this.setAttribute("northuv", val.join(","));
    }
    set southUV(val) {
        this.setAttribute("southuv", val.join(","));
    }
    set eastUV(val) {
        this.setAttribute("eastuv", val.join(","));
    }
    set westUV(val) {
        this.setAttribute("westuv", val.join(","));
    }
    set upUV(val) {
        this.setAttribute("upuv", val.join(","));
    }
    set downUV(val) {
        this.setAttribute("downuv", val.join(","));
    }
    // creates geometry for a cube
    // specifies widths/heights/x/y for each face
    // onyl faces with w/h added to dom
    //
    // takes a lower coord, and upper coord
    origin = new CSSROrigin();
    northFace = new CSSRPlane();
    southFace = new CSSRPlane();
    eastFace = new CSSRPlane();
    westFace = new CSSRPlane();
    upFace = new CSSRPlane();
    downFace = new CSSRPlane();
    constructor(){
        super();
        this.northFace.face = "north";
        this.southFace.face = "south";
        this.eastFace.face = "east";
        this.westFace.face = "west";
        this.upFace.face = "up";
        this.downFace.face = "down";
    }
    connectedCallback() {
        if (!this.contains(this.origin)) this.append(this.origin);
    }
    attributeChangedCallback(attr, _, attrValue) {
        this.props.noshade = this.hasAttribute("noshade");
        if (attr == "north") this.props.north = attrValue || null;
        else if (attr == "south") this.props.south = attrValue || null;
        else if (attr == "east") this.props.east = attrValue || null;
        else if (attr == "west") this.props.west = attrValue || null;
        else if (attr == "up") this.props.up = attrValue || null;
        else if (attr == "down") this.props.down = attrValue || null;
        else if (attr == "from") {
            const fromAttr = (attrValue || "0,0,0").split(",");
            this.props.from[0] = parseFloat(fromAttr[0] || "0");
            this.props.from[1] = parseFloat(fromAttr[1] || "0");
            this.props.from[2] = parseFloat(fromAttr[2] || "0");
        } else if (attr == "to") {
            const toAttr = (attrValue || "0,0,0").split(",");
            this.props.to[0] = parseFloat(toAttr[0] || "16");
            this.props.to[1] = parseFloat(toAttr[1] || "16");
            this.props.to[2] = parseFloat(toAttr[2] || "16");
        } else if (attr == "northuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.northUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.northUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.northUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.northUV[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "southuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.southUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.southUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.southUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.southUV[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "eastuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.eastUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.eastUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.eastUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.eastUV[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "westuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.westUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.westUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.westUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.westUV[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "upuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.upUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.upUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.upUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.upUV[3] = parseFloat(uvAttr[3] || "16");
        } else if (attr == "downuv") {
            const uvAttr = (attrValue || "0,0,16,16").split(",");
            this.props.downUV[0] = parseFloat(uvAttr[0] || "0");
            this.props.downUV[1] = parseFloat(uvAttr[1] || "0");
            this.props.downUV[2] = parseFloat(uvAttr[2] || "16");
            this.props.downUV[3] = parseFloat(uvAttr[3] || "16");
        }
        if (this.noshade) {
            this.northFace.brightness = 1;
            this.southFace.brightness = 1;
            this.eastFace.brightness = 1;
            this.westFace.brightness = 1;
            this.upFace.brightness = 1;
            this.downFace.brightness = 1;
        } else {
            this.northFace.brightness = 11 / 15;
            this.southFace.brightness = 11 / 15;
            this.eastFace.brightness = 9 / 15;
            this.westFace.brightness = 9 / 15;
            this.upFace.brightness = 15 / 15;
            this.downFace.brightness = 7 / 15;
        }
        if (this.to[0] - this.from[0] > 0 && this.to[1] - this.from[1]) {
            this.northFace.w = this.to[0] - this.from[0];
            this.northFace.h = this.to[1] - this.from[1];
            this.northFace.x = this.to[0];
            this.northFace.y = this.from[1];
            this.northFace.z = this.from[2];
            this.southFace.w = this.to[0] - this.from[0];
            this.southFace.h = this.to[1] - this.from[1];
            this.southFace.x = this.from[0];
            this.southFace.y = this.from[1];
            this.southFace.z = this.to[2];
            this.northFace.bg = this.north || "";
            this.southFace.bg = this.south || "";
            this.northFace.uv = this.northUV;
            this.southFace.uv = this.southUV;
            if (!this.origin.contains(this.northFace)) this.origin.appendChild(this.northFace);
            if (!this.origin.contains(this.southFace)) this.origin.appendChild(this.southFace);
        } else {
            this.northFace.remove();
            this.southFace.remove();
        }
        if (this.to[1] - this.from[1] > 0 && this.to[2] - this.from[2] > 0) {
            this.eastFace.w = this.to[2] - this.from[2];
            this.eastFace.h = this.to[1] - this.from[1];
            this.eastFace.x = this.to[0];
            this.eastFace.y = this.from[1];
            this.eastFace.z = this.to[2];
            this.westFace.w = this.to[2] - this.from[2];
            this.westFace.h = this.to[1] - this.from[1];
            this.westFace.x = this.from[0];
            this.westFace.y = this.from[1];
            this.westFace.z = this.from[2];
            this.eastFace.bg = this.east || "";
            this.westFace.bg = this.west || "";
            this.eastFace.uv = this.eastUV;
            this.westFace.uv = this.westUV;
            if (!this.origin.contains(this.eastFace)) this.origin.appendChild(this.eastFace);
            if (!this.origin.contains(this.westFace)) this.origin.appendChild(this.westFace);
        } else {
            this.eastFace.remove();
            this.westFace.remove();
        }
        if (this.to[0] - this.from[0] > 0 && this.to[2] - this.from[2] > 0) {
            this.upFace.w = this.to[0] - this.from[0];
            this.upFace.h = this.to[2] - this.from[2];
            this.upFace.x = this.to[0];
            this.upFace.y = this.to[1];
            this.upFace.z = this.from[2];
            this.downFace.w = this.to[0] - this.from[0];
            this.downFace.h = this.to[2] - this.from[2];
            this.downFace.x = this.from[0];
            this.downFace.y = this.from[1];
            this.downFace.z = this.from[2];
            this.upFace.bg = this.up || "";
            this.downFace.bg = this.down || "";
            this.upFace.uv = this.upUV;
            this.downFace.uv = this.downUV;
            if (!this.origin.contains(this.upFace)) this.origin.appendChild(this.upFace);
            if (!this.origin.contains(this.downFace)) this.origin.appendChild(this.downFace);
        } else {
            this.upFace.remove();
            this.downFace.remove();
        }
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
        this.rootOrigin.x = -8;
        this.rootOrigin.y = -8;
        this.rootOrigin.z = -8;
        this.wrapper.append(this.rootOrigin);
        this.shadowRoot.append(this.internalStyle, this.wrapper);
    }
    attributeChangedCallback(attr, _, attrValue) {
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
        const unit = (Math.min(width, height) / 16).toFixed(3);
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
