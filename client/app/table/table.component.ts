const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './table.routes';

export class TableController {
  $http;
  socket;
  categories = [];
  newThing = '';
  scrapeProgress = 0;

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('scrapeProgress');
    });
  }

  $onInit() {
    this.$http.get('/api/category').then(response => {
      this.categories = response.data;
      this.socket.syncUpdates('scrapeProgress', this.scrapeProgress);
    });
  }
}

export default angular.module('rozetkaScrapeApp.table', [
  uiRouter])
    .config(routing)
    .component('table', {
      template: require('./table.pug'),
      controller: TableController
    })
    .name;
