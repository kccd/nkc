<template lang="pug">
  .drafts-container
    mixin resourcePaging
      .resource-paging(v-if="paging && paging.buttonValue")
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
    .drafts-header(v-if="!type")
      .option-button
        a(:class="{'active': draftsType === 'all'}" @click="selectType('all')")
          .fa &nbsp;
          | 全部
        a(:class="{'active': draftsType === 'trash'}" @click="selectType('trash')")
          .fa.fa-trash &nbsp;
          | 回收站
        a(@click="editDraft()")
          .fa.fa-plus &nbsp;
          | 添加草稿
    +resourcePaging
    .drafts-body
      .drafts-info(v-if="!drafts.length && !loading") 空空如也~~
      .drafts-info(v-if="loading") 加载中...
      .module-draft(v-for="d in drafts" v-else)
        .module-info
          .module-time {{fromNow(d.toc)}}
        .module-article-title 标题：
          span {{d.document.title}}
        .module-article-content 内容：
          span {{d.document.content}}
        .module-buttons
          div(title="继续创作" @click="editDraft(d)")
            span 继续创作
          div
            span(title="删除草稿" @click="delDraft(d, 'delete')").m-r-05 删除
            span.disabled(title="已插入" v-if="d.delay !== 0") 插入
            span(title="插入内容" @click="insert(d)" v-else-if="d.delay === 0 && type") 插入
            span(title="恢复内容" @click="delDraft(d, 'recover')" v-else-if="!type && draftsType === 'trash'") 恢复
</template>
<style lang="less" scoped>
  @import "../../../publicModules/base";
  .drafts-container {
    .resource-paging {
      padding: 0.5rem 1rem 0 1rem;
    }
    .drafts-header {
      padding: 0.5rem 1rem 0 1rem;
      .option-button {
        padding-right: 1rem;
        a {
          &:hover {
            text-decoration: none;
            background-color: #2b90d9;
            color: #fff;
          }
          &:focus {
            text-decoration: none;
            background-color: #2b90d9;
            color: #fff;
          }
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -khtml-user-select: none;
          user-select: none;
          display: inline-block;
          height: 2rem;
          cursor: pointer;
          color: #777;
          line-height: 2rem;
          text-align: center;
          min-width: 2rem;
          margin-right: 0.3rem;
          padding: 0 0.8rem;
          font-size: 1.2rem;
          background-color: #f4f4f4;
          border-radius: 3px;
          transition: background-color 200ms, color 200ms;
          margin-bottom: 0.5rem;
          .fa {
            display: inline-block;
            font: normal normal normal 14px/1 FontAwesome;
            font-size: inherit;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
          }
        }
        .active {
          background: #2b90d9;
          color: #fff;
        }
      }
    }
    .resources-paging{
      height: 3rem;
      overflow: hidden;
      padding-top: 0.5rem;
    }
    @draftHeight: 5.6rem;
    .drafts-body {
      font-size: 0;
      position: relative;
      min-height: 28rem;
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
      .drafts-info {
        font-size: 1.2rem;
        height: 15rem;
        line-height: 15rem;
        font-weight: 700;
        text-align: center;
      }
      .draft {
        cursor: pointer;
        width: 100%;
        height: @draftHeight;
        margin: 0.5rem 0;
        padding: 0 0.5rem;
        text-align: right;
        line-height: @draftHeight;
         .draft-name {
           &:hover {
             color: #0e90d2;
           }
           font-size: 3rem;
           display: inline-block;
           float: left;
         }
        .draft-do {
          display: inline-block;
          .fa {
            &:hover {
              color: #0e90d2;
            }
            line-height: @draftHeight;
            cursor: pointer;
            margin-right: 1rem;
            font-size: 3rem;
          }
        }
      }
    }
  }

</style>
<script>
import {nkcAPI} from "../../js/netAPI";
import {debounce} from "../../js/execution";
import {timeFormat, fromNow} from "../../js/tools";
import {sweetQuestion} from "../../js/sweetAlert";
export default {
  props: ['type'],
  data: () => ({
    paging: {},
    drafts: [],
    draftsType: 'all',
    selectedDraftsId: [],
    loading: true,
    quota: 10,
    pageNumber: "",
  }),
  components: {
  },
  mounted() {
    this.getDrafts();
  },
  computed: {
    screenType: function() {
      return this.windowWidth < 700? "sm": "md";
    },
  },
  methods: {
    timeFormat: timeFormat,
    fromNow: fromNow,
    //选择草稿类型
    selectType(type) {
      if(this.type) return;
      this.draftsType = type;
      this.getDrafts(0);
    },
    refresh() {
      this.getDrafts(0);
    },
    fastSelectPage: function() {
      var pageNumber = this.pageNumber - 1;
      var paging = this.paging;
      if(!paging || !paging.buttonValue.length) return;
      var lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
      if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
      this.getDrafts(pageNumber);
    },
    changePage: function(type) {
      var paging = this.paging;
      if(paging.buttonValue.length <= 1) return;
      if(type === "last" && paging.page === 0) return;
      if(type === "next" && paging.page + 1 === paging.pageCount) return;
      var count = type === "last"? -1: 1;
      this.getDrafts(paging.page + count);
    },
    //获取草稿箱内容
    getDrafts: debounce(function (skip = 0) {
      this.loading = true;
      const self = this;
      let {quota} = self;
      if(self.type) quota = 7;
      nkcAPI(`/creation/drafts?quota=${quota}&skip=${skip}&type=${this.draftsType}&t=${Date.now()}`, 'GET', {})
        .then(res => {
          res.drafts.map(d => {
            d.delay = 0;
          })
          self.drafts = res.drafts;
          self.paging = res.paging;
          self.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    }, 300),
    //创建，编辑草稿
    editDraft(item) {
      if(this.type) {
        sweetQuestion(`继续创作将会覆盖编辑器中全部内容，确定继续？`)
          .then(() => {
            window.location.href = `/creation/drafts/draftEdit?draftId=${item?item._id:''}&documentDid=${item?item.document.did:''}`;
          })
          .catch(sweetError);
      } else {
        window.location.href = `/creation/drafts/draftEdit?draftId=${item?item._id:''}&documentDid=${item?item.document.did:''}`;
      }
    },
    fastSelectedDraft(id) {
      console.log(id);
    },
    selectedDraft(item) {
      console.log(item);
    },
    delDraft(item, type) {
      const self = this;
      return sweetQuestion(`确定要执行当前操作？`)
        .then(() => {
          return nkcAPI(`/creation/drafts?_id=${item._id}&type=${type}`, 'DELETE', {})
            .then(res => {
              //从草稿中去除删除成功的草稿
              self.getDrafts(self.paging.page);
            })
            .catch(err => {
              sweetError(err);
            })
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    //插入草稿
    insert(item) {
      if(!item) return;
      this.$emit('callback-data', item.document.content);
      item.delay = 3;
      const func = () => {
        setTimeout(() => {
          item.delay --;
          if(item.delay > 0) {
            func();
          }
        }, 1000);
      }
      func();
    },
    open: function (callback, options = {}) {
      this.callback = callback;
      this.getDrafts(0);
    },
  }
}
</script>
