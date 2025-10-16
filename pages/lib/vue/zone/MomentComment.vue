<template lang="pug">
  div(:data-id="commentData._id")
    resource-selector(ref="resourceSelector")
    emoji-selector(ref="emojiSelector")
    .moment-comment-item(
      :class=`panelClass`
    )
      // moment-status(ref="momentStatus" :moment="commentData" :permissions="permissions")
      .moment-comment-item-header(v-if="!hideContent")
        a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
          img(
            :src="commentData.avatarUrl"
            data-global-mouseover="showUserPanel"
            data-global-mouseout="hideUserPanel"
            :data-global-data="objToStr({uid: commentData.uid})"
          )
          span(
            data-global-mouseover="showUserPanel"
            data-global-mouseout="hideUserPanel"
            :data-global-data="objToStr({uid: commentData.uid})"
          ) {{commentData.username}}

        span(v-if="commentData.parentData && commentData.parentData._id !== commentData.parentsId[1]")
          .moment-comment-time.m-r-05 回复
          a.moment-comment-avatar(:href="commentData.parentData.userHome" target="_blank")
            span(
              data-global-mouseover="showUserPanel"
              data-global-mouseout="hideUserPanel"
              :data-global-data="objToStr({uid: commentData.parentData.uid})"
            ) {{commentData.parentData.username}}

        .moment-comment-time
          from-now(:time="commentData.toc")
          span &nbsp;IP:{{commentData.addr}}

        .moment-comment-options
          .moment-comment-option(title="回复" @click="switchEditor" v-if="type === 'comment' && control==='rw'")
            .fa.fa-comment-o
          .moment-comment-option(@click="vote(commentData)" :class="{'active': commentData.voteType === 'up'}" title="点赞")
            .fa.fa-thumbs-o-up
            span(v-if="commentData.voteUp > 0") {{commentData.voteUp}}
          //-.moment-comment-options
            .fa.fa-comment-o
          .moment-comment-option.fa.fa-ellipsis-h(v-if='logged' @click="openOption($event, commentData)" data-direction="up")
            moment-option(
              :ref="`momentOption_${commentData._id}`"
              @complaint="complaint"
            )
      .moment-status(v-if="commentData && commentData.status === 'unknown'")
        .review(v-if="isAuthor || hasReviewPermission") 内容审核中
        .hidden-content(v-else)
      .moment-status(v-else-if="commentData && commentData.status === 'deleted'") 
        .deleted(v-if="hasReviewPermission") 内容已被删除
        .hidden-content(v-else)
      .moment-status(v-else-if="commentData && commentData.status === 'disabled'")
        .disabled(v-if="hasReviewPermission") 内容已被屏蔽
        .hidden-content(v-else)
      .moment-comment-item-content(v-html="commentData.content" v-if="type === 'comment'")
      //- 图片视频
      .moment-comment-item-files(v-if="type === 'comment'")
        moment-files(:data="commentData.files")
      .moment-comment-item-content.pointer(v-html="commentData.content" v-else @click="visitUrl(commentData.url, true)")
      .moment-comment-reply-editor(v-if="replyEditorStatus")
        .permission-checker
          publish-permission-checker(:type="publishPermissionTypes.moment")
        .m-b-05
          editor-core(
            ref="editorCore"
            :placeholder="editorPlaceholder"
            @content-change="onReplyEditorContentChange"
            @click-ctrl-enter="submitReplyContent"
          )
        .moment-comment-reply-pictures-container
          .pictures(v-if="picturesUrl.length > 0")
            .picture-item(v-for="(url, index) in picturesUrl" :style="'background-image: url('+url+')'")
              .icon-remove(@click="clearReplyPicture" title="取消选择")
                .fa.fa-trash-o
        .button-container
          .button-icon
            .fa.fa-picture-o(
              @click="selectPicture"
              @mouseover="iconMouseOver(icons.image)"
              @mouseleave="iconMouseLeave(icons.image)"
              :class="{'disabled':picturesId.length>0}"
              title="图片"
              )
            .fa.fa-smile-o(
              @click="selectEmoji"
              @mouseover="iconMouseOver(icons.face)"
              @mouseleave="iconMouseLeave(icons.face)"
              title="表情"
              )
          .submit-button-container.text-right
            button.btn.btn-sm.btn-default.m-r-05(@click="hideReplyEditor") 取消
            button.btn.btn-sm.btn-primary(disabled v-if="disabledButton") 发射
            button.btn.btn-sm.btn-primary(v-else-if="submitting" disabled)
              .fa.fa-spinner.fa-spin
            button.btn.btn-sm.btn-primary(v-else @click="submitReplyContent") 发射

    .moment-comment-comments(v-if="commentData.commentsData && commentData.commentsData.length > 0")
      moment-comment(
        v-for="_comment in commentData.commentsData"
        :comment="_comment"
        :focus="focus"
        :type="type"
        :permissions="permissions"
        :key="_comment._id"
        @on-reply-comment="onReplyComment"
        :mode="mode"
        :control="control"
      )
      .more-comment(v-if="mode === 'simple' && commentData.commentCount > 2" @click="visitCommentChild") 共 {{commentData.commentCount}} 条回复
