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
  public error;
  /*@ngInject*/
  constructor($http, $scope, socket, $stateParams) {
    this.$http = $http;
    this.socket = socket;
    this.id = $stateParams.id;
  }

  public getItems(page = 0) {
    this.error = void null;
    this.currentPage = page;
    this.loaded = false;
    console.log(this.id);
    console.log(`/api/category/${this.id}/items`);
    return this.$http.get(`/api/category/${this.id}/items`, {
      params: {
        limit: this.limit,
        offset: page * this.limit,
        search: this.search
      }
    })
      .then(response => {
        this.items = [].concat(response.data[0]);
        this.totalPages = Math.floor(response.data[1] / this.limit) + (response.data[1] > 0 && response.data[1] % this.limit === 0 ? 1 : 0);
        this.loaded = true;
      })
      .then(err => {
        this.loaded = true;
        this.error = err;
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
