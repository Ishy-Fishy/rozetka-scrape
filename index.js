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
        const links = res.$('.all-cat-b-l-i a.all-cat-b-l-i-link-child')
        let arr = []
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
        this.url = this.baseUrl;
        this.cfg = this.defCfg();
        this.page = 0;
    }

    static defCfg() {
        return {
            jQString: 'g-i-tile-i-box-desc',
            urlParam: ';scroll=true',
            urlPageParam: ';page='
        }
    }

    appendUrlParams() {
        if (this.page > 0);
    }
}