'use strict';

import table from './table.component';
// import {TableController} from './table.component';

describe('Component: TableComponent', function() {

  beforeEach(angular.mock.module(table));
  beforeEach(angular.mock.module('stateMock'));  beforeEach(angular.mock.module('socketMock'));

  var scope;
  var tableComponent;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(
    _$httpBackend_,
    $http,
    $componentController,
    $rootScope,
    $state,
    socket) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/things')
        .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

      scope = $rootScope.$new();
      state = $state;
      tableComponent = $componentController('table', {
        $http: $http,
        $scope: scope,
        socket: socket
      });
  }));

  it('should attach a list of things to the controller', function() {
    tableComponent.$onInit();
    $httpBackend.flush();
    expect(tableComponent.scrapeProgress).to.equal(0);
  });
});
