"use strict";

var through = require("through");
var winston = require("winston");

var logger = new winston.Logger({
  transports: [

  ]
});

logger.asStream = function asStream(level){
  return through(function(data){
    logger.log(level, String(data));
  });
};


module.exports = logger;
