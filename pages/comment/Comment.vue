<template lang="pug">
  div

    mixin skeleton
      .comment-item
        .comment-item-header
          .comment-item-avatar.skeleton
          .comment-item-info
            .comment-item-username.skeleton
            .comment-item-time.skeleton
        .comment-item-content
          div.skeleton
          div.skeleton
          div.skeleton

    .comment-header 评论列表 {{source}} {{sid}}
    .comment-list(v-if="loading")
      .loading(v-if="loading")
        +skeleton
        +skeleton
        +skeleton
    .comment-list(v-else-if="comments.length === 0")
      .text-center.p-t-3.p-b-3 空空如也~
    .comment-list(v-else)
      .comment-item(v-for="comment in comments")
        .comment-item-header
          .comment-item-avatar
            img(:src="comment.avatarUrl")
          .comment-item-info
            .comment-item-username
              span(v-if="!comment.userHome") {{comment.username}}
              a(v-else :href="comment.userHome") {{comment.username}}
            .comment-item-time {{comment.time}}
        .comment-item-content(v-html="comment.content")
    .comment-editor
      comment-editor
</template>

<style lang="less" scoped>
  @import "../publicModules/base";
  .comment-header {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f4f4f4;
  }
  .comment-item{
    margin: 1rem 0;
    .comment-item-header{
      @height: 3rem;
      margin-bottom: 0.5rem;
      height: 3rem;
      padding-left: @height + 0.5rem;
      position: relative;
      .comment-item-avatar{
        position: absolute;
        border-radius: 50%;
        overflow: hidden;
        top: 0;
        left: 0;
        height: @height;
        width: @height;
        img{
          height: 100%;
          width: 100%;
        }
      }
      .comment-item-info{
        .comment-item-username{
          font-size: 1.3rem;
          height: 1.6rem;
          line-height: 1.6rem;
          .hideText(@line: 1);
          margin-bottom: 0.2rem;
        }
        .comment-item-time{
          font-size: 1rem;
          height: 1.3rem;
          line-height: 1.3rem;
          .hideText(@line: 1);
        }
      }
    }
  }
  .loading{
    @bgColor: #eee;
    @height: 1.2rem;
    .comment-item-avatar{
      background-color: @bgColor;
    }
    .comment-item-username{
      max-width: 6rem;
      height: @height;
      background-color: @bgColor;
    }
    .comment-item-time{
      max-width: 10rem;
      height: @height;
      background-color: @bgColor;
    }
    .comment-item-content div{
      height: @height;
      background-color: @bgColor;
      margin-bottom: 0.3rem;
      &:last-child{
        max-width: 60%;
      }
    }
    .skeleton{
      background-image: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
      width: 100%;
      height: 0.6rem;
      list-style: none;
      background-size: 400% 100%;
      background-position: 100% 50%;
      animation: skeleton-loading 1s ease infinite;
    }
    @keyframes skeleton-loading {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }
  }
</style>

<script>
  import CommentEditor from "./CommentEditor"
  export default {
    props: ['source', 'sid'],
    data: () => ({
      loading: true,

      comments: [
        {
          _id: 123,
          username: 'BBB123',
          userHome: 'http://1921.68.11.250:9000',
          time: '2021/12/04 23:11:27',
          avatarUrl: 'http://192.168.11.250:9000/a/61de53e547d5ec4d10c43a02?c=userAvatar',
          content: '动画的过程实际就是一个3倍容器宽的线性背景图片相对于容器的偏移从 -300px 到 0 的变化的过程。 最后一步. 最后一步，就是别忘了把背景图改成正常的颜色'
        },
        {
          _id: 123,
          username: 'BBB123',
          userHome: 'http://1921.68.11.250:9000',
          time: '2021/12/04 23:11:27',
          avatarUrl: 'http://192.168.11.250:9000/a/61de53e547d5ec4d10c43a02?c=userAvatar',
          content: '动画的过程实际就是一个3倍容器宽的线性背景图片相对于容器的偏移从 -300px 到 0 的变化的过程。 最后一步. 最后一步，就是别忘了把背景图改成正常的颜色'
        }
      ]
    }),
    components: {
      "comment-editor": CommentEditor
    },
    mounted() {
      const self = this;
      setTimeout(() => {
        self.loading = false;
      }, 1500)
    }
}
</script>

