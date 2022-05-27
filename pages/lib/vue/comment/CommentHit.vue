<template lang="pug">
  .posts-vote
    .posts-vote-up(class=vote === 'up' ? 'active' : '' data-cid=cid @click="commentsVote(cid, 'up')")
      .fa.fa-caret-up
      .posts-vote-number(data-cid=cid)= voteUp || ''
    .posts-vote-down(class=vote === 'down' ? 'active' : '' data-cid=cid @click="commentsVote(cid, 'down')")
      .fa.fa-caret-down
</template>

<style lang="less" scoped>
@import "../../../publicModules/base";
//div{
//  height: 100px;
//  width: 100px;
//  background: #0e0e0e;
//}
</style>

<script>

export default {
  props: [],
  data: () => ({

  }),
  components: {
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    commentsVote(){

    }
  }
}
</script>

