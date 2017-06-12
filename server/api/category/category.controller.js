/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/categories              ->  index
 * POST    /api/categories              ->  create
 * GET     /api/categories/:id          ->  show
 * PUT     /api/categories/:id          ->  upsert
 * PATCH   /api/categories/:id          ->  patch
 * DELETE  /api/categories/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Category from './category.model';
import {premadeCats} from './../../util/scraper.util';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Categories
export function index(req, res) {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
  const search = new RegExp(`.*${(req.query.search || '').replace(/[\W]/g, '.')}.*`, 'i');
  const criteria = {};
  if (req.query.search) Object.assign(criteria, {
    name: search
  });

  const dataPipe = Category.find(criteria)
    .sort({name: 1})
    .limit(limit)
    .skip(offset)
    .exec()
    .then((cats) => {
      return Promise.all(cats.map(cat => cat.populateItemData()));
    });

  const metaPipe = Category.count(criteria)
    .exec();

  return Promise.all([dataPipe, metaPipe])
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Category from the DB
export function show(req, res) {
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Category in the DB
export function create(req, res) {
  return Category.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Category in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Category.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Category in the DB
export function patch(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Category from the DB
export function destroy(req, res) {
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function init(req, res) {
  const cats = premadeCats();
  Category.insertMany(cats, {ordered: false})
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getParam(req, res, next) {
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then((category) => {
      if (!res.locals) res.locals = {};
      res.locals.category = category;
    })
    .catch(handleError(res));
}
