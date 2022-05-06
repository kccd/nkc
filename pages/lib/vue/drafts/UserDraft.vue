<template lang="pug">
  .user-draft(v-if="!loading" )
    paging(ref="paging" :pages="pageButtons" @click-button="clickBtn")
    .paging-button.m-l-05(v-if="drafts && drafts.length !== 0")
      a.button.radius-left(@click="selectAll()") 全选
      a.button.radius-right(@click="removeSelectedDrafts()") 删除已选
      a.button.radius-left.radius-right.m-l-05(@click="removeAll()") 清空草稿箱
    .account-threads(v-else)
      .null 空空如也~~
    .account-thread.draft-list(v-for="draft in drafts")
      .account-post-thread-user
        .checkbox.draft-checkbox
          label
            input(type="checkbox" :data-did="draft.did" :value="draft.did" v-model="selectedDraftId")
        .time {{fromNow(draft.tlm || draft.toc)}}
        span(v-if="draft.type === 'newThread'") 发表文章
        span(v-else-if="draft.type === 'newPost'") 在文章《
          a(:href="draft.thread.url" target="_blank") {{draft.thread.title}}》下发表
          span(v-if="draft.parentPostId") 评论
          span(v-else) 回复
        span(v-else-if="draft.type ==='modifyPost'") 修改文章《
          a(:href="draft.thread.url" target="_blank") {{draft.thread.title}}》下的
          span(v-if="draft.parentPostId") 评论
          span(v-else) 回复
        span(v-else-if="draft.type === 'modifyThread'")
          span 修改文章《
            a(:href="draft.thread.url" target="_blank") {{draft.thread.title}}》
        span(v-else)
          span 修改
            a(:href="draft.forum.url" target="_blank") {{draft.forum.title}}的专业说明
      a.account-post-content {{draft.c || "未填写内容"}}
      .text-right.m-t-05.draft-button
        button(@click="removeDraftSingle(draft.did)") 删除
        span.dropdown(v-if="draft.desType === 'post'")
          button.p-a-0.m-a-0(style='color: #2b90d9' :id="`dLabel_${draft.did}`" type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false') 继续创作
            span.caret
          ul.dropdown-menu.dropdown-menu-right(:aria-labelledby="`dLabel_${draft.did}`")
            li
              a(:shref="`/editor?type=redit&id=${draft.did}&o=copy`" target='_blank')
                .fa.fa-clone
                span &nbsp;复制为新文章
            li
              a(:shref="`/editor?type=redit&id=${draft.did}&o=update`" target='_blank')
                .fa.fa-refresh
                span &nbsp;更新已发布的文章
        a(:href="`/editor?type=redit&id=${draft.did}&o=update`" target='_blank' v-else) 继续创作
    paging(:pages="pageButtons" @click-button="clickBtn")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.null {
  text-align: center;
  margin-top: 5rem;
  margin-bottom: 5rem;
}
.account-thread{
  margin-bottom: 1.5rem;
  //padding-bottom: 1rem;
  &.draft-list{
    .checkbox{
      display: inline;
      cursor: pointer;
      label{
        padding: 4px 0 0 20px;
      }
    }
    .draft-button{
      .dropdown-menu{
        a{
          color: #333;
          .fa{
            color: #444;
          }

        }
      }
      a{
        color: @primary;
      }
      button{
        background-color: rgba(0, 0, 0, 0);
        color: @accent;
        margin-right: 0.3rem;
        border: none;
        &:focus{
          outline: none;
        }
      }
    }
  }
  .account-post-thread-user{
    .time{
      color: @accent;
      display: inline;
      margin-right: 0.3rem;
    }
    img{
      height: 1.5rem;
      width: 1.5rem;
      border-radius: 50%;
      margin-left: 0.3rem;
      margin-top: -2px;
      margin-right: 0.2rem;
    }
    a{
      color: @primary;
    }
  }
  .account-post-thread{
    padding: 1rem;
    background-color: #f6f2ee;
    border-radius: 3px;
    .account-post-thread-warning{
      text-align: center;
      color: #bbab9c;
      //font-weight: 700;
      .fa{
        margin-right: 0.3rem;
      }
    }
  }
  .account-post-content{
    margin: 0.4rem 0 0.6rem 0;
    text-decoration: none;
    color: @dark;
    max-height: 5rem;
    .hideText(@line: 3)
  }
  &.draft{
    @warningColor: rgba(255, 255, 0, 0.2);
    background-color: @warningColor;
    .account-reason{
      text-align: center;
      color: @accent;
      padding: 0.5rem;
      font-weight: 700;
      //background-color: @warningColor;
    }
  }
  &.disabled{
    @disabledColor: rgba(0, 0, 0, 0.07);
    background-color: @disabledColor;
    .account-reason{
      text-align: center;
      color: @accent;
      padding: 0.5rem;
      font-weight: 700;
      //background-color: @warningColor;
    }
  }
  &.review{
    @disabledColor: rgba(255, 0, 0, 0.07);
    background-color: @disabledColor;
    .account-reason{
      text-align: center;
      color: @accent;
      padding: 0.5rem;
      font-weight: 700;
      //background-color: @warningColor;
    }
  }
  .account-thread-avatar{
    display: table-cell;
    vertical-align: top;
    &>div{
      width: 12rem;
      height: 8rem;
      margin-right: 1rem;
      overflow: hidden;
      border-radius: 3px;
      background-size: cover;
    }
  }
  .account-thread-content{
    display: table-cell;
    vertical-align: top;
    overflow: hidden;
    width: 100%;
    .account-thread-title{
      font-size: 1.3rem;
      display: -webkit-box;
      font-weight: 700;
      height: 1.8rem;
      color: @dark;
      .hideText(@line: 1);
      &.digest a{
        color: @accent;
        &:hover, &:focus{
          color: @accent;
        }
        &:hover{
          border-color: @accent;
        }
      }
      a{
        color: @dark;
        transition: border-bottom-color 200ms;
        border-bottom: 1px solid rgba(0, 0, 0, 0);
        padding-bottom: 0.1rem;
        &:hover, &:focus{
          text-decoration: none;
          color: @dark;
        }
        &:hover{
          border-color: @dark;
        }
      }
    }
    .account-thread-abstract{
      margin: 0.6rem 0;
      max-height: 3.5rem;
      .hideText(@line: 2);
    }
    .account-thread-info{
      position: relative;
      height: 1.8rem;
      display: block;
      width: 100%;
      padding-right: 7rem;
      .hideText(@line: 1);
      &>div{
        display: inline;
        margin-right: 0.3rem;
      }
      .thread-forum-link{
        margin-right: 0.5rem;
        color: #888;
      }
      .thread-time{
        position: absolute;
        right: 0;
        top: 0;
      }
      .thread-user{
        margin-right: 0.3rem;
        &:hover, &:focus{
          color: #555;
          text-decoration: none;
        }
        img{
          height: 1.4rem;
          width: 1.4rem;
          margin-top: -2px;
          margin-right: 0.3rem;
          border-radius: 50%;
        }
        span{

        }
      }
      .fa{
        color: #aaa;
        margin-right: 0.3rem;
      }
      span{
        color: #888;
      }
    }
  }
}
</style>
<script>
import Paging from "../Paging";
import {getState} from "../../js/state";
import {nkcAPI} from "../../js/netAPI";
import {fromNow} from "../../js/tools";
export default {
  data: () => ({
    uid: '',
    paging: null,
    drafts: [],
    loading: false,
    selectedDraftId: [],//选中的草稿
  }),
  components: {
    "paging": Paging
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
    draftsId() {
      const {drafts} = this;
      const arr = drafts.map(d => d.did)
      return arr;
    }
  },
  mounted() {
    this.initData();
    this.getUserDraft();
  },
  methods: {
    fromNow: fromNow,
    initData() {
      const {uid} = this.$route.params;
      const {uid: stateUid} = getState();
      this.uid = uid || stateUid;
    },
    //获取指定用户的草稿列表
    getUserDraft(page=0) {
      this.loading = true;
      const self = this;
      if(!self.uid) return;
      let url = `/u/${self.uid}/profile/draftData?page=${page}`;
      nkcAPI(url, 'GET')
      .then(res => {
        self.drafts = res.drafts;
        self.paging = res.paging;
      })
      .catch(err => {
        sweetError(err);
      })
      self.loading = false;
    },
    clickBtn(num) {
      this.getUserDraft(num);
    },
    //删除草稿
    removeDraftSingle(did) {
      const self = this;
      sweetQuestion("确定要删除当前草稿？删除后不可恢复。")
        .then(function() {
          self.removeDraft(did);
        })
        .catch(function() {})
    },
    //全选草稿
    selectAll() {
      if(this.selectedDraftId.length === this.draftsId.length) {
        this.selectedDraftId = [];
      } else {
        this.selectedDraftId = [].concat(this.draftsId);
      }
    },
    //删除草稿
    removeDraft(did) {
      const self = this;
      nkcAPI('/u/' + this.uid + "/drafts/" + did, "DELETE")
        .then(function() {
          self.getUserDraft(self.paging.page);
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    //删除选中的草稿
    removeSelectedDrafts() {
      const {selectedDraftId} = this;
      if(!selectedDraftId.length) return;
      const did = selectedDraftId.join('-');
      const self = this;
      sweetQuestion("确定要删除已勾选的草稿？删除后不可恢复。")
        .then(function() {
          self.removeDraft(did);
        })
        .catch(function() {});
    },
    //清空草稿箱
    removeAll() {
      const self = this;
      sweetQuestion("确定要删除全部草稿？删除后不可恢复。")
        .then(function() {
          self.removeDraft("all");
        })
        .catch(function(){})
    }
  }
}
</script>
