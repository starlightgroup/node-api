#!/bin/bash
echo "Start NPM"
if [[ "$DEPLOYMENT_GROUP_NAME" == "node-app1" ]]; then
  export REDIS_URL="redis://prod-redis-01.rcanzp.ng.0001.use1.cache.amazonaws.com:6379"
fi
cd /opt/node-api
npm start
