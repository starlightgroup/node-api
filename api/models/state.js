import mongoose, { Schema } from 'mongoose';

/**
 * User Schema
 */

const State = new Schema({
  zip: {
    type: String,
    index: true
  },
  type: String,
  primary_city: String,
  acceptable_cities: String,
  unacceptable_cities: String,
  state: String,
  county: String,
  timezone: String,
  area_codes: String,
  latitude: String,
  longitude: String,
  world_region: String,
  country: String,
  decommissioned: String,
  estimated_population: String,
  notes: String
});



export default mongoose.model('state', State);
