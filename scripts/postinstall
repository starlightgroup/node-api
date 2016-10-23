#!/bin/sh

rm -rf dist


# transpile and move all js files to dist folder
babel . --ignore node_modules --out-dir dist --source-maps

cp ./zip_code_database.csv ./dist/zip_code_database.csv

#if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "staging" ]; then
  # snyk auth $SNYK_TOKEN
  # snyk monitor
#else
#  snyk test
#fi
