<template lang="pug">
  .user-draw-count(v-if="user")
    .col-xs-4
      .user-draw-count-number {{user.threadCount - user.disabledThreadsCount}}
      .user-draw-count-title 文章
    .col-xs-4
      .user-draw-count-number {{user.postCount - user.disabledPostsCount}}
      .user-draw-count-title 回复
    .col-xs-4
      .user-draw-count-number {{user.xsf}}
      .user-draw-count-title 学术分

</template>

<script>
export default {
  props: ['user'],
  data: () => ({
  }),
  components: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.user-draw-count{
  font-size: 1.2rem;
  height: 4.4rem;
  padding: 0.2rem 0;
  background-color: #f5f5f5;
  border-radius: 2.2rem;
  .col-xs-4{
    .user-draw-count-number {
      height: 2rem;
      line-height: 2rem;
      text-align: center;
      font-size: 1rem;
      font-weight: 700;
    }
    .user-draw-count-title {
      font-size: 1rem;
      color: #555;
      height: 2rem;
      line-height: 2rem;
      text-align: center;
    }
  }
}
</style>
