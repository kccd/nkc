<template lang="pug">
  .material-folder
    .row
      .col-xs-12.col-md-12
        .material-header-title
          bread-crumb(ref="breadCrumb" :list="navList")
        material-box(ref="materialFolders" :folders="folders" @material-data="getMaterialData")
</template>

<style lang="less" scoped>
.material-folder {
  width: 100%;
  .material-header-title {
    height: 5rem;
    line-height: 5rem;
  }
}
</style>

<script>
import {getUrl} from '../../../lib/js/tools';
import MaterialContent from '../../../lib/vue/MaterialContent'
import MaterialBox from './MaterialBox'
import BreadCrumb from '../../../lib/vue/Breadcrumb';
export default {
  data: function (){
    return {
      folders: [],
      materialData: [],
    }
  },
  components: {
    'material-content': MaterialContent,
    'material-box': MaterialBox,
    'bread-crumb': BreadCrumb,
  },
  mounted() {
  },
  computed: {
    navList() {
      const {materialData, bid} = this;
      if(!materialData) {
        materialData.push({
          name: `加载中...`,
        });
      }
      return [
        {
          name: '我的素材',
          page: 'materials'
        },
        ...materialData
      ]
    }
  },
  methods: {
    getUrl: getUrl,
    //获取面包屑导航信息
    getMaterialData(data) {
      for(const m of data) {
        if(!m._id) continue;
        m.path = `/creation/material/${m._id}`;
      }
      this.materialData = data;
    },
  }
}
</script>
