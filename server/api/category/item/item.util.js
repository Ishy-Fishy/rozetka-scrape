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
        this._data = {
          rating: (total / count),
          name,
          commentData: comments
        };
      });
  }

}

export class MItem extends Item {
  constructor(item) {
    super(item.url)
  }
}
