<template lang="pug">
  .posts-vote
    .posts-vote-up(:class="voteUp_ > 0 ? 'active' : ''" data-cid=cid_ @click="commentsVote(cid_, 'up')")
      .fa.fa-caret-up
      .posts-vote-number(data-cid=cid) {{voteUp_ > 0 ? voteUp_ : ''}}
    .posts-vote-down(:class="voteDown_ > 0 ? 'active' : ''" data-cid=cid_ @click="commentsVote(cid_, 'down')")
      .fa.fa-caret-down
      .posts-vote-number(data-cid=cid)

</template>

<style lang="less" scoped>
@import "../../../publicModules/base";
.posts-vote{
  .posts-vote-up{
    margin-right: 5px;
  }
}
</style>

<script>

import {toLogin} from "../../js/account";
import {nkcAPI} from "../../js/netAPI";

export default {
  props: ['article', 'cid', 'voteUp', 'voteDown'],
  data: () => ({
    cid_: '',
    voteUp_: '',
    voteDown_: '',
  }),
  components: {
  },
  created() {
    this.cid_ = this.cid
    this.voteUp_ = this.voteUp
    this.voteDown_ = this.voteDown
  },
  mounted() {

  },
  methods: {
    commentsVote(cid,type){
      self = this;
      if(!NKC.configs.uid || type === 'login') return toLogin('login');
      if(self.article){
        let url = '/article/' + cid + '/vote/down';
        if(type === 'up') {
          url = '/article/' + cid + '/vote/up';
        }
        nkcAPI(url, 'POST', {})
          .then(function(data) {
            self.voteUp_ = data.article.voteUp;
            self.voteDown_ = data.article.voteDown;
          })
      }else {
        let url = '/comment/' + cid + '/vote/down';
        if(type === 'up') {
          url = '/comment/' + cid + '/vote/up';
        }
        nkcAPI(url, 'POST', {})
          .then(function(data) {
            self.voteUp_ = data.comment.voteUp;
            self.voteDown_ = data.comment.voteDown;
          })
      }

    }

  }
}
</script>

