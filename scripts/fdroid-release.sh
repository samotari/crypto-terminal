#!/usr/bin/env sh

INITIAL_BRANCH="$(git branch | grep \* | cut -d ' ' -f2)"
cleanup() {
	# undo any changes made to local files tracked by git
	git checkout .
	# return to initial branch
	git checkout $INITIAL_BRANCH
}

# update the local git repo with the latest tags from upstream remote
echo "Fetching latest tags from upstream..."
git fetch upstream

# get the latest version tag
VERSION=$(git describe --match "v[0-9]*" --abbrev=0)

if [ -z "$VERSION" ]; then
	echo "Failed to find latest version tag.";
	exit 1;
fi;

# fdroid version tag name is prefixed with "fdroid-"
FDROID_VERSION="fdroid-$VERSION"

# check if this version has already been published for fdroid
if git rev-parse -q --verify "refs/tags/$FDROID_VERSION" > /dev/null; then
	echo "Version number \"$VERSION\" of this project has already been published for fdroid.";
	exit 1;
fi;

read -p "You are about to publish version \"$VERSION\" for fdroid. Do you want to continue? (y/n) " ANSWER;
if [ "$ANSWER" != "y" ]; then
	echo "Canceled";
	exit;
fi;

# delete fdroid local branch if it already exists
git branch -D fdroid 2>/dev/null

# abort on errors
set -e

# checkout the version tag to a new branch
git checkout tags/$VERSION -b fdroid

PROJECT_DIR=".."
PROJECT_DIR="$( cd "$( dirname "$0" )" && pwd )/$PROJECT_DIR"
BIN="$PROJECT_DIR/node_modules/.bin"
PLATFORMS="$PROJECT_DIR/platforms"
PLUGINS="$PROJECT_DIR/plugins"

# delete existing cordova files
rm -rf $PLATFORMS $PLUGINS

# install dependencies
echo "Installing project dependencies..."
npm install

# build
echo "Running project build..."
npm run build

# ensure that cordova exists
if [ ! -f $BIN/cordova ]; then
	npm install cordova@8.1.2
fi

# prepare android platform files
echo "Preparing android platform files..."
$BIN/cordova prepare android

# add files required by fdroid
git add -f 	$PLATFORMS/android/

# commit
git commit -m "fdroid release $VERSION"

# (force) push changes to upstream/fdroid branch
echo "Pushing changes to fdroid remote branch..."
git push -f -u upstream fdroid

# create fdroid release tag
echo "Creating fdroid release tag..."
git tag -a $FDROID_VERSION -m "fdroid release $VERSION"
git push upstream $FDROID_VERSION

cleanup
echo "Done!"
