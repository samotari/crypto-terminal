# CryptoTerminal

[![Build Status](https://travis-ci.org/samotari/crypto-terminal.svg?branch=master)](https://travis-ci.org/samotari/crypto-terminal) [![Status of Dependencies](https://david-dm.org/samotari/crypto-terminal.svg)](https://david-dm.org/samotari/crypto-terminal)

CryptoTerminal is an open-source terminal application with which merchants can accept in-person cryptocurrency payments.

The high-level goals for the app include:
* Easy to use for both merchants and customers.
* Catch and resolve common gotcha's that happen everyday with most cryptocurrency payment solutions.
* Keep you, the merchant, in control of your funds. It is impossible for your funds to be compromised by the app because it does not have access to your private keys.
* Maintain the highest possible standards for both privacy and security.


## Contributing

If you would like to contribute to the project, the following should help get you started.

* [Requirements](#requirements)
* [Get the Code](#get-the-code)
* [Technical Overview](#technical-overview)
* [Developing with Cryptocurrencies](#developing-with-cryptocurrencies)
  * [Bitcoin](#bitcoin)
  * [Litecoin](#litecoin)
  * [Monero](#monero)
* [Android Development](#android-development)
  * [Create Signed APK](#create-signed-apk)
* [Homepage](#homepage) - [cryptoterminal.eu](https://cryptoterminal.eu)


## Requirements

The following is a list of requirements needed to contribute to this project.

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm). For Windows, use an [installer](https://nodejs.org/en/download/) from the nodejs website.
* [grunt-cli](https://gruntjs.com/getting-started) - `npm install -g grunt-cli`
* For Android development:
  * [cordova](https://cordova.apache.org/#getstarted) - `npm install -g cordova`
  * [Java Development Kit (JDK)](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) version 8 or higher. Use your system's native package manager to install the JDK (if available).
  * [Android SDK](https://developer.android.com/studio/index.html) - On Ubuntu 18.04 or later, it is possible to install Android Studio from Ubuntu Software Sources.
  * [gradle](https://gradle.org/install/)
  * [adb](https://developer.android.com/studio/command-line/adb) - Not required, but is recommended.


## Get the Code

Before continuing, be sure to download and install the project [requirements](#requirements).

To get the project files and start working locally, you should first create a [fork](https://github.com/samotari/crypto-terminal/fork). Then "clone" your fork of the project:
```bash
git clone https://github.com/YOUR_USERNAME/crypto-terminal.git
```
Don't forget to replace `YOUR_USERNAME` with your GitHub username.

```bash
cd crypto-terminal
npm install
grunt
```

Open your browser and navigate to [localhost:3000](http://localhost:3000). You should see the settings screen the first time you open the app.


## Technical Overview

The technology stack includes:
* Standard web technologies (HTML, CSS, JavaScript).
* [Backbone.js](http://backbonejs.org/) - A JavaScript library for developing complex web applications.
* [cordova](https://cordova.apache.org/) - To wrap the web application and create builds for Android, iOS, and other mobile platforms.
* [nodejs](https://nodejs.org/) - As a build tool.

Directory structure explained:
* `build/` - Temporary files used during the build process by Grunt.
* `css/` - CSS source files.
* `exports/` - Files that are processed by browserify, which processes node.js modules so that they can be run in a browser.
* `grunt/` - Grunt task configuration files go here.
* `html/` - Source HTML files go here (templates for example).
* `js/` - JavaScript source files.
* `scripts/` - Miscellaneous script files go here.
* `tasks/` - Custom Grunt tasks live here.
* `third-party/` - Custom builds of third-party libraries.
* `test/` - Automated tests are defined here. This project uses [mocha]().
* `www/` - Final output from the build process. Minified and uglified, this is served in the app once you run it.


## Developing with Cryptocurrencies

This project is focused on working with cryptocurrencies as a payment method. As such, you will need to know some basics about how cryptocurrencies work and how to develop applications that use them.

### Bitcoin

It's a good idea to test your application without risking real money, which is why the [bitcoin testnet](https://en.bitcoin.it/wiki/Testnet) exists.

* [Bitcoin - How it works](https://bitcoin.org/en/how-it-works) - A decent starting point if you are totally new to bitcoin and cryptocurrency.
* Testnet wallet applications:
  * [Mycelium Testnet Wallet](https://play.google.com/store/apps/details?id=com.mycelium.testnetwallet&hl=en) - A mobile testnet wallet application for Android.
  * [Electrum](https://electrum.org/) - A desktop wallet application which can be run in testnet mode from the command line like this: `electrum --testnet`
* "Faucets" can be used to obtain testnet bitcoin:
  * https://faucet.thonguyen.net/btc
  * https://kuttler.eu/en/bitcoin/btc/faucet/
  * https://tpfaucet.appspot.com/

Valid testnet master public key that you can use while developing:
```
tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs
```


### Litecoin

* Testnet wallet applications:
  * [Electrum-LTC](https://electrum-ltc.org/) - A desktop wallet application which can be run in testnet mode from the command line like this: `electrum-ltc --testnet`
* "Faucets" can be used to obtain testnet litecoin:
  * https://faucet.thonguyen.net/ltc
  * https://kuttler.eu/en/bitcoin/ltc/faucet/

Valid testnet master public key that you can use while developing:
```
tpubD6NzVbkrYhZ4YLXXEvJuNSnv3duP7VvCVG2ybxbbfcdJrgfvyfqjLdS2mntHXAr5YVLQvGqSdwa5j62bJhPCGTxX6xXeJp4CtRw494UKG96
```


### Monero

* Testnet wallet applications:
  * [monerujo](https://play.google.com/store/apps/details?id=com.m2049r.xmrwallet&hl=en) - A mobile, light-weight wallet app for Monero. If you are running an older version of Android, you can install the app from an `.apk` that you can download from the project's [GitHub repo](https://github.com/m2049r/xmrwallet).
* "Faucets" can be used to obtain testnet monero:
  * https://dis.gratis/

Sample testnet settings that you can use during development:

Setting | Key | Value
------- | --- | -----
Public Address | `monero.publicAddress` | `9xmkWjzAB8JguD7JvkJxPHgMwkf7VP5v3Z5eSNmRMdoeCEnoVu6eGUbZT3FQ3Q8XrGihNEbb4qGhqHHGK5kWy9chU3URbaF`
Private View Key | `monero.privateViewKey` | `136674e3e6868bb04d4ef2674f97c00166f5f7aa67185bdda97cde8ecfe4f609`


## Android Development

Before continuing, be sure you already have the [requirements](#requirements) for Android development.

Add the Android platform to the project (via cordova):
```bash
cordova platform add android
```
This downloads the cordova plugins which are necessary to build the app for Android devices.


### Create Signed APK

Create your signing key:
```bash
npm run generate-android-signing-key
```

Run the APK build script:
```bash
npm run build-signed-apk
```
If successful, it should have created a new `.apk` file at the following path:
```
./platforms/android/app/build/outputs/apk/release/app-release.apk
```


## Homepage

The homepage is hosted via [GitHub pages](https://pages.github.com/) at [cryptoterminal.eu](https://cryptoterminal.eu/). It is intended as a non-technical entry-point for merchants to find and learn about the app.

The source files for the homepage are located in this project in the `homepage/` directory.

To build and serve the homepage locally:
```bash
grunt homepage
```
Then open your browser to [localhost:3003](http://localhost:3003).

To update the production build, copy the homepage build files from `build/homepage/www` to the `gh-pages` git branch in this project.
