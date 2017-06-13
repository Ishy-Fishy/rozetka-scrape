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
    this._rId = this.constructor.parseRemoteId(url)
  }

  static parseRemoteId(url) {
    return url.match(/\bp[0-9]{5,9}/)[0];
  }

  // data() {
  //   return getPage(this.url)
  //     .then((data) => {
  //       let name = data.$('h1.detail-title')[0].children[0].data;
  //       let comments = Array.prototype.slice.call(data.$('article.pp-review-i div.pp-review-text-i'));
  //       let ratings = data.$(this.cfg.jQString);
  //       let total = 0;
  //       let count = 0;
  //       for (let i = 0, len = ratings.length; i < len; i++) {
  //         if (!(ratings[i].attribs || {}).content) continue;
  //         total += +ratings[i].attribs.content;
  //         count++;
  //       }
  //       let rating = Math.round((total / count) * 10) / 10;
  //       return {
  //         name,
  //         rating: isNaN(rating) ? 0 : rating,
  //         avgGood: { //todo: implement!!
  //           data: 'foo',
  //           count: 3
  //         },
  //         avgBad: {
  //           data: 'bar',
  //           count: 10
  //         }
  //       }
  //     });
  // }

  details() {
    const data = {};
    return getPage(`${this.cfg.apiBase}${this.cfg.getParams}${this._rId}`)
      .then(res => {
        const json = (JSON.parse(res.body).content || [])[0].content;
        if (!json
        +) return null;
        Object.assign(data, {name: json.title, rating: json.users_rating});
        return this.getComments({count: json.count_comments, url: json.comments_href});
      })
  }

  getComments({count, url}) {
    const maxPage = Math.ceil(count / 10);
    return getPage(`${url}${this.cfg.commentCoreParams}${7}${this.cfg.commentTrailingParams}`)
      .then(page => {
        let comments = Array.from(page.$('article.pp-review-i div.pp-review-text-i span'));
        if (comments.length === 0) return null;
        return comments;
      })

  }

}

const foo = new Item(url)
foo.details().then(data => {
  console.log(data)
});

