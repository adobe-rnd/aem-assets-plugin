:construction: This is an early access technology and is still heavily in development. Reach out to us over Slack / Discord before using it.

# AEM Edge Delivery Services Assets Plugin
The AEM Assets Plugin helps you quickly integrate with AEM Assets for your AEM project. It is currently available to customers in collaboration with AEM Engineering via co-innovation VIP Projects. To implement your use cases, please reach out to the AEM Engineering team in the Slack channel dedicated to your project.

## Features
- A collection of blocks to use AEM Assets in Edge Delivery Services frontend code for sites
- Utility functions to delivery assets from AEM Assets

It's key differentiator are:
- 🚀 extremely fast: the library is optimized to reduce load delay, TBT and CLS, and has minimal impact on your Core Web Vitals

## Prerequisites
- You need to have an AEM Assets as a Cloud Service subscription
- You need to have access to Dynamic Media Open API

And you need to have pre-configured:
- AEM Assets Sidekick plugin

## Installation

Add the plugin to your AEM project by running:
```sh
git subtree add --squash --prefix plugins/martech git@github.com:adobe-rnd/aem-martech.git main
```

If you later want to pull the latest changes and update your local copy of the plugin
```sh
git subtree pull --squash --prefix plugins/martech git@github.com:adobe-rnd/aem-martech.git main
```

If you prefer using `https` links you'd replace `git@github.com:adobe-rnd/aem-martech.git` in the above commands by `https://github.com/adobe-rnd/aem-martech.git`.

If the `subtree pull` command is failing with an error like:
```
fatal: can't squash-merge: 'plugins/martech' was never added
```
you can just delete the folder and re-add the plugin via the `git subtree add` command above.

## Installation

Add the plugin to your AEM project by running:
```sh
git subtree add --squash --prefix plugins/aem-assets-blocks git@github.com:adobe-rnd/aem-assets-blocks.git main
```

If you later want to pull the latest changes and update your local copy of the plugin
```sh
git subtree pull --squash --prefix plugins/aem-assets-blocks git@github.com:adobe-rnd/aem-assets-blocks.git main
```

If the `subtree pull` command is failing with an error like:
```
fatal: can't squash-merge: 'plugins/aem-assets-blocks' was never added
```
you can just delete the folder and re-add the plugin via the `git subtree add` command above.

## Project instrumentation

To properly connect and configure the plugin for your project, you'll need to edit both the `aem.js` and `scripts.js` in your AEM project and add a new file `aem-assets-plugin.js` in the `scripts` folder.
