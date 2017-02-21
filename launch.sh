#!/usr/bin/env bash

# script used by deploy CI and CD systems made by @Evan

npm install
cp -rf /home/flashlightsforever/source/tacticalsales/ public/

./node_modules/.bin/forever stopall
./node_modules/.bin/forever start app.js