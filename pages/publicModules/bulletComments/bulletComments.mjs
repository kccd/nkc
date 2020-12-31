class Boat {
  constructor() {
    this.dom = $(`<a class="bullet" target="_blank"><img class="bullet-avatar" /><p class="bullet-content"></p></a>`);
    // 当前dom是否正在工作
    this.working = false;
    // dom距离上边框的距离
    this.top = 0;
    // 当前dom移动速度
    this.speed = 0;
    // dom宽
    this.width = 0;
    // dom距离左边框的距离
    this.left = 0;
    // 定时器，定时更改dom的状态（working）
    this.timeout = null;
  }
  // 申明鼠标点击事件和触摸事件
  initMouseEvent() {
    const self = this;
    // 鼠标悬浮或触摸开始
    const leaveEvent = (e) => {
      const domLeft = self.dom.offset().left;
      const domWidth = self.dom.width();
      // 根据当前距离和速度，计算出dom消失所需要的时间
      const time = self.getTransitionTimeByDistance(domLeft + domWidth);
      self.dom.css({
        transform: `translatex(0)`,
        transition: `transform ${time}ms linear 0s`,
        "z-index": '5555',
      });4
      // 创建定时器，清除working标志
      this.createTimeout(time);
    }
    // 鼠标离开或触摸结束
    const overEvent = (e) => {
      self.removeTimeout();
      const {left} = self.dom.offset();
      self.dom.css({
        transform: `translatex(${left - self.left}px)`,
        transition: `transform 0ms linear 0s`,
        "z-index": '9999'
      });
    };
    this.dom.on('mouseover', overEvent);
    this.dom.on('touchstart', overEvent);
    this.dom.on('mouseleave', leaveEvent);
    this.dom.on('touchend', leaveEvent);
  }
  // 清除鼠标点击事件以及触摸事件
  clearMouseEvent() {
    this.dom
      .off('mouseover')
      .off('mouseleave')
      .off('touchstart')
      .off('touchend')
  }
  // 设置弹幕内容信息
  setInfo(info) {
    // 清除旧的事件
    this.clearMouseEvent();
    // 将当前dom标记为工作状态
    this.working = true;
    const {contentUrl, id, avatarUrl, content, username} = info;
    this.dom.attr({
      'href': contentUrl,
      'data-id': id
    });
    this.dom.find('.bullet-avatar').attr({
      'src': avatarUrl,
      'alt': username
    });
    this.dom.find('.bullet-content').text(content);
  }
  // 设置dom的位置信息定义鼠标点击事件和触摸事件
  setPosition({top, speed}) {
    this.clearMouseEvent();
    this.speed = speed;
    this.top = top;
    const bodyWidth = $(body).width();
    const domWidth = this.dom.width();
    this.left = -domWidth;
    this.dom.css({
      transform: `translatex(${bodyWidth + domWidth}px)`,
      transition: `transform 0ms`,
      left: this.left + 'px',
      top: top + 'px',
    });
    this.initMouseEvent();
  }
  // 根据距离和速度计算出所需时间
  getTransitionTimeByDistance(distance) {
    return Math.round(distance / (this.speed / 1000));
  }
  // 移除定时器
  removeTimeout() {
    clearTimeout(this.timeout);
  }
  // 创建定时器，清除working状态
  createTimeout(time) {
    this.timeout = setTimeout(() => {
      this.working = false;
    }, time);
  }
  getDom() {
    return this.dom;
  }
  // 设置dom的目标状态，启动定时器
  move() {
    const domWidth = this.dom.width();
    const bodyWidth = $(body).width();
    const time = this.getTransitionTimeByDistance(domWidth + bodyWidth);
    this.dom.css({
      transform: `translatex(0)`,
      transition: `transform ${time}ms linear 0s`,
    });
    this.createTimeout(time);
  }
}

class Bullet {
  constructor(info) {
    this.id = `nkcBullet_${info.postId}`;
    info.id = this.id;
    this.info = info;
  }
}

class Track {
  constructor({top}) {
    // 轨道上弹幕的速度
    if($(body).width() > 768) {
      // 130px~180px/s
      this.speed = Math.round(Math.random() * 50 + 130);
    } else {
      // 80px~130px/s
      this.speed = Math.round(Math.random() * 50 + 80);
    }
    // 轨道距离上边框的位置
    this.top = top;
    // 当前轨道上的最后一条弹幕
    this.boat = null;
  }
  // 判断轨道当前是否可以添加弹幕
  isFree() {
    let free = true;
    if(this.boat) {
      const dom = this.boat.getDom();
      if((dom.offset().left + dom.width()) > $('body').width()) {
        free = false;
      }
    }
    return free;
  }
}


class BulletComments {
  constructor(options) {
    // trackCount：弹幕轨道数
    // offsetTop: 第一条弹幕轨道距离上边框的距离
    const {trackCount = 8, offsetTop = 60, boatCount = 64} = options || {};
    this.id = `nkcBullet${Date.now()}${Math.round(Math.random() * 1000)}`;
    // 定时器 用于定时向轨道推送弹幕
    this.setTimeoutId = null;
    // 待显示的弹幕信息
    this.bullets = [];
    // 运送弹幕的dom，最大未this.boatCount
    this.boats = [];
    // 弹幕dom最大数量
    this.boatCount = boatCount;
    // 轨道
    this.tracks = [];
    // 创建trackCount个弹幕轨道
    for(let i = 0; i < trackCount; i++) {
      this.tracks.push(new Track({top: offsetTop + 46 * i}));
    }
  }
  // 塞入一条信息，判断是否启动定时任务，未启动则启动
  add(comment) {
    const bullet = new Bullet(comment);
    this.bullets.push(bullet);
    if(!this.setTimeoutId) {
      this.transition();
    }
  }
  // 获取当前空闲的dom，数量不超过轨道数
  getFreeBoats() {
    const maxCount = this.tracks.length;
    const freeBoats = [];
    for(let i = 0; i < this.boats.length; i++) {
      const boat = this.boats[i];
      if (boat.working) continue;
      freeBoats.push(boat);
      if(freeBoats >= maxCount) break;
    }
    const need = maxCount - freeBoats.length;
    if(need > 0) {
      const max = this.boatCount - this.boats.length;
      for(let i = 0; i < (need > max?max:need); i++) {
        const boat = new Boat();
        this.boats.push(boat);
        freeBoats.push(boat);
      }
    }
    return freeBoats;
  }
  // 启动定时任务，推送弹幕
  transition() {
    const self = this;
    const {
      tracks,
      bullets,
    } = this;
    this.setTimeoutId = setTimeout(() => {
      // 获取空闲dom
      const freeBoats = self.getFreeBoats();
      for(let i = 0; i <tracks.length; i++) {
        // 判断当前轨道是否可以添加弹幕
        const track = tracks[i];
        if(!track.isFree()) continue;
        // 取出一条待显示信息
        const bullet = bullets.shift();
        if(!bullet) continue;
        const {top, speed} = track;
        // 获取一个空闲dom
        const boat = freeBoats.pop();
        if(!boat) continue;
        // 设置dom信息
        boat.setInfo(bullet.info);
        track.boat = boat;
        const dom = boat.getDom();
        $(body).append(dom);
        // 设置dom位置
        boat.setPosition({
          top,
          speed,
        });
        // 开始移动
        boat.move();
      }
      if(bullets.length) {
        self.transition();
      } else {
        this.setTimeoutId = null;
      }
    }, 300);
  }
}


NKC.modules.BulletComments = BulletComments;
