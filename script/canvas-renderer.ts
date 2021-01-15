interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Quad<T extends Vector2D = Vector2D> {
  topLeft: T;
  topRight: T;
  bottomLeft: T;
  bottomRight: T;
}

class Vector2D {
  protected type = "vec2";
  constructor(public x: number, public y: number) {}
  get size() { return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); }
  get array() { return [this.x, this.y] as const }
  add(vector: Vector2D) { return new Vector2D(this.x + vector.x, this.y + vector.y); }
  sub(vector: Vector2D) { return new Vector2D(this.x - vector.x, this.y - vector.y); }
  dotProduct(vector: Vector2D) { return this.x * vector.x + this.y * vector.y; }
  unit() { return new Vector2D(this.x / this.size, this.y / this.size); }
  normal(side: "left" | "right") {
    if (side == "left") return new Vector2D(-this.y, this.x);
    else return new Vector2D(this.y, -this.x);
  }
}
class UVCoord extends Vector2D { protected type = "uv" }
class Point extends Vector2D { protected type = "point" }

class UVMap {
  constructor(public size: {width: number, height: number}) {}
  uv(point: Point) { return new UVCoord(point.x / this.size.width, point.y / this.size.height); }
  point(uv: UVCoord) { return new Point(Math.floor(uv.x * this.size.width), Math.floor(uv.y * this.size.height)); }
}

function uvProjection(shape: Quad<UVCoord>, coord: UVCoord) {
  const n0 = shape.topLeft.sub(shape.bottomLeft).normal("right").unit();
  const n1 = shape.bottomRight.sub(shape.bottomLeft).normal("left").unit();
  const n2 = shape.topRight.sub(shape.bottomRight).normal("left").unit();
  const n3 = shape.topRight.sub(shape.topLeft).normal("right").unit();
  const du0 = Math.abs(coord.sub(shape.bottomLeft).dotProduct(n0));
  const du1 = Math.abs(coord.sub(shape.topRight).dotProduct(n2));
  const dv0 = Math.abs(coord.sub(shape.bottomRight).dotProduct(n1));
  const dv1 = Math.abs(coord.sub(shape.topLeft).dotProduct(n3));
  const u = du0 / (du0 + du1);
  const v = 1 - (dv0 / (dv0 + dv1)); // 1 - to convert to computer-cartesian
  return new UVCoord(u, v);
}

function getPixel(imageData: ImageData, point: Point) {
  const pixelIndex = 4 * (imageData.width * point.y + point.x);
  return {
    r: imageData.data[pixelIndex],
    g: imageData.data[pixelIndex+1],
    b: imageData.data[pixelIndex+2],
    a: imageData.data[pixelIndex+3],
  };
}

function setPixel(imageData: ImageData, colour: RGBA, point: Point) {
  const pixelIndex = 4 * (imageData.width * point.y + point.x);
  return imageData.data.set([
    colour.r,
    colour.g,
    colour.b,
    colour.a,
  ], pixelIndex);
}

function brightness(colour: RGBA, value: number): RGBA {
  return {
    r: colour.r * value,
    g: colour.g * value,
    b: colour.b * value,
    a: colour.a,
  };
}

async function loadTexture(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const cnv = document.createElement("canvas");
  cnv.width = img.width;
  cnv.height = img.height;
  const ctx = cnv.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const textureData = ctx.getImageData(0, 0, img.width, img.height);
  return textureData;
}

class Renderer {
  private renderCanvas = document.createElement("canvas");
  private renderContext = this.renderCanvas.getContext("2d")!;
  private targetCanvasContext: CanvasRenderingContext2D;
  private renderMap: UVMap;
  constructor(targetCanvas: HTMLCanvasElement) {
    this.targetCanvasContext = targetCanvas.getContext("2d")!;
    this.renderCanvas.width = targetCanvas.width;
    this.renderCanvas.height = targetCanvas.height;
    this.renderMap = new UVMap(this.renderCanvas);
    this.renderContext.fillStyle = "#fff";
  }
  renderQuad(shape: Quad<UVCoord>, texture: ImageData, pixelFilter = (colour: RGBA, coord: UVCoord)=>{return colour}) {
    const textureMap = new UVMap(texture);
    this.renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    // prime for drawing, by filling a quad on the canvas
    this.renderContext.beginPath();
    this.renderContext.moveTo(...this.renderMap.point(shape.topLeft).array);
    this.renderContext.lineTo(...this.renderMap.point(shape.bottomLeft).array);
    this.renderContext.lineTo(...this.renderMap.point(shape.bottomRight).array);
    this.renderContext.lineTo(...this.renderMap.point(shape.topRight).array);
    this.renderContext.fill();
    const renderData = this.renderContext.getImageData(0, 0, this.renderCanvas.width, this.renderCanvas.height);
    for (let y = 0; y < this.renderCanvas.height; y++) {
      for (let x = 0; x < this.renderCanvas.width; x++) {
        const renderXY = new Point(x,y);
        const currentPixel = getPixel(renderData, renderXY);
        if (currentPixel.r > 0) {
          const renderUV = this.renderMap.uv(renderXY);
          const textureUV = uvProjection(shape, renderUV);
          const textureXY = textureMap.point(textureUV);
          const texturePixel = getPixel(texture, textureXY);
          const filteredPixel = pixelFilter({
            r: texturePixel.r,
            g: texturePixel.g,
            b: texturePixel.b,
            a: texturePixel.a * currentPixel.a / 255,
          }, textureUV);
          setPixel(renderData, filteredPixel, renderXY);
        }
      }
    }
    this.renderContext.putImageData(renderData, 0, 0);
    this.targetCanvasContext.drawImage(this.renderCanvas, 0, 0);
  }
}

