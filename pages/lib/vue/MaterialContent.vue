<template lang="pug">
  .material-content
    .material-header
      span.m-r-1 显示风格:
      input.m-r-1(type="radio" naem="orderStyle" value="icon" v-model="orderStyle")
      | 图标
      input.m-r-1(type="radio" name="orderStyle" value="list" v-model="orderStyle")
      | 列表
    .file-box-container
      // -大图标显示
      .file-box-icon(v-if="orderStyle === 'icon'")
        .row
          .col-xs-12.col-md-12
            .file-box(v-for="file in files" @click="openFile(file.rid)" v-if="orderStyle === 'icon'")
              .file-img
                img(:src="getUrl('fileCover', 'file')")
              .folder-name
                span {{file.name}}
      //-列表显示
      .file-box-list
        .row
          .col-xs-12.col-md-12
            .table-material(v-if="orderStyle === 'list'")
              table.table
                thead
                  tr
                    th 名称
                    th 修改日期
                    th 类型
                    th 大小
                tbody
                  tr(v-for="file in files")
                    th
                      .file-name-box
                        .file-img.m-r-1
                          img(:src="getUrl('fileCover', 'file')")
                        span.file-name {{file.name}}
                    th
                      .file-tlm {{file.tlm}}
                    th
                      .file-ext {{file.ext}}
                    th
                      .file-size {{file.size}}
</template>

<style lang="less" scoped>
.material-content {
  .material-header {
    margin: 1rem;
  }
  .file-box-container{
    margin: 1rem;
    width: 100%;
    //.file-box-list {
    //  user-select: none;
    //  .file-list-li {
    //    transition: background-color 100ms;
    //    border-radius: 3px;
    //    cursor: pointer;
    //    margin: 5px 0;
    //    padding: 2px;
    //    .list-checkbox {
    //      display: table-cell;
    //      vertical-align: top;
    //      .checkbox {
    //        position: relative;
    //        display: block;
    //        margin-top: 10px;
    //        margin-bottom: 10px;
    //        label {
    //          min-height: 20px;
    //          padding-left: 20px;
    //          margin-bottom: 0;
    //          font-weight: normal;
    //          cursor: pointer;
    //        }
    //      }
    //    }
    //    .list-cover {
    //      display: table-cell;
    //      border: 1px solid #eee;
    //      background-color: #fff;
    //      position: relative;
    //      div {
    //        img {
    //          height: 2.88rem;
    //          width: 2.88rem;
    //          position: absolute;
    //          top: 0;
    //          left: 0;
    //          right: 0;
    //          bottom: 0;
    //          margin: auto;
    //        }
    //      }
    //    }
    //    .list-body {
    //      .list-name {
    //
    //      }
    //      .list-info {
    //        .time {
    //
    //        }
    //        .size {
    //
    //        }
    //      }
    //      .list-options {
    //
    //      }
    //    }
    //  }
    //}
    .file-box-icon {
      .file-box{
        display: inline-block;
        width: 10%;
        height: 8rem;
        text-align: center;
        .file-img {
          text-align: center;
          img {
            padding: 0.25rem;
          }
        }
        .file-name {
          text-align: center;
        }
      }
    }
    .file-box-list {
      .table-material {
        .table {
          tbody {
            tr {
              th {
                .file-name-box {
                  .file-img {
                    display: inline-block;
                    img {
                      width: 1.5rem;
                      height: 1.5rem;
                    }
                  }
                  .file-name {

                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

<script>
import {nkcAPI} from "../../lib/js/netAPI";
import {getUrl, getSize} from '../../lib/js/tools';
import {visitUrl} from "../../lib/js/pageSwitch";
export default {
  props: ['files'],
  data: function (){
    return {
      orderStyle: 'icon',//list 列表, icon 图标
      mark: false,
    }
  },
  components: {
  },
  mounted() {
    this.getFiles()
  },
  computed: {},
  methods: {
    getUrl: getUrl,
    getSize: getSize,
    visitUrl: visitUrl,
    //获取文件夹的文件
    getFiles() {

    },
    selectFile(file, bool) {},
    deleteFile() {},
    moveFile() {},
    editFile() {},
  }
}
</script>