</template>

<script>
import MomentOptionFixed from './momentOption/MomentOptionFixed';
import FromNow from '../FromNow';
import { toLogin } from '../../js/account';
import { momentVote } from '../../js/zone/vote';
import { visitUrl } from '../../js/pageSwitch';
import { sweetError } from '../../js/sweetAlert';
import { getState } from '../../js/state';
import { objToStr } from '../../js/tools';
import { nkcAPI } from '../../js/netAPI';
import { WinkingFace, Lock } from '@icon-park/vue';
import EmojiSelector from '../EmojiSelector.vue';
import MomentFiles from './MomentFiles';
import ResourceSelector from '../ResourceSelector';
import EditorCore from './EditorCore.plain.vue';
import { getUrl } from '../../js/tools';
import { debounce } from '../../js/execution';
import { lazyLoadInit } from '../../js/lazyLoad';
import { publishPermissionTypes } from '../../js/publish';
import PublishPermissionCheck from '../PublishPermissionCheck.vue';
const state = getState();
const iconFill = {
  normal: '#555',
  active: '#000',
};
export default {
  name: 'moment-comment',
  props: {
    comment: {
      type: Object,
      required: true,
    },
    permissions: {
      type: Object,
      required: true,
    },
    focus: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: 'simple',
    },
    control:{
      type: String,
      default: '',
    }
  },
  components: {
    'editor-core': EditorCore,
    'moment-option': MomentOptionFixed,
    'from-now': FromNow,
    'winking-face': WinkingFace,
    'emoji-selector': EmojiSelector,
    'moment-files': MomentFiles,
    'resource-selector': ResourceSelector,
    'publish-permission-checker': PublishPermissionCheck,
    lock: Lock,
  },
  data: () => ({
    publishPermissionTypes,
    logged: !!state.uid,
    replyEditorStatus: false,
    replyContent: '',
    submitting: false,
    autoSaving: false,
    icons: {
      image: {
        fill: iconFill.normal,
        size: 22,
        theme: 'outline',
      },
      video: {
        fill: iconFill.normal,
        size: 22,
        theme: 'outline',
      },
      face: {
        fill: iconFill.normal,
        size: 14,
        theme: 'outline',
      },
      article: {
        fill: iconFill.normal,
        size: 22,
        theme: 'outline',
      },
    },
    picturesId: [],
  }),
  computed: {
    hideContent() {
      return (
        !this.hasReviewPermission &&
        this.commentData.status !== 'normal' &&
        (!this.isAuthor || this.commentData.status !== 'unknown')
      );
    },
    isAuthor() {
      return state.uid && state.uid === this.commentData.uid;
    },
    hasReviewPermission() {
      return this.permissions && this.permissions.managementMoment;
    },
    panelClass() {
      const classArr = [];
      if (this.focus === this.commentData._id) classArr.push('active');
      if (this.replyEditorStatus) classArr.push('disable-hover');
      if (this.hasReviewPermission) {
        // 管理员
        classArr.push(this.commentData.status);
      } else if (!this.isAuthor) {
        // 其他用户
      } else {
        // 作者
        if (this.commentData.status === 'unknown') {
          classArr.push('unknown');
        }
      }
      return classArr.join(' ');
    },
    commentData() {
      return this.comment;
    },
    editorPlaceholder() {
      return `回复 ${this.commentData.username}`;
    },
    picturesUrl() {
      const { picturesId } = this;
      const filesUrl = [];
      for (const rid of picturesId) {
        const url = getUrl('resource', rid);
        filesUrl.push(url);
      }
      return filesUrl;
    },
    disabledButton() {
      return (
        (this.replyContent.length === 0 && this.picturesUrl.length === 0) ||
        this.autoSaving
      );
    },
  },
  mounted() {
    lazyLoadInit();
  },
  methods: {
    objToStr,
    visitUrl,
    onReplyEditorContentChange(content) {
      this.replyContent = content;
      this.autoSaving = true;
      this.delayedSaveReplayContent();
    },
    delayedSaveReplayContent: debounce(function () {
      this.saveReplayContent().finally(() => {
        this.autoSaving = false;
      });
    }, 1000),
    getReplayContent() {
      nkcAPI(`/api/v1/zone/editor/plain?parent=${this.commentData._id}`, 'GET')
        .then((res) => {
          if (res.data.momentId) {
            this.picturesId = res.data.medias
              .filter((item) => item.type === 'picture')
              .map((item) => item.rid);
            this.replyContent = res.data.content;
            this.$refs.editorCore.setContent(this.replyContent);
          }
          this.$refs.editorCore.hideLoading();
          Vue.nextTick(() => {
            this.$refs.editorCore.focus();
          });
        })
        .catch(sweetError);
    },
    saveReplayContent() {
      return nkcAPI(`/api/v1/zone/editor/plain`, 'PUT', {
        parent: this.commentData._id,
        content: this.replyContent,
        resourcesId: this.picturesId,
      })
        .then((res) => {
          console.log('保存成功');
        })
        .catch(sweetError);
    },
    submitReplyContent() {
      const { replyContent, commentData, picturesId, disabledButton } = this;
      const self = this;
      return Promise.resolve()
        .then(() => {
          if (disabledButton) throw new Error('请输入评论内容');
          self.submitting = true;
          return nkcAPI(`/api/v1/zone/editor/plain`, 'POST', {
            parent: commentData._id,
            content: replyContent,
            resourcesId: picturesId,
            postType: 'comment',
            repost: false,
          });
        })
        .then((res) => {
          self.hideReplyEditor();
          self.clearReplyContent();
          self.clearReplyPicture();
          self.onReplyComment(res.commentId);
          if (self.mode === 'simple') {
            sweetSuccess('提交成功');
          }
        })
        .catch(sweetError)
        .then(() => {
          self.submitting = false;
        });
    },
    onReplyComment(commentId) {
      this.$emit('on-reply-comment', commentId);
    },
    clearReplyContent() {
      this.replyContent = '';
      this.$refs.editorCore.clearContent();
    },
    clearReplyPicture() {
      this.picturesId = [];
    },
    hideReplyEditor() {
      this.replyEditorStatus = false;
    },
    showReplyEditor() {
      this.replyEditorStatus = true;
      this.clearReplyPicture();
      this.getReplayContent();
    },
    switchEditor() {
      if (!this.logged) return toLogin();
      if (this.replyEditorStatus) {
        this.hideReplyEditor();
      } else {
        this.showReplyEditor();
      }
    },
    //投诉或举报
    complaint(mid) {
      this.$emit('complaint', mid);
    },
    vote(commentData) {
      if (!this.logged) return toLogin();
      const voteType = 'up';
      const cancel = voteType === commentData.voteType;
      const momentId =
        this.type === 'comment'
          ? commentData.momentCommentId
          : commentData.momentId;
      momentVote(momentId, voteType, cancel)
        .then((res) => {
          const { voteUp } = res;
          commentData.voteUp = voteUp;
          commentData.voteType = cancel ? '' : voteType;
        })
        .catch(sweetError);
    },
    openOption(e, moment) {
      const self = this;
      const target = e.target;
      const name = `momentOption_${moment._id}`;
      self.$refs[name].open({ DOM: $(target), moment });
      // e.stopPropagation();
    },
    visitCommentChild() {
      // this.$emit('visit-comment-child', this.commentData);
      visitUrl(`/z/m/${this.commentData._id}`, true);
    },
    insertContent(text) {
      return this.$refs.editorCore.insertContent(text);
    },
    iconMouseOver(e) {
      e.fill = iconFill.active;
    },
    iconMouseLeave(e) {
      e.fill = iconFill.normal;
    },
    selectEmoji() {
      const self = this;
      this.$refs.emojiSelector.open((res) => {
        const { code } = res;
        self.insertContent(
          JSON.stringify({
            type: 'nkc-emoji',
            attrs: {
              unicode: code,
            },
          }),
        );
      });
    },
    selectPicture() {
      if (this.picturesId.length > 0) return;
      const self = this;
      this.$refs.resourceSelector.open(
        (res) => {
          self.picturesId = [...new Set(res.resourcesId)].slice(0, 1);
          self.$refs.resourceSelector.close();
          self.delayedSaveReplayContent();
        },
        {
          allowedExt: ['picture'],
          countLimit: 1 - self.picturesId.length,
        },
      );
    },
  },
};
</script>

