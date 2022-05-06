<template lang="pug">
  .subscribe-thread(v-if="targetUser")
    subscribe-types(ref="subscribeTypes")
    nav-types(ref="navTypes" :target-user="targetUser" :parent-type="parentType" type="collection" :subscribe-types="subscribeTypes" @click-type="clickType"  @edit-type="editType")
    paging(ref="paging" :pages="pageButtons" @click-button="clickPage")
    .account-threads.subscribe-thread
      .null(v-if="!subscribes.length") 空空如也~
      .subscribe-thread-list(v-else)
        .account-thread(v-for="subscribe in subscribes")
          .account-thread(:class="threadType(subscribe.thread)" v-if="subscribe.type === 'collection'")
            .account-reason(v-if="subscribe.thread.disabled") 已屏蔽，仅自己可见。
            .account-reason(v-else-if="subscribe.thread.recycleMark") 退修中，仅自己可见，修改后对所有人可见。
            .account-reason(v-else-if="!subscribe.thread.reviewed") 审核中，仅自己可见，通过后对所有人可见。
            .account-thread-avatar
              div(:style="`background-image: url(${getUrl('postCover', subscribe.thread.firstPost.cover)})`" v-if="subscribe.thread.firstPost.cover")
            .account-thread-content(:style="!subscribe.thread.firstPost.cover?'display: block':''")
              .account-thread-title(:class="subscribe.thread.digest?'digest':''")
                .account-follower-buttons(:data-thread="subscribe.tid" :class="collectionThreadsId.includes(subscribe.tid) ? 'active' : ''")
                  button.category.collection-button.m-r-05(@click="moveSub([subscribe.tid])") 分类
                  button.subscribe.collection-button(@click="subThread(subscribe.tid, 'collection')")
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
          .account-thread(:class="subscribe.article.status" v-if="subscribe.type === 'article'")
            .account-reason(v-if="subscribe.article.statue === 'disabled'") 已屏蔽，仅自己可见。
            .account-reason(v-else-if="subscribe.article.status === 'faulty'") 退修中，仅自己可见，修改后对所有人可见。
            .account-reason(v-else-if="subscribe.article.status === 'default'") 审核中，仅自己可见，通过后对所有人可见。
            .account-thread-avatar
              div(:style="`background-image: url(${getUrl('postCover', subscribe.article.cover)})`" v-if="subscribe.article.cover")
            .account-thread-content(:style="!subscribe.article.cover?'display: block':''")
              .account-thread-title(:class="subscribe.article.digest?'digest':''")
                .account-follower-buttons(:data-thread="subscribe.tid" :class="collectionThreadsId.includes(subscribe.tid) ? 'active' : ''")
                  button.category.collection-button.m-r-05(@click="moveSub([subscribe.tid])") 分类
                  button.subscribe.collection-button(@click="subArticle(subscribe.tid, 'article')")
                a(:href="subscribe.article.url" :title="subscribe.article.title" target="_blank") {{subscribe.article.title}}
              .account-thread-abstract {{subscribe.article.abstract || subscribe.article.content}}
              .account-thread-info
                .thread-time
                  span {{fromNow(subscribe.article.toc)}}
                a.thread-forum-link(:href="subscribe.article.column.homeUrl" target="_blank" v-if="subscribe.article.source === 'column'") {{subscribe.article.column.name}}
                span.thread-forum-link(v-else) 空间文章
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
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
@media (max-width: 768px) {
  .account-thread-avatar{
    &>div{
      width: 9rem!important;
      height: 6rem!important;
    }
  }
}
.null {
  text-align: center;
  margin: 5rem 0;
}
.account-threads, .account-followers{
  .account-thread:last-child{
    margin-bottom: 0;
  }
}
.account-follower-buttons{
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
import NavTypes from "./NavTypes";
import Paging from "../../../../lib/vue/Paging";
import SubscribeTypes from "../../../../lib/vue/SubscribeTypes";
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getUrl, fromNow} from "../../../../lib/js/tools";
import {collectionThread, collectionArticle} from "../../../../lib/js/subscribe";
import {objToStr} from "../../../../lib/js/tools";
import {getState} from "../../../../lib/js/state";
import {setPageTitle} from "../../../../lib/js/pageSwitch";
export default {
  data: () => ({
    uid: null,
    targetUser: null,
    subscribes: [],
    paging: null,
    t: 'null',
    parentType: null,
    collectionThreadsId: [],
    subscribeTypes: [],
  }),
  components: {
    "subscribe-types": SubscribeTypes,
    'nav-types': NavTypes,
    'paging': Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    setPageTitle('收藏的文章');
    this.initData();
    this.getThreads();
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
    initData() {
      const {uid} = this.$route.params;
      const {uid: stateUid} = getState();
      this.uid = uid || stateUid;
    },
    //获取用户收藏的文章
    getThreads(page) {
      const self = this;
      let url = `/u/${self.uid}/profile/subscribe/collectionData`;
      if(self.t) url = url + `?t=${self.t}`;
      if(page) {
        if(url.indexOf('?') === -1) {
          url = url + `?page=${page}`;
        } else {
          url = url + `page=${page}`;
        }
      }
      nkcAPI(url, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.subscribes = res.subscribes;
        self.paging = res.paging;
        self.parentType = res.parentType;
        self.t = res.t;
        self.collectionThreadsId = res.collectionThreadsId;
        self.subscribeTypes = res.subscribeTypes;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //转移分类
    moveSub(subsId = []) {
      const subscribes = [];
      const _subscribesObj = {};
      const self = this;
      const _subscribes = self.subscribes;
      _subscribes.map(s => {
        _subscribesObj[s.tid] = s;
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
      const sub = !self.collectionThreadsId.includes(id);
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          collectionArticle(id, sub, cid)
            .then(() => {
              const index = self.collectionThreadsId.indexOf(id);
              if(index === -1) self.collectionThreadsId.push(id);
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
            const index = self.collectionThreadsId.indexOf(id);
            if(index !== -1) self.collectionThreadsId.splice(index, 1);
            sweetSuccess('收藏已取消');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    },
    //收藏和取消收藏文章
    subThread(id) {
      const self = this;
      const sub = !self.collectionThreadsId.includes(id);
      if(sub) {
        self.$refs.subscribeTypes.open((cid) => {
          collectionThread(id, sub, cid)
          .then(() => {
            const index = self.collectionThreadsId.indexOf(id);
            if(index === -1) self.collectionThreadsId.push(id);
            sweetSuccess('收藏成功');
            self.$refs.subscribeTypes.close();
          })
          .catch(err => {
            sweetError(err);
          })
        }, {
        })
      } else {
        collectionThread(id, sub)
          .then(() => {
            const index = self.collectionThreadsId.indexOf(id);
            if(index !== -1) self.collectionThreadsId.splice(index, 1);
            sweetSuccess('收藏已取消');
          })
          .catch(err => {
            sweetError(err);
          })
      }
    },
    //点击文章分类时
    clickType(t){
      this.t = t;
      this.getThreads();
    },
    //管理分类
    editType() {
      this.$refs.subscribeTypes.open(() => {
      },{
        editType: true
      })
    },
    //点击分页
    clickPage(num) {
      if(!num) return;
      this.getThreads(num);
    }
  }
}
</script>
