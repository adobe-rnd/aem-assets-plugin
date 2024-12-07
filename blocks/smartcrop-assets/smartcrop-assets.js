let config = {};
const smartcropImages = [];

/**
 * to check if given src is a DM OpenAPI URL
 */
function isDMOpenAPIUrl(src) {
  return /^(https?:\/\/(.*)\/adobe\/assets\/urn:aaid:aem:(.*))/gm.test(src);
}

/**
 * loads the config file for smartcrop delivery
 */
async function loadconfigs() {
  try {
    const response = await fetch('/blocks/smartcrop-assets/config.json');

    // Check if the request was successful
    if (!response.ok) {
      console.error(`Error loading config file for smartcrop delivery: ${response.status}`);
    }

    // Parse the JSON content
    config = await response.json();
  } catch {
    console.error('Error loading config file for smartcrop delivery');
  }
}

/**
 * function to adapt the picture tag based on the smartcrop config
 */
function adaptPictureTagToSmartCrop(pictureTag, smartCrops) {
  // if no picture tag or smartCrops provided, return
  if (!pictureTag || !smartCrops) return;

  // Get the base URL and existing parameters from the img tag's src attribute
  const imgTag = pictureTag.querySelector('img');
  const imgSrc = imgTag.getAttribute('src');
  const [baseUrl, params] = imgSrc.split('?');
  const urlParams = new URLSearchParams(params);

  // Remove all existing <source> tags
  while (pictureTag.firstChild && pictureTag.firstChild.nodeName === 'SOURCE') {
    pictureTag.removeChild(pictureTag.firstChild);
  }

  // Add new <source> tags based on smartCrops configuration
  Object.entries(smartCrops).forEach(([key, value]) => {
    const { minWidth, maxWidth } = value;
    const mediaQuery = `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;

    // Update the smartcrop parameter
    urlParams.set('smartcrop', key);
    const newSrcSet = `${baseUrl}?${urlParams.toString()}`;

    const newSource = document.createElement('source');
    newSource.setAttribute('media', mediaQuery);
    newSource.setAttribute('srcset', newSrcSet);
    pictureTag.insertBefore(newSource, pictureTag.firstChild);
  });
}

/**
 * function to decorate the images with smartcrop
 */
function decorateSmartCropImages() {
  // loop through all the potential smart crop images and
  // update their src & srcset based on viewport width
  smartcropImages.forEach(async (img) => {
    adaptPictureTagToSmartCrop(img.closest('picture'), config.smartCrops);
  });
}

export default async function decorate(block) {
  // load the config file and if it fails, do nothing
  await loadconfigs();
  if (config.smartCrops === undefined) {
    console.error('Error loading smartcrop config file');
    return;
  }

  const images = block.querySelectorAll('img');
  images.forEach((img) => {
    if (isDMOpenAPIUrl(img.src)) {
      // if the image is a DM OpenAPI URL, add it to the list of smartcrop images
      smartcropImages.push(img);
    }
  });

  decorateSmartCropImages();
}
