# Smart Crop Asset Block

## Feature Overview: 

In the standard image transformation from `<a>` tags to `<picture>` tags in EDS, as outlined in [external sources](https://github.com/hlxsites/franklin-assets-selector/blob/ext-images/EXTERNAL_IMAGES.md), smart crop assets from DM with OpenAPI were not considered. This resulted in all assets retaining their original image content, thus losing the point of focus when viewed especially on smaller devices. This newly added block addresses this gap by rendering the appropriate smart crop image that matches the viewport the window is rendered upon.

## Advantages: 

This block enables content authors to embed smart crop assets directly into their EDS pages. It enhances user interaction on smaller screens by maintaining the focus point of the image, ensuring a consistently engaging viewing experience.

## Functionality: 

This block reduces overhead by rendering the appropriate smart crop asset variation based on the viewport dimensions. This ensures that the image displayed is optimized for the device, maintaining focus and enhancing the user experience.

## Usages

### Smart Crop Config file

* For the block to be aware of all available smart crops, users need to create or update the configuration file located at `/blocks/smartcrop-assets/config.json`. A sample config is illustrated below:
```
{
  "smartCrops" : {
    "Small" : {
      "minWidth": 0,
      "maxWidth": 767
    },
    "Medium" : {
      "minWidth": 768,
      "maxWidth": 1023
    },
    "Large" : {
      "minWidth": 1024,
      "maxWidth": 9999
    }
  }
}
```

## Knowledge Base

### Where I need to define the available smart crops?

Can edit/update the config at `/blocks/smartcrop-assets/config.json`

### What if a smart crop being listed in config.json is not availble with server?

In that case, the image will appear as a broken link.

### What if there is no best match from the list of smart crop from config.json?

In that case, the current state of the image will be retained without making any request to smart crop.

### Are the smart crop name case-sensitive?

Yes, the smart crop name is case-sensitive and must match exactly. For example, a smart crop with the name Large must be requested with `?smartcrop=Large`. Using `?smartcrop=LARGE` or `?smartcrop=large` will result in an error.

### How do I generate smart crop for any Asset

Users can create an Image Profile in the AEM author environment with the desired smart crops and ingest the asset. Once processed and approved, the asset becomes available in the Asset Selector to be copied into the target document.

### Why the copied asset from Asset Selector not showing any smart crops by default?

Currently, it's not possible to get the smart crop references directly from the asset picker. Users need to obtain the base URL for any target asset. To get the smart crop variation, they must manually update the smart crop config file to match the presets defined in the Image Profile within the AEM author environment.