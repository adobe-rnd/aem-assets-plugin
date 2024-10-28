const securedImages = [];
let placeholderImg;

/**
 * to check if given src is a DM OpenAPI URL
 */
function isDMOpenAPIUrl(src) {
  return /^(https?:\/\/(.*)\/adobe\/assets\/urn:aaid:aem:(.*))/gm.test(src);
}

/**
 * to check if given src is a secure asset
 */
async function isSecureAsset(src) {
  let isSecure = false;
  try {
    const response = await fetch(src, { method: 'HEAD' });
    if (response.ok) {
      isSecure = false;
    } else if (response.status === 404) {
      // 404 is thrown by DM OpenAPI if the asset is secure
      isSecure = true;
    }
  } catch {
    isSecure = false;
  }
  return isSecure;
}

/**
 * Replace the image with placeholder image in case of error
 */
function handleImageError(img) {
  img.src = placeholderImg;
  img.closest('picture').querySelectorAll('source').forEach((source) => {
    source.srcset = placeholderImg;
  });
}

/**
 * Try to restore the original image using the token
 * and fallback to placeholder image in case of error
 */
function restoreOriginalImage(img, token) {
  fetch(img.getAttribute('data-original-src'), {
    headers: {
      'x-asset-delivery-token': token,
    },
  }).then(async (resp) => {
    if (resp.status === 200) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result;
        img.setAttribute('src', base64Data);
        img.closest('picture').querySelectorAll('source').forEach((el) => {
          el.setAttribute('srcset', base64Data);
        });
      };
      reader.readAsDataURL(await resp.blob());
    } else {
      handleImageError(img);
    }
  });
}

export default function decorate(block) {
  placeholderImg = document.querySelector('.secure-assets-container')?.getAttribute('data-placeholder-image');

  let images;
  if (document.querySelector('.secure-assets-container')?.getAttribute('data-scan-full-page')) {
    // scan the whole page if asked for
    images = document.querySelectorAll('img');
  } else {
    images = block.querySelectorAll('img');
  }

  images.forEach(async (img) => {
    const src = img.getAttribute('src');
    if (!securedImages.includes(img) && img.getAttribute('data-is-public') !== 'true'
        && isDMOpenAPIUrl(src) && await isSecureAsset(src)) {
      // Identify all secure images and push them into securedImages map
      securedImages.push(img);

      // capture the original src and replace the src with placeholder image
      img.setAttribute('data-original-src', src);
      img.src = placeholderImg;
      img.closest('picture').querySelectorAll('source').forEach((source) => {
        // capture the original src and replace the src with placeholder image
        source.setAttribute('data-original-src', source.srcset);
        source.srcset = placeholderImg;
      });
    } else {
      // required to avoid re-processing the same image whe multiple blocks are there on Page
      img.setAttribute('data-is-public', 'true');
    }
  });

  // Listen for auth-token-available event to restore the original images
  // Refer README.md for more details & examples
  document.addEventListener('auth-token-available', (event) => {
    const token = event.detail;
    securedImages.forEach((img) => {
      if (token) {
        restoreOriginalImage(img, token);
      }
    });
  });
}
