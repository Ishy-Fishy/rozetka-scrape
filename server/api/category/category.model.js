'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './category.events';
import {MCat} from './category.util';

var CategorySchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  name: String,
  items: [{
    type: String,
  }],
  _items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  pristine: {
    type: Boolean,
    default: true
  },
  loaded: {
    type: Boolean,
    default: false
  }
});

CategorySchema.index({url: 1}, {unique: true, name: 'CATEGORY_URL_UINDEX'});
CategorySchema.index({name: 1}, {name: 'CATEGORY_NAME_INDEX'});

CategorySchema.methods.populateItemData = function () {
  if (this.items.length === 0 && this.pristine === true) {
    const self = this;
    const cat = new MCat(self);
    return cat.getAllItems()
      .then(items => {
        self.items = items;
        self.pristine = false;
        return self.save()
      })
      .catch(err => console.error(err))
  } else return Promise.resolve(this)
};

registerEvents(CategorySchema);
export default mongoose.model('Category', CategorySchema);
