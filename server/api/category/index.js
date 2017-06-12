'use strict';

var express = require('express');
var controller = require('./category.controller');

var router = express.Router();

router.get('/init', controller.init);
router.get('/', controller.index);

router.use('/:id/items', controller.getParam, require('./item'));

module.exports = router;
