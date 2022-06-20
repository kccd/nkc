<template lang="pug">
  div
    .paging-button
      a.button.m-r-05.radius-left.radius-right(@click="refresh") 刷新
      span(v-for="(b, index) in paging.buttonValue" v-if="paging")
        span(v-if="b.type === 'active'")
          a.button.active(@click="getDrafts(b.num)"
            :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
          ) {{b.num+1}}
        span(v-else-if="b.type === 'common'")
          a.button(@click="getDrafts(b.num)"
            :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
          ) {{b.num+1}}
        span(v-else)
          a.button ..
    .module-draft-info(v-if="!drafts.length && !loading") 空空如也~~
    .module-draft-info(v-if="loading") 加载中...
    .module-draft(v-for="d in drafts")
      .module-info
        .module-time {{fromNow(d.toc)}}
        .module-from {{getDraftInfo(d)}}
      .module-article-title 标题：
        span {{d.t}}
      .module-article-content 内容：
        span {{d.c}}
      .module-buttons
        div(title="继续创作" @click="loadDraft(d)")
          span 继续创作
        div
          span(title="删除草稿" @click="removeDraft(d)").m-r-05 删除
          span.disabled(title="已插入" v-if="d.delay !== 0") 插入
          span(title="插入内容" @click="insert(d)" v-else) 插入
</template>
<style lang="less" scoped>
.draft-selector {
  @import "../../../publicModules/base";
  .module-draft-info {
    font-size: 1.2rem;
    height: 15rem;
    line-height: 15rem;
    font-weight: 700;
    text-align: center;
  }
  .module-drafts {
    .paging-button {
      padding: 0 1rem 0 1rem;
    }

    .module-draft:last-child {
      border-bottom: none;
    }

    .module-draft-warning {
      font-size: 1rem;
      padding: 0.5rem 1rem;
    }

    .module-draft {
      padding: 0.3rem 1rem;
      border-bottom: 1px solid #eee;
      padding-right: 5.5rem;
      position: relative;

      &:hover {
        background-color: #f6f6f6;
      }

      .module-buttons {
        user-select: none;
        position: absolute;
        top: 0;
        right: 0.5rem;
        width: 5rem;

        div {
          font-size: 1rem;
          color: @primary;
          cursor: pointer;
          margin-bottom: 0.5rem;
          user-select: none;
        }

        div:first-child {
          margin-top: 0.7rem;
          margin-bottom: 0.5rem;
        }

        div:last-child {
          span:first-child {
            color: @accent;
          }

          span:last-child {
            font-weight: 700;
          }

          span.disabled {
            color: #aaa;
            cursor: not-allowed;
          }
        }

        div > span:hover {
          opacity: 0.7;
        }
      }

      .module-info {
        font-size: 1rem;
        font-style: oblique;
        height: 1.4rem;
        .hideText(@line: 1);

        & > div {
          display: inline;
        }

        .module-time {
          color: @accent;
          margin-right: 0.5rem;
        }

        .module-from {
          color: #666;
        }
      }

      .module-article-title {
        font-size: 1rem;
        color: #666;
        font-style: oblique;
        height: 1.4rem;
        .hideText(@line: 1);

        span {
          color: #333;
          font-style: normal;
        }
      }

      .module-article-content {
        font-size: 1rem;
        font-style: oblique;
        color: #666;
        max-height: 1.4rem;
        .hideText(@line: 1);
        overflow: hidden;

        span {
          font-style: normal;
          color: #333;
        }
      }
    }
  }
}
</style>
<script>
import {fromNow} from "../../js/tools";
import {getState} from '../../js/state';
import {sweetQuestion} from "../../js/sweetAlert";
const {uid} = getState();
export default {
  data: () => ({
    draftType: 'auto',//选择草稿类型
    uid,
    paging: {},
    perpage: 7,
    loading: true,
    drafts: [],
    callback: null,
  }),
  mounted() {
    // this.getDrafts(0);
  },
  destroyed() {
  },
  methods: {
    fromNow: fromNow,
    getDraftInfo(draft) {
      const {type, thread, forum} = draft;
      let info = "";
      if(type === "newThread") {
        info = `发表文章`;
      } else if(type === "newPost") {
        info = `在文章《${thread.title}》下发表回复`;
      } else if(type === "modifyPost") {
        info = `修改文章《${thread.title}》下的回复`;
      } else if(type === "modifyThread") {
        info = `修改文章《${thread.title}》`;
      } else if(type === 'modifyForumLatestNotice') {
        info = `修改专业《${forum.title}》最新页板块公告`;
      } else {
        info = `修改专业《${forum.title}》的专业说明`;
      }
      return info;
    },
    insert(data) {
      if(!data) return;
      this.$emit('callback-data', data.content);
      data.delay = 3;
      const func = () => {
        setTimeout(() => {
          data.delay --;
          if(data.delay > 0) {
            func();
          }
        }, 1000);
      }
      func();
    },
    removeDraft(draft) {
      const self = this;
      sweetQuestion("确定要删除草稿吗？")
        .then(() => {
          nkcAPI('/u/' + this.uid + "/drafts/" + draft.did, "DELETE")
            .then(function() {
              self.getDrafts(self.paging.page);
            })
            .catch(function(data) {
              sweetError(data);
            })
        })
    },
    getDrafts(page = 0) {
      const self = this;
      nkcAPI(`/u/${this.uid}/profile/draftData?page=${page}&perpage=${this.perpage}`, "GET")
        .then(data => {
          if(data.drafts) {
            data.drafts.map(d => {
              d.delay = 0;
            });
          }
          self.drafts = data.drafts;
          self.paging = data.paging;
          self.loading = false;
        })
        .catch(sweetError);
    },
    loadDraft(d) {
      sweetQuestion(`继续创作将会覆盖编辑器中全部内容，确定继续？`)
        .then(() => {
          if(window.PostInfo && window.PostInfo.showCloseInfo) {
            window.PostInfo.showCloseInfo = false;
          }
          window.location.href = `/editor?type=redit&id=${d.did}`;
        })
        .catch(sweetError);
    },
    selectDraftType(type) {
      this.draftType = type;
    },
    refresh() {
      this.getDrafts(this.paging.page);
    },
    open(callback) {
      this.callback = callback;
      this.getDrafts();
    },
  }
}
</script>
