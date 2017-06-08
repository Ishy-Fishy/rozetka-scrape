'use strict';

const Crawler = require('crawler');
const fs = require('fs');
const crawlie = new Crawler({ maxConnections: 10});
function getPage(url) {
    console.log(`¬¬¬¬¬¬querying page ${url}`);
    return new Promise((resolve, reject) => {
        crawlie.queue({
            uri: url,
            callback: (err, res, done) => {
                console.log(`++++++page ${url} received`);
                done();
                resolve(res);
            }
        });
    });
}


let cats = new Promise((resolve, reject) => {
    fs.readFile('./cats3.json', {}, (err, data) => {
        if (err) reject(err);
        resolve(JSON.parse(data));
    })
});

cats
    .then((data) => {
        return data.map(({name, link}) => new Cat(link, name))
    })
    .then((data) => {
        return data[0].getAllItems()
    })
    .then((itemData) => {
        return Promise.all(itemData.map((val) => val.data()))
    })
    .then((data) => {
        console.log(data)
        fs.writeFile('items.flashusb.json', JSON.stringify(data))
    })
//
// getPage('http://rozetka.com.ua/ua/all-categories-goods/')
//     .then((res) => {
//         const links = res.$('.all-cat-b-l-i a.all-cat-b-l-i-link-child');
//         let arr = [];
//         for (let i = 0, len = links.length; i < len; i++) {
//             const link = (links[i].attribs || {}).href;
//             const name = (links[i].children[0] || {}).data;
//             arr.push({name: name, link: link});
//         }
//         return arr;
//     })


class Cat {
    constructor(url, name) {
        this.baseUrl = url;
        this.cfg = {
            jQString: 'div.g-i-tile-i-title a',
            urlParam: 'scroll=true',
            urlPageParam: 'page='
        };
        this.name = name;
    }

    getAllItems() {
        const items = [];
        for (let i = 0; i < 16; i++) {
            items.push(this.getOnePage(i));
        }
        return Promise.all(items)
            .then((result) => {
                this.items = result.reduce((acc, now) => acc.concat(now), []);
                return this.items
            });
    }

    getOnePage(page) {
        return getPage(`${this.baseUrl}${this.cfg.urlPageParam}${page};${this.cfg.urlParam}/`)
            .then((data) => {
                const items = data.$(this.cfg.jQString);
                const extArr = [];
                for (let i = 0, len = items.length; i < len; i++) {
                    extArr.push(new Item(items[i].attribs.href));
                }
                return extArr;
            });
    }
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
                    let ratings = data.$(this.cfg.jQString);
                    let total = 0;
                    let count = 0;
                    for (let i = 0, len = ratings.length; i < len; i++) {
                        if (!(ratings[i].attribs || {}).content) continue;
                        total += +ratings[i].attribs.content;
                        count++
                    }
                    this._data = {
                        rating: (total / count),
                        name: name
                    };
                    return this._data;
                });
    }

}