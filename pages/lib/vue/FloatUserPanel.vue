<!--用户悬浮框-->
<template lang="pug">
  #floatUserPanel(v-cloak v-show="show")
    transition(name="fade")
      .float-user(v-if="user && (over || onPanel)")
        .float-user-top
          .float-user-mask
          .float-user-banner(:style="'background-image: url('+getUrl('userBanner', user.banner)+')'")
          a(:href="'/u/' + user.uid" target="_blank").float-user-avatar
            img(:src="getUrl('userAvatar', user.avatar)" :style="user.certs.indexOf('banned') >= 0 ? 'filter: grayscale(1);': ''")
          .float-user-uid ID: {{user.uid}}
          .float-user-info
            a(:href="'/u/' + user.uid" target="_blank" :style="uid?'padding-right: 3.5rem;':''" :title="user.username").float-user-name {{user.username}}
            button(v-if="uid && subscribed" @click.stop="subscribe") 取关
            button.active(v-if="uid && !subscribed" @click.stop="subscribe") 关注
            .float-user-cert
              img.float-user-grade(:src="getUrl('gradeIcon', user.grade._id)" :title="user.grade.displayName" v-if="user.certs.indexOf('banned') < 0")
              .float-user-destroy(v-if="user.destroyed") 用户已注销
              span(:title="user.info.certsName" v-else) {{user.info.certsName}}
            .float-user-description(:title="user.description") {{user.description}}
            .float-user-time {{timeFormat("YYYY/MM/DD", user.toc)}}注册，{{fromNow(user.tlv)}}活动
        .float-user-bottom
          .float-user-number(:class="{'column': !!user.column}")
            .col
              a.link(:href="'/u/' + user.uid + '?t=thread'" target="_blank" :title="'文章：' + (user.threadCount - user.disabledThreadsCount)")
                .title 文章
                .number {{user.threadCount - user.disabledThreadsCount}}
            .col
              a.link(:href="'/u/' + user.uid" target="_blank" :title="'回复：' + (user.postCount - user.disabledPostsCount)")
                .title 回复
                .number {{user.postCount - user.disabledPostsCount}}
            .col(:title="'学术分：' + user.xsf")
              .title 学术分
              .number {{user.xsf}}
            .border-left.col
              a.link(:onclick="'NKC.methods.toChat(\"' +user.uid+'\")'" v-if="uid && user.uid !== uid") 私信
              a.link(onclick="Login.open()" v-else-if="!uid") 私信
            .border-left.col(v-if="user.column")
              a.link(:href="'/m/' + user.column._id" target="_blank" :title="user.column.name") 专栏
</template>

<style lang="less">
#floatUserPanel{
  @import "../../publicModules/base.less";
  top: 0;
  left: 0;
  position: absolute;
  z-index: 1000;
  .float-user{
    border: 1px solid #ccc;
    min-height: 7.5rem;
    width:  26rem;
    background-color: #fff;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    position: relative;
    border-radius: 3px;
    .float-user-destroy{
      display: inline-block;
      font-size: 1rem;
      color: #777;
    }
    .float-user-top{
      position: relative;
      height: 9rem;
      .float-user-banner{
        position: absolute;
        top: 0;
        left: 0;
        background-size: cover;
        height: 9rem;
        width: 100%;
        border-radius: 3px;
        z-index: 100;
      }
      .float-user-mask{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 110;
        height: 9rem;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.4);
      }
      .float-user-uid{
        bottom: 0;
        left: 0.5rem;
        width: 8rem;
        height: 2rem;
        line-height: 2rem;
        font-weight: 700;
        position: absolute;
        z-index: 130;
        text-align: center;
        font-size: 1.2rem;
        font-style: oblique;
        color: #fff;
      }
      .float-user-avatar{
        z-index: 130;
        height: 8rem;
        width: 8rem;
        position: absolute;
        top: -1rem;
        left: 0.5rem;
        border-radius: 5px;
        overflow: hidden;
        box-sizing: border-box;
        border: 3px solid #eee;
        img{
          height: 100%;
          width: 100%;
        }
      }
      .float-user-info{
        position: absolute;
        top: 0;
        left: 8.5rem;
        padding: 0 0.5rem;
        width: 17.3rem;
        z-index: 130;
        .float-user-name{
          .hideText(@line: 1);
          font-size: 1.3rem;
          margin-top: 0.5rem;
          color: #fff;
          font-weight: 700;
          &:hover, &:focus{
            text-decoration: none;
          }
        }
        .float-user-cert{
          font-size: 1rem;
          margin-top: 0.2rem;
          color: @accent;
          font-style: oblique;
          .hideText(@line: 1);
          height: 1.4rem;
          vertical-align: text-bottom;
        }
        .float-user-grade{
          display: inline-block;
          height: 1rem;
          padding: 0;
          margin-top: -2px;
          margin-right: 0.5rem;
          vertical-align: middle;
          width: 1rem;
        }
        .float-user-description{
          font-size: 1rem;
          color: #eee;
          //font-style: oblique;
          margin-top: 0.2rem;
          max-height: 2.8rem;
          .hideText(@line: 2);
        }
        .float-user-time{
          font-size: 1rem;
          margin-top: 0.2rem;
          font-style: oblique;
          color: #eee;
        }
        button{
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
          border: none;
          border-radius: 2px;
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 1rem;
          box-sizing: border-box;
          color: #fff;
          line-height: 1.8rem;
          height: 1.8rem;
          background-color: #ccc;
          &:focus{
            outline: none;
          }
          &:hover{
            background-color: #aaa;
          }
          &.active{
            background-color: @primary;
            &:hover{
              background-color: #2378b5;
            }
          }

        }
        .float-user-count{
          font-size: 1.2rem;
        }
      }
    }

    .float-user-bottom{
      .float-user-number{
        width: 100%;
        font-size: 0;

        .col{
          vertical-align: top;
          &.border-left{
            box-sizing: border-box;
            border-left: 1px solid #f4f4f4;
          }
          width: 25%;
          font-size: 0;
          display: inline-block;
          position: relative;
          overflow: hidden;
          height: 4rem;
          text-align: center;
          .number{
            font-size: 1.25rem;
            font-style: oblique;
            height: 2rem;
            line-height: 1.7rem;
            .hideText(@line: 1);
          }
          .title{
            width: 100%;
            text-align: center;
            color: #666;
            height: 2rem;
            line-height: 2.4rem;
            font-size: 1rem;
          }
          .link{
            font-size: 1.2rem;
            line-height: 4rem;
            color: @dark;
            display: block;
            height: 100%;
            width: 100%;
            cursor: pointer;
            &:hover, &:focus{
              color: @dark;
              text-decoration: none;
            }
            &:hover{
              background-color: rgba(0, 0, 0, 0.05);
            }
          }
        }
        &.column .col{
          width: 20%;
        }
      }
    }
  }
}
</style>

