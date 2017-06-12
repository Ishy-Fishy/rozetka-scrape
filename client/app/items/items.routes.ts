'use strict';


export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('items', {
      url: '/items/:id',
      template: '<items></items>'
    });
};
