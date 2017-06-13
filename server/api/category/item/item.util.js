'use strict';
import {getPage} from '../../../util/scraper.util';

export class Item {
  constructor(url) {
    this.url = url;
    this.cfg = {
      jQString: 'span.sprite.g-rating-stars-i',
      jQNameString: 'h1.detail-title'
    };
  }

  data() {
    return getPage(this.url)
      .then((data) => {
        let name = data.$('h1.detail-title')[0].children[0].data;
        let comments = Array.prototype.slice.call(data.$('article.pp-review-i div.pp-review-text-i'));
        let ratings = data.$(this.cfg.jQString);
        let total = 0;
        let count = 0;
        for (let i = 0, len = ratings.length; i < len; i++) {
          if (!(ratings[i].attribs || {}).content) continue;
          total += +ratings[i].attribs.content;
          count++;
        }
        let rating = Math.round((total / count) * 10) / 10;
        return {
          name,
          rating: isNaN(rating) ? 0 : rating,
          avgGood: { //todo: implement!!
            data: 'foo',
            count: 3
          },
          avgBad: {
            data: 'bar',
            count: 10
          }
        }
      });
  }

}

export class MItem extends Item {
  constructor(item) {
    super(item.url);
    this.__mongoObject = item;
  }

  data() {
    return this.constructor.__proto__.prototype.data.call(this) //currently, this shit is the only way to call a parent non-static method without using outside scope variables
      .then(info => {
        return Object.assign(this.__mongoObject, info);
      })
  }
}
