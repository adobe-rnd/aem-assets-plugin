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
 * function to decorate the images with smartcrop
 */
function decorateSmartCrop() {
  // capture the current window width
  const windowWidth = window.innerWidth;

  // loop through all the images and check if the current crop is valid for the current window size
  smartcropImages.forEach(async (img) => {
    let currentCropValid = false;
    const url = new URL(img.src);
    const currentCrop = url.searchParams.get('smartcrop');
    let bestCrop;
    if (currentCrop) {
      const crop = config.smartCrops[currentCrop];
      if (crop) {
        // check if the crop is valid for the current window size
        if (crop.minWidth <= windowWidth && crop.maxWidth >= windowWidth) {
          currentCropValid = true;
        }
      }
    }

    // if the crop is not valid, find the next best crop
    if (!currentCropValid) {
      bestCrop = Object.entries(config.smartCrops)
        .find(([, crop]) => crop.minWidth <= windowWidth && crop.maxWidth >= windowWidth)?.[0];
    }

    // transform the image URL to use the new crop
    if (bestCrop && bestCrop !== currentCrop) {
      url.searchParams.set('smartcrop', bestCrop);
      img.src = url.toString();
      img.closest('picture').querySelectorAll('source').forEach((source) => {
        const sourceUrl = new URL(source.srcset);
        sourceUrl.searchParams.set('smartcrop', bestCrop);
        source.srcset = sourceUrl.toString();
      });
    }
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
      smartcropImages.push(img);
    }
  });

  decorateSmartCrop();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      decorateSmartCrop();
    }, 200);
  });
}
