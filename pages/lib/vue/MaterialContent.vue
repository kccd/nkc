<template lang="pug">
  .material-content
    .material-header
      //span.m-r-1 显示风格:
      //input.m-r-1(type="radio" naem="orderStyle" value="icon" v-model="orderStyle")
      //| 图标
      //input.m-r-1(type="radio" name="orderStyle" value="list" v-model="orderStyle")
      //| 列表
      option-button(ref="optionButton"
        @create="createFolder"
        @select="selectFolders"
        @cancel="cancelSelect"
        :mark="mark"
        @all-selected="allSelected"
        @del-folders="delFolders"
        @all-unselected="allUnSelected"
        @move-folders="moveFolders")
    .file-box-container
      // -大图标显示
      .folder-box-content(v-for="folder in folders" @dblclick="openFolder(folder)")
        .folder-box(:class="(selectFoldersId.includes(folder.mid) && mark)?'selected':''" @click="selected(folder.mid)")
          .folder-img
            img(:src="getUrl('fileCover', folder.type)")
          .folder-name(:title="folder.decoration")
            span(@click) {{folder.name}}
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
  }
  .file-box-container{
    margin: 1rem;
    width: 100%;
    .folder-box-content {
      user-select: none;
      cursor: pointer;
      display: inline-block;
      width: 10%;
      padding: 0.5rem;
      text-align: center;
      vertical-align: top;
      .selected {
        background: #CCE8FF;
        border: 1px #99D1FF solid;
        margin: -1px;
      }
      .folder-box {
        box-sizing: border-box;
        display: inline-block;
        padding: 0.5rem;
        &:hover {
          background: #D8EAF9;
        }
        .folder-img {
          display: inline-block;
          text-align: center;
        }
        .folder-name {
          display: inline-block;
          text-align: center;
          span {
            text-align: left;
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-line-clamp:3;
            -webkit-box-orient:vertical;
          }
        }
      }
    }
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
import OptionButton from './OptionButton'
import {nkcAPI} from "../../lib/js/netAPI";
import {getUrl, getSize} from '../../lib/js/tools';
import {visitUrl} from "../../lib/js/pageSwitch";
export default {
  data: function (){
    return {
      orderStyle: 'icon',//list 列表, icon 图标
      mark: false,
      folders: [
        {
          name: 'sdqweqwe',
          type: 'file',
          mid: '34123',
          decoration: ''
        },
        {
          name: '测试文件夹',
          type: 'folder',
          mid: '32424',
          decoration: ''
        }
      ],
      mid: 0,
      selectFoldersId: [],
    }
  },
  components: {
    'option-button': OptionButton,
  },
  mounted() {
    this.mid = this.$route.params.mid;
  },
  computed: {},
  methods: {
    getUrl: getUrl,
    nkcAPI: nkcAPI,
    getFolder() {
    },
    //如果是文件夹就进入文件夹，如果是文件就打开文件
    openFolder(folder) {
      if(folder.type === 'folder') {
        this.$router.push({
          name: 'material',
          params: {
            mid: folder.mid,
          }
        });
      } else {
        console.log('目标类型是文件');
      }
    },
    //返回上一层文件夹
    back() {
      this.$router.go(-1);
    },
    //创建文件夹
    createFolder(data) {
      this.folders.push({
        name: data[0].value,
        type: 'folder',
        mid: this.mid,
        decoration: data[1].value
      });
      ++this.mid;
    },
    //多选
    selectFolders() {
      this.mark = true;
    },
    //选中文件夹
    selected(mid) {
      if(!this.mark) return;
      if(this.selectFoldersId.includes(mid)) {
        const index = this.selectFoldersId.indexOf(mid);
        this.selectFoldersId.splice(index, 1);
      } else {
        this.selectFoldersId.push(mid);
      }
    },
    //取消多选
    cancelSelect() {
      this.mark = false;
      this.selectFoldersId = [];
    },
    //全选
    allSelected() {
      this.folders.map(folder => {
        if(!this.selectFoldersId.includes(folder.mid)) {
          this.selectFoldersId.push(folder.mid);
        };
      })
    },
    //取消全选
    allUnSelected() {
      this.selectFoldersId = [];
    },
    //删除选中文件夹
    delFolders() {
      return sweetQuestion(`确定要执行当前操作？`)
        .then(() => {
          const {folders} = this;
          for(const i in folders) {
            if(this.selectFoldersId.includes(folders[i].mid)) {
              this.folders.splice(i, 1);
            }
          }
          return;
        })
        // .then(() => {
        //   sweetSuccess('执行成功');
        // })
        .catch((err) => {
          sweetError(err);
        });
    },
    //移动文件夹
    moveFolders() {
      if(this.selectFoldersId.length === 0) return sweetWarning('请先选择文件夹');
      console.log(this.selectFoldersId);
    }
  }
}
</script>
