<template lang="pug">
  .comment-vote
    .comment-vote-up(:class="vote === 'up' ? 'active' : ''" data-cid=cid_ @click="commentsVote(cid_, 'up')")
      .fa.fa-caret-up
      .comment-vote-number(data-cid=cid) {{voteUp_ > 0 ? voteUp_ : ''}}
    .comment-vote-down(:class="vote === 'down' ? 'active' : ''" data-cid=cid_ @click="commentsVote(cid_, 'down')")
      .fa.fa-caret-down
      .comment-vote-number(data-cid=cid)

</template>

<style lang="less" scoped>
@import "../../../publicModules/base";
.comment-vote{
  height: 1.3rem;
  line-height: 1.3rem;
  display: inline-block;
}
.comment-vote>div{
  vertical-align: top;
  display: inline-block;
  height: 1.3rem;
  line-height: 1.3rem;
  font-size: 1rem;
  min-width: 1.5rem;
  padding: 0 0.6rem;
  cursor: pointer;
  text-align: center;
}.comment-vote>div:last-child{
   line-height: 1.3rem;
 }
.comment-vote-up, .comment-vote-down{
  /*background-color: #deedfa;*/
  /*color: #3e9ef2;*/
  color: #555;
  border: 1px solid #aaa;
  border-radius: 3px;
  transition: color 0.3s, background-color 0.3s;
  .fa{
    margin: 0 0.15rem;
  }
}
.comment-vote-up {
  margin-right: 5px;
}
/*.comment-vote-up:hover, .comment-vote-down:hover, .comment-vote-up.active, .comment-vote-down.active{*/
.comment-vote-up.active, .comment-vote-down.active{
  background-color: #3e9ef2;
  color: #fff;
  border: 1px solid rgba(0,0,0,0);
}
.comment-vote-up.active .comment-vote-number{
  color: #fff;
}
.comment-vote .comment-vote-number{
  font-weight: 600;
  display: inline;
  color: #607a91;
  max-width: 2.5rem;
  line-height: 1.3rem;
}
</style>

<script>

import {toLogin} from "../../js/account";
import {nkcAPI} from "../../js/netAPI";

export default {
  props: ['article', 'cid', 'voteUp', 'voteDown', 'vote'],
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

