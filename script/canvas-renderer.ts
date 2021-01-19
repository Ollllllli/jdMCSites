/****************** GLOBALS ******************/

const _global_render_var = {

  /** The key is a string in format `renderWidth:renderHeight|textureWidth:textureHeight|shapeKey`.
   * maps a given renderSize and shape, and each index stores the texture index.
   * Appears as differing Uint arrays to save space. */
  bakedMaps: new Map<string, Uint8Array | Uint16Array | Uint32Array>(),

  /** Key is a texture's `width:height`.
   * the float32 is used as u,v,... a pair for each index in the texture */
  bakedTexUVs: new Map<string, Float32Array>(),

  /** Key = `shapeKey` */
  uvProjectors: new Map<string, UVProjector>(),
};

const _global_render_func = {

  uvFromPoint(point: PointVector, width: number, height: number): UVVector {
    return [point[0] / width, point[1] / height] as any;
  },

  pointFromUV(coord: UVVector, width: number, height: number): PointVector {
    return [Math.abs(Math.floor(coord[0] * width)), Math.abs(Math.floor(coord[1] * height))] as any;
  },

  /** Returns a `Uint32Array` mapping each pixel in the render to a pixel in the texture. */
  bake({shapeKey, shape, textureSize, renderSize}: {
    shapeKey: string,
    shape: Quad<UVVector>,
    textureSize: {width: number, height: number},
    renderSize: {width: number, height: number},
  }): Uint32Array {
    const bakeKey =
      `${renderSize.width}:${renderSize.height}|` +
      `${textureSize.width}:${textureSize.height}|` +
      `${shapeKey}`;
    // see if textureMap has already been cached
    if (!_global_render_var.bakedMaps.has(bakeKey)) {
      // see if a uvprojector exists for the shape already
      if (!_global_render_var.uvProjectors.has(shapeKey)) {
        _global_render_var.uvProjectors.set(shapeKey, new UVProjector(shape));
      }
      const projector = _global_render_var.uvProjectors.get(shapeKey)!;
    }
    if (!this.bakedMaps.has(textureDim)) {
      const renderMap = new Uint32Array(this.renderWidth * this.renderHeight);
      const renderTextureUVBake: UVVector[] = [];
      for (let y = 0; y < this.renderHeight; y++) {
        for (let x = 0; x < this.renderWidth; x++) {
          const renderIndex = y * this.renderHeight + x;
          const renderUV = this.uv([x, y] as any, this.renderWidth, this.renderHeight);
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
    const bakedMap = this.bakedMaps.get(textureDim)!;
    return bakedMap;
  },
};

/****************** END GLOBALS ******************/

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

type Brand<T, BrandType extends string> = T & { [Brand in BrandType]: true }
type ArrayND<T extends number> = { [N in T]: number; } & { readonly length: number; }
type Array2D = ArrayND<0|1>;
type Array3D = ArrayND<0|1|2>;
type Array4D = ArrayND<0|1|2|3>;
type UVVector = Brand<Array2D, "UVVector">;
type PointVector = Brand<Array2D, "PointVector">;

interface Vector2D extends Array2D {};
class Vector2D extends Float32Array {
  //array: Array2D & Float32Array = new Float32Array(2) as any;
  constructor(from: Array2D) { super(from); }
  size() {
    return Math.sqrt(Math.pow(this[0], 2) + Math.pow(this[1], 2));
  }
  // get array() { return [this.x, this.y] as const }
  add(vector: Array2D) {
    this[0] = this[0] + vector[0];
    this[1] = this[1] + vector[1];
    return this;
  }
  sub(vector: Array2D) {
    this[0] = this[0] - vector[0];
    this[1] = this[1] - vector[1];
    return this;
  }
  dotProduct(withVector: Array2D) {
    return this[0] * withVector[0] + this[1] * withVector[1];
  }
  unit() {
    const magnitude = this.size();
    this[0] = this[0] / magnitude;
    this[1] = this[1] / magnitude;
    return this;
  }
  normal(side: "left" | "right") {
    const temp = this[0];
    if (side == "left") {
      this[0] = this[1]
      this[1] = -temp;
    }
    else {
      this[0] = -this[1]
      this[1] = temp;
    }
    return this;
  }
}

interface Quad<T extends Array2D = Array2D> {
  topLeft: T;
  topRight: T;
  bottomLeft: T;
  bottomRight: T;
}

/** Returns a subarray referencing the pixel data directly. */
function getPixelIndex(imageData: ImageData, pixelIndex: number) {
  return imageData.data.subarray(4 * pixelIndex, 4 * pixelIndex + 4);
}

/** Returns a subarray referencing the pixel data directly. */
function getPixel(imageData: ImageData, point: PointVector) {
  const pixelIndex = 4 * (imageData.width * point[1] + point[0]);
  return getPixelIndex(imageData, pixelIndex);
}

function setPixel(imageData: ImageData, colour: Uint8ClampedArray, point: PointVector) {
  const pixelIndex = 4 * (imageData.width * point[1] + point[0]);
  imageData.data.set(colour, pixelIndex);
}

async function urlExists(url: string) : Promise<boolean>{
  try {
    const res = await fetch(url, {method: "HEAD"});
    return res.status == 200;
  } catch (e) {
    return false;
  }
}

async function loadTexture(src: string | null) {
  const img = new Image();
  let doMissingTexture = (src == null) ? true : !(await urlExists(src));
  if (doMissingTexture)
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVBhXY/gPhBDwn+E/ABvyA/1Bas9NAAAAAElFTkSuQmCC";
  else
    img.src = src as string;
  await img.decode();
  const cnv = document.createElement("canvas");
  cnv.width = img.width;
  cnv.height = img.height;
  const ctx = cnv.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const textureData = ctx.getImageData(0, 0, img.width, img.height);
  return textureData;
}

class UVProjector {

  private n0
    = new Vector2D(this.shape.topLeft)
    .sub(this.shape.bottomLeft)
    .normal("right")
    .unit();
    
  private n1
    = new Vector2D(this.shape.bottomRight)
    .sub(this.shape.bottomLeft)
    .normal("left")
    .unit();

  private n2
    = new Vector2D(this.shape.topRight)
    .sub(this.shape.bottomRight)
    .normal("left")
    .unit();

  private n3
    = new Vector2D(this.shape.topRight)
    .sub(this.shape.topLeft)
    .normal("right")
    .unit();

  constructor(private shape: Quad<UVVector>){}

  project(coord: UVVector): UVVector {
    // create a coordVec to hold temp values
    const coordVec = new Vector2D(coord);
    // du0 = perpendicular distance to P from left side.
    const du0 = Math.abs(coordVec.sub(this.shape.bottomLeft).dotProduct(this.n0));
    coordVec.set(coord);
    // du1 = perpendicular distance to P from right side.
    const du1 = Math.abs(coordVec.sub(this.shape.topRight).dotProduct(this.n2));
    coordVec.set(coord);
    // dv0 = perpendicular distance to P from bottom side.
    const dv0 = Math.abs(coordVec.sub(this.shape.bottomRight).dotProduct(this.n1));
    coordVec.set(coord);
    // dv1 = perpendicular distance to P from top side.
    const dv1 = Math.abs(coordVec.sub(this.shape.topLeft).dotProduct(this.n3));
    const u = du0 / (du0 + du1);
    const v = dv1 / (dv1 + dv0);
    return [u, v] as any;
  }
}

/** Modifys the pixel directly. */
function brightness(pixel: Uint8ClampedArray, value: number) {
  pixel[0] *= value;
  pixel[1] *= value;
  pixel[2] *= value;
}

type RendererFilter = { brightness: number };
type RendererShader = (colour: RGBA, texCoord: UVVector, screenCoord: UVVector) => RGBA;

class Renderer {
  private renderCanvas: HTMLCanvasElement
    = document.createElement("canvas");
  private renderContext: CanvasRenderingContext2D
    = this.renderCanvas.getContext("2d")!;
  /** The key is a string in format `width:height`. */

  constructor(readonly width: number, readonly height: number) {
    this.renderCanvas.width = width;
    this.renderCanvas.height = height;
    this.renderContext.fillStyle = "#fff";
  }

  private _primeRenderer(shape: Quad<UVVector>) {
    this.renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    // prime for drawing, by filling a quad on the canvas
    this.renderContext.beginPath();
    const topLeft = RenderMapper.pointFromUV(shape.topLeft, this.width, this.height);
    const topRight = RenderMapper.pointFromUV(shape.topRight, this.width, this.height);
    const bottomLeft = RenderMapper.pointFromUV(shape.bottomLeft, this.width, this.height);
    const bottomRight = RenderMapper.pointFromUV(shape.bottomRight, this.width, this.height);
    this.renderContext.moveTo(topLeft[0], topLeft[1]);
    this.renderContext.lineTo(bottomLeft[0], bottomLeft[1]+1);
    this.renderContext.lineTo(bottomRight[0]+1, bottomRight[1]+1);
    this.renderContext.lineTo(topRight[0]+1, topRight[1]);
    this.renderContext.fill();
  }

  renderQuad(
    canvasContext: CanvasRenderingContext2D,
    shape: Quad<UVVector>,
    texture: ImageData,
    filterOrShader?: RendererFilter | RendererShader
  ) {
    const renderToTextureMap = this.renderMap.bake(shape, texture);
    this._primeRenderer(shape);
    const renderData = this.renderContext.getImageData(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    if (typeof filterOrShader == "undefined" || typeof filterOrShader == "object") {
      for (let renderIndex = 0; renderIndex < renderToTextureMap.length; renderIndex++) {
        const textureIndex = renderToTextureMap[renderIndex];
        const renderPixel = getPixelIndex(renderData, renderIndex);
        if (renderPixel[3] > 0) {
          const texturePixel = getPixelIndex(texture, textureIndex);
          renderPixel.set(texturePixel.slice(0,3));
          renderPixel[3] = Math.sqrt(renderPixel[3] * texturePixel[3]);
          if (typeof filterOrShader == "object") {
            brightness(renderPixel, filterOrShader.brightness);
          }
        }
      }
    }
    else if (typeof filterOrShader == "function") {
      const textureUVBake = this.renderMap.renderToTextureBakedUV.get(`${JSON.stringify(shape)}${texture.width}:${texture.height}`)!;
      for (let y = 0; y < this.renderCanvas.height; y++) {
        for (let x = 0; x < this.renderCanvas.width; x++) {
          const renderIndex = y * this.renderCanvas.height + x;
          const renderPixel = getPixelIndex(renderData, renderIndex);
          if (renderPixel[3] > 0) {
            const textureIndex = renderToTextureMap[renderIndex];
            const texturePixel = getPixelIndex(texture, textureIndex);
            const renderUV = this.renderMap.uvInRender([x,y] as any);
            const textureUV = textureUVBake[renderIndex];
            const filteredPixel = filterOrShader({
              r: texturePixel[0],
              g: texturePixel[1],
              b: texturePixel[2],
              a: texturePixel[3],
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



/*
RenderMapper creation

things to store:
render<size> => texture<size>
bake(shape, renderSize, textureSize)

*/