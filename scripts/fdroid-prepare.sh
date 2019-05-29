#!/usr/bin/env sh

# abort on errors
set -e

git checkout master

# build
npm run build
# compile files required by fdroid
npm run prepare:fdroid

git branch -D fdroid
git checkout -b fdroid

# adds files required by fdroid
git add -f platforms/android/

# commit
git commit -m "adds files required for fdroid repository"

git push -f -u origin fdroid
