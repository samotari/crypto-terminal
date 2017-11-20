# CryptoTerminal

The goal of this project is to create a mobile application that merchants can use to accept cryptocurrency payments in a variety of cryptocurrencies. The focus will be on ease-of-use, security, and privacy. In the beginning our goal is to support the following cryptocurrencies:
* [Bitcoin](https://bitcoin.org/)
* [Litecoin](https://litecoin.org/)
* [Monero](https://getmonero.org/home)

The technology stack will include:
* Standard web technologies (HTML, CSS, JavaScript).
* [Backbone.js](http://backbonejs.org/) - A JavaScript library for developing complex web applications.
* [cordova](https://cordova.apache.org/) - To wrap the web application and create builds for Android, iOS, and other mobile platforms.
* [nodejs](https://nodejs.org/) - As a build tool.


## Requirements

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm). For Windows, use an [installer](https://nodejs.org/en/download/) from the nodejs website.
* [grunt-cli](https://gruntjs.com/getting-started) - `npm install -g grunt-cli`


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

## Project Folder Structure

Introduction to some of the less obvious folders:
* /tasks - custom Grunt tasks live here
* /js - Javascript you should be modifying. Gets processed during the Grunt build
* /css - CSS you should be modifying. Gets processed during the Grunt build
* /build - temporary files used during the build process by Grunt
* /www - output from the build process. Minified and uglified, this is served in the app once you run it

## Developing with Cryptocurrencies

This project is focused on working with cryptocurrencies as a payment method. As such, you will need to know some basics about how cryptocurrencies work and how to develop applications that use them.

### Bitcoin

It's a good idea to test your application without risking real money, which is why the [bitcoin testnet](https://en.bitcoin.it/wiki/Testnet) exists.

* [Bitcoin - How it works](https://bitcoin.org/en/how-it-works) - A decent starting point if you are totally new to bitcoin and cryptocurrency.
* [Testnet Bitcoin Faucet](https://tpfaucet.appspot.com/) - Get testnet bitcoin that you can use for testing purposes.
* [Mycelium Testnet Wallet](https://play.google.com/store/apps/details?id=com.mycelium.testnetwallet&hl=en) - The Mycelium bitcoin wallet for Android, but for Bitcoin's Testnet.

Valid testnet master public key that you can use while developing:
```
tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs
```


## Tests

End-to-end tests are included in the project which allow automated testing (in a real browser) of the application's user interface. The tests use [selenium](http://www.seleniumhq.org/) and [webdriverio](http://webdriver.io/). To run the tests:
```bash
grunt test:e2e
```
Note that selenium requires Java Run-time Environment (JRE).
