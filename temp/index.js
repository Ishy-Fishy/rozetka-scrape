'use strict';

const Crawler = require('crawler');
const fs = require('fs');
const path = require('path');
const crawlie = new Crawler({maxConnections: 10});

function getPage(url, number) {
  console.log(`||||| item ${number | ''} querying page ${url}`);
  return new Promise((resolve, reject) => {
    crawlie.queue({
      uri: url,
      callback: (err, res, done) => {
        if (err) console.error(`----- item ${number | ''} failed`);
        console.log(`+++++ item ${number | ''} page ${url} received`);
        done();
        resolve(res);
      }
    });
  });
}

function premadeCats() {
  const cats = fs.readFileSync(path.resolve(__dirname, './cats3.json'));
  return JSON.parse(cats);
}

class Item {
  constructor(url) {
    this.url = url;
    this.cfg = {
      jQString: 'span.sprite.g-rating-stars-i',
      jQNameString: 'h1.detail-title'
    };
  }

  data() {
    return this._data || getPage(this.url)
        .then((data) => {
          let name = data.$('h1.detail-title')[0].children[0].data;
          let comments = Array.prototype.slice.call(data.$('article.pp-review-i div.pp-review-text-i'));
          let ratings = data.$(this.cfg.jQString);
          let total = 0;
          let count = 0;
          for(let i = 0, len = ratings.length; i < len; i++) {
            if(!(ratings[i].attribs || {}).content) continue;
            total += +ratings[i].attribs.content;
            count++;
          }
          this._data = {
            rating: (total / count),
            name
          };
          return this._data;
        });
  }

}


class Cat {
  constructor(url, name) {
    this.baseUrl = url;
    this.cfg = {
      jQString: 'div.g-i-tile-i-title a',
      urlParam: 'scroll=true',
      urlPageParam: 'page='
    };
    this.displayName = name;
    this.name = this.constructor.parseUrlForName(url);
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
          const link = (links[i].attribs || {}).href;
          const name = (links[i].children[0] || {}).data;
          arr.push({name, link});
        }
        return arr;
      })
      .then((parsed) => parsed
        .map(({name, link}) => /(hotels|travel|payments)/.test(link) ? void null : new Cat(link, name))
        .reduce((acc, curr) => curr ? acc.concat(curr) : acc, [])
      );
  }

  static getPremadeCats(offset, limit) {
    const cats = premadeCats();
    return cats
      .slice(+offset, offset + limit)
      .map(({name, link}) => /(hotels|travel|payments)/.test(link) ? void null : new Cat(link, name))
      .reduce((acc, curr) => curr ? acc.concat(curr) : acc, []);
  }

  static parseUrlForName(url) {
    const regex = new RegExp(/(http(?:s)?:\/\/(?:[a-z]+\.)?rozetka\.com(?:\.ua)?\/ua\/)([a-z-]*)/);
    const matched = [].concat(url.match(regex));
    return matched.pop();
  }

  get rawItems() {
    if (this._items && Array.isArray(this._items)) return this._items;
    return this.getAllItems()
      .then(items => {
        this._items = items;
        return this._items;
      });
  }

  getAllItems() {
    const promArr = [];
    for (let i = 0; i < 16; i++) promArr.push(this.getItemsOnOnePage(i));
    return Promise.all(promArr)
      .then(scrapedUrlArr => {
        return scrapedUrlArr.reduce((acc, curr) => acc.concat(curr), []);
      });
  }

  getItemsOnOnePage(page) {
    return getPage(`${this.baseUrl}${this.cfg.urlPageParam}${page};${this.cfg.urlParam}/`)
      .then(data => {
        const iterable = data.$(this.cfg.jQString);
        const result = [];
        for (let i = 0, len = iterable.length; i < len; i++) {
          const url = (iterable[i].attribs || {}).href;
          url && result.push(url);
        }
        return result;
      });
  }

  toJSON() {
    return {
      name: this.name,
      displayName: this.displayName,
      url: this.baseUrl,
      items: this.items,
      rawItems: this.rawItems
    };
  }
}

const cats = Cat.getPremadeCats(0, 2);

Promise.all(cats.map(cat => cat.rawItems))
  .then(() => {
    const catItems = cats.map(cat => {
      cat.items = cat.rawItems.map((url) => new Item(url))
      return cat;
    });
    return Promise.all(catItems
      .map(cat => cat.items.map(item => item.data()))
      .reduce((acc, curr) => curr ? acc.concat(curr) : acc ,[])
    )
      .then(() => catItems)
  })
  .then((data) => {
    console.log(data)
  })