<script>
import {getUrl, fromNow} from "../js/tools";
import {timeFormat} from "../js/time";
import {getState} from "../js/state";
export default {
  data: () => {
    return {
      user: '',
      uid: '',
      over: false,
      show: false,
      count: 1,
      onPanel: false,
      users: {},
      timeoutName: '',
    }
  },
  mounted() {
    this.uid = this.getState().uid;
    const self = this;
    const panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
    });
    panel.css({
      top: 300,
      left: 300
    });
  },
  methods: {
    getUrl: getUrl,
    timeFormat: timeFormat,
    fromNow: fromNow,
    getState() {
      return getState();
    },
    reset() {
      this.show = false;
       this.onPanel = false;
       this.over = false;
       this.user = '';
    },
    initPanel() {
      const doms = $(`[data-float-uid]`);
      for(var i = 0; i < doms.length; i++ ) {
        const dom = doms.eq(i);
        if(dom.attr("data-float-init") === "true") continue;
        let position = dom.attr("data-float-position");
        if(getState.isApp) return;
        this.initEvent(doms.eq(i), position);
      }
    },
    initEvent(dom, position = 'right') {
      const self = this;
      dom.on("mouseleave", function() {
        //鼠标离开元素
        self.timeoutName = setTimeout(() => {
          self.reset();
        }, 200);
      });
      dom.on("mouseover", function() {
        //鼠标悬浮在元素上
        clearTimeout(self.timeoutName);
        self.count ++;
        self.over = true;
        let uid;
        let count_ = self.count;
        let left, top, width, height;
        //延迟过滤掉鼠标意外划过元素
        self.timeout(300)
        .then(() => {
          if(count_ !== self.count) throw "timeout 1";
          if(!self.over) throw "timeout 2";
          uid = dom.attr("data-float-uid");
          left = dom.offset().left;
          top = dom.offset().top;
          width = dom.width();
          height = dom.height();
          return self.getUserById(uid);
        })
        .then((userObj) => {
          const {user, subscribed} = userObj;
          if(count_ !== self.count) throw "timeout 3";
          if(!self.over) throw "timeout 4";
          self.user = user;
          self.subscribed = subscribed;
          const panel = $(self.$el);
          self.show = true;
          panel.on("mouseleave", function() {
            self.reset();
          });
          panel.on("mouseover", function() {
            clearTimeout(self.timeoutName);
            self.onPanel = true;
          });

          const documentWidth = $(document).width() - 10;

          const panelWidth = 26 * 12;

          if(position === 'bottom') {
            top += height + 10;
            left -= (width + 10);
          } else {
            left += width + 10;
            top += height + 10;
          }

          if((left + panelWidth) > documentWidth) {
            left = documentWidth - panelWidth;
          }
          const {top: contentTop, left: contentWidth} = $('#comment-content').offset();
          panel.css({
            top: top - contentTop,
            left: left - contentWidth
          });
        })
        .catch(err => {
          console.log(err);
        })
      });
      dom.attr('data-float-init', 'true');
    },
    //延迟
    timeout(t) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, t)
      });
    },
    //获取用户信息通过uid
    getUserById(id) {
      const self = this;
      return new Promise((resolve, reject) => {
        let userObj = self.users[id];
        if(userObj) {
          resolve(userObj);
        } else {
          nkcAPI(`/u/${id}?from=panel`, "GET")
            .then(data => {
              if(data.targetUser.hidden) return;
              const userObj = {
                subscribed: data.subscribed,
                user: data.targetUser
              };
              self.users[data.targetUser.uid] = userObj;
              resolve(userObj);
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        }
      });
    },
  }
}
</script>
