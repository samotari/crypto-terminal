# CryptoTerminal

* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [Folder Structure](#folder-structure)
* [Developing with Cryptocurrencies](#developing-with-cryptocurrencies)
  * [Bitcoin](#bitcoin)
    * [Lightning Network](#lightning-network)
  * [Litecoin](#litecoin)
  * [Monero](#monero)

The goal of this project is to create a mobile application that merchants can use to accept cryptocurrency payments in a variety of cryptocurrencies. The focus will be on ease-of-use, security, and privacy. In the beginning our goal is to support the following cryptocurrencies:
* [Bitcoin](https://bitcoin.org/) with [Lightning Network](http://dev.lightning.community/overview/)
* [Litecoin](https://litecoin.org/)
* [Monero](https://getmonero.org/home)

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
* `/build` - Temporary files used during the build process by Grunt.
* `/css` - CSS you should be modifying. Gets processed during the Grunt build.
* `/exports` - Files that are processed by browserify, which processes node.js modules so that they can be run in a browser.
* `/tasks` - Custom Grunt tasks live here.
* `/js` - JavaScript you should be modifying. Gets processed during the Grunt build.
* `/www` - Final output from the build process. Minified and uglified, this is served in the app once you run it.


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

!! TODO !!


### Lightning Network

!! TODO !!
