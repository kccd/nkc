class BulletComments {
  constructor() {
    this.id = `nkcBullet${Date.now()}${Math.round(Math.random() * 1000)}`;
    this.comments = [];
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
    return $(`<a href="${contentUrl}" class="bullet" id="${this.id + '_' +id}"><img class="bullet-avatar" src="${avatarUrl}"  alt="${username}"/><div class="bullet-content">${content}</div></a>`);
  }
  getBulletByComment(comment) {
    const {avatar, username, content, url} = comment;
    const bullet = {
      status: 'unDisplay',
      avatar,
      username,
      content,
      url,
      id: this.comments.length
    };
    this.comments.push(bullet);
    return bullet;
  }
  getTrack() {
    const index = Math.round(Math.random() * (this.tracks.length - 1));
    return this.tracks[index];
  }
  add(comment) {
    const bullet = this.getBulletByComment(comment);
    const bulletDom = this.getBulletDomByBullet(bullet);
    const track = this.getTrack();
    track.bullets.push(bulletDom);
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
    }, 1000);
  }
  start() {

  }
  pause() {

  }
  clear() {

  }
}

NKC.modules.BulletComments = BulletComments;
