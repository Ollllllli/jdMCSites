class Vector2D {
    type = "vec2";
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    get size() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    // get array() { return [this.x, this.y] as const }
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    sub(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    unit() {
        return new Vector2D(this.x / this.size, this.y / this.size);
    }
    normal(side) {
        if (side == "left") return new Vector2D(this.y, -this.x);
        else return new Vector2D(-this.y, this.x);
    }
}
/** Returns a subarray referencing the pixel data directly. */ function getPixelIndex(imageData, pixelIndex) {
    return imageData.data.subarray(4 * pixelIndex, 4 * pixelIndex + 4);
}
/** Returns a subarray referencing the pixel data directly. */ function getPixel(imageData, point) {
    const pixelIndex = 4 * (imageData.width * point[1] + point[0]);
    return getPixelIndex(imageData, pixelIndex);
}
function setPixel(imageData, colour, point) {
    const pixelIndex = 4 * (imageData.width * point[1] + point[0]);
    imageData.data.set(colour, pixelIndex);
}
async function urlExists(url) {
    try {
        const res = await fetch(url, {
            method: "HEAD"
        });
        return res.status == 200;
    } catch (e) {
        return false;
    }
}
async function loadTexture(src) {
    const img = new Image();
    let doMissingTexture = src == null ? true : !await urlExists(src);
    if (doMissingTexture) img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVBhXY/gPhBDwn+E/ABvyA/1Bas9NAAAAAElFTkSuQmCC";
    else img.src = src;
    await img.decode();
    const cnv = document.createElement("canvas");
    cnv.width = img.width;
    cnv.height = img.height;
    const ctx = cnv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const textureData = ctx.getImageData(0, 0, img.width, img.height);
    return textureData;
}
class UVProjector {
    constructor(shape){
        this.topLeft = new Vector2D(shape.topLeft[0], shape.topLeft[1]);
        this.topRight = new Vector2D(shape.topRight[0], shape.topRight[1]);
        this.bottomLeft = new Vector2D(shape.bottomLeft[0], shape.bottomLeft[1]);
        this.bottomRight = new Vector2D(shape.bottomRight[0], shape.bottomRight[1]);
        this.n0 = this.topLeft.sub(this.bottomLeft).normal("right").unit();
        this.n1 = this.bottomRight.sub(this.bottomLeft).normal("left").unit();
        this.n2 = this.topRight.sub(this.bottomRight).normal("left").unit();
        this.n3 = this.topRight.sub(this.topLeft).normal("right").unit();
    }
    project(coord) {
        const coordVector2D = new Vector2D(coord[0], coord[1]);
        const du0 = Math.abs(coordVector2D.sub(this.bottomLeft).dotProduct(this.n0));
        const du1 = Math.abs(coordVector2D.sub(this.topRight).dotProduct(this.n2));
        const dv0 = Math.abs(coordVector2D.sub(this.bottomRight).dotProduct(this.n1));
        const dv1 = Math.abs(coordVector2D.sub(this.topLeft).dotProduct(this.n3));
        const u = du0 / (du0 + du1);
        const v = 1 - dv0 / (dv0 + dv1); // 1 - to convert to computer-cartesian
        return [
            u,
            v
        ];
    }
}
// NEED TO PREBAKE
class RenderMapper {
    /** The key is a string in format `width:height`. */ bakedMaps = new Map();
    renderToTextureBakedUV = new Map();
    constructor(renderWidth, renderHeight){
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
    }
    uv(point, width, height) {
        return [
            point[0] / width,
            point[1] / height
        ];
    }
    point(coord, width, height) {
        return [
            Math.floor(coord[0] * width),
            Math.floor(coord[1] * height)
        ];
    }
    pointInRender(coord) {
        return this.point(coord, this.renderWidth, this.renderHeight);
    }
    uvInRender(point) {
        return this.uv(point, this.renderWidth, this.renderHeight);
    }
    // eventually check that point within shape
    /** Returns a `Uint32Array` mapping each pixel in the render to a pixel in the texture. */ bake(shape, texture) {
        const textureDim = `${JSON.stringify(shape)}${texture.width}:${texture.height}`;
        const projector = new UVProjector(shape);
        if (!this.bakedMaps.has(textureDim)) {
            const renderMap = new Uint32Array(this.renderWidth * this.renderHeight);
            const renderTextureUVBake = [];
            for(let y = 0; y < this.renderHeight; y++){
                for(let x = 0; x < this.renderWidth; x++){
                    const renderIndex = y * this.renderHeight + x;
                    const renderUV = this.uv([
                        x,
                        y
                    ], this.renderWidth, this.renderHeight);
                    const textureUV = projector.project(renderUV);
                    renderTextureUVBake.push(textureUV);
                    const textureXY = this.point(textureUV, texture.width, texture.height);
                    const textureIndex = textureXY[1] * texture.height + textureXY[0];
                    renderMap[renderIndex] = textureIndex;
                }
            }
            this.bakedMaps.set(textureDim, renderMap);
            this.renderToTextureBakedUV.set(textureDim, renderTextureUVBake);
        }
        const bakedMap = this.bakedMaps.get(textureDim);
        return bakedMap;
    }
}
/** Modifys the pixel directly. */ function brightness(pixel, value) {
    pixel[0] *= value;
    pixel[1] *= value;
    pixel[2] *= value;
}
class Renderer {
    renderCanvas = document.createElement("canvas");
    renderContext = this.renderCanvas.getContext("2d");
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.renderMap = new RenderMapper(width, height);
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.renderContext.fillStyle = "#fff";
    }
    _primeRenderer(shape) {
        this.renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        // prime for drawing, by filling a quad on the canvas
        this.renderContext.beginPath();
        const topLeft = this.renderMap.pointInRender(shape.topLeft);
        const topRight = this.renderMap.pointInRender(shape.topRight);
        const bottomLeft = this.renderMap.pointInRender(shape.bottomLeft);
        const bottomRight = this.renderMap.pointInRender(shape.bottomRight);
        this.renderContext.moveTo(topLeft[0], topLeft[1]);
        this.renderContext.lineTo(bottomLeft[0], bottomLeft[1] + 1);
        this.renderContext.lineTo(bottomRight[0] + 1, bottomRight[1] + 1);
        this.renderContext.lineTo(topRight[0] + 1, topRight[1]);
        this.renderContext.fill();
    }
    renderQuad(canvasContext, shape, texture, filterOrShader) {
        const renderToTextureMap = this.renderMap.bake(shape, texture);
        this._primeRenderer(shape);
        const renderData = this.renderContext.getImageData(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        if (typeof filterOrShader == "undefined" || typeof filterOrShader == "object") {
            for(let renderIndex = 0; renderIndex < renderToTextureMap.length; renderIndex++){
                const textureIndex = renderToTextureMap[renderIndex];
                const renderPixel = getPixelIndex(renderData, renderIndex);
                if (renderPixel[3] > 0) {
                    const texturePixel = getPixelIndex(texture, textureIndex);
                    renderPixel.set(texturePixel.slice(0, 3));
                    renderPixel[3] = Math.sqrt(renderPixel[3] * texturePixel[3]);
                    if (typeof filterOrShader == "object") {
                        brightness(renderPixel, filterOrShader.brightness);
                    }
                }
            }
        } else if (typeof filterOrShader == "function") {
            const textureUVBake = this.renderMap.renderToTextureBakedUV.get(`${JSON.stringify(shape)}${texture.width}:${texture.height}`);
            for(let y = 0; y < this.renderCanvas.height; y++){
                for(let x = 0; x < this.renderCanvas.width; x++){
                    const renderIndex = y * this.renderCanvas.height + x;
                    const renderPixel = getPixelIndex(renderData, renderIndex);
                    if (renderPixel[3] > 0) {
                        const textureIndex = renderToTextureMap[renderIndex];
                        const texturePixel = getPixelIndex(texture, textureIndex);
                        const renderUV = this.renderMap.uvInRender([
                            x,
                            y
                        ]);
                        const textureUV = textureUVBake[renderIndex];
                        const filteredPixel = filterOrShader({
                            r: texturePixel[0],
                            g: texturePixel[1],
                            b: texturePixel[2],
                            a: texturePixel[3]
                        }, textureUV, renderUV);
                        renderPixel[0] = filteredPixel.r;
                        renderPixel[1] = filteredPixel.g;
                        renderPixel[2] = filteredPixel.b;
                        renderPixel[3] = Math.sqrt(filteredPixel.a * renderPixel[3]);
                    }
                }
            }
        }
        this.renderContext.putImageData(renderData, 0, 0);
        canvasContext.drawImage(this.renderCanvas, 0, 0);
    }
}
