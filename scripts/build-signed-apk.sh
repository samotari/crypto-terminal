#!/bin/bash

read -s -p "Password for key store:" KEYSTORE_PW;
echo '';
read -s -p "Password for signing key:" SIGNING_KEY_PW;
echo '';

# Must generate a temporary build config file, otherwise the cordova build doesn't work.
# See:
# https://issues.apache.org/jira/browse/CB-13684
tmpBuildConfigFile='../android-build-config.json';
tmpBuildConfigFile="$( cd "$( dirname "$0" )" && pwd )/$tmpBuildConfigFile";

echo "{\"android\": {\"release\": {\"keystore\": \"android.keystore\", \"storePassword\": \"${KEYSTORE_PW}\", \"alias\": \"cryptoTerminalKey\", \"password\": \"${SIGNING_KEY_PW}\", \"keystoreType\": \"\"}}}" > $tmpBuildConfigFile;

cordova build android --release --buildConfig $tmpBuildConfigFile;

rm $tmpBuildConfigFile;
