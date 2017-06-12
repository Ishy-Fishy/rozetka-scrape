const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './items.routes';

export class ItemsController {
  $http;
  socket;
  id;
  public items = [];
  public limit: number = 32;
  public search: string;
  public currentPage = 0;
  public totalPages = 0;
  public loaded: boolean = false;

  /*@ngInject*/
  constructor($http, $scope, socket, $stateParams) {
    this.$http = $http;
    this.socket = socket;
    this.id = $stateParams.id;
  }

  public getItems(page = 0) {
    this.currentPage = page;
    this.loaded = false;
    return this.$http.get(`/api/category/:id/items`, {
      params: {
        limit: this.limit,
        offset: page * this.limit,
        search: this.search,
        id: this.id
      }
    })
      .then(response => {
        this.items = [].concat(response.data[0]);
        this.totalPages = Math.ceil(response.data[1] / this.limit);
        this.loaded = true;
      });

  }

  $onInit() {
    this.getItems()
  }
}

export default angular.module('rozetkaScrapeApp.items', [
  uiRouter])
  .config(routing)
  .component('items', {
    template: require('./items.pug'),
    controller: ItemsController,
    controllerAs: 'vm'
  })
  .name;
