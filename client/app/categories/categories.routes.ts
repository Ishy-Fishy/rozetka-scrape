'use strict';


export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('categories', {
      url: '/categories',
      template: '<categories></categories>'
    });
};
