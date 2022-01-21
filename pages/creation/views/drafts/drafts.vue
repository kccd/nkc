<template lang="pug">
  .container-fluid
    .m-b-1
      button.m-r-05.btn.btn-default.btn-sm 新建图文片段
      button.btn.btn-default.btn-sm 回收站
    .m-b-1
      paging(:pages="pages" @click-button="switchPage")
    .m-b-1
      drafts-box(ref="draftsBox")
</template>

<script>
  import DraftsBox from "../../../lib/vue/drafts/CustomDraftsBox";
  import Paging from "../../../lib/vue/Paging";
  import {sweetError} from '../../../lib/js/sweetAlert';
  export default {
    data: () => ({
      type: 'all', // all, trash
      drafts: [],
      paging: null,
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
      }
    },
    mounted() {
      this.getDrafts();
    },
    methods: {
      toHome() {

      },
      toTrash() {

      },
      switchPage(num) {
        console.log(num)
      },
      getDrafts(num = 0) {
        const {type} = this;
        const self = this;
        nkcAPI(`/creation/drafts?del=${type==='trash'}&page=${num}`, 'GET')
          .then(data => {
            self.drafts = data.drafts;
            self.paging = data.paging;
          })
          .catch(sweetError)
      }
    }
  }
</script>
