'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './category.events';

var CategorySchema = new mongoose.Schema({
  url: String,
  name: String,
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }]
});

CategorySchema.index({url: 1},{unique: true, name: 'CATEGORY_URL_UINDEX'});
CategorySchema.index({name: 1},{name: 'CATEGORY_NAME_INDEX'});

registerEvents(CategorySchema);
export default mongoose.model('Category', CategorySchema);
