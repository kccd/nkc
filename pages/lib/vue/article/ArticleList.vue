<template lang="pug">
  .article-list(v-if="articles && articles.length !== 0")
    .user-column-box(v-for="item in articles")
      .user-column-body
        .user-column-title
          a.user-column-name(:href="item.homeUrl" target="_blank") {{item.columnName}}
          span(
            data-type="nkcTimestamp"
            :data-time="(new Date(item.toc)).getTime()"
            data-time-type='fromNow'
            :title="timeFormat(item.toc)"
          ) {{fromNow(item.toc)}}
          .user-column-data
            .fa.fa-thumbs-up(v-if="item.voteUp" ) {{item.voteUp}}
            .fa.fa-eye(v-if="item.hits" ) {{item.hits}}
            .fa.fa-comment(v-if="item.count" ) {{item.count}}
        .user-column-content
          a(:href="item.url" target="_blank").user-column-content-title {{item.title}}
          .user-column-content-container
            a(:href="item.url" target="_blank").user-column-content-abstract {{item.content}}
            .user-column-content-cover
              img(:src="getUrl('postCover', item.cover)")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.article-list {
  a{
    cursor: pointer;
  }
  .user-column-box{
    margin-bottom: 2rem;
  }
  .user-column-body{
    padding: 0.7rem 1rem 0.4rem 1rem;
    border-radius: 5px;
    background-color: #f6f2ee;
    border: 2px solid #eae6e2;
    margin-bottom: 0.6rem;
    .user-column-title{
      position: relative;
      padding-right: 6rem;
      .user-column-name{
        color: #000;
        margin-right: 0.5rem;

      }
      .user-column-data{
        position: absolute;
        top: 0;
        right: 0;
        div{
          margin-left: 5px;
        }
      }
    }
  }
  .user-column-content{
    margin-bottom: 0.6rem;
    .user-column-content-title{
      font-size: 1.5rem;
      color: #000;
      font-weight: 700;
      margin-right: 1rem;
      word-break: break-all;
      text-decoration: none;
      border-bottom: rgba(0, 0, 0, 0) solid 1px;
      &:hover{
        border-bottom: 1px solid #000;
      }
    }
    .user-column-content-container{
      position: relative;
      margin-top: 0.3rem;
      .user-column-content-abstract{
        height: 5.2rem;
        font-size: 1.25rem;
        text-decoration: none;
        color: #000;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        padding-right: 10rem;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        @media (max-width: 991px) {
          padding-right: 8rem;
        }
      }
      .user-column-content-cover{
        background: #00a0e9;
        position: absolute;
        top: -2.5rem;
        right: 0;
        border-radius: 3px;
        img{
          height: 7.5rem;
          width: 9.5rem;
          border-radius: 3px;
          background-size: cover;
        }
        @media (max-width: 991px) {
          top: -0.5rem;
          img{
            height: 5.5rem;
            width: 7.5rem;
          }
        }
      }
    }
  }
}
</style>
<script>
import {fromNow, timeFormat, getUrl} from "../../js/tools";
export default {
  props: ['articles'],
  data: () => ({

  }),
  components: {

  },
  mounted() {
  },
  methods: {
    fromNow: fromNow,
    timeFormat: timeFormat,
    getUrl: getUrl,
  }
}
</script>
