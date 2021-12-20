<template lang="pug">
  .row
    .col-xs-12.col-md-12
      .material-folder
        .folder-box.col-xs-2(v-for="folder in folders" @click="openFolder(item.mid)")
          .folder-img
            img(:src="getUrl('fileCover', 'folder')")
          .folder-name
            span {{folder.name}}
</template>
<script>
import {nkcAPI} from "../js/netAPI";
import {getUrl} from "../js/tools";
export default {
  props: [],
  data: function() {
    return {
      folders: [
        {
          name: '测试文件',
          type: 'file',
          mid: '1',
        },
        {
          name: '测试文件夹',
          type: 'folder',
          mid: '2',
        }
      ]
    }
  },
  methods: {
    getUrl: getUrl,
    nkcAPI: nkcAPI,
    getFolder() {
    },
    openFolder(mid) {
      this.$router.push(`/creation/material/${mid}`);
    }
  }
}
</script>
