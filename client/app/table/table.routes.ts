'use strict';


export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
    .state('table', {
      url: '/table/',
      template: '<table></table>'
    });
};
