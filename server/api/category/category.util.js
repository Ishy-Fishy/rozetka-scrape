'use strict';
import {getPage} from '../../util/scraper.util';

export class Cat {
  constructor(url, name) {
    this.baseUrl = url;
    this.cfg = {
      jQString: 'div.g-i-tile-i-title a',
      urlParam: 'scroll=true',
      urlPageParam: 'page='
    };
    this.displayName = name;
    this.name = this.constructor.parseUrlForName(url);
    this.lastParsed = 0;
    this.items = new Set();
  }

  static get mainUrl() {
    return 'http://rozetka.com.ua/ua/all-categories-goods/';
  }

  static findCats() {
    return getPage(this.constructor.mainUrl)
      .then((res) => {
        const links = res.$('.all-cat-b-l-i a.all-cat-b-l-i-link-child');
        let arr = [];
        for (let i = 0, len = links.length; i < len; i++) {
          const url = (links[i].attribs || {}).href;
          const name = (links[i].children[0] || {}).data;
          arr.push({name, url});
        }
        return arr;
      })
      .then((parsed) => parsed
        .map(({name, url}) => /(hotels|travel|payments)/.test(url) ? void null : new Cat(url, name))
        .reduce((acc, curr) => curr ? acc.concat(curr) : acc, [])
      );
  }

  static parseUrlForName(url) {
    const regex = new RegExp(/(http(?:s)?:\/\/(?:[a-z]+\.)?rozetka\.com(?:\.ua)?\/ua\/)([a-z-]*)/);
    const matched = [].concat(url.match(regex));
    return matched.pop();
  }

  get rawItems() {
    if (this._rawItems && Array.isArray(this._items)) return this._items;
    return this.getAllItems()
      .then(items => {
        this._items = items;
        return this._items;
      });
  }

  getAllItems() {
    return this.recursiveGet()
  }

  recursiveGet() {
    return getPage(`${this.baseUrl}${this.cfg.urlPageParam}${this.lastParsed};${this.cfg.urlParam}/`)
      .then(data => {
        const iterable = data.$(this.cfg.jQString);
        const prevLen = this.items.size;
        for (let i = 0, len = iterable.length; i < len; i++) {
          const url = (iterable[i].attribs || {}).href;
          url && this.items.add(url);
        }
        this.lastParsed++;
        if (this.items.size > prevLen && this.lastParsed < 15) return this.recursiveGet();
        else return this.items;
      })
  }

  toJSON() {
    return {
      name: this.name,
      displayName: this.displayName,
      url: this.baseUrl,
      items: this.items
    };
  }
}

export class MCat extends Cat {
  constructor(cat) {
    super(cat.url, cat.name);
    this.__mongoObject = cat;
  }

  getAllItems() {
    return this.constructor.__proto__.prototype.getAllItems.call(this)
      .then(() => {
        this.__mongoObject.items = Array.from(this.items);
        this.__mongoObject.pristine = false;
        return this.__mongoObject.save()
      })
      .catch(() => {
        this.__mongoObject.items = Array.from(this.items);
        return this.__mongoObject.save()
      })
  }
}
