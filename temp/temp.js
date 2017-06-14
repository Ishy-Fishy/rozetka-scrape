"use strict";
const url = 'http://rozetka.com.ua/apple_mmgf2ua_a/p8616504';
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


class Item {
  constructor(url) {
    this.url = url;
    this.cfg = {
      apiBase: 'http://rozetka.com.ua/recent_recommends/action=getGoodsDetailsJSON/',
      getParams: '?goods_ids=',
      commentCoreParams: 'page=',
      commentTrailingParams: ';scroll=true;tab=comments;sort=date',
      commentBase: 'div.pp-review-i div.pp-review-text-i div.pp-review-inner span > *'
    };
    this._rId = this.constructor.parseRemoteId(url);
  }

  static parseRemoteId(url) {
    return url.match(/\bp[0-9]{5,9}/)[0];
  }

  details() {
    const data = {};
    return getPage(`${this.cfg.apiBase}${this.cfg.getParams}${this._rId}`)
      .then(res => {
        const json = (JSON.parse(res.body).content || [])[0].content;
        if (!json) return null;
        Object.assign(data, {name: json.title, rating: json.users_rating});
        return this.commentStats({count: json.count_comments, url: json.comments_href});
      })
      .then(stats => {
        const positive = stats.positive;
        const negative = stats.negative;
        let goodVal = 0;
        let good;
        let badVal = 0;
        let bad;
        for (let i = 0, keys = Object.keys(positive), len = keys.length; i < len; i++) {
          let hash = keys[i];
          let val = positive[hash];
          (val > 1 && val < 5 && val > goodVal) && (goodVal = val, good = hash)
        }
        for (let i = 0, keys = Object.keys(negative), len = keys.length; i < len; i++) {
          let hash = keys[i];
          let val = negative[hash];
          (val > 1 && val < 5 && val > badVal) && (badVal = val, bad = hash)
        }
        data.avgGood = {
          data: good,
          count: goodVal
        };
        data.avgBad = {
          data: bad,
          count: badVal
        };
        return data;
      })
  }

  commentStats({count, url}) {
    const maxPage = Math.ceil(count / 10);
    const stats = Object.freeze({positive: {}, negative: {}});
    const promises = [];
    for (let i = 1; i <= maxPage; i++) promises.push(single(`${url}${this.cfg.commentCoreParams}${i}${this.cfg.commentTrailingParams}`))
    return Promise.all(promises)
      .then(() => stats);

    function single(connString) {
      return getPage(connString)
        .then(page => {
          let comments = Array.from(page.$('article.pp-review-i div.pp-review-text-i span'));
          let positive = comments
            .filter(val => /^[^Н]/.test((val.children || [{}])[0].data))
            .map(val => (val.next || {}).data)
            .reduce((acc, val) => {
              let words = val.match(/[\w\u0400-\u04FF]{5,}/g);
              return words ? acc.concat(words) : acc;
            }, [])
            .forEach(val => stats.positive[val] ? stats.positive[val]++ : stats.positive[val] = 1);
          let negative = comments
            .filter(val => /^Н/.test((val.children || [{}])[0].data))
            .map(val => (val.next || {}).data)
            .reduce((acc, val) => {
              let words = val.match(/[\w\u0400-\u04FF]{5,}/g);
              return words ? acc.concat(words) : acc;
            }, [])
            .forEach(val => stats.negative[val] ? stats.negative[val]++ : stats.negative[val] = 1);
        })
    }
  }
}

const foo = new Item(url);
foo.details().then(data => {
  console.log(data)
});

