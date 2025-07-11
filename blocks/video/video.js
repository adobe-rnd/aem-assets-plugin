const { decorateIcons, loadScript, loadCSS } = await import(`${window.hlx.codeBasePath}/scripts/aem.js`);

const VIDEO_JS_SCRIPT = `${window.hlx.aemassets?.codeBasePath ?? ''}/blocks/video/videojs/video.min.js`;
const VIDEO_JS_CSS = `${window.hlx.aemassets?.codeBasePath ?? ''}/blocks/video/videojs/video-js.min.css`;
const VIDEO_JS_LOAD_EVENT = 'videojs-loaded';

function getDeviceSpecificVideoUrl(videoUrl) {
  const { userAgent } = navigator;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = (/Safari/i).test(userAgent) && !(/Chrome/i).test(userAgent) && !(/CriOs/i).test(userAgent) && !(/Android/i).test(userAgent) && !(/Edg/i).test(userAgent);

  const manifest = (isIOS || isSafari) ? 'manifest.m3u8' : 'manifest.mpd';
  return videoUrl.replace(/manifest\.mpd|manifest\.m3u8|play/, manifest);
}

function parseConfig(block) {
  const isAutoPlay = block.classList.contains('autoplay');

  if (block.classList.contains('hero')) {
    const posterImage = block.querySelector('picture');
    const videoUrl = block.querySelector('div > div:first-child a').href;
    const title = block.querySelector('h1, h2, h3')?.textContent;
    const description = block.querySelector('div > div:nth-child(2) > p')?.textContent;
    const button = block.querySelector('div > div:nth-child(2) > p:last-child > a');

    return {
      type: 'hero',
      videoUrl: getDeviceSpecificVideoUrl(videoUrl),
      isAutoPlay,
      title,
      description,
      button,
      posterImage,
    };
  }

  if (block.classList.contains('inline')) {
    const cards = [...block.children].map((child) => {
      const posterImage = child.querySelector('picture');
      const videoUrl = child.querySelector('div:first-child a').href;
      const title = child.querySelector('h1, h2, h3')?.textContent;
      const description = child.querySelector('div:nth-child(2) > p')?.textContent;

      return {
        videoUrl: getDeviceSpecificVideoUrl(videoUrl),
        isAutoPlay,
        title,
        description,
        posterImage,
      };
    });

    return {
      type: 'cards',
      cards,
    };
  }

  const videoUrl = block.querySelector('div:first-child a').href;
  const posterImage = block.querySelector('picture');

  return {
    type: 'modal',
    videoUrl: getDeviceSpecificVideoUrl(videoUrl),
    posterImage,
  };
}

function getVideojsScripts() {
  return {
    scriptTag: document.querySelector(`head > script[src="${VIDEO_JS_SCRIPT}"]`),
    cssLink: document.querySelector(`head > link[href="${VIDEO_JS_CSS}"]`),
  };
}

async function waitForVideoJs() {
  return new Promise((resolve) => {
    const { scriptTag, cssLink } = getVideojsScripts();
    const isJsLoaded = scriptTag && scriptTag.dataset.loaded;
    const isCSSLoaded = cssLink && cssLink.dataset.loaded;
    if (isJsLoaded && isCSSLoaded) {
      resolve();
    }

    const successHandler = () => {
      document.removeEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
      resolve();
    };

    document.addEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
  });
}

async function loadVideoJs() {
  const { scriptTag, cssLink } = getVideojsScripts();
  if (scriptTag && cssLink) {
    await waitForVideoJs();
    return;
  }

  await Promise.all([
    loadCSS(VIDEO_JS_CSS),
    loadScript(VIDEO_JS_SCRIPT),
  ]);

  const { scriptTag: jsScript, cssLink: css } = getVideojsScripts();
  jsScript.dataset.loaded = true;
  css.dataset.loaded = true;
  document.dispatchEvent(new Event(VIDEO_JS_LOAD_EVENT));
}

