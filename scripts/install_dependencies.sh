#!/bin/bash
echo "Install dependencies"
if [[ "$DEPLOYMENT_GROUP_NAME" == "node-app1" ]]; then
  export NODE_ENV="production"
else
  export NODE_ENV="staging"
fi
npm i
