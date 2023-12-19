<template lang="pug">

  mixin articleBody
    .moment-quote-body-article
      .moment-quote-reply-abstract(v-if="quoteData.data.replyContent")
        a(:href="quoteData.data.replyUrl || quoteData.data.url" target="_blank") {{quoteData.data.replyContent}}
      .moment-quote-header.hidden-md.hidden-lg(v-if="showThreadHeader")
        +threadHeader
      .moment-quote-title
        a(:href="quoteData.data.url" target="_blank") {{quoteData.data.title}}
        .moment-quote-header-min.hidden-sm.hidden-xs(v-if="showThreadHeader")
          +threadHeaderMin
      .moment-quote-abstract(:class="{'cover': quoteData.data.coverUrl}")
        .moment-quote-cover(v-if='quoteData.data.coverUrl' :style="'background-image: url('+quoteData.data.coverUrl+')'")
        span {{quoteData.data.content}}

  mixin momentBody
    .moment-quote-body-moment
      .moment-quote-content.pointer(v-html="quoteData.data.content" @click="visitUrl(quoteData.data.url, true)")
      .moment-quote-files(v-if="quoteData.data.files && quoteData.data.files.length > 0")
        moment-files(:data="quoteData.data.files")

  mixin topHeader
    .moment-quote-avatar(
      data-global-mouseover="showUserPanel"
      data-global-mouseout="hideUserPanel"
      :data-global-data="objToStr({uid: topHeaderInfo.uid})"
    )
      img(:src="topHeaderInfo.avatarUrl")
    .moment-quote-username(
      data-global-mouseover="showUserPanel"
      data-global-mouseout="hideUserPanel"
      :data-global-data="objToStr({uid: topHeaderInfo.uid})"
    )
      a(:href="topHeaderInfo.userHome" target="_blank") {{topHeaderInfo.username}}
    .moment-quote-time
      from-now(:time="topHeaderInfo.toc")
    a.moment-quote-link(:href="topHeaderInfo.url" v-if="topHeaderInfo.url" target="_blank") 详情

  mixin threadHeader
    .moment-quote-avatar(
      data-global-mouseover="showUserPanel"
      data-global-mouseout="hideUserPanel"
      :data-global-data="objToStr({uid: threadHeaderInfo.uid})"
    )
      img(:src="threadHeaderInfo.avatarUrl")
    .moment-quote-username(
      data-global-mouseover="showUserPanel"
      data-global-mouseout="hideUserPanel"
      :data-global-data="objToStr({uid: threadHeaderInfo.uid})"
    )
      a(:href="threadHeaderInfo.userHome" target="_blank") {{threadHeaderInfo.username}}
    .moment-quote-time
      from-now(:time="threadHeaderInfo.toc")
    a.moment-quote-link(:href="threadHeaderInfo.url" v-if="threadHeaderInfo.url" target="_blank") 详情

  mixin threadHeaderMin
    |（
    a(:href="threadHeaderInfo.userHome" target="_blank") {{threadHeaderInfo.username}}
    from-now(:time="threadHeaderInfo.toc")
    |）

  .moment-quote-permission(v-if="quoteData.data && quoteData.data.quoteData && quoteData.data.quoteData.data && quoteData.data.quoteData.data.status && quoteData.data.quoteData.data.status==='permission'" ) 根据相关法律法规和政策，内容不予显示。
  div(v-else)
    .moment-quote-lost(v-if="!quoteData.data")
      .fa.fa-exclamation-circle
      span 引用丢失
    .moment-quote-lost(v-else-if="quoteData.data.status !== 'normal'")
      .fa.fa-exclamation-circle
      span {{quoteData.data.statusInfo}}
    .moment-quote(v-else)
      div(v-if="['article', 'post', 'comment'].includes(quoteData.quoteType)")
        .moment-quote-header(v-if="showTopHeader")
          +topHeader
        .moment-quote-body
          +articleBody
      div(v-else)
        .moment-quote-header
          +topHeader
        .moment-quote-body
          +momentBody

      moment-quote(
        v-if="quoteData.data.quoteData"
        :data="quoteData.data.quoteData"
        :uid="quoteData.data.uid"
        )



</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .moment-quote-permission{
    text-align: center;
    color: #282c37;
    font-size: 1.3rem;
    line-height: 2.4rem;
  }
  .moment-quote-lost{
    text-align: center;
    font-size: 1rem;
    .fa{
      color: @accent;
      font-size: 1.2rem;
      margin-right: 0.3rem;
    }
  }
  .moment-quote-header-min{
    display: inline-block;
    a{
      font-size: 1.25rem!important;
      margin-right: 0.5rem;
      color: #2b90d9!important;
      font-weight: normal!important;
    }
  }
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
      .moment-quote-reply-abstract{
        a{
          max-height: 7rem;
          .hideText(@line: 4);
          font-size: 1.25rem;
          margin-top: 0.3rem;
          margin-bottom: 0.8rem;
          color: #000;
        }
        border-bottom: 1px solid #dbdbdb;
        margin-bottom: 0.8rem;
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
  import {visitUrl} from "../../js/pageSwitch";

  export default {
    name: 'moment-quote',
    props: ['data', 'uid'],
    components: {
      'from-now': FromNow,
      'moment-files': MomentFiles,
    },
    data: () => ({

    }),
    computed: {
      momentUserId() {
        return this.uid;
      },
      quoteData() {
        return this.data;
      },
      disabledContent() {
        const {quoteData} = this;
        return !quoteData.data || quoteData.data.status !== 'normal';
      },
      hasReply() {
        const {quoteData} = this;
        return quoteData && quoteData.data && quoteData.data.replyId;
      },
      showTopHeader() {
        const {momentUserId, quoteData, hasReply, disabledContent} = this;
        if(disabledContent) return false;
        if(hasReply) {
          return quoteData.data.replyUid !== momentUserId;
        } else {
          return quoteData.data.uid !== momentUserId;
        }
      },
      showThreadHeader() {
        const {quoteData, disabledContent, hasReply} = this;
        if(disabledContent) return false;
        return hasReply && quoteData.data.uid !== quoteData.data.replyUid;
      },
      replyHeaderInfo() {
        const {quoteData, disabledContent, hasReply} = this;
        if(disabledContent) return {};
        const {
          replyUid,
          replyUsername,
          replyAvatarUrl,
          replyUserHome,
          replyToc,
          replyTime,
          replyUrl,
        } = quoteData.data;
        return {
          uid: replyUid,
          username: replyUsername,
          avatarUrl: replyAvatarUrl,
          userHome: replyUserHome,
          toc: replyToc,
          time: replyTime,
          url: replyUrl,
        }
      },
      threadHeaderInfo() {
        const {quoteData, disabledContent} = this;
        if(disabledContent) return {};
        const {
          uid,
          avatarUrl,
          username,
          userHome,
          toc,
          time,
          url,
        } = quoteData.data;
        return {
          uid,
          username,
          avatarUrl,
          userHome,
          toc,
          time,
          url
        }
      },
      topHeaderInfo() {
        const {threadHeaderInfo, replyHeaderInfo, disabledContent, hasReply} = this;
        if(disabledContent) return {};

        if(hasReply) {
          return replyHeaderInfo;
        } else {
          return threadHeaderInfo;
        }
      }
    },
    methods: {
      objToStr: objToStr,
      visitUrl
    }
  }
</script>
