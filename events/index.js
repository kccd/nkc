const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
const { initMomentEvents } = require('./moment');
function initEvents() {
  initMomentEvents(eventEmitter);
}

module.exports = {
  initEvents,
  eventEmitter,
};
