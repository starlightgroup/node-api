// trace.config.js
import config from './server-config';
import util from 'util';

module.exports = {
  serviceName: util.format('nodejs - %s', config.ENV),
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4OTMxMmYzZmRjNGYwMDAwMWIwMDFlYiIsImlhdCI6MTQ4NjAzMzY1MX0.yk1v5JRIRNMA34zZnRemRbnOFluKmusXNc9K00nhJ-g'
};
