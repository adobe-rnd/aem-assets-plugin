/* eslint-env jest */
import { testFunctions } from '../../scripts/aem-assets.js';

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
    expect(result).toBe('https://example.com/?rotate=90');
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

describe('decorateImagesFromAlt', () => {
  it('should decorate images from alt', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <picture>
        <img src="https://example.com/image.jpg" alt='{"deliveryUrl":"https://delivery.com/image.jpg","altText":"Example Image"}'>
      </picture>
    `;
    const { decorateImagesFromAlt } = testFunctions;
    decorateImagesFromAlt(container);
    expect(container.innerHTML).toBe(`
      <picture><source media="(min-width: 600px)" type="image/webp" srcset="https://delivery.com/image.jpg?width=2000"><source type="image/webp" srcset="https://delivery.com/image.jpg?width=750"><source media="(min-width: 600px)" srcset="https://delivery.com/image.jpg?width=2000"><img loading="lazy" alt="Example Image" src="https://delivery.com/image.jpg?width=750"></picture>
    `);
  });
});
