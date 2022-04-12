<template lang="pug">
  #forumPanel(v-cloak v-show="show")
    transition(name="fade")
      //- (:style="'background-image: url(/f/'+forum.fid+'/banner)'")
      .float-forum(v-if="forum && (over || onPanel)")
        .float-forum-top
          a(:href="'/f/' + forum.fid" target="_blank").float-forum-cover
            img.float-forum-icon(v-if="forum.logo" :src="getUrl('forumLogo', forum.logo)")
            .float-forum-icon(v-else :style="'background-color: ' + forum.color + ';'")
          .float-forum-info
            a(:href="'/f/' + forum.fid" target="_blank" :style="uid?'padding-right: 3.5rem;':''").float-forum-name {{forum.displayName}}
            button(v-if="uid && subscribed" @click="subscribe") 取关
            button.active(v-if="uid && !subscribed" @click="subscribe") 关注
            .float-forum-count
              .number {{forum.countThreads}}
              | 篇文章，
              .number {{forum.countPosts}}
              | 条回复
        .float-forum-bottom
          .float-forum-description(:title="forum.description") {{forum.description || "暂无简介"}}
</template>
<style lang="less">
@import "../../../publicModules/base";
#forumPanel{
  top: 0;
  left: 0;
  position: absolute;
  z-index: 1000;
  .float-forum{
    background-size: cover;
    border: 1px solid #ccc;
    min-height: 7.5rem;
    padding-bottom: 0.8rem;
    width:  24rem;
    background-color: #fff;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    position: relative;
    border-radius: 3px;
    .float-forum-cover{
      height: 6rem;
      width: 6rem;
      position: absolute;
      z-index: 100;
      top: -1rem;
      left: 0.5rem;
      border-radius: 5px;
      overflow: hidden;
      box-sizing: border-box;
      border: 3px solid #eee;
      .float-forum-icon{
        height: 100%;
        width: 100%;
      }
    }
    .float-forum-info{
      padding-left: 7rem;
      height: 5rem;
      overflow: hidden;
      position: relative;
      .float-forum-name{
        font-size: 1.3rem;
        height: 2rem;
        line-height: 2rem;
        margin-top: 0.9rem;
        display: block;
        .hideText(@line: 1);
        color: @dark;
        &:hover, &:focus{
          text-decoration: none;
        }
      }
      button{
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        border: none;
        border-radius: 2px;
        position: absolute;
        top: 0.9rem;
        right: 1rem;
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

    }
    .float-forum-description{
      padding: 0 0.8rem;
      margin-top: 0.45rem;
      font-style: oblique;
      font-size: 1rem;
      color: #666;
      max-height: 3rem;
      .hideText(@line: 2);
    }
    .float-forum-count{
      font-size: 1rem;
      .number{
        display: inline-block;
        font-style: oblique;
        font-size: 1.2rem;
        margin-right: 0.2rem;
        color: @accent;
        font-weight: 700;
      }
    }
    .float-forum-latest {
      padding: 0 0.8rem;
      .title {
        font-size: 1em;
        font-weight: bold;
        color: black;
      }
    }
  }
}

</style>
<script>
import {getUrl} from "../../js/tools";
import {strToObj} from "../../js/dataConversion";
import {sweetError} from "../../js/sweetAlert";
import {subForum} from "../../js/subscribe";
export default {
  data: () => ({
    forum: "",
    uid: NKC.configs.uid,
    subscribed: false,
    over: false,
    show: false,
    count: 1,
    onPanel: false,
    forums: {},
    timeoutName: "",
  }),
  computed: {
  },
  mounted() {
    window.showForumPanel = this.showForumPanel;
    window.hideForumPanel = this.hideForumPanel;
    const self = this;
    const panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
    });
  },
  methods: {
    getUrl: getUrl,
    initPanel() {
      const doms = $(`[data-float-fid]`);
      for(var i = 0; i < doms.length; i++) {
        const dom = doms.eq(i);
        if(dom.attr("data-float-init") === "true") continue;
        let position = dom.attr("data-float-position");
        if(NKC.configs.isApp) return;
        this.initEvent(doms.eq(i), position);
      }
    },
    reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.forum = "";
    },
    hideForumPanel() {
      const self = this;
      self.timeoutName = setTimeout(() => {
        self.reset();
      }, 200);
    },
    showForumPanel(dom, fid) {
      const DOM = $(dom);
      this.initEvent(DOM, '', fid);
    },
    initEvent(dom, position = 'right', fid) {
      const self = this;
      // 鼠标已悬浮在元素上
      clearTimeout(self.timeoutName);
      self.count ++;
      self.over = true;
      let targetFid;
      let count_ = self.count;
      let left, top, width, height;
      // 做一个延迟，过滤掉鼠标意外划过元素的情况。
      self.timeout(300)
        .then(() => {
          if(count_ !== self.count) throw "timeout 1";
          if(!self.over) throw "timeout 2";
          targetFid = fid || strToObj(dom.attr("data-global-data"));
          left = dom.offset().left;
          top = dom.offset().top;
          width = dom.width();
          height = dom.height();
          return self.getForumById(targetFid);
        })
        .then(forumObj => {
          const {forum, subscribed} = forumObj;
          if(count_ !== self.count) throw "timeout 3";
          if(!self.over) throw "timeout 4";
          self.forum = forum;
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

          const panelWidth = 24 * 12;

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

          panel.css({
            top,
            left
          });
        })
        .catch(err => {
        });
    },
    timeout(t) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, t)
      });
    },
    getForumById(fid) {
      const self = this;
      return new Promise((resolve, reject) => {
        let forumsObj = self.forums[fid];
        nkcAPI(`/f/${fid}/card`, "GET")
          .then(data => {
            forumsObj = {
              forum: {
                ...data.forum,
                latestThreads: data.latestThreads
              },
              subscribed: data.subscribed,
            };
            self.forums[data.forum.fid] = forumsObj;
            resolve(forumsObj);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    subscribe() {
      const self = this;
      const {forum, subscribed} = self;
      const {fid} = forum;
      const sub = !subscribed;
      subForum(fid, sub)
      .then(res => {
        if(sub) {
          sweetSuccess('关注成功');
        } else {
          sweetSuccess('取关成功');
        }
        self.subscribed = sub;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    close() {
    },
  }
}
</script>
