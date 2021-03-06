'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';
import {MItem} from './item.util';

var ItemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  name: String,
  rating: Number,
  avgGood: {
    data: String,
    count: Number
  },
  avgBad: {
    data: String,
    count: Number
  },
  _category: mongoose.Schema.Types.ObjectId,
  loaded: {
    type: Boolean,
    default: false
  },
  pristine: {
    type: Boolean,
    default: true
  },
  meta: Object
});

ItemSchema.index({url: 1}, {unique: true, name: 'ITEM_URL_UINDEX'});
ItemSchema.index({name: 1}, {name: 'ITEM_NAME_INDEX'});

ItemSchema.methods.analyze = function () {
  if (!this.loaded) {
    const self = this;
    const item = new MItem(self);
    return item.details()
      .then(() => {
        self.loaded = true;
        return self.save()
      })
      .catch(err => console.error(err))
  } else return Promise.resolve(this)
};

ItemSchema.methods.baseData = function () {
  if (this.pristine === true && this.url) {
    const self = this;
    const item = new MItem(self);
    return item.basic()
      .then(() => {
        self.pristine = false;
        return self.save()
      })
      .catch(err => console.error(err))
  } else return Promise.resolve(this)
};


registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
