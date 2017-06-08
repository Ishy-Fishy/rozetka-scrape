'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';

var ItemSchema = new mongoose.Schema({
  url: String,
  name: String,
  rating: Number,
  commentTrend: String
});

ItemSchema.index({url: 1}, {unique: true, name: "ITEM_URL_UINDEX"});
ItemSchema.index({name: 1}, {name: "ITEM_NAME_INDEX"});

registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
