'use strict';
const angular = require('angular');

export default angular.module('directives.loader', [])
  .directive('loaderSpin', function () {
    return {
      restrict: 'E',
      scope: {
        loaded: '='
      },
      template: require('./loader.pug')
    }
  })
  .name;
