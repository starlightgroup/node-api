#!/usr/bin/env bash

# script used by deploy CI and CD systems made by @Evan
./node_modules/.bin/forever stopall
npm install
npm build
cp -rf /home/flashlightsforever/source/tacticalsales/ ~/source/public/
./node_modules/.bin/forever start index.js