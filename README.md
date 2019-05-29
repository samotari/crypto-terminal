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
  * [Android](#android)
    * [Running on Android (VM)](#running-on-android-vm)
    * [Running on Android (Device)](#running-on-android-device)
    * [Create Signed APK](#create-signed-apk)
    * [Prepare F-Droid Release](#prepare-f-droid-release)
* [Developing with Cryptocurrencies](#developing-with-cryptocurrencies)
  * [Bitcoin](#bitcoin)
  * [Litecoin](#litecoin)
* [License](#license)


## Requirements

The following is a list of requirements needed to contribute to this project.

* [nodejs](https://nodejs.org/) - For Linux and Mac install node via [nvm](https://github.com/creationix/nvm).
* [make](https://www.gnu.org/software/make/)
* For Android development:
  * [Java Development Kit (JDK)](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) version 8 or higher. Use your system's native package manager to install the JDK (if available).
  * [Android SDK](https://developer.android.com/studio/index.html) - On Ubuntu 18.04 or later, it is possible to install Android Studio from Ubuntu Software Sources.
  * [gradle](https://gradle.org/install/)
  * [adb](https://developer.android.com/studio/command-line/adb) - Not required, but is recommended.


## Getting Started

Before continuing, be sure you already have the project's [requirements](#requirements).

Download the project files via git:
```bash
git clone https://github.com/samotari/crypto-terminal.git
```

Install the project's dependencies:
```bash
cd crypto-terminal
npm install
```

Build the application files:
```bash
npm run build
```

### Android

Before installing and running the app on Android, you must prepare the Android platform with cordova:
```bash
npm run prepare:android
```
This downloads the cordova plugins which are necessary to build the app for Android devices.

#### Running on Android (VM)

Run the following command to check to see if there are any available Android virtual devices:
```bash
adb devices
```

Install and run the app on the virtual device with the following command:
```bash
npm run android-vm
```

#### Running on Android (Device)

To install and run the app on an Android device, you must first:
* [Enable developer mode](https://developer.android.com/studio/debug/dev-options) on the device.
* Enable USB debugging

Once developer mode and USB debugging are enabled, connect the device to your computer via USB. Run the following command to check to see if your computer is authorized:
```bash
adb devices
```

Install and run the app on the device: with the following command
```bash
npm run android
```

#### Create Signed APK

Create your signing key:
```bash
npm run android-generate-signing-key
```

Build a production APK:
```bash
npm run build:prod && npm run build:apk
```
If successful, it should have created a new `.apk` file at the following path:
```
./platforms/android/app/build/outputs/apk/release/app-release.apk
```

To install the newly created APK onto an Android device:
```bash
adb install ./platforms/android/app/build/outputs/apk/release/app-release.apk
```
* You may need to run `adb devices` before the above command.
* And if the app is already installed on the device, you will need to use the `-r` flag to reinstall it.


### Prepare F-Droid Release

F-Droid requires the Android platform files (built by Cordova) in order to build an APK. This repository contains a special branch specifically for F-Droid - the branch contains the platform files from the latest, stable release.

After making a release of the app, the F-Droid branch must be updated as well. Run the following script to do this:
```bash
npm run release:fdroid
```
Note that write access for this repostiory is required.


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


## License

This project is licensed under the [GNU Affero General Public License v3 (AGPL-3.0)](https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)).
