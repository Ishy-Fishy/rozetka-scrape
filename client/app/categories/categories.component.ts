const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './categories.routes';

export class TableController {
  $http;
  socket;
  public categories = [];
  public limit: number = 32;
  public search: string;
  public currentPage = 0;
  public totalPages = 0;
  public loaded: boolean = false;
  public error;

  public diff = [];

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
  }

  public getCategories(page = 0) {
    this.error = void null;
    this.currentPage = page;
    this.loaded = false;
    return this.$http.get(`/api/category`, {
      params: {
        limit: this.limit,
        offset: page * this.limit,
        search: this.search
      }
    })
      .then(response => {
        this.categories = [].concat(response.data[0]);
        this.totalPages = Math.ceil(response.data[1] / this.limit);
        this.loaded = true;
      })
      .catch(err => {
        this.loaded = true;
        this.error = err;
      });
  }

  $onInit() {
    this.getCategories()
  }
}

export default angular.module('rozetkaScrapeApp.categories', [
  uiRouter])
  .config(routing)
  .component('categories', {
    template: require('./categories.pug'),
    controller: TableController,
    controllerAs: 'vm'
  })
  .name;
