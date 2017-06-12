'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';
import {MItem} from './item.util';

var ItemSchema = new mongoose.Schema({
  url: String,
  name: String,
  rating: Number,
  avgGood: Object,
  avgBad: Object,
  _category: mongoose.Schema.Types.ObjectId,
  populated: {
    type: Boolean,
    defaultValue: false
  }
});

ItemSchema.index({url: 1}, {unique: true, name: 'ITEM_URL_UINDEX'});
ItemSchema.index({name: 1}, {name: 'ITEM_NAME_INDEX'});

ItemSchema.methods.analyze = function () {
  const self = this;
  if (!self.populated) {
    const item = new MItem(self);
    return item.data()
      .then(data => {
        const keys = Object.keys(data);
        for (let i = 0, len = keys.length; i < len; i++){
          item.set(keys[i], )
        }
        item.populated = true;
        return self.save()
      })
      .catch(err => console.error(err))
  } else return Promise.resolve(self)
};


registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
