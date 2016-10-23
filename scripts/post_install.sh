#!/bin/bash

echo "Install dependencies"
rm -rf /opt/node-api/node_modules
cd /opt/node-api
npm i

rm -rf dist
babel . --ignore node_modules --out-dir dist --source-maps

cp ./zip_code_database.csv ./dist/zip_code_database.csv

echo "Change permission to ubuntu:ubuntu"
chown -R ubuntu:ubuntu /opt/node-api
