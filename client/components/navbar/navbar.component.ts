'use strict';
/* eslint no-sync: 0 */
const angular = require('angular');

export class NavbarComponent {
  menu = [{
    'title': 'Home',
    'state': 'main'
  },{
    'title': 'Categories',
    'state': 'categories'
  }];
  isCollapsed = true;


}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.pug'),
    controller: NavbarComponent
  })
  .name;
