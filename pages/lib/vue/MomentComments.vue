<template lang="pug">
  .moment-commments
    .moment-comment-nav(v-if="postType === 'comment'")
      .post-type 评论列表
      .sort-item(
        v-for='n in nav'
        :class="{'active': n.type === sort}"
        @click="setActiveNav(n.type)"
        ) {{n.name}}
    .moment-comment-nav(v-else)
      .post-type 转发动态
    .moment-comment-list


    moment-comment-editor(:mid="momentId" :type="postType")
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-comment-nav{
    margin-bottom: 1rem;
    .post-type{
      font-weight: 700;
      display: inline-block;
      margin-right: 1rem;
    }
    .sort-item{
      display: inline-block;
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
  import {sweetError} from "../js/sweetAlert";

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
        const {sort, postType, momentId} = this;
        if(postType !== 'comment') return;
        nkcAPI(`/moment/${momentId}/comments`, 'GET')
          .then(res => {
            console.log(res)
          })
          .catch(sweetError)
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
