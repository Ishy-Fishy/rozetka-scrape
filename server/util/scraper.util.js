'use strict';

import Crawler from 'crawler';
import fs from 'fs';
import path from 'path';
const crawlie = new Crawler({maxConnections: 10});

export function getPage(url, number) {
  console.log(`||||| item ${number || ''} querying page ${url}`);
  return new Promise((resolve, reject) => {
    crawlie.queue({
      uri: url,
      callback: (err, res, done) => {
        if (err) console.error(`----- item ${number || ''} failed`);
        console.log(`+++++ item ${number || ''} page ${url} received`);
        done();
        resolve(res || null);
      }
    });
  });
}

export function premadeCats() {
  const cats = fs.readFileSync(path.resolve(__dirname, './categories.premade.json'));

  return JSON.parse(cats);
}
