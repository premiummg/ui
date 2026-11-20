import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { readPastedImage } from './richTextImages';

// jsdom has no canvas, so the decode and the pixels are stand-ins: what is under test is which format is chosen.
function stubCanvas(alphaOfFirstPixel: number) {
  vi.stubGlobal('createImageBitmap', async () => ({ width: 400, height: 200, close() {} }));
  const pixels = new Uint8ClampedArray([10, 20, 30, alphaOfFirstPixel, 10, 20, 30, 255]);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage() {},
    getImageData: () => ({ data: pixels }),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation((type?: string) => `data:${type};base64,xx`);
}

describe('readPastedImage format', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  test('an image with transparency stays PNG, so it does not get a black background', async () => {
    stubCanvas(0);
    expect(await readPastedImage(new File(['x'], 'logo.png', { type: 'image/png' }))).toMatch(/^data:image\/png/);
  });

  test('an opaque screenshot is still compressed to JPEG', async () => {
    stubCanvas(255);
    expect(await readPastedImage(new File(['x'], 'shot.png', { type: 'image/png' }))).toMatch(/^data:image\/jpeg/);
  });
});
