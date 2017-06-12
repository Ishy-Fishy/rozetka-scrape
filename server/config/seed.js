/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Category from '../api/category/category.model';
import {premadeCats} from '../util/scraper.util';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    catPop();
  }
}


function catPop() {
  Category.find({}).remove()
    .then(() => {
      let thing = Category.create(premadeCats());
      return thing;
    })
    .then(() => console.log('finished populating things'))
    .catch(err => console.log('error populating things', err));
}
