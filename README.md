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
```

Open your browser and navigate to [localhost:3000](http://localhost:3000). You should see the settings screen the first time you open the app.


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


## License

This project is licensed under the [GNU Affero General Public License v3 (AGPL-3.0)](https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)).
