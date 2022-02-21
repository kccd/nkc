<template lang="pug">
  .container-fluid
    .m-b-1(v-if="type === 'all'")
      span.b-b(@click="toggle('drafts')" :class="{active : draftsType === 'drafts'}") 自定义 
      span |
      span.m-r-05.b-b(@click="toggle('column')" :class="{active : draftsType === 'column'}") 专栏
      button.m-r-05.btn.btn-default.btn-sm(@click="newDraft") 新建图文片段
      button.btn.btn-default.btn-sm(@click="toTrash" v-show="draftsType === 'drafts'") 回收站
    .m-b-1(v-else)
      bread-crumb(:list="navList")
    .m-b-05(v-if="pages && pages.length > 0")
      paging(:pages="pages" @click-button="switchPage")
    .m-b-05
      .drafts
        .p-t-2.p-b-2.text-center(v-if="!draftsData.length") 空空如也~
        .draft-item(v-for="draft in draftsData" @click="toEditDraft(draft)" :class="type")
          .draft-title {{draft.title}}
          .draft-content {{draft.content}}
          .draft-time
            .fa.fa-lightbulb-o.m-r-05
            span 最后编辑于 {{draft.time}}
            span.icon.icon-recover(v-if='draft.deleted' @click.stop="recoverDraft(draft)") 恢复
            span.icon.icon-delete(v-else @click.stop="deleteDraft(draft)") 删除
    .m-b-05(v-if="pages && pages.length > 0")
      paging(:pages="pages" @click-button="switchPage")
</template>
<style lang="less" scoped>
  @import "../../../publicModules/base";
  .b-b{
     border-bottom:1px solid orange;
     padding: 2px 4px;
    //  border-radius: 4px;
     transition: all .5s;
     cursor: pointer;
  }
  .b-b:hover{
    border-bottom:1px solid rgb(0, 238, 255);
  }
  .active{
    color: orange;
  }
  .drafts{
    .draft-item{
      width: 34rem;
      max-width: 100%;
      border: 1px solid #eee;
      background-color: #fff;
      padding: 1rem;
      cursor: pointer;
      display: inline-block;
      margin: 0 1rem 1rem 0;
      .draft-title{
        @height: 2.8rem;
        height: @height;
        line-height: @height;
        font-weight: 700;
        .hideText(@line: 1);
        font-size: 1.6rem;
        margin-bottom: 0.5rem;
      }
      .draft-time{
        @height: 1.8rem;
        @buttonDeleteWidth: @height + 1rem;
        height: @height;
        line-height: @height;
        .hideText(@line: 1);
        position: relative;
        padding-right: @buttonDeleteWidth;
        .icon{
          position: absolute;
          top: 0;
          right: 0;
          height: @height;
          width: @buttonDeleteWidth;
          text-align: right;
          cursor: pointer;
          &.icon-delete{
            color: red;
          }
          &.icon-recover{
            color: @primary;
            opacity: 1!important;
          }
        }
      }
      .draft-content{
        height: 10rem;
        margin-bottom: 1rem;
        color: #555;
        .hideText(@line: 6);
      }
      &.trash{
        opacity: 0.8;
        .draft-content, .draft-title{
          text-decoration:line-through;
        }
      }
    }
  }
</style>
<script>
  import DraftsBox from "../../../lib/vue/drafts/CustomDraftsBox";
  import Paging from "../../../lib/vue/Paging";
  import {sweetError, sweetQuestion, sweetSuccess} from '../../../lib/js/sweetAlert';
  export default {
    data: () => ({
      type: 'all', // all, trash
      draftsData: [],
      paging: null,
      // 区分是 自定义 还是 专栏
      draftsType:'drafts'
    }),
    components: {
      'drafts-box': DraftsBox,
      'paging': Paging
    },
    computed: {
      pages() {
        const {paging} = this;
        if(paging && paging.buttonValue) {
          return paging.buttonValue
        } else {
          return []
        }
      },
      navList() {
        if(this.type === 'all') return [];
        const self = this;
        return [
          {
            name: "图文片段",
            onClick() {
              self.toDrafts();
            }
          },
          {
            name: '回收站'
          }
        ]
      }
    },
    mounted() {
      this.initType();
      this.getDrafts();
    },
    methods: {
      toggle(type){
        
        if(type === 'drafts'){
          this.getDrafts()
        }else if(type === 'column'){
          this.getColumn()
        }
      },
      initType() {
        const {type = "all"} = this.$route.query;
        this.type = type;
      },
      navToPage(name, params = {}, query = {}) {
        this.$router.push({
          name,
          params,
          query
        });
      },
      toDrafts() {
        this.type = 'all';
        this.getDrafts();
      },
      toTrash() {
        this.type = 'trash';
        this.getDrafts();
      },
      switchPage(num) {
        this.getDrafts(num);
      },
      getColumn(page = 0){
        // this.draftsData = [{'title':1,content:'11'}];
        nkcAPI(`/creation/drafts/column?pageNumber=${page}`, 'GET')
          .then(data => {
            this.draftsData = data.draftsData
            this.paging = data.paging;
            this.draftsType = 'column'
          })
          .catch(sweetError)
      },
      getDrafts(num = 0) {
        const {type} = this;
        const self = this;
        nkcAPI(`/creation/drafts?del=${type==='trash'}&page=${num}`, 'GET')
          .then(data => {
            self.draftsData = data.draftsData;
            self.paging = data.paging;
            this.draftsType = 'drafts'
          })
          .catch(sweetError)
      },
      draftOption(draft, operation) {
        let deleteTitle = '确定要删除当前自定义草稿吗？删除后可通过回收站找回。' 
        const {draftId} = draft;
        let deleteUrl = [`/creation/draft?id=${draftId}&type=custom&operation=${operation}`, 'DELETE']
        if(this.draftsType === 'column'){
          const {articleId} = draft
          deleteTitle = '删除后不能恢复，确定要删除当前专栏草稿吗？';
          deleteUrl[0] = `/creation/draft?id=${articleId}&type=column&operation=${operation}`
        }
        const self = this;
        return Promise.resolve()
          .then(() => {
            if(operation === 'delete') {
              return sweetQuestion(deleteTitle);
            }
          })
          .then(() => {
            return nkcAPI(...deleteUrl)
          })
          .then(() => {
            self.getDrafts(this.paging.page);
          })
          .catch(sweetError)
      },
      recoverDraft(draft) {
        this.draftOption(draft, 'recover')
      },
      deleteDraft(draft) {
        this.draftOption(draft, 'delete')
      },
      newDraft() {
        this.navToPage("draftEdit", {}, {});
      },
      toEditDraft(draft) {
        if(this.draftsType === 'column'){
          const {articleId, columnId} = draft 
          window.open(`/column/editor?mid=${columnId}&aid=${articleId}`)
        }else{
          if(this.type !== 'all') return;
          const {draftId} = draft;
          this.navToPage("draftEdit", {}, {
          draftId: draftId
        });
        }
      }
    }
  }
</script>
