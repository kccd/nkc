<template lang="pug">

  .single-moment-container(v-if="momentData")
    moment-status(ref="momentStatus" :moment="momentData" :permissions="permissions")
    .single-moment-top-container#comment-content
      //moment-option(
      //  ref="momentOption"
      //  @complaint="complaint"
      //)
      .single-moment-left
        .single-moment-avatar(
          data-global-mouseover="showUserPanel"
          data-global-mouseout="hideUserPanel"
          :data-global-data="objToStr({uid: momentData.uid})"
        )
          img(:src="momentData.avatarUrl")
      .single-moment-right
        .single-moment-header
          .single-moment-user(
            data-global-mouseover="showUserPanel"
            data-global-mouseout="hideUserPanel"
            :data-global-data="objToStr({uid: momentData.uid})"
          )
            a(:href="momentData.userHome" target="_blank") {{momentData.username}}
          .single-moment-time
            from-now(:time="momentData.toc")
            span &nbsp;IP:{{momentData.addr}}
          //- 其他操作
          .single-moment-header-options.fa.fa-ellipsis-h(@click.stop="openOption($event)" data-direction="down")
            moment-option(
              ref="momentOption"
              @complaint="complaint"
            )
        //- 动态内容
        .single-moment-content.pointer(v-html="momentData.content" @click.self="visitUrl(momentData.url, true)")

        //- 图片视频
        .single-moment-files
          moment-files(:data="momentData.files")

        //- 引用内容
        .single-moment-quote(v-if="momentData.quoteData")
          moment-quote(:data="momentData.quoteData" :uid="momentData.uid")
        //- 底部的操作按钮
        .single-moment-options
          .single-moment-options-left(
            title="评论"
            :class="{'active': showPanelType === panelTypes.comment}"
            @click="showPanel(panelTypes.comment)"
            )
            .fa.fa-comment-o
            span(v-if="momentData.commentCount > 0") {{momentData.commentCount}}
          .single-moment-options-center(
            title="转发"
            :class="{'active': showPanelType === panelTypes.repost}"
            @click="showPanel(panelTypes.repost)"
            )
            .fa.fa-retweet
            span(v-if="momentData.repostCount > 0") {{momentData.repostCount}}
          .single-moment-options-right(
            title="点赞"
            :class="{'active': momentData.voteType === 'up'}"
            @click="vote"
            )
            .fa.fa-thumbs-o-up
            span(v-if="momentData.voteUp > 0") {{momentData.voteUp}}

        // 评论列表
        .single-moment-moments(v-if="showPanelType")
          moment-comments(
            ref="momentComments"
            :mid="momentData.momentId"
            :type="showPanelType"
            @post-comment="onPostComment"
            :focus="focus"
            :permissions="permissions"
            :mode="mode"
            )
</template>

