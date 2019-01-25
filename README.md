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
npm run android-generate-signing-key
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
* Recommended wallet applications:
  * [Coinomi](https://www.coinomi.com/downloads/) - A mobile wallet application for Android and iOS. Supports testnet bitcoin.
  * [Electrum](https://electrum.org/) - A desktop wallet application which can be run in testnet mode from the command line like this: `electrum --testnet`. Supports legacy and segwit (backwards compatible and bech32) addresses.
* "Faucets" can be used to obtain testnet bitcoin:
  * https://faucet.thonguyen.net/btc
  * https://kuttler.eu/en/bitcoin/btc/faucet/
  * https://tpfaucet.appspot.com/


### Litecoin

Litecoin is very similar to Bitcoin but with one key difference: blocks are mined about every 2.5 minutes instead of once every 10 minutes. This means that transactions are confirmed more quickly and fees are lower. To learn more about Litecoin you can check [the official project website](https://litecoin.org/).

* Recommended wallet applications:
  * [Coinomi](https://www.coinomi.com/downloads/) - A mobile wallet application for Android and iOS.
  * [Electrum-LTC](https://electrum-ltc.org/) - A desktop wallet application which can be run in testnet mode from the command line like this: `electrum-ltc --testnet`. Supports legacy and segwit (backwards compatible and bech32) addresses.
* "Faucets" can be used to obtain testnet litecoin:
  * http://testnet.litecointools.com/
  * https://faucet.xblau.com/


### Monero

Monero is a cryptocurrency focused on privacy and censorship-resistance. You can learn more about Monero on [the official project website](https://www.getmonero.org/get-started/what-is-monero/).
* Recommended wallet applications:
  * [Official Monero Desktop Wallet](https://ww.getmonero.org/downloads/)
  * [monerujo](https://play.google.com/store/apps/details?id=com.m2049r.xmrwallet&hl=en) - A mobile, light-weight wallet app for Monero. If you are running an older version of Android, you can install the app from an `.apk` that you can download from the project's [GitHub repo](https://github.com/m2049r/xmrwallet).
  * [Cake Wallet](https://itunes.apple.com/us/app/cake-wallet-for-xmr-monero/id1334702542) - A mobile wallet for iOS.
* "Faucets" can be used to obtain testnet monero:
  * https://dis.gratis/


## License

This project is licensed under the [GNU Affero General Public License v3 (AGPL-3.0)](https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)).
