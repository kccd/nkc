class Bullet {
  constructor({postId, avatarUrl, username, content, contentUrl}) {
    this.id = `nkcBullet_${postId}`;
    this.dom = $(`<a href="${contentUrl}" class="bullet" id="${this.id}"><img class="bullet-avatar" src="${avatarUrl}" alt="${username}"/><div class="bullet-content">${content}</div></a>`);
    this.left = '100%';
    this.top = '0';
  }
}

class BulletComments {
  constructor() {
    this.id = `nkcBullet${Date.now()}${Math.round(Math.random() * 1000)}`;
    this.bullets = [];
    this.tracks = [];
    for(let i = 0; i < 5; i++) {
      this.tracks.push({
        index: i,
        speed: 5 + Math.round(Math.random() * 10),
        idle: true,
        bullets: []
      });
    }
    this.transition();
  }
  getBulletDomByBullet(bullet) {
    const {avatarUrl, username, content, contentUrl, id} = bullet;
    const dom = $(`<a href="${contentUrl}" class="bullet" id="${this.id + '_' +id}"><img class="bullet-avatar" src="${avatarUrl}"  alt="${username}"/><div class="bullet-content">${content}</div></a>`);
    dom.on('mouseover', (e) => {
      const {left} = dom.offset();
      dom.attr('style', `left: ${left}px!important;`);
    });
    dom.on(`mouseleave`, () => {
      dom.attr('style', `left: ${-1 * dom.width()}px!important;`);
    });
    return dom;
  }
  getTrack() {
    const index = Math.round(Math.random() * (this.tracks.length - 1));
    return this.tracks[index];
  }
  add(comment) {
    const bullet = new Bullet(comment);
    this.bullets.push(bullet);
  }
  transition() {
    const self = this;
    const {tracks} = this;
    setTimeout(() => {
      for(let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const {bullets} = track;
        const bullet = bullets.shift();
        if(!bullet) continue;
        $(body).append(bullet);
        const bulletWidth = bullet.width();
        bullet.css({
          // left: -1 * bulletWidth,
          left: '30rem',
          top: i * 3 + 5 + 'rem'
        });
        bullet.css('left', -1 * bulletWidth);
      }
      self.transition();
    }, 500);
  }
  start() {

  }
  pause() {

  }
  clear() {

  }
}

NKC.modules.BulletComments = BulletComments;
