<template lang="pug">
  .moment-commments
    .moment-comment-nav
      span(
        v-for='n in nav'
        :class="{'active': n.type === sort}"
        @click="setActiveNav(n.type)"
        ) {{n.name}}
    .moment-comment-list


    moment-comment-editor(:mid="momentId" :type="postType")
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-comment-nav{
    margin-bottom: 1rem;
    span{
      cursor: pointer;
      margin-right: 0.5rem;
      &.active{
        color: @primary;
      }
    }
  }
</style>

<script>
  import MomentCommentEditor from './MomentCommentEditor'
  export default {
    props: ['mid', 'type'],
    components: {
      'moment-comment-editor': MomentCommentEditor,
    },
    data: () => ({
      moments: [],
      sort: null,
      nav: [
        {
          type: 'hot',
          name: '按热度',
        },
        {
          type: 'time',
          name: '按时间',
        }
      ]
    }),
    mounted() {
      this.setActiveNav(this.nav[0].type);
    },
    methods: {
      setActiveNav(type) {
        this.sort = type;
        this.getComments();
      },
      getComments(page = 0) {

      }
    },
    computed: {
      postType() {
        return this.type;
      },
      momentId() {
        return this.mid;
      }
    }
  }
</script>
