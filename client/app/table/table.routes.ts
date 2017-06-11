'use strict';


export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('table', {
      url: '/',
      template: '<table></table>'
    });
};
