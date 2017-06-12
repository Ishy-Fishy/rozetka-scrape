'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './category.events';
import {MCat} from './category.util'

var CategorySchema = new mongoose.Schema({
  url: String,
  name: String,
  items: [String],
  _items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  pristine: {
    type: Boolean,
    defaultValue: true
  },
  populated: {
    type: Boolean,
    defaultValue: false
  }
});

CategorySchema.index({url: 1}, {unique: true, name: 'CATEGORY_URL_UINDEX'});
CategorySchema.index({name: 1}, {name: 'CATEGORY_NAME_INDEX'});

CategorySchema.methods.populateItemData = function () {
  const self = this;
  if (self.items.length === 0 && self.pristine === true) {
    const cat = new MCat(self);
    return cat.getAllItems()
      .then(items => {
        self.items = items;
        self.pristine = false;
        return self.save()
      })
      .catch(err => console.error(err))
  } else return Promise.resolve(self)
};

registerEvents(CategorySchema);
export default mongoose.model('Category', CategorySchema);
