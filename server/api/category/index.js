'use strict';

var express = require('express');
var controller = require('./category.controller');

var router = express.Router();

router.get('/', controller.initIfNeeded, controller.index);
router.get('/:id', controller.show);

router.use('/:id/items', controller.getParam, require('../item'));

module.exports = router;
