import * as redis from '../api/common/redis';
import csv from 'fast-csv';
import fs from 'fs';
const stream = fs.createReadStream("zip_code_database.csv");
const csvStream = csv()
  .on("data", function(data){
      redis.setJson(data[0], data);
  })
  .on("end", async function(){
    console.log("import done");
    console.log(await redis.getJson('00544'));
  });
stream.pipe(csvStream);