function createPlayButton(container, player) {
  const pauseIcon = document.createElement('span');
  pauseIcon.classList.add('icon');
  pauseIcon.classList.add('icon-pause');

  const playIcon = document.createElement('span');
  playIcon.classList.add('icon');
  playIcon.classList.add('icon-play');

  const button = document.createElement('button');
  button.classList.add('custom-play-button');
  button.addEventListener('click', () => {
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  });

  button.append(pauseIcon);
  button.append(playIcon);

  function updateIcons(isPaused) {
    if (isPaused) {
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      button.setAttribute('aria-label', 'Play video');
    } else {
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
      button.setAttribute('aria-label', 'Pause video');
    }
  }

  player.on('play', () => {
    updateIcons(false);
  });
  player.on('pause', () => {
    updateIcons(true);
  });

  decorateIcons(button, `${window.hlx.aemassets.codeBasePath ?? ''}/blocks/video`);
  updateIcons(player.paused());

  container.append(button);
}

function isImageFormatSupported(format) {
  if (['image/jpeg', 'image/png'].includes(format)) {
    return true;
  }

  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL(format).indexOf(`data:${format}`) === 0;
  }

  return false;
}

function getPosterImage(posterElement) {
  const img = posterElement.querySelector('img');
  const sources = posterElement.querySelectorAll('source');
  if (!sources || !img) {
    return null;
  }

  const supportedSources = [...sources].filter((source) => {
    const format = source.getAttribute('type');
    const media = source.getAttribute('media');
    return isImageFormatSupported(format) && (window.matchMedia(media).matches || !media);
  });

  if (supportedSources.length === 0) {
    return img.src;
  }

  return supportedSources[0].srcset;
}

function setupAutopause(videoElement, player) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        player.play();
      } else {
        player.pause();
      }
    });
  }, {
    threshold: [0.5],
  });

  observer.observe(videoElement);
}

function setupPlayer(url, videoContainer, config) {
  const videoElement = document.createElement('video');
  videoElement.classList.add('video-js');
  videoElement.id = `video-${Math.random().toString(36).substr(2, 9)}`;
  if (config.playsinline || config.autoplay) {
    videoElement.setAttribute('playsinline', '');
  }

  videoContainer.append(videoElement);

  const poster = config.poster ? getPosterImage(config.poster) : null;
  const videojsConfig = {
    ...config,
    preload: poster && !config.autoplay ? 'none' : 'auto',
    poster,
  };

  if (config.autoplay) {
    videojsConfig.muted = true;
    videojsConfig.loop = true;
    videojsConfig.autoplay = true;
  }

  // eslint-disable-next-line no-undef
  const player = videojs(videoElement, videojsConfig);
  player.src(url);

  if (config.hasCustomPlayButton) {
    createPlayButton(videoContainer, player);
  }

  player.ready(() => {
    if (config.autoplay) {
      setupAutopause(videoElement, player);
    }
  });

  return player;
}

async function decorateVideoPlayer(url, videoContainer, config) {
  if (config.posterImage) {
    videoContainer.append(config.posterImage);
  }

  await waitForVideoJs();
  const player = setupPlayer(url, videoContainer, config);
  player.on('loadeddata', () => {
    const posterImage = videoContainer.querySelector('picture');
    if (posterImage) {
      posterImage.style.display = 'none';
    }
  });
}

async function decorateVideoCard(container, config) {
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');

  const article = document.createElement('article');
  article.classList.add('video-card');
  article.append(videoContainer);

  if (config.title || config.description) {
    const content = document.createElement('div');
    content.classList.add('video-card-content');

    if (config.title) {
      const title = document.createElement('h3');
      title.classList.add('video-card-title');
      title.textContent = config.title;
      content.append(title);
    }

    if (config.description) {
      const description = document.createElement('p');
      description.classList.add('video-card-description');
      description.textContent = config.description;
      content.append(description);
    }

    article.append(content);
  }

  container.append(article);

  decorateVideoPlayer(config.videoUrl, videoContainer, {
    autoplay: config.isAutoPlay,
    hasCustomPlayButton: true,
    fill: true,
    posterImage: config.posterImage,
  });
}

async function decorateHeroBlock(block, config) {
  const container = document.createElement('div');
  container.classList.add('video-hero');

  const content = document.createElement('div');
  content.classList.add('video-hero-content');

  if (config.title) {
    const title = document.createElement('h1');
    title.classList.add('video-hero-title');
    title.textContent = config.title;
    content.append(title);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.classList.add('video-hero-description');
    description.textContent = config.description;
    content.append(description);
  }

  if (config.button) {
    config.button.classList.add('video-hero-button');
    content.append(config.button);
  }

  container.append(content);

  block.innerHTML = '';
  block.append(container);

  decorateVideoPlayer(config.videoUrl, container, {
    autoplay: config.isAutoPlay,
    hasCustomPlayButton: true,
    fill: true,
    posterImage: config.posterImage,
  });
}

