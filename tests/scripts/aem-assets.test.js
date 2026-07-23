/* eslint-env jest */
import { testFunctions } from '../../scripts/aem-assets.js';

const { appendQueryParams, getImageSrcUrlAndAlt } = testFunctions;
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

describe('getImageSrcUrlAndAlt', () => {
  function anchor(href, text, title) {
    const a = document.createElement('a');
    a.setAttribute('href', href);
    if (title !== undefined) a.setAttribute('title', title);
    a.textContent = text ?? '';
    return a;
  }

  it('should use the title attribute when present', () => {
    const a = anchor('https://example.com/asset.jpg', 'link text', 'a title');
    expect(getImageSrcUrlAndAlt(a)).toEqual({ url: 'https://example.com/asset.jpg', alt: 'a title' });
  });

  it('should fall back to the link text when there is no title attribute', () => {
    const a = anchor('https://example.com/asset.jpg', 'blue car with black wheels');
    expect(getImageSrcUrlAndAlt(a)).toEqual({
      url: 'https://example.com/asset.jpg',
      alt: 'blue car with black wheels',
    });
  });

  it('should not use the link text as alt when it is just the raw URL', () => {
    const a = anchor('https://example.com/asset.jpg', 'https://example.com/asset.jpg');
    expect(getImageSrcUrlAndAlt(a)).toEqual({ url: 'https://example.com/asset.jpg', alt: '' });
  });

  it('should return empty alt when there is no title and no text', () => {
    const a = anchor('https://example.com/asset.jpg', '');
    expect(getImageSrcUrlAndAlt(a)).toEqual({ url: 'https://example.com/asset.jpg', alt: '' });
  });
});
