<template lang="pug">
  .container-fluid
    .m-b-1
      button.m-r-05.btn.btn-default.btn-sm(@click="newDraft") 撰写新片段
      //button.btn.btn-default.btn-sm(@click="toTrash" ) 回收站
    paging(:pages="pages" @click-button="switchPage")
    blank(v-if="draftsData.length === 0")
    .drafts(v-else)
      .draft-item(v-for="draft in draftsData" @click="toEditDraft(draft)" :class="type")
        .draft-title(:title="draft.title") {{draft.title}}
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
  .drafts{
    .draft-item{
      width: 26.2rem;
      border-radius: 3px;
      max-width: 100%;
      border: 1px solid #eee;
      background-color: #efefef;
      padding: 1rem 1rem;
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
        height: 6.8rem;
        margin-bottom: 1rem;
        color: #555;
        .hideText(@line: 4);
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
  import Blank from '../../components/Blank';
  export default {
    data: () => ({
      type: 'all', // all, trash
      draftsData: [],
      paging: null,
    }),
    components: {
      'drafts-box': DraftsBox,
      'paging': Paging,
      'blank': Blank,
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
    watch: {
      $route() {
        this.getDrafts(this.$route.query.page);
      }
    },
    methods: {
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
        this.$router.replace({
          name: this.$route.name,
          query: {
            page: num
          }
        });
      },
      getDrafts(num = 0) {
        const {type} = this;
        const self = this;
        nkcAPI(`/creation/drafts?del=${type==='trash'}&page=${num}`, 'GET')
          .then(data => {
            self.draftsData = data.draftsData;
            self.paging = data.paging;
            self.draftsType = 'drafts'
          })
          .catch(sweetError)
      },
      draftOption(draft, type) {
        return Promise.resolve()
          .then(() => {
            if(type === 'delete') {
              return sweetQuestion('片段被删除后无法恢复，确定要删除吗？')
            }
          })
          .then(() => {
            return nkcAPI(`/creation/draft/${draft.draftId}?type=${type}`, 'DELETE')
          })
          .then(() => {
            if(type === 'recover') {
              sweetSuccess('片段已恢复')
            }
            this.getDrafts(this.pages.page);
          })
          .catch(sweetError);
      },
      recoverDraft(draft) {
        this.draftOption(draft, 'recover')
      },
      deleteDraft(draft) {
        this.draftOption(draft, 'delete')
      },
      newDraft() {
        this.navToPage("draftEditor", {}, {});
      },
      toEditDraft(draft) {
        const {draftId} = draft;
        this.navToPage("draftEditor", {}, {
          id: draftId
        });
      }
    }
  }
</script>
