#!/bin/bash

echo "Install dependencies"
rm -rf /opt/node-api/node_modules
cd /opt/node-api
npm i

echo "Change permission to ubuntu:ubuntu"
chown -R ubuntu:ubuntu /opt/node-api
