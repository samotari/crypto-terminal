# CryptoTerminal

[![Build Status](https://travis-ci.org/Learn-by-doing/crypto-terminal.svg?branch=master)](https://travis-ci.org/Learn-by-doing/crypto-terminal) [![Status of Dependencies](https://david-dm.org/Learn-by-doing/crypto-terminal.svg)](https://david-dm.org/Learn-by-doing/crypto-terminal)

* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [Folder Structure](#folder-structure)
* [Developing with Cryptocurrencies](#developing-with-cryptocurrencies)
  * [Bitcoin](#bitcoin)
    * [Lightning Network](#lightning-network)
  * [Litecoin](#litecoin)
  * [Monero](#monero)

The goal of this project is to create a mobile application that merchants can use to accept cryptocurrency payments in a variety of cryptocurrencies. The focus is on ease-of-use, security, and privacy.

The technology stack includes:
* Standard web technologies (HTML, CSS, JavaScript).
* [Backbone.js](http://backbonejs.org/) - A JavaScript library for developing complex web applications.
* [cordova](https://cordova.apache.org/) - To wrap the web application and create builds for Android, iOS, and other mobile platforms.
* [nodejs](https://nodejs.org/) - As a build tool.


## Requirements

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm). For Windows, use an [installer](https://nodejs.org/en/download/) from the nodejs website.
* [grunt-cli](https://gruntjs.com/getting-started) - `npm install -g grunt-cli`
* For Android development:
  * [cordova](https://cordova.apache.org/#getstarted)
  * [Android SDK](https://developer.android.com/studio/index.html)
  * [gradle](https://gradle.org/install/)


## Getting Started

Before continuing, be sure to download and install the project [requirements](#requirements).

To get the project files and start working locally, you should first create a [fork](https://github.com/Learn-by-doing/crypto-terminal/fork). Then "clone" your fork of the project:
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


## Folder Structure

Introduction to some of the less obvious folders:
* `build/` - Temporary files used during the build process by Grunt.
* `css/` - CSS you should be modifying. Gets processed during the Grunt build.
* `exports/` - Files that are processed by browserify, which processes node.js modules so that they can be run in a browser.
* `grunt/` - Grunt task configuration files go here.
* `html/` - Source HTML files go here (templates for example).
* `scripts/` - Miscellaneous script files go here.
* `tasks/` - Custom Grunt tasks live here.
* `js/` - JavaScript you should be modifying. Gets processed during the Grunt build.
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
Private View Key | `monero.viewPrivateKey` | `136674e3e6868bb04d4ef2674f97c00166f5f7aa67185bdda97cde8ecfe4f609`


### Lightning Network

!! TODO !!
