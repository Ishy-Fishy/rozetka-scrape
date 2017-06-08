/**
 * Category model events
 */

'use strict';

import {EventEmitter} from 'events';
var CategoryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CategoryEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Category) {
  for(var e in events) {
    let event = events[e];
    Category.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    CategoryEvents.emit(`${event}:${doc._id}`, doc);
    CategoryEvents.emit(event, doc);
  };
}

export {registerEvents};
export default CategoryEvents;
