# CryptoTerminal

[![Build Status](https://travis-ci.org/samotari/crypto-terminal.svg?branch=master)](https://travis-ci.org/samotari/crypto-terminal) [![Status of Dependencies](https://david-dm.org/samotari/crypto-terminal.svg)](https://david-dm.org/samotari/crypto-terminal)

CryptoTerminal is an open-source terminal application with which merchants can accept in-person cryptocurrency payments.

The high-level goals for the app include:
* Easy to use for both merchants and customers.
* Catch and resolve common gotcha's that happen everyday with most cryptocurrency payment solutions.
* Keep you, the merchant, in control of your funds. It is impossible for your funds to be compromised by the app because it does not have access to your private keys.
* Maintain the highest possible standards for both privacy and security.

If you would like to contribute to the project, the following should help get you started:
* [Requirements](#requirements)
* [Getting Started](#getting-started)
  * [Project Files](#project-files)
  * [Build and Run Web App](#build-and-run-web-app)
  * [Build and Run Android App](#build-and-run-android-app)
  * [Create Signed APK](#create-signed-apk)
* [Developing with Cryptocurrencies](#developing-with-cryptocurrencies)
  * [Bitcoin](#bitcoin)
  * [Litecoin](#litecoin)
  * [Monero](#monero)
* [License](#license)


## Requirements

The following is a list of requirements needed to contribute to this project.

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm).
* [make](https://www.gnu.org/software/make/)
* For Android development:
  * [cordova](https://cordova.apache.org/#getstarted) - `npm install -g cordova`
  * [Java Development Kit (JDK)](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) version 8 or higher. Use your system's native package manager to install the JDK (if available).
  * [Android SDK](https://developer.android.com/studio/index.html) - On Ubuntu 18.04 or later, it is possible to install Android Studio from Ubuntu Software Sources.
  * [gradle](https://gradle.org/install/)
  * [adb](https://developer.android.com/studio/command-line/adb) - Not required, but is recommended.


## Getting Started

Before continuing, be sure you already have the project's [requirements](#requirements).

### Project Files

Download the project files via git:
```bash
git clone https://github.com/samotari/crypto-terminal.git
```

Install the project's dependencies:
```bash
cd crypto-terminal
npm install
```


### Build and Run Web App

To build and then run the app in a browser:
```bash
npm run build && npm run browser
```
Open your browser and navigate to [localhost:3000](http://localhost:3000).


### Build and Run Android App

Add the Android platform to the project (via cordova):
```bash
cordova platform add android
```
This downloads the cordova plugins which are necessary to build the app for Android devices.

To install and run the app on an Android device, you must first:
* [Enable developer mode](https://developer.android.com/studio/debug/dev-options) on the device.
* Enable USB debugging

Once developer mode and USB debugging are enabled, connect the device to your computer via USB. Run the following command to check to see if your computer is authorized:
```bash
adb devices
```

Once authorized, you can build then install and run the app from your computer onto the device:
```bash
npm run build && npm run android
```


### Create Signed APK

Create your signing key:
```bash
npm run generate-android-signing-key
```

Build a production APK:
```bash
npm run build && npm run build:apk
```
If successful, it should have created a new `.apk` file at the following path:
```
./platforms/android/app/build/outputs/apk/release/app-release.apk
```


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


## License

This project is licensed under the [GNU Affero General Public License v3 (AGPL-3.0)](https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)).
