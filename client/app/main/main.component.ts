const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export default angular.module('rozetkaScrapeApp.main', [
  uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.pug')
  })
  .name;
