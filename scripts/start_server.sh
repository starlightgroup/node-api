#!/bin/bash
echo "Start NPM"
if [[ "$DEPLOYMENT_GROUP_NAME" == "node-app1" ]]; then
  export REDIS_URL="redis://localhost:6379"
  export NODE_ENV="production"
else
  export NODE_ENV="staging"
fi
cd /opt/node-api
npm start
