'use strict';

const Crawler = require('crawler');
const fs = require('fs');

function getPage (url) {
    return new Promise((resolve, reject) => {
        const crawlie = new Crawler({
            rateLimit: 1000,
            callback: (err, res, done) => {
                done();
                if (err) return reject(err);
                return resolve(res);
            }
        });
        crawlie.queue(url);
    });
}

getPage('http://rozetka.com.ua/ua/all-categories-goods/')
    .then((res) => {
        const links = res.$('.all-cat-b-l-i a.all-cat-b-l-i-link-child');
        let arr = [];
        for (let i = 0, len = links.length; i < len; i++) {
            arr.push(links[i].attribs.href);
        }
        return arr;
    })
    .then((data) => {
        return data.map((val) => new Cat(val));
    })
    .then((cats) => {
        return cats[0].items
    })
    .then((items) => {
        return items[0].rating
    })
    .then((rating)=> {
        console.log(rating)
    });

class Cat {
    constructor (url) {
        this.baseUrl = url;
        this.cfg = {
            jQString: 'div.g-i-tile-i-title a',
            urlParam: 'scroll=true',
            urlPageParam: 'page='
        };
        this.page = 0;
    }

    get url () {
        return `${this.baseUrl}${this.cfg.urlPageParam}${this.page};${this.cfg.urlParam}/`;
    }

    getItemsOnPage (page) {
        this.page = page;
        return getPage(this.url).then((data) => {
            const items = data.$(this.cfg.jQString);
            const extArr = [];
            for (let i = 0, len = items.length; i < len; i++) {
                extArr.push(new Item(items[i].attribs.href));
            }
            return extArr;
        });
    }

    get items () {
        if (this._items) return this._items;
        this._items = 'pending';
        const items = [];
        for (let i = 0; i < 16; i++) {
            items.push(this.getItemsOnPage(i));
        }
        return Promise.all(items)
            .then((result) => {
                return result.reduce((acc, now) => acc.concat(now), []);
            });
    }
}

class Item {
    constructor (url) {
        this.url = url;
        this.cfg = {
            jQString: 'span.sprite.g-rating-stars-i'
        };
    }

    get rating () {
        return getPage(this.url)
            .then((data) => {
                let ratings = data.$(this.cfg.jQString);
                let total = 0;
                let count = 0;
                for (let i = 0, len = ratings.length; i < len; i++) {
                    if (!(ratings[i].attribs || {}).content) continue;
                    total += +ratings[i].attribs.content;
                    count++
                }
                return total / count;
            });
    }

}