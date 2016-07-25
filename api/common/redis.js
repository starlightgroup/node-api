import redis from '../../config/redis';

'use strict';

/**
 * Sets the value of a key as a string in Redis
 *
 * @param {string} key - the key to store the value at
 * @param {any} value - A JSON serializable value
 * @param {number} [expiresIn] -  optional seconds to wait before deleting this key
 */
export async function setJson (key, value, expiresIn) {
  try {
    // set the key in redis
    redis.set(key, JSON.stringify(value));
    // add expiration in seconds if provided
    if (expiresIn) await redis.expire(key, expiresIn);
  }
  catch(error) {
    console.error(error.stack);
  }
}


/**
 * Returns the parsed JSON for the given key in redis
 * @param {string} key - the key whose value we want to return
 */
export async function getJson (key) {
  try {
    return JSON.parse(await redis.get(key));
  }
  catch(error) {
    console.error(error);
  }
}