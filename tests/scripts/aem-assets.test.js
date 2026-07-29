/* eslint-env jest */
import {
  testFunctions,
  decorateExternalImages,
  createOptimizedPictureForDM,
} from '../../scripts/aem-assets.js';

const { appendQueryParams } = testFunctions;
// scripts/aem-assets.test.js

describe('appendQueryParams', () => {
  it('should append allowed query parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map([['rotate', '90'], ['crop', 'center']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?rotate=90&crop=center');
  });

  it('should ignore disallowed query parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map([['foo', 'bar'], ['rotate', '90']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?foo=bar&rotate=90');
  });

  it('should handle empty parameters', () => {
    const url = new URL('https://example.com');
    const params = new Map();
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/');
  });

  it('should handle URLs with existing query parameters', () => {
    const url = new URL('https://example.com?existing=param');
    const params = new Map([['rotate', '90']]);
    const result = appendQueryParams(url, params);
    expect(result).toBe('https://example.com/?existing=param&rotate=90');
  });
});

describe('decorateExternalImages - intrinsic width/height for Approach B anchors', () => {
  const PREFIX = 'https://delivery-p12345-e123456.adobeaemcloud.com/';

  beforeEach(() => {
    document.body.innerHTML = '';
    window.hlx = {
      aemassets: {
        externalImageUrlPrefixes: [[PREFIX, createOptimizedPictureForDM]],
      },
    };
  });

  it('sets width/height on the built img from originalImageWidth/Height and strips them from the delivered URL', () => {
    document.body.innerHTML = `<div id="main"><a href="${PREFIX}adobe/assets/urn:aaid:aem:123/as/photo.jpg?originalImageWidth=800&originalImageHeight=600">a photo</a></div>`;
    const main = document.getElementById('main');

    decorateExternalImages(main);

    const img = main.querySelector('picture img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('width')).toBe('800');
    expect(img.getAttribute('height')).toBe('600');
    expect(img.getAttribute('src')).not.toMatch(/originalImage(Width|Height)/);
    main.querySelectorAll('picture source').forEach((source) => {
      expect(source.getAttribute('srcset')).not.toMatch(/originalImage(Width|Height)/);
    });
  });

  it('does not set width/height when neither is present on the anchor href', () => {
    document.body.innerHTML = `<div id="main"><a href="${PREFIX}adobe/assets/urn:aaid:aem:123/as/photo.jpg">a photo</a></div>`;
    const main = document.getElementById('main');

    decorateExternalImages(main);

    const img = main.querySelector('picture img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('width')).toBeNull();
    expect(img.getAttribute('height')).toBeNull();
  });

  it('skips setting width/height when Smart Crop applies to the image', () => {
    window.hlx.aemassets.smartCrops = { mobile: { minWidth: 0, maxWidth: 900 } };
    document.body.innerHTML = `<div id="main" class="smartcrop"><a href="${PREFIX}adobe/assets/urn:aaid:aem:123/original/as/photo.jpg?originalImageWidth=800&originalImageHeight=600">a photo</a></div>`;
    const main = document.getElementById('main');

    decorateExternalImages(main);

    const img = main.querySelector('picture img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('width')).toBeNull();
    expect(img.getAttribute('height')).toBeNull();
    // still stripped from the delivered URL even when Smart Crop skips the attributes
    expect(img.getAttribute('src')).not.toMatch(/originalImage(Width|Height)/);
  });
});
