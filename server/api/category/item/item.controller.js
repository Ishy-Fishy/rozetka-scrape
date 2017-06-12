/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/items              ->  index
 * POST    /api/items              ->  create
 * GET     /api/items/:id          ->  show
 * PUT     /api/items/:id          ->  upsert
 * PATCH   /api/items/:id          ->  patch
 * DELETE  /api/items/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Item from './item.model';

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

export function initIfNeeded(req, res, next) {
  const parentCat = res.locals.category;
  if (!parentCat) return handleError(res);
  if (parentCat._items.length === 0 && parentCat.populated === false) {
    const itemUrls = parentCat.items;
    return Item.insertMany(itemUrls.map(url => {
      return {
        url: url,
        _category: parentCat._id
      }
    }))
      .then(({acknowledged, insertedIds}) => {
        parentCat._items = [].concat(insertedIds);
        if (acknowledged) parentCat.populated = true;
        return parentCat.save().then(() => insertedIds)
      })
      .then(ids => Item.find({
        _id: {
          $in: ids
        }
      })
        .exec())
      .then(items => Promise.all(items.map(item => item.analyze())))
      .then(() => next())
      .catch(err => console.log(error));
  } else next()
}

export function index(req, res) {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
  const search = new RegExp(`.*${(req.query.search || '').replace(/[\W]/g, '.')}.*`, 'i');
  const criteria = {};

  const dataPipe = Item.find(criteria)
    .sort({url: 1})
    .limit(limit)
    .skip(offset)
    .exec()
    .then((items) => {
      Promise.all(items.map(item => item.analyze()))
    });

  const metaPipe = Item.count(criteria)
    .exec();

  return Promise.all([dataPipe, metaPipe])
    .then(data => data)
    .then(respondWithResult(res))
    .catch(handleError(res));

}

