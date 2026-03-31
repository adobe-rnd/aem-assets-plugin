# Video Smart Crop Asset Block

## Feature Overview: 

The standard [Embed block's](https://www.aem.live/developer/block-collection) responsive player sizing can diminish the impact of Dynamic Media's video smart cropping.  Because the player scales with the viewport, the cropped video's focal point can be lost, particularly on smaller devices in portrait mode.  This often results in videos reverting to their original, uncropped dimensions, negating the benefits of smart cropping.  This new functionality addresses this issue by enabling a fixed-height video player, customizable per viewport, that preserves the smart crop's focal point across all devices.

## Advantages: 

This functionality ensures consistent video smart crop focus across all devices, enhancing user engagement, especially on smaller screens.

## Functionality: 

This block reduces overhead by rendering the appropriate video smart crop variation based on viewport dimensions, maintaining focus and enhancing the user experience.

## Usages

The Video Smart Crop use case seamlessly integrates with the Embed block.  Users can customize the player height by defining `window.hlx.aemassets.videosmartcrop.height`.

## Knowledge Base

### Where I need to define the video smart crop player height?

set the `window.hlx.aemassets.videosmartcrop.height` value to any desired value. Default value is 44rem.

### How do I generate video smart crop for any Asset

refer [this](https://experienceleague.adobe.com/en/docs/experience-manager-learn/assets/dynamic-media/video/dynamic-media-smart-crop-video).

### Why the copied asset from Asset Selector not showing any smart crops by default?

Currently, it's not possible to get the smart crop references directly from the asset picker. Users need to obtain the base URL for any target asset through AEM author environment only.

### How do I autoplay the Video smartcrop?

Set the variant as autoplay. Eg -> `Embed (videosmartcrop, autoplay)` 

### How do I mute the Video smartcrop?

Set the variant as autoplay. Eg -> `Embed (videosmartcrop, mute)` 