async function decorateVideoCards(block, config) {
  const gridContainer = document.createElement('ul');
  gridContainer.classList.add('video-card-grid');

  block.innerHTML = '';
  block.append(gridContainer);

  await Promise.all(config.cards.map(async (videoConfig) => {
    const gridItem = document.createElement('li');
    gridItem.classList.add('video-card-grid-item');
    gridContainer.append(gridItem);

    await decorateVideoCard(gridItem, videoConfig);
  }));
}

function closeModal() {
  const dialog = document.querySelector('.video-modal-dialog');
  dialog.querySelector('.video-container').innerHTML = '';

  // eslint-disable-next-line no-use-before-define
  window.removeEventListener('click', handleOutsideClick);
  // eslint-disable-next-line no-use-before-define
  window.removeEventListener('keydown', handleEscapeKey);

  dialog.close();
  document.body.style.overflow = '';
}

function handleOutsideClick(event) {
  const modal = document.querySelector('.video-modal-dialog');
  if (event.target === modal) {
    closeModal();
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

async function openModal(config) {
  await loadVideoJs();

  const dialog = document.querySelector('.video-modal-dialog');
  const container = dialog.querySelector('.video-container');
  setupPlayer(config.videoUrl, container, {
    bigPlayButton: true,
    fluid: true,
    controls: true,
    playsinline: true,
    autoplay: true,
  });

  window.addEventListener('click', handleOutsideClick);
  window.addEventListener('keydown', handleEscapeKey);

  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function createModal() {
  const modal = document.createElement('dialog');
  modal.classList.add('video-modal-dialog');

  const container = document.createElement('div');
  container.classList.add('video-modal');

  const header = document.createElement('div');
  header.classList.add('video-modal-header');

  const closeIcon = document.createElement('span');
  closeIcon.classList.add('icon');
  closeIcon.classList.add('icon-close');
  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.classList.add('video-modal-close');
  closeBtn.append(closeIcon);
  closeBtn.addEventListener('click', () => {
    closeModal();
  });

  header.append(closeBtn);
  decorateIcons(header, `${window.hlx.aemassets.codeBasePath ?? ''}/blocks/video`);

  container.append(header);

  const content = document.createElement('div');
  content.classList.add('video-modal-content');

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');
  content.append(videoContainer);

  container.append(content);
  modal.append(container);
  document.body.append(modal);
}

async function decorateVideoModal(block, config) {
  const container = document.createElement('div');
  container.classList.add('video-component');

  const posterImage = config.posterImage.cloneNode(true);
  const playButton = document.createElement('button');
  playButton.setAttribute('aria-label', 'Play video');
  playButton.classList.add('video-play-button');

  const playIcon = document.createElement('span');
  playIcon.classList.add('icon');
  playIcon.classList.add('icon-play');
  playButton.append(playIcon);
  decorateIcons(playButton, `${window.hlx.aemassets.codeBasePath ?? ''}/blocks/video`);

  playButton.addEventListener('click', async () => {
    await openModal(config);
  });

  container.append(posterImage);
  container.append(playButton);

  block.innerHTML = '';
  block.append(container);

  const hasVideoModal = document.querySelector('.video-modal-dialog');
  if (!hasVideoModal) {
    createModal();
  }
}

export default async function decorate(block) {
  if (typeof window.DELAYED_PHASE !== 'undefined') {
    // DELAYED_PHASE is defined, so hook to delayed-phase
    if (window.DELAYED_PHASE) {
      loadVideoJs();
    } else {
      const delayedPhaseHandler = async () => {
        document.removeEventListener('delayed-phase', delayedPhaseHandler);
        await loadVideoJs();
      };
      document.addEventListener('delayed-phase', delayedPhaseHandler);
    }
  } else {
    // DELAYED_PHASE is not defined, so don't hook to delayed-phase event
    setTimeout(loadVideoJs, 3000);
  }

  const config = parseConfig(block);

  if (config.type === 'hero') {
    await decorateHeroBlock(block, config);
    return;
  }

  if (config.type === 'cards') {
    await decorateVideoCards(block, config);
    return;
  }

  await decorateVideoModal(block, config);
}
