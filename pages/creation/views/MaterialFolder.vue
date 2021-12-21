<template lang="pug">
  .material-folder
    .row
      .col-xs-12.col-md-12
        h2 我的素材
        material-content(ref="materialContent" :files="files")


</template>

<style lang="less" scoped>
.material-folder {
  width: 100%;
}
</style>

<script>
import {nkcAPI} from "../../lib/js/netAPI";
import {getUrl} from '../../lib/js/tools'
import Material from './Material'
import MaterialContent from '../../lib/vue/MaterialContent'
export default {
  data: function (){
    return {
      orderStyle: 'icon',//list 列表, icon 图标
      files: [
        {
          _id: '1',
          name: '测试文件',
          type: 'file',
          mid: '1',
          rid: '111',
          ext: 'txt',
          tlm: '2020-9-8',
          size: '15445135',
          description: '',
        },
        {
          _id: '2',
          name: '测试文件2222',
          type: 'file',
          mid: '1',
          rid: '222',
          ext: 'txt',
          tlm: '2020-9-8',
          size: '15445135',
          description: ''
        },
      ]
    }
  },
  components: {
    'material-content': MaterialContent,
  },
  mounted() {
    this.getFolders()
  },
  computed: {},
  methods: {
    getUrl: getUrl,
    //获取文件夹的文件
    getFolders() {

    },
    openFile(rid) {
    }
  }
}
</script>
