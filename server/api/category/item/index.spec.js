'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var itemCtrlStub = {
  index: 'itemCtrl.index',
  show: 'itemCtrl.show',
  create: 'itemCtrl.create',
  upsert: 'itemCtrl.upsert',
  patch: 'itemCtrl.patch',
  destroy: 'itemCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var itemIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './item.controller': itemCtrlStub
});

describe('Item API Router:', function() {
  it('should return an express router instance', function() {
    expect(itemIndex).to.equal(routerStub);
  });

  describe('GET /api/items', function() {
    it('should route to item.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'itemCtrl.index')
      ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/items/:id', function() {
    it('should route to item.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'itemCtrl.show')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/items', function() {
    it('should route to item.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'itemCtrl.create')
      ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/items/:id', function() {
    it('should route to item.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'itemCtrl.upsert')
      ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/items/:id', function() {
    it('should route to item.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'itemCtrl.patch')
      ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/items/:id', function() {
    it('should route to item.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'itemCtrl.destroy')
      ).to.have.been.calledOnce;
    });
  });
});
