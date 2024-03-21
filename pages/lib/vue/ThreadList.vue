<template lang="pug">
  div
    subscribe-types(ref="subscribeTypes")
    nav-types(ref="navTypes")
    .account-thread(v-for="subscribe in subscribes")
      .account-thread(:class="subscribe.article.status" v-if="subscribe.source === 'collectionArticle'")
        .account-reason(v-if="subscribe.article.status === 'disabled'") 已屏蔽，仅自己可见。
        .account-reason(v-else-if="subscribe.article.status === 'faulty'") 退修中，仅自己可见，修改后对所有人可见。
        .account-reason(v-else-if="subscribe.article.status === 'default'") 审核中，仅自己可见，通过后对所有人可见。
        .account-thread-avatar
          div(:style="`background-image: url(${getUrl('postCover', subscribe.article.cover)})`" v-if="subscribe.article.cover")
        .account-thread-content(:style="!subscribe.article.cover?'display: block':''")
          .account-thread-title(:class="subscribe.article.digest?'digest':''")
            .account-follower-buttons(:data-thread="subscribe.tid" :class="threadsId.includes(subscribe.sid) ? 'active' : ''")
              button.category.collection-button.m-r-05(@click="moveSub([subscribe.sid])") 分类
              button.subscribe(@click="subArticle(subscribe.sid, 'article')" :class="{'collection-button': type === 'collection'}")
            a(:href="subscribe.article.url" :title="subscribe.article.title" target="_blank") {{subscribe.article.title}}
          .account-thread-abstract {{subscribe.article.abstract || subscribe.article.content}}
          .account-thread-info
            .thread-time
              span {{fromNow(subscribe.article.toc)}}
            //a.thread-forum-link(:href="subscribe.article.column.homeUrl" target="_blank" v-if="subscribe.article.source === 'column'") {{subscribe.article.column.name}}
            a.thread-forum-link(:href="subscribe.article.column.homeUrl" target="_blank" v-if="subscribe.article.source === 'column' && subscribe.article.column ") {{subscribe.article.column.name}}
            //span.thread-forum-link(v-else) 空间文章
            span.thread-forum-link(v-else) 独立文章
            span(v-if="subscribe.article.anonymous") 匿名
            a.thread-user(:href="`/u/${subscribe.article.uid}`" target="_blank" v-else)
              img(:src="getUrl('userAvatar', subscribe.article.user.avatar)"
                data-global-mouseover="showUserPanel"
                data-global-mouseout="hideUserPanel"
                :data-global-data="objToStr({uid: subscribe.article.uid})"
              )
              span {{subscribe.article.user.username}}
            .thread-thumbup(v-if="subscribe.article.voteUp && subscribe.article.voteUp > 0")
              .fa.fa-thumbs-up
              span {{subscribe.article.voteUp}}
            .thread-hits(v-if="subscribe.article.hits")
              .fa.fa-eye
              span {{subscribe.article.hits}}
            .thread-comment(v-if="subscribe.article.count")
              .fa.fa-comment
              span {{subscribe.article.count}}
      .account-thread(:class="threadType(subscribe.thread)" v-if="subscribe.source === 'collectionThread'")
        .account-reason(v-if="subscribe.thread.disabled") 已屏蔽，仅自己可见。
        .account-reason(v-else-if="subscribe.thread.recycleMark") 退修中，仅自己可见，修改后对所有人可见。
        .account-reason(v-else-if="!subscribe.thread.reviewed") 审核中，仅自己可见，通过后对所有人可见。
        .account-thread-avatar
          div(:style="`background-image: url(${getUrl('postCover', subscribe.thread.firstPost.cover)})`" v-if="subscribe.thread.firstPost.cover")
        .account-thread-content(:style="!subscribe.thread.firstPost.cover?'display: block':''")
          .account-thread-title(:class="subscribe.thread.digest?'digest':''")
            .account-follower-buttons(:data-thread="subscribe.sid" :class="threadsId.includes(subscribe.sid) ? 'active' : ''")
              button.category.collection-button.m-r-05(@click="moveSub([subscribe.sid])") 分类
              button.subscribe(@click="subThread(subscribe.sid)" :class="{'collection-button': type === 'collection'}")
            a(:href="`/t/${subscribe.thread.tid}`" :title="subscribe.thread.firstPost.t" target="_blank") {{subscribe.thread.firstPost.t}}
          .account-thread-abstract {{subscribe.thread.firstPost.abstractCN || subscribe.thread.firstPost.c}}
          .account-thread-info
            .thread-time
              span {{fromNow(subscribe.thread.toc)}}
            a.thread-forum-link(:href="`/f/${subscribe.thread.forums[0].fid}`" target="_blank") {{subscribe.thread.forums[0].displayName}}
            span(v-if="subscribe.thread.firstPost.anonymous") 匿名
            a.thread-user(:href="`/u/${subscribe.thread.uid}`" v-else)
              img(:src="getUrl('userAvatar', subscribe.thread.firstPost.user.avatar)"
                data-global-mouseover="showUserPanel"
                data-global-mouseout="hideUserPanel"
                :data-global-data="objToStr({uid: subscribe.thread.uid})"
              )
              span {{subscribe.thread.firstPost.user.username}}
            .thread-thumbup(v-if="subscribe.thread.firstPost.voteUp")
              .fa.fa-thumbs-up
              span {{subscribe.thread.firstPost.voteUp}}
            .thread-hits(v-if="subscribe.thread.hits")
              .fa.fa-eye
              span {{subscribe.thread.hits}}
            .thread-comment(v-if="subscribe.thread.count")
              .fa.fa-comment
              span {{subscribe.thread.count}}
      .account-thread(:class="threadType(subscribe.post)" v-if="subscribe.source === 'collectionPost'")
        .account-reason(v-if="subscribe.post.disabled") 回复已屏蔽。
        .account-reason(v-else-if="subscribe.post.recycleMark") 退修中，修改后对所有人可见。
        .account-reason(v-else-if="!subscribe.post.reviewed") 审核中，通过后对所有人可见。
        .account-thread-avatar(v-if="!subscribe.post.disabled")
          div(:style="`background-image: url(${getUrl('postCover', subscribe.post.cover)})`" v-if="subscribe.post.cover")
        .account-thread-content(:style="!subscribe.post.cover?'display: block':''")
          .account-thread-title(:class="subscribe.post.digest?'digest':''")
            .account-follower-buttons(:data-thread="subscribe.sid" :class="threadsId.includes(subscribe.sid) ? 'active' : ''")
              button.category.collection-button.m-r-05(@click="moveSub([subscribe.sid])") 分类
              button.subscribe(@click="subPost(subscribe.sid)" :class="{'collection-button': type === 'collection'}")
            a(:href="`/p/${subscribe.post.pid}`" :title="subscribe.post.t" target="_blank") {{subscribe.post.t}}
          .account-thread-abstract(v-if="!subscribe.post.disabled") {{subscribe.post.abstractCN || subscribe.post.c}}
          .account-thread-info
            .thread-time
              span {{fromNow(subscribe.post.toc)}}
            span 发表于
              a.thread-forum-link(:href="`${subscribe.post.postUrl}`" target="_blank") 《{{ subscribe.post.thread.firstPost.t }}》
            span(v-if="subscribe.post.anonymous") 匿名
            a.thread-user(:href="`/u/${subscribe.post.uid}`" v-else)
              img(:src="getUrl('userAvatar', subscribe.post.user.avatar)"
                data-global-mouseover="showUserPanel"
                data-global-mouseout="hideUserPanel"
                :data-global-data="objToStr({uid: subscribe.post.uid})"
              )
              span {{subscribe.post.user.username}}
            .thread-thumbup(v-if="subscribe.post.voteUp")
              .fa.fa-thumbs-up
              span {{subscribe.post.voteUp}}
            //.thread-hits(v-if="subscribe.thread.hits")
              .fa.fa-eye
              span {{subscribe.thread.hits}}
            .thread-comment(v-if="subscribe.post.postCount")
              .fa.fa-comment
              span {{subscribe.post.postCount}}
      .account-thread(:class="subscribe.comment.status" v-if="subscribe.source === 'collectionComment'")
        .account-reason(v-if="subscribe.comment.status === 'disabled'") 内容已屏蔽。
        .account-reason(v-else-if="subscribe.comment.status === 'faulty'") 退修中，内容已屏蔽，修改后对所有人可见。
        .account-reason(v-else-if="subscribe.comment.status === 'default'") 审核中，内容已屏蔽，通过后对所有人可见。
        .account-thread-avatar
          div(:style="`background-image: url(${getUrl('postCover', subscribe.comment.cover)})`" v-if="subscribe.comment.cover")
        .account-thread-content(:style="!subscribe.comment.cover?'display: block':''")
          .account-thread-title(:class="subscribe.comment.digest?'digest':''")
            .account-follower-buttons(:data-thread="subscribe.tid" :class="threadsId.includes(subscribe.sid) ? 'active' : ''")
              button.category.collection-button.m-r-05(@click="moveSub([subscribe.sid])") 分类
              button.subscribe(@click="subComment(subscribe.sid, 'article')" :class="{'collection-button': type === 'collection'}")
            //a(:href="subscribe.article.url" :title="subscribe.article.title" target="_blank") {{subscribe.article.title}}
          .account-thread-abstract(v-if="subscribe.comment.status === 'normal'") {{subscribe.comment.content}}
          .account-thread-info
            .thread-time
              span {{fromNow(subscribe.comment.toc)}}
            span 发表于
              a.thread-forum-link(:href="`${subscribe.comment.commentUrl}`" target="_blank") 《{{ subscribe.comment.articleDocument.title }}》
            span(v-if="subscribe.comment.anonymous") 匿名
            a.thread-user(:href="`/u/${subscribe.comment.uid}`" target="_blank" v-else)
              img(:src="getUrl('userAvatar', subscribe.comment.user.avatar)"
                data-global-mouseover="showUserPanel"
                data-global-mouseout="hideUserPanel"
                :data-global-data="objToStr({uid: subscribe.comment.uid})"
              )
              span {{subscribe.comment.user.username}}
            .thread-thumbup(v-if="subscribe.comment.voteUp && subscribe.comment.voteUp > 0")
              .fa.fa-thumbs-up
              span {{subscribe.comment.voteUp}}
            .thread-hits(v-if="subscribe.comment.hits")
              .fa.fa-eye
              span {{subscribe.comment.hits}}
            .thread-comment(v-if="subscribe.comment.count")
              .fa.fa-comment
              span {{subscribe.comment.count}}

