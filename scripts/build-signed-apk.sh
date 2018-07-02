#!/bin/bash

if [ -z "$KEYSTORE_FILENAME" ]; then
	read -p "Key store file name [android.keystore]: " KEYSTORE_FILENAME;
	if [ -z "$KEYSTORE_FILENAME" ]; then
		KEYSTORE_FILENAME="android.keystore";
	fi;
fi;

if [ -z "$KEY_ALIAS" ]; then
	read -p "Key alias [cryptoterminal]: " KEY_ALIAS;
	if [ -z "$KEY_ALIAS" ]; then
		KEY_ALIAS="cryptoterminal";
	fi;
fi;

read -s -p "Enter keystore password: " KEYSTORE_PW; echo '';

read -s -p "Enter key password (RETURN if same as key store): " KEY_PW; echo '';
if [ -z "$KEY_PW" ]; then
	KEY_PW="$KEYSTORE_PW";
fi;

# Must generate a temporary build config file, otherwise the cordova build doesn't work.
# See:
# https://issues.apache.org/jira/browse/CB-13684
tmpBuildConfigFile='../android-build-config.json';
tmpBuildConfigFile="$( cd "$( dirname "$0" )" && pwd )/$tmpBuildConfigFile";

echo "{\"android\": {\"release\": {\"keystore\": \"${KEYSTORE_FILENAME}\", \"storePassword\": \"${KEYSTORE_PW}\", \"alias\": \"${KEY_ALIAS}\", \"password\": \"${KEY_PW}\", \"keystoreType\": \"\"}}}" > $tmpBuildConfigFile;

cordova build android --release --buildConfig $tmpBuildConfigFile;

rm $tmpBuildConfigFile;