<style lang="less" scoped>
  @import "../../../publicModules/base";
  .single-moment-top-container{
    @avatarWidth: 4rem;
    @avatarWidthMin: 3rem;
    position: relative;
    padding-left: @avatarWidth + 1rem;
    min-height: @avatarWidth;

    .single-moment-left{
      position: absolute;
      top: 0;
      left: 0;
      width: @avatarWidth;
      .single-moment-avatar{
        height: @avatarWidth;
        width: @avatarWidth;
        border-radius: 50%;
        overflow: hidden;
        img{
          height: 100%;
          width: 100%;
        }
      }
    }
    .single-moment-right{

    }

    .single-moment-quote{
      width: 100%;
      max-width: 100%;
      padding: 1rem;
      border: 1px solid #d5d5d5;
      border-radius: 5px;
      background-color: #f6f2ee;
    }
    .single-moment-files{
      font-size: 0;
      max-width: 70%;
      @media(max-width: 768px) {
        max-width: 100%;
      }
    }
    .single-moment-options{
      position: relative;
      @padding: 3rem;
      height: @padding;
      line-height: @padding;
      padding-left: @padding;
      padding-right: @padding;
      font-size: 1.3rem;
      text-align: center;
      color: #3f3f3f;
      &>*{
        cursor: pointer;
        &.active{
          color: @accent;
        }
      }
      .single-moment-options-left{
        text-align: left;
        position: absolute;
        top: 0;
        left: 0;
        height: @padding;
        line-height: @padding;
        cursor: pointer;
        .fa{
          margin-right: 0.5rem;
        }
        span{
          font-size: 1.1rem;
        }
      }
      .single-moment-options-center{
        display: inline-block;
        padding: 0 1rem;
        .fa{
          margin-right: 0.5rem;
        }
        span{
          font-size: 1.1rem;
        }
      }
      .single-moment-options-right{
        position: absolute;
        top: 0;
        right: 0;
        height: @padding;
        line-height: @padding;
        cursor: pointer;
        text-align: right;
        .fa{
          margin-right: 0.5rem;
        }
        span{
          font-size: 1.1rem;
        }
      }
    }
  }
  .single-moment-bottom-container{
    padding-left: 5rem;
    //padding-right: 4rem;
    .single-moment-bottom{

    }
  }

  .single-moment-center-container{
    padding-left: 5rem;
    margin-bottom: 0.5rem;
    .single-moment-center-content{
      width: 100%;
      max-width: 100%;
      padding: 1rem;
      border: 1px solid #d5d5d5;
      border-radius: 5px;
      background-color: #f6f2ee;
    }
    .single-moment-top-container{
      padding-left: 0;
      padding-right: 0;
    }
    .single-moment-files{

    }
  }

  .moments-container{
    .moment-item{
      border-bottom: 1px solid #eee;
      padding-bottom: 0.3rem;
      margin-bottom: 1.5rem;
    }
    & .moment-item:last-child{
      border-bottom: none;
      margin-bottom: 0;
    }
  }

  .single-moment-header{
    margin-bottom: 0.5rem;
    @optionHeight: 2rem;
    position: relative;
    .single-moment-user{
      display: inline-block;
      margin-right: 0.5rem;
      font-weight: 700;
      font-size: 1.25rem;
      a{
        color: @primary;
      }
    }
    .single-moment-time{
      display: inline-block;
      font-size: 1rem;
      color: #555;
    }
    .single-moment-header-options{
      height: @optionHeight;
      line-height: @optionHeight;
      text-align: center;
      width: @optionHeight;
      position: absolute;
      font-size: 1.5rem;
      color: #555;
      top: 0;
      right: 0;
      cursor: pointer;
    }
  }
  .single-moment-title{
    a{
      font-size: 1.3rem;
      font-weight: 700;
      color: #333;
    }
    margin-bottom: 0.5rem;
  }
  .single-moment-abstract{
    height: 7rem;
    @width: 9rem;
    .hideText(@line: 4);
    font-size: 1.25rem;
    &.cover{
      padding-left: @width + 1rem;
      position: relative;
    }
    .single-moment-cover{
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
  .single-moment-content{
    font-size: 1.25rem;
    color: #000;
    line-height: 2rem;
    margin-bottom: 0.5rem;
    word-break: break-word;
    word-wrap: break-word;
    white-space: pre-wrap;
    &/deep/ img{
      height: 1.5rem;
      width: 1.5rem;
      margin: 0 0.1rem;
      vertical-align: text-bottom;
    }
    &/deep/ a{
      color: @primary;
    }
  }
  .single-moment-comment-container{
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 1rem 1rem 0.5rem 1rem;
    border-radius: 5px;
    margin-bottom: 1rem
  }
</style>

<script>
  import {momentVote} from "../../js/zone/vote";
  import {sweetError} from "../../js/sweetAlert";
  import {objToStr} from "../../js/tools";
  import FromNow from '../../../lib/vue/FromNow';
  import MomentFiles from './MomentFiles';
  import MomentComments from './MomentComments';
  import MomentQuote from './MomentQuote';
  import MomentStatus from "./MomentStatus";
  import {visitUrl} from "../../js/pageSwitch";
  import MomentOptionFixed from "./momentOption/MomentOptionFixed";
  import {getState} from "../../js/state";
  import {toLogin} from "../../js/account";

  const state = getState();
  export default {
    components: {
      'from-now': FromNow,
      'moment-files': MomentFiles,
      'moment-comments': MomentComments,
      'moment-quote': MomentQuote,
      'moment-status': MomentStatus,
      'moment-option': MomentOptionFixed
    },
    /*
    * prop {Object} data 动态用于显示的数据 组装自 MomentModel.statics.extendMomentsListData
    * prop {String} focus 高亮的评论ID
    * */
    props: ['data', 'focus', 'permissions', 'mode'],
    data: () => ({
      logged: !!state.uid,
      momentData: null,
      showPanelType: '', // comment, repost
      panelTypes: {
        comment: 'comment',
        repost: 'repost'
      },
      timer: null,
    }),
    mounted() {
      this.initData();
    },
    computed: {
      focusCommentId() {
        return this.focus;
      }
    },
    destroyed() {
      this.clearTimer();
    },
    methods: {
      objToStr: objToStr,
      visitUrl,
      clearTimer() {
        clearTimeout(this.timer);
      },
      initData() {
        const {data} = this;
        this.momentData = JSON.parse(JSON.stringify(data));
      },
      vote() {
        if(!this.logged) return toLogin();
        const {momentId, voteType} = this.momentData;
        const self = this;
        const voteUpType = 'up';
        const cancel = voteType === voteUpType;
        momentVote(momentId, voteUpType, cancel)
          .then(res => {
            const {voteUp} = res;
            self.momentData.voteType = cancel? '': voteUpType;
            self.momentData.voteUp = voteUp;
          })
          .catch(sweetError);
      },
      showPanel(type) {
        if(this.showPanelType === type) {
          this.showPanelType = '';
        } else {
          this.showPanelType = type;
        }
        this.setTimerToInitComments();
      },
      setTimerToInitComments() {
        const self = this;
        self.clearTimer();
        this.timer = setTimeout(() => {
          if(self.$refs.momentComments) {
            self.$refs.momentComments.init();
          } else {
            self.setTimerToInitComments();
          }
        }, 200);
      },
      showCommentPanel() {
        this.showPanel(this.panelTypes.comment);
      },
      onPostComment() {
        this.momentData.commentCount ++;
      },
      //打开其他操作
      openOption(e) {
        const target = e.target;
        const init = $(target).attr('data-init');
        if(init === 'true') return;
        this.$refs.momentOption.open({DOM: $(target), moment: this.momentData});
        //阻止浏览器默认事件 阻止事件冒泡
        // e.preventDefault();
      },
      //投诉或举报
      complaint(mid) {
        this.$emit('complaint', mid);
      },
    }
  }
</script>