</template>
<style lang="less" scoped>
@import "../../publicModules/base";
@media (max-width: 768px) {
  .account-thread-avatar{
    &>div{
      width: 9rem!important;
      height: 6rem!important;
    }
  }
}
.account-thread:last-child{
  margin-bottom: 0;
}
.account-follower-buttons {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 1rem;

  @buttonHeight: 2rem;
  @buttonWidth: 4rem;

  button{
    &:focus{
      outline: none;
    }
    height: @buttonHeight;
    width: @buttonWidth;
    //line-height: @buttonHeight;
    border-radius: 2px;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2);
  }
  .category{
    background-color: #fff;
    display: none;
    color: @dark;
    border: 1px solid #ccc;
    &:hover{
      background-color: #eee;
    }
  }
  .subscribe{
    background-color: @primary;
    border: 1px solid @primary;
    color: #fff;
    &:after{
      content: "关注";
    }
    &.collection-button:after{
      content: "收藏";
    }
    &:hover{
      background-color: #2777b1;
    }
  }
  &.active{
    .subscribe{
      background-color: @accent;
      border: 1px solid @accent;
      &:hover{
        background-color: #cb4c61;
      }
      &:after{
        content: "取关";
      }
      &.collection-button:after{
        content: "取藏"
      }
    }
    .category{
      display: inline-block;
    }
  }
}
.subscribe-thread {
  .account-thread{
    margin-bottom: 1.5rem;
    //padding-bottom: 1rem;
    &.draft-list{
      .checkbox{
        display: inline;
        cursor: pointer;
        label{
          padding: 4px 0 0 20px;
        }
      }
      .draft-button{
        .dropdown-menu{
          a{
            color: #333;
            .fa{
              color: #444;
            }

          }
        }
        a{
          color: @primary;
        }
        button{
          background-color: rgba(0, 0, 0, 0);
          color: @accent;
          margin-right: 0.3rem;
          border: none;
          &:focus{
            outline: none;
          }
        }
      }
    }
    .account-post-thread-user{
      .time{
        color: @accent;
        display: inline;
        margin-right: 0.3rem;
      }
      img{
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 50%;
        margin-left: 0.3rem;
        margin-top: -2px;
        margin-right: 0.2rem;
      }
      a{
        color: @primary;
      }
    }
    .account-post-thread{
      padding: 1rem;
      background-color: #f6f2ee;
      border-radius: 3px;
      .account-post-thread-warning{
        text-align: center;
        color: #bbab9c;
        //font-weight: 700;
        .fa{
          margin-right: 0.3rem;
        }
      }
    }
    .account-post-content{
      margin: 0.4rem 0 0.6rem 0;
      text-decoration: none;
      color: @dark;
      max-height: 5rem;
      .hideText(@line: 3)
    }
    &.draft{
      @warningColor: rgba(255, 255, 0, 0.2);
      background-color: @warningColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    &.disabled{
      @disabledColor: rgba(0, 0, 0, 0.07);
      background-color: @disabledColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    &.faulty{
        @disabledColor: rgba(0, 0, 0, 0.07);
        background-color: @disabledColor;
        .account-reason{
          text-align: center;
          color: @accent;
          padding: 0.5rem;
          font-weight: 700;
        }
      }
    &.review{
      @disabledColor: rgba(255, 0, 0, 0.07);
      background-color: @disabledColor;
      .account-reason{
        text-align: center;
        color: @accent;
        padding: 0.5rem;
        font-weight: 700;
        //background-color: @warningColor;
      }
    }
    .account-thread-avatar{
      display: table-cell;
      vertical-align: top;
      &>div{
        width: 12rem;
        height: 8rem;
        margin-right: 1rem;
        overflow: hidden;
        border-radius: 3px;
        background-size: cover;
      }
    }
    .account-thread-content{
      display: table-cell;
      vertical-align: top;
      overflow: hidden;
      width: 100%;
      .account-thread-title{
        font-size: 1.3rem;
        display: -webkit-box;
        font-weight: 700;
        height: 1.8rem;
        color: @dark;
        .hideText(@line: 1);
        &.digest a{
          color: @accent;
          &:hover, &:focus{
            color: @accent;
          }
          &:hover{
            border-color: @accent;
          }
        }
        a{
          color: @dark;
          transition: border-bottom-color 200ms;
          border-bottom: 1px solid rgba(0, 0, 0, 0);
          padding-bottom: 0.1rem;
          &:hover, &:focus{
            text-decoration: none;
            color: @dark;
          }
          &:hover{
            border-color: @dark;
          }
        }
      }
      .account-thread-abstract{
        margin: 0.6rem 0;
        max-height: 3.5rem;
        .hideText(@line: 2);
      }
      .account-thread-info{
        position: relative;
        height: 1.8rem;
        display: block;
        width: 100%;
        padding-right: 7rem;
        .hideText(@line: 1);
        &>div{
          display: inline;
          margin-right: 0.3rem;
        }
        .thread-forum-link{
          margin-right: 0.5rem;
          color: #888;
        }
        .thread-time{
          position: absolute;
          right: 0;
          top: 0;
        }
        .thread-user{
          margin-right: 0.3rem;
          &:hover, &:focus{
            color: #555;
            text-decoration: none;
          }
          img{
            height: 1.4rem;
            width: 1.4rem;
            margin-top: -2px;
            margin-right: 0.3rem;
            border-radius: 50%;
          }
          span{

          }
        }
        .fa{
          color: #aaa;
          margin-right: 0.3rem;
        }
        span{
          color: #888;
        }
      }
    }
  }
}
.subscribe-thread{
  .account-thread-title{
    padding-right: 9rem;
    position: relative;
    padding-top: 0.1rem;
    height: 2.1rem!important;
    box-sizing: border-box;
  }
}
</style>
<script>
import SubscribeTypes from "./SubscribeTypes";
import NavTypes from "../../spa/views/user/subscribe/NavTypes";
import {fromNow, getUrl, objToStr} from "../js/tools";
import {collectionArticle, collectionReply, collectionThread, subscribeThread, unSubscribeThread} from "../js/subscribe";
import {nkcAPI} from "../js/netAPI";
export default {
  props: ['subscribes', 'threads-id', 'type'],
  data: () => ({
  }),
  components: {
    'subscribe-types': SubscribeTypes,
    'nav-types': NavTypes,
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    fromNow: fromNow,
    threadType(thread) {
      const {disabled, recycleMark, reviewed} = thread;
      let klass = '';
      if(disabled) {
        klass = 'disabled'
      } else if(recycleMark) {
        klass = 'draft';
      } else if(!reviewed) {
        klass = 'review'
      }
      return klass;
    },
    //收藏和取消收藏文章
    subThread(id) {
      const self = this;
      const sub = !self.threadsId.includes(id);
      if(sub) {
        if(self.type === 'collection') {
          self.$refs.subscribeTypes.open((cid) => {
            collectionThread(id, sub, cid)
              .then(() => {
                const index = self.threadsId.indexOf(id);
                if(index === -1) self.threadsId.push(id);
                sweetSuccess('收藏成功');
                self.$refs.subscribeTypes.close();
              })
              .catch(err => {
                sweetError(err);
              })
          }, {
          })
        } else {
          self.$refs.subscribeTypes.open((cid) => {
            subscribeThread(id, cid)
              .then(() => {
                const index = self.threadsId.indexOf(id);
                if(index === -1) self.threadsId.push(id);
                sweetSuccess('关注成功');
                self.$refs.subscribeTypes.close();
              })
              .catch(err => {
                sweetError(err);
              })
          }, {})
        }
      } else {
        if(self.type === 'collection') {
          collectionThread(id, sub)
            .then(() => {
              const index = self.threadsId.indexOf(id);
              if(index !== -1) self.threadsId.splice(index, 1);
              sweetSuccess('收藏已取消');
            })
            .catch(err => {
              sweetError(err);
            })
        } else {
          unSubscribeThread(id)
            .then(() => {
              const index = self.threadsId.indexOf(id);
              if(index !== -1) self.threadsId.splice(index, 1);
              sweetSuccess('关注已取消');
            })
            .catch(err => {
              sweetError(err);
            })
        }
      }
    },
    //转移分类
    moveSub(subsId = []) {
      const subscribes = [];
      const _subscribesObj = {};
      const self = this;
      const _subscribes = self.subscribes;
      _subscribes.map(s => {
        _subscribesObj[s.sid] = s;
      })
      subsId.map(id => {
        const s = _subscribesObj[id];
        if(s) subscribes.push(s);
      })
      let selectedTypesId = [];
      if(subscribes.length === 1) {
        selectedTypesId = subscribes[0].cid;
      } else if(subscribes.length === 0) {
        return;
      }
      subsId = subscribes.map(s => s._id);
      self.$refs.subscribeTypes.open((typesId) => {
        nkcAPI("/account/subscribes", "PUT", {
          type: "modifyType",
          typesId: typesId,
          subscribesId: subsId
        })
          .then(function() {
            self.$refs.subscribeTypes.close();
            subscribes.map(s => {
              s.cid = typesId
            });
            sweetSuccess("执行成功");
          })
          .catch(function(data) {
            sweetError(data);
          })
      }, {
        selectedTypesId: selectedTypesId,
        hideInfo: true,
        selectTypesWhenSubscribe: true
      });
    },
    subArticle(id, ) {
      const self = this;
      const sub = !self.threadsId.includes(id);
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          collectionArticle(id, sub, cid)
            .then(() => {
              const index = self.threadsId.indexOf(id);
              if(index === -1) self.threadsId.push(id);
              sweetSuccess('收藏成功');
              self.$refs.subscribeTypes.close();
            })
            .catch(err => {
              sweetError(err);
            })
        }, {
        })
      } else {
        collectionArticle(id, sub)
          .then(() => {
            const index = self.threadsId.indexOf(id);
            if(index !== -1) self.threadsId.splice(index, 1);
            sweetSuccess('收藏已取消');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    },
    subComment(id){
      const self = this;
      const sub = !self.threadsId.includes(id);
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          collectionReply(id, sub, cid,'comment')
            .then(() => {
              const index = self.threadsId.indexOf(id);
              if(index === -1) self.threadsId.push(id);
              sweetSuccess('收藏成功');
              self.$refs.subscribeTypes.close();
            })
            .catch(err => {
              sweetError(err);
            })
        }, {
        })
      } else {
        collectionReply(id, sub,[],'comment')
          .then(() => {
            const index = self.threadsId.indexOf(id);
            if(index !== -1) self.threadsId.splice(index, 1);
            sweetSuccess('收藏已取消');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    },
    subPost(id){
      const self = this;
      const sub = !self.threadsId.includes(id);
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          collectionReply(id, sub, cid,'post')
            .then(() => {
              const index = self.threadsId.indexOf(id);
              if(index === -1) self.threadsId.push(id);
              sweetSuccess('收藏成功');
              self.$refs.subscribeTypes.close();
            })
            .catch(err => {
              sweetError(err);
            })
        }, {
        })
      } else {
        collectionReply(id, sub,[],'post')
          .then(() => {
            const index = self.threadsId.indexOf(id);
            if(index !== -1) self.threadsId.splice(index, 1);
            sweetSuccess('收藏已取消');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    }
  }
}
</script>
