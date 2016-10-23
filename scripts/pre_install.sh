#!/bin/bash
echo "Install dependencies"

export API_DIR="/opt/node-api"
if [[ "$DEPLOYMENT_GROUP_NAME" == "node-app1" ]]; then
  export NODE_ENV="production"
else
  export NODE_ENV="staging"
fi

npm i -g babel

if [[ -d "${API_DIR}" ]]; then
  rm -rf "${API_DIR}"
fi
mkdir -vp "${API_DIR}"
