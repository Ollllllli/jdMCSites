interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

class Vector2D {
  protected type = "vec2";
  constructor(public x: number, public y: number) {}
  get size() { return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); }
  // get array() { return [this.x, this.y] as const }
  add(vector: Vector2D) {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }
  sub(vector: Vector2D) {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }
  dotProduct(vector: Vector2D) { return this.x * vector.x + this.y * vector.y; }
  unit() {
    return new Vector2D(this.x / this.size, this.y / this.size);
  }
  normal(side: "left" | "right") {
    if (side == "left")
      return new Vector2D(this.y, -this.x);
    else
      return new Vector2D(-this.y, this.x);
  }
}

type Brand<T, BrandType extends string> = T & { [Brand in BrandType]: true }
type ArrayND<T extends number> = { readonly [N in T]: number; } & { readonly length: number; }
type Array2D = ArrayND<0|1>;
type Array3D = ArrayND<0|1|2>;
type Array4D = ArrayND<0|1|2|3>;
type UVVector = Brand<Array2D, "UVVector">;
type PointVector = Brand<Array2D, "PointVector">;

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
  private topLeft: Vector2D;
  private topRight: Vector2D;
  private bottomLeft: Vector2D;
  private bottomRight: Vector2D;
  private n0: Vector2D;
  private n1: Vector2D;
  private n2: Vector2D;
  private n3: Vector2D;
  constructor(shape: Quad<UVVector>) {
    this.topLeft = new Vector2D(shape.topLeft[0], shape.topLeft[1]);
    this.topRight = new Vector2D(shape.topRight[0], shape.topRight[1]);
    this.bottomLeft = new Vector2D(shape.bottomLeft[0], shape.bottomLeft[1]);
    this.bottomRight = new Vector2D(shape.bottomRight[0], shape.bottomRight[1]);
    this.n0 = this.topLeft.sub(this.bottomLeft).normal("right").unit();
    this.n1 = this.bottomRight.sub(this.bottomLeft).normal("left").unit();
    this.n2 = this.topRight.sub(this.bottomRight).normal("left").unit();
    this.n3 = this.topRight.sub(this.topLeft).normal("right").unit();
  }
  project(coord: UVVector): UVVector {
    const coordVector2D = new Vector2D(coord[0], coord[1]);
    const du0 = Math.abs(coordVector2D.sub(this.bottomLeft).dotProduct(this.n0));
    const du1 = Math.abs(coordVector2D.sub(this.topRight).dotProduct(this.n2));
    const dv0 = Math.abs(coordVector2D.sub(this.bottomRight).dotProduct(this.n1));
    const dv1 = Math.abs(coordVector2D.sub(this.topLeft).dotProduct(this.n3));
    const u = du0 / (du0 + du1);
    const v = 1 - (dv0 / (dv0 + dv1)); // 1 - to convert to computer-cartesian
    return [u, v] as any;
  }
}

// NEED TO PREBAKE
class RenderMapper {
  /** The key is a string in format `width:height`. */
  readonly bakedMaps: Map<string, Uint32Array>
    = new Map();
  readonly renderToTextureBakedUV: Map<string, UVVector[]>
    = new Map();

  constructor(readonly renderWidth: number, readonly renderHeight: number) {}

  private uv(point: PointVector, width: number, height: number): UVVector {
    return [point[0] / width, point[1] / height] as any;
  }

  private point(coord: UVVector, width: number, height: number): PointVector {
    return [Math.floor(coord[0] * width), Math.floor(coord[1] * height)] as any;
  }

  pointInRender(coord: UVVector) {
    return this.point(coord, this.renderWidth, this.renderHeight);
  }

  uvInRender(point: PointVector) {
    return this.uv(point, this.renderWidth, this.renderHeight);
  }

  // eventually check that point within shape
  /** Returns a `Uint32Array` mapping each pixel in the render to a pixel in the texture. */
  bake(shape: Quad<UVVector>, texture: ImageData): Uint32Array {
    const textureDim = `${JSON.stringify(shape)}${texture.width}:${texture.height}`;
    const projector = new UVProjector(shape);
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
  private renderMap: RenderMapper;

  constructor(readonly width: number, readonly height: number) {
    this.renderMap = new RenderMapper(width, height);
    this.renderCanvas.width = width;
    this.renderCanvas.height = height;
    this.renderContext.fillStyle = "#fff";
  }

  private _primeRenderer(shape: Quad<UVVector>) {
    this.renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    // prime for drawing, by filling a quad on the canvas
    this.renderContext.beginPath();
    const topLeft = this.renderMap.pointInRender(shape.topLeft);
    const topRight = this.renderMap.pointInRender(shape.topRight);
    const bottomLeft = this.renderMap.pointInRender(shape.bottomLeft);
    const bottomRight = this.renderMap.pointInRender(shape.bottomRight);
    this.renderContext.moveTo(topLeft[0], topLeft[1]);
    this.renderContext.lineTo(bottomLeft[0], bottomLeft[1]);
    this.renderContext.lineTo(bottomRight[0], bottomRight[1]);
    this.renderContext.lineTo(topRight[0], topRight[1]);
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
