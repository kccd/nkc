<template lang="pug">
  .draft-selector
    .module-header(ref="draggableHandle")
      .module-sd-title 草稿箱
      .module-sd-close.fa.fa-close(@click="close")
    .module-sd-body
      .module-content(v-if="loading")
        .null 加载中...
      .module-content(v-else)
        .module-drafts
          .module-draft-warning.bg-warning.text-warning 此处只插入正文，如果要使用草稿中的其余内容，请点击继续创作。
          .paging-button
            a.button.m-r-05.radius-left.radius-right(@click="refresh") 刷新
            span(v-for="(b, index) in paging.buttonValue")
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
  .draft-selector{
    @import "../../publicModules/base";
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
    .null{
      margin-top: 5rem;
      margin-bottom: 5rem;
      text-align: center;
    }
    .module-header{
      height: 3rem;
      line-height: 3rem;
      background-color: #f6f6f6;
      position: relative;
      .module-sd-title{
        margin-left: 1rem;
        color: #666;
        cursor: move;
      }
      .module-sd-close{
        height: 3rem;
        width: 3rem;
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        line-height: 3rem;
        color: #888;
        cursor: pointer;
        &:hover{
          color: #777;
          background-color: #ddd;
        }
      }
    }
    .module-sd-body{
      .module-content{
        .module-drafts{
          .paging-button{
            padding: 0.5rem 1rem 0 1rem;
          }
          .module-draft:last-child{
            border-bottom: none;
          }
          .module-draft-warning{
            font-size: 1rem;
            padding: 0.5rem 1rem;
          }
          .module-draft{
            padding: 0.3rem 1rem;
            border-bottom: 1px solid #eee;
            padding-right: 5.5rem;
            position: relative;
            &:hover{
              background-color: #f6f6f6;
            }
            .module-buttons{
              user-select: none;
              position: absolute;
              top: 0;
              right: 0.5rem;
              width: 5rem;
              div{
                font-size: 1rem;
                color: @primary;
                cursor: pointer;
                margin-bottom: 0.5rem;
                user-select: none;
              }
              div:first-child{
                margin-top: 0.7rem;
                margin-bottom: 0.5rem;
              }
              div:last-child{
                span:first-child{
                  color: @accent;
                }
                span:last-child{
                  font-weight: 700;
                }
                span.disabled{
                  color: #aaa;
                  cursor: not-allowed;
                }
              }
              div>span:hover{
                opacity: 0.7;
              }
            }
            .module-info{
              font-size: 1rem;
              font-style: oblique;
              height: 1.4rem;
              .hideText(@line: 1);
              &>div{
                display: inline;
              }
              .module-time{
                color: @accent;
                margin-right: 0.5rem;
              }
              .module-from{
                color: #666;
              }
            }
            .module-article-title{
              font-size: 1rem;
              color: #666;
              font-style: oblique;
              height: 1.4rem;
              .hideText(@line: 1);
              span{
                color: #333;
                font-style: normal;
              }
            }
            .module-article-content{
              font-size: 1rem;
              font-style: oblique;
              color: #666;
              max-height: 1.4rem;
              .hideText(@line: 1);
              overflow: hidden;
              span{
                font-style: normal;
                color: #333;
              }
            }
          }
        }
      }
    }
  }
</style>
<script>
  import {fromNow} from '../js/tools';
  import {DraggableElement} from "../js/draggable";
  import {getState} from '../js/state';
  import {sweetQuestion} from "../js/sweetAlert";

  const {uid} = getState();
  export default {
    data: () => ({
      uid,
      paging: {},
      perpage: 7,
      loading: true,
      drafts: [],
      draggableElement: null,
      callback: null,
    }),
    mounted() {
      this.initDraggableElement();
    },
    destroyed() {
      this.destroyDraggableElement();
    },
    methods: {
      fromNow: fromNow,
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      },
      destroyDraggableElement() {
        this.draggableElement.destroy();
      },
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
        this.callback({content: data.content});
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
        nkcAPI(`/u/${this.uid}/profile/draft?page=${page}&perpage=${this.perpage}`, "GET")
          .then(data => {
            data.drafts.map(d => {
              d.delay = 0;
            });
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
      refresh() {
        this.getDrafts(this.paging.page);
      },
      open(callback) {
        this.draggableElement.show();
        this.callback = callback;
        this.getDrafts();
      },
      close() {
        this.draggableElement.hide();
      }
    }
  }
</script>