/* eslint-env jest */
import { testFunctions } from '../../../blocks/secure-assets/secure-assets.js';

const { isDMOpenAPIUrl } = testFunctions;

describe('isDMOpenAPIUrl', () => {
  it('should match the original /adobe/assets/urn:aaid:aem: pattern', () => {
    const url = 'https://delivery-p66302-e574366.adobeaemcloud.com/adobe/assets/urn:aaid:aem:9ead338d-4ac8-483a-a1cd-a3c7dfe9f437/original/as/article_01_hero.png';
    expect(isDMOpenAPIUrl(url)).toBe(true);
  });

  it('should match when the path prefix before /assets/ is not /adobe', () => {
    const url = 'https://example.com/abcd/def/assets/urn:aaid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(true);
  });

  it('should match a single arbitrary path segment before /assets/', () => {
    const url = 'https://example.com/maruti/assets/urn:aaid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(true);
  });

  it('should match urn:avid:aem: in addition to urn:aaid:aem:', () => {
    const url = 'https://example.com/maruti/assets/urn:avid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(true);
  });

  it('should match when /assets/ appears with no path prefix', () => {
    const url = 'https://example.com/assets/urn:aaid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(true);
  });

  it('should reject urn types other than aaid or avid', () => {
    const url = 'https://example.com/adobe/assets/urn:xyz:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(false);
  });

  it('should reject URLs missing the /assets/ segment', () => {
    const url = 'https://example.com/adobe/foo/urn:aaid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(false);
  });

  it('should reject non-http(s) URLs', () => {
    const url = 'ftp://example.com/adobe/assets/urn:aaid:aem:1234/as/hero.avif';
    expect(isDMOpenAPIUrl(url)).toBe(false);
  });
});
