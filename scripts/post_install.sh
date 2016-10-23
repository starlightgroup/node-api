#!/bin/bash

if [[ "$DEPLOYMENT_GROUP_NAME" == "node-app1" ]]; then
  export NODE_ENV="production"
else
  export NODE_ENV="staging"
fi

echo "Install dependencies"
rm -rf /opt/node-api/node_modules
cd /opt/node-api
npm i

echo "Change permission to ubuntu:ubuntu"
chown -R ubuntu:ubuntu /opt/node-api
