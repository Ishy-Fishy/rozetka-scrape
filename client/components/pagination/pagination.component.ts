'use strict';
const angular = require('angular');

export class PaginationComponent {

}

export default angular.module('directives.pagination', [])
  .directive('paginationBar', function () {
    return {
      scope: {
        current: '=',
        max: '=',
        onClick: '&',
        scrollTo: '='
      },
      template: require('./pagination.pug')
    }
  })
  .name;