<style lang="less" scoped>
@import '../../../publicModules/base';
.moment-comment-item {
  .moment-status {
    text-align: center;
    .hidden-content {
      font-size: 1.1rem;
      border: 1px solid #efefef;
      background-color: #f7f7f7;
      color: #d7cece;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 0.5rem;
    }
    .deleted {
      color: #d57070;
    }
    .disabled {
      color: #d57070;
    }
    .review {
      color: #d57070;
    }
  }
  &:hover {
    background-color: #f4f4f4;
  }
  &.disable-hover:hover {
    background-color: inherit;
  }
  &.active {
    background-color: #ffebcf;
    padding: 0.5rem;
  }
  &.disabled {
    background-color: rgba(143, 143, 143, 0.5);
  }
  &.unknown {
    background: #ffd598;
  }
  &.deleted {
    background: #e6bfc4;
  }
  padding: 0.5rem 0;
  margin-bottom: 0;
  .moment-comment-item-header {
    margin-bottom: 0.5rem;
    padding-right: 6rem;
    position: relative;
  }
  .moment-comment-options {
    @height: 2rem;
    position: absolute;
    top: 0;
    right: 0;
    height: @height;
    .moment-comment-option {
      display: inline-block;
      height: @height;
      line-height: @height;
      text-align: center;
      cursor: pointer;
      padding: 0 0.2rem;
      margin-left: 0.5rem;
      &.active {
        color: @accent;
      }
      span {
        margin-left: 0.2rem;
      }
      #modulePostOptions {
      }
    }
  }
  .moment-comment-time {
    display: inline-block;
    font-size: 1rem;
    color: #555;
  }
  .moment-comment-avatar {
    margin-right: 0.5rem;
    span {
      display: inline-block;
      //margin-right: 0.5rem;
      font-size: 1.25rem;
      color: @primary;
    }
    img {
      margin-right: 0.5rem;
      height: 2rem;
      width: 2rem;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
  .moment-comment-item-files {
    font-size: 0;
    max-width: 50%;
    @media (max-width: 768px) {
      max-width: 80%;
    }
  }
  .moment-comment-item-content {
    all: initial;
    /deep/img {
      height: 2rem;
      width: 2rem;
      margin: 0 0.1rem;
      vertical-align: text-bottom;
    }
    /deep/a {
      color: @primary;
    }
    /deep/div {
    }
    /deep/p {
      font-size: 1.2rem;
      color: #000;
      line-height: 1.6em;
      margin-bottom: 0.5rem;
      word-break: break-word;
      word-wrap: break-word;
      min-height: 1.6em;
    }
  }
}
.button-container {
  // position: relative;
  display: flex;
  justify-content: space-between;
}
.moment-comment-reply-editor {
  margin-top: 0.5rem;
  .moment-comment-reply-pictures-container {
    .pictures {
      margin-bottom: 1rem;
      .picture-item {
        @pictureHeight: 8rem;
        position: relative;
        display: inline-block;
        height: @pictureHeight;
        width: @pictureHeight;
        background-color: #000;
        overflow: hidden;
        margin-right: 0.5rem;
        border-radius: 10px;
        background-size: cover;
        background-position: center;
        .icon-remove {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2rem;
          line-height: 2rem;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.3);
          color: #fff;
          cursor: pointer;
          transition: background-color 100ms;
          &:hover {
            background-color: rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
  }
}
.moment-comment-comments {
  padding-left: 2rem;
  border-left: 1px solid #cbcbcb;
  margin-bottom: 1rem;
  .more-comment {
    display: inline-block;
    user-select: none;
    height: 2rem;
    line-height: 2rem;
    padding: 0 1rem;
    border: 1rem;
    border-radius: 1rem;
    color: #fff;
    background-color: @darkGray;
    margin-top: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
}
.submit-button-container {
  button {
    width: 4rem;
  }
}
.button-icon {
  // position: absolute;
  // left: 0;
  // top: 0;
  height: 1rem;
  line-height: 1rem;
  border-radius: 50%;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  color: #333;
  margin-right: 1rem;
  .icon {
    font-size: 1.2rem;
    margin-right: 0.3rem;
    color: #333;
    transition: color 100ms;
    &.icon-face {
      font-size: 1.3rem;
    }
  }
  span {
    font-size: 1rem;
    transition: color 100ms;
  }
  &:hover {
    .icon,
    span {
      color: #000;
    }
  }
  .disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  &.disabled {
    cursor: not-allowed;
    .icon {
      color: #aaa;
    }
    span {
      color: #aaa;
    }
  }
}
</style>
