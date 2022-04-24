<template lang="pug">

  mixin articleBody
    .moment-quote-body-article
      .moment-quote-title
        a(:href="quoteData.data.url" target="_blank") {{quoteData.data.title}}
      .moment-quote-abstract(:class="{'cover': quoteData.data.coverUrl}")
        .moment-quote-cover(v-if='quoteData.data.coverUrl' :style="'background-image: url('+quoteData.data.coverUrl+')'")
        span {{quoteData.data.content}}

  mixin momentBody
    .moment-quote-body-moment
      .moment-quote-content(v-html="quoteData.data.content")
      .moment-quote-files(v-if="quoteData.data.files && quoteData.data.files.length > 0")
        moment-files(:data="quoteData.data.files")

  .moment-quote(v-if="data")
    .moment-quote-header
      .moment-quote-avatar(
        data-global-mouseover="showUserPanel"
        data-global-mouseout="hideUserPanel"
        :data-global-data="objToStr({uid: quoteData.data.uid})"
      )
        img(:src="quoteData.data.avatarUrl")
      .moment-quote-username(
        data-global-mouseover="showUserPanel"
        data-global-mouseout="hideUserPanel"
        :data-global-data="objToStr({uid: quoteData.data.uid})"
      )
        a(:href="quoteData.data.userHome" target="_blank") {{quoteData.data.username}}
      .moment-quote-time
        from-now(:time="quoteData.data.toc")
      a.moment-quote-link(:href="quoteData.data.url" v-if="quoteData.quoteType === 'moment'") 详情
    .moment-quote-body(v-if="quoteData.quoteType === 'article'")
      +articleBody
    .moment-quote-body(v-else-if="quoteData.quoteType === 'moment'")
      +momentBody





</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .moment-quote-header{
    &>*{
      display: inline-block;
      margin-right: 0.5rem;
    }
    margin-bottom: 0.54rem;
    .moment-quote-avatar{
      display: inline-block;
      height: 2rem;
      width: 2rem;
      border-radius: 50%;
      overflow: hidden;
      vertical-align: middle;
      img{
        height: 100%;
        width: 100%;
      }
    }
    .moment-quote-username{
      a{
        color: @primary;
      }
    }
    .moment-quote-time{
      font-size: 1rem;
      color: #555;
    }
    .moment-quote-link{
      color: @primary;
      font-size: 1rem;
    }
  }
  .moment-quote-body{
    .moment-quote-body-article{
      .moment-quote-title{
        a{
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
        }
        margin-bottom: 0.5rem;
      }
      .moment-quote-abstract{
        max-height: 7rem;
        @width: 9rem;
        .hideText(@line: 4);
        font-size: 1.25rem;
        &.cover{
          padding-left: @width + 1rem;
          position: relative;
          height: 7rem;
        }
        .moment-quote-cover{
          position: absolute;
          border-radius: 3px;
          top: 0;
          left: 0;
          height: 100%;
          width: @width;
          background-size: cover;
          background-position: center;
        }
      }
    }
    .moment-quote-body-moment{
      .moment-quote-files{
        max-width: 70%;
      }
      @media(max-width: 768px) {
        .moment-quote-files{
          max-width: 100%;
        }
      }
      .moment-quote-content{
        font-size: 1.25rem;
        color: #000;
        line-height: 2rem;
        margin-bottom: 0.5rem;
        &/deep/img{
          height: 1.5rem;
          width: 1.5rem;
          margin: 0 0.1rem;
          vertical-align: text-bottom;
        }
        &/deep/a{
          color: @primary;
        }
      }
    }
  }
</style>

<script>
  import {objToStr} from "../../js/tools";
  import MomentFiles from './MomentFiles';
  import FromNow from '../FromNow';
  export default {
    props: ['data'],
    components: {
      'from-now': FromNow,
      'moment-files': MomentFiles,
    },
    data: () => ({

    }),
    computed: {
      quoteData() {
        return this.data;
      }
    },
    methods: {
      objToStr: objToStr,
    }
  }
</script>
