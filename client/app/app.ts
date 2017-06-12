'use strict';
const angular = require('angular');
// import ngAnimate from 'angular-animate';
const ngCookies = require('angular-cookies');
const ngResource = require('angular-resource');
const ngSanitize = require('angular-sanitize');

import 'angular-socket-io';

const uiRouter = require('angular-ui-router');
const uiBootstrap = require('angular-ui-bootstrap');



import {routeConfig} from './app.config';

import main from './main/main.component';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import paginationBar from '../components/pagination/pagination.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import categories from './categories/categories.component';
import items from './items/items.component';
import loader from './../components/loader/loader.component';


import './app.scss';

angular.module('rozetkaScrapeApp', [
  ngCookies,
  ngResource,
  ngSanitize,

  'btford.socket-io',
  main,
  uiRouter,
  uiBootstrap,
  navbar,
  footer,
  paginationBar,
  constants,
  socket,
  util,
  categories,
  items,
  loader
])
  .config(routeConfig)
;

angular
  .element(document)
  .ready(() => {
    angular.bootstrap(document, ['rozetkaScrapeApp'], {
      strictDi: true
    });
  });
