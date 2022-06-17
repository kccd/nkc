<template lang="pug">
  div
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
@import "../../publicModules/base";
</style>
<script>
import {fromNow, getUrl, objToStr} from "../js/tools";
import {collectionArticle, collectionThread} from "../js/subscribe";
import {nkcAPI} from "../js/netAPI";
export default {
  props: ['subscribes', 'collection-Threads-id'],
  data: () => ({
  }),
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
  }
}
</script>
