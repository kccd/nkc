<template lang="pug">
  .row
    .col-xs-12.col-md-12
      .material-header
        option-button(
          ref="optionButton"
          @create="createFolder"
          @select="selectFolders"
          @cancel="cancelSelect"
          :mark="mark"
          @all-selected="allSelected"
          @del-folders="delFolders"
          @all-unselected="allUnSelected"
          @move-folders="moveFolders")
      .material-folder
        .folder-box-content(v-for="folder in folders" @dblclick="openFolder(folder)")
          .folder-box(:class="(selectFoldersId.includes(folder.mid) && mark)?'selected':''" @click="selected(folder.mid)")
            .folder-img
              img(:src="getUrl('fileCover', folder.type)")
            .folder-name(:title="folder.decoration")
              span(@click) {{folder.name}}
</template>
<style lang="less" scoped>
.material-header {
}
.material-folder {
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
}
</style>
<script>
import {nkcAPI} from "../../lib/js/netAPI";
import {getUrl} from "../../lib/js/tools";
import OptionButton from '../../lib/vue/OptionButton'
export default {
  props: [],
  data: function() {
    return {
      mark: false,
      folders: [
        {
          name: '测试文件',
          type: 'file',
          mid: '555',
          decoration: ''
        },
        {
          name: '测试文件夹',
          type: 'folder',
          mid: '23424',
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
  methods: {
    getUrl: getUrl,
    nkcAPI: nkcAPI,
    getFolder() {
    },
    //如果是文件夹就进入文件夹，如果是文件就打开文件
    openFolder(folder) {
      if(folder.type === 'folder') {
        this.$router.push(`/creation/materials/${folder.mid}`);
      } else {
        console.log('目标类型是文件');
      }
    },
    //返回上一层文件夹
    back() {
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
