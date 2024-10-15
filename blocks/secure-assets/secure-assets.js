// eslint-disable-next-line import/no-unresolved
import { SignJWT } from 'https://cdnjs.cloudflare.com/ajax/libs/jose/5.2.3/jwt/sign.js';

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

async function reloadImage(img, token) {
  await fetch(img.getAttribute('data-src'), {
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
      img.src = placeholderImg;
      img.closest('picture').querySelectorAll('source').forEach((source) => {
        source.srcset = placeholderImg;
      });
    }
  });
}

function generateJwtAndReloadImg(img, secretKey, userRoles) {
  // Define the secret key
  const secret = new TextEncoder().encode(secretKey);

  // generate expiry for 24 hours
  const timeNow = new Date().getTime();
  const expiry24hrs = new Date(timeNow + 24 * 60 * 60 * 1000).toISOString();

  // Define the JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // Define the JWT claims
  const jwtClaims = {
    roles: userRoles,
    expiry: expiry24hrs,
  };

  // new jose.SignJWT(jwtClaims)
  new SignJWT(jwtClaims)
    .setProtectedHeader(header)
    .sign(secret)
    .then((token) => {
      reloadImage(img, token);
    });
}

function refreshSecuredImages(principalName) {
  securedImages.forEach((img) => {
    const url = new URL(img.getAttribute('data-src'));
    const secretKey = url.host.replace('delivery', 'cm').replace('-cmstg.adobeaemcloud.com', '').replace('.adobeaemcloud.com', '');
    generateJwtAndReloadImg(img, secretKey, principalName);
  });
}

function appendLoginForm() {
  if (document.querySelector('.secure-assets-container .login-form-wrapper')) {
    return;
  }
  const loginForm = `
    <form id='login-form' class='login-form'>
      <div class='input-wrapper'>
        <span>
          <h6>Enter Principal Name : </h6>
        </span>
        <input type='text' name='username' placeholder='Username'>
      </div>
      <button class='button reload-btn' type='submit'>Reload Images!</button>
    </form>
  `;
  const formWrapper = document.createElement('div');
  formWrapper.className = 'login-form-wrapper';
  formWrapper.innerHTML = loginForm;
  document.querySelector('.secure-assets-container')?.prepend(formWrapper);
  formWrapper.querySelector('.reload-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const username = formWrapper.querySelector('input[name=\'username\']').value;
    refreshSecuredImages(username);
  });
}

export default function decorate(block) {
  // Remove or Replace this as per Project usecase
  if (document.querySelector('.secure-assets-container')?.getAttribute('data-include-principal-form') === 'true') {
    appendLoginForm();
  }

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
    if (isDMOpenAPIUrl(src) && await isSecureAsset(src)) {
      // Identify all secure images and push them into securedImages map
      securedImages.push(img);

      img.setAttribute('data-src', src);
      img.src = placeholderImg;
      img.closest('picture').querySelectorAll('source').forEach((source) => {
        // capture the original src and replace the src with placeholder image
        source.setAttribute('data-src', source.srcset);
        source.srcset = placeholderImg;
      });
    }
  });
}
