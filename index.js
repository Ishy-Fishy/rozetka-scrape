'use strict';

const Crawler = require('crawler');

function getPage(url) {
    return new Promise((resolve, reject) => {
        const crawlie = new Crawler({
            callback: (err, res, done) => {
                done();
                if (err) return reject(err);
                return resolve(res)
            }
        });
        crawlie.queue(url)
    })
}

getPage('http://rozetka.com.ua/ua/all-categories-goods/')
    .then((res) => {
        const links = res.$('.all-cat-b-l-i a.all-cat-b-l-i-link-child');
        let arr = [];
        for (let i = 0, len = links.length; i < len; i++) {
            arr.push(links[i].attribs.href)
        }
        return arr
    })
    .then((data) => {

        console.log(data)
    });

class CatParser {
    constructor(url) {
        this.baseUrl = url.replace(/\/$/, '');
        this.cfg = this.defCfg();
        this.page = 0;
        this._crawl = new Crawler()
    }

    static defCfg() {
        return {
            jQString: 'g-i-tile-i-box-desc',
            urlParam: ';scroll=true',
            urlPageParam: ';page='
        }
    }

    get url() {
        return `${this.baseUrl}${this.page > 0 && this.cfg.urlPageParam + this.page + this.cfg.urlParam}/`
    }

    listItems(page) {

    }
}