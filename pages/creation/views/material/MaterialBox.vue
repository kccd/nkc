<template lang="pug">
  .row
    .col-xs-12.col-md-12
      common-modal(ref="editorModal")
      resource-info(ref="resourceInfo" @download="downloadFile")
      download-panel(ref="downloadPanel")
      image-viewer(ref="imageViewer")
      ul.contextmenu(v-show="visible" :style="{left:left+'px',top:top+'px'}" v-if="rightClickItem")
        li(@click="editorFolder(rightClickItem)") 重命名
        li(@click="editorDocument(rightClickItem)" v-if="rightClickItem && rightClickItem.type === 'document'") 编辑
        li(@click="downloadFile(rightClickItem.resource.rid)" v-if="rightClickItem && rightClickItem.type === 'resource' && rightClickItem.resource") 下载
        li(@click="delFolder(rightClickItem)") 删除
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
          @move-folders="moveFolders"
          @add-files="addFiles"
          @back="back"
          @add-document="addDocument")
      .material-folder-container
        .material-folder(v-if="!loading")
          .folder-box-loading(v-if="folders.length === 0")
            .null 空空如也~~
          .folder-box-content(v-else v-for="folder in folders")
            .folder-box(:class="(selectFoldersId.includes(folder._id) && mark)?'selected':''" @dblclick="openMaterial(folder)" @click="selected(folder._id)" @dragend="dragend" @dragenter="dragenter($event, folder)" @drag="drag($event, folder)" @contextmenu.prevent="openMenu($event,folder)")
              .folder-img
                img(:src="getUrl('fileCover', folder.type)" v-if="folder.type === 'folder'")
                img(:src="getUrl('resourceCover', folder.resource.rid)" v-else-if="folder.type === 'resource' && folder.resource && (folder.resource.mediaType !== 'mediaAttachment' && folder.resource.mediaType !== 'mediaAudio')")
                img(:src="getUrl('fileCover', folder.resource.ext)" v-else-if="folder.type === 'resource' && folder.resource && (folder.resource.mediaType === 'mediaAttachment' || folder.resource.mediaType === 'mediaAudio')")
                img(:src="getUrl('fileCover', '')" v-else)
              .folder-name(:title="folder.decoration")
                span(v-if="folder.type === 'document' && folder.betaDid && !folder.targetId") [编辑中]
                span {{folder.name}}
        .material-folder(v-else)
          .null
            .fa.fa-spinner.fa-spin.fa-fw
</template>
<style lang="less" scoped>
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background-color: rgb(3, 125, 243);;
  color: white;
}
.material-header {
}
.material-folder-container {
  .material-folder {
    .folder-box-loading {
      .null {
        margin-top: 10rem;
        text-align: center;
        font-size: 1.2rem;
      }
    }
    .null {
      margin-top: 10rem;
      text-align: center;
      font-size: 1.2rem;
    }
    .folder-box-content {
      user-select: none;
      cursor: pointer;
      display: inline-block;
      width: 8rem;
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
          width: 5rem;
          height: 5rem;
          line-height: 5rem;
          img {
            width: 5rem;
          }
        }
        .folder-name {
          display: inline-block;
          text-align: center;
          span {
            word-wrap: break-word;
            white-space: normal;
            word-break: break-all;
            width: 100%;
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
}

</style>
<script>
import {nkcAPI} from "../../../lib/js/netAPI";
import {getUrl} from "../../../lib/js/tools";
import OptionButton from '../../../lib/vue/OptionButton';
import CommonModal from '../../../lib/vue/CommonModal';
import ResourceInfo from '../../../lib/vue/ResourceInfo';
import DownloadPanel from '../../../lib/vue/DownloadPanel';
import ImageViewer from '../../../lib/vue/ImageViewer';
export default {
  data: function() {
    return {
      mark: false,
      loading: true,
      folders: [
      ],
      mid: '',
      selectFoldersId: [],
      visible: false,
      top: 0,
      left: 0,
      materialData: '',
      dragenterId: '',
      dragId: '',
      rightClickItem: '',
    }
  },
  components: {
    'option-button': OptionButton,
    'common-modal': CommonModal,
    'resource-info': ResourceInfo,
    'download-panel': DownloadPanel,
    'image-viewer': ImageViewer,
  },
  mounted() {
    this.mid = this.$route.params?this.$route.params.id:'';
    this.getFolders();
  },
  watch: {
    '$route' (to, from) {
      if (to.params && from.params && to.params.id !== from.params.id) {
        let id = Number(to.params.id);
        this.mid = id;
        this.getFolders();
      }
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  methods: {
    getUrl: getUrl,
    nkcAPI: nkcAPI,
    getFolders() {
      const self = this;
      let url = '/creation/materials';
      if(this.mid) url = '/creation/material/' + self.mid;
      nkcAPI(url, 'GET', {})
      .then(res => {
        self.folders = res.materials;
        console.log(self.folders);
        self.materialData = res.materialData || '';
        self.$emit('material-data', res.materialData?res.materialData.crumbs:[]);
        self.loading = false;
      })
      .catch(err => {
        console.log(err);
      })
    },
    //如果是文件夹就进入文件夹，如果是文件就打开文件,如果是文档就打开文档,双击打开
    openMaterial(folder) {
      if(folder.type === 'folder') {
        this.$router.push({
          path: `/creation/material/${folder._id}`
        });
      } else if (folder.type === 'resource') {
        if(!folder.resource) sweetError('未找到资源文件');
        if(folder.resource.mediaType === 'mediaPicture') {
          this.viewer([`/r/${folder.resource.rid}`,
          ]);
          // window.open( `/r/${folder.resource.rid}`);
        } else if(folder.resource.mediaType === 'mediaVideo') {
          // this.$refs.videoPlayer.open();
        } else {
          this.$refs.resourceInfo.open({rid: folder.resource.rid, mediaType: folder.mediaType})
        }
      } else {
        this.editorDocument(folder);
      }
    },
    //预览图片
    viewer(img) {
      this.$refs.imageViewer.show(img);
    },
    //返回上一层文件夹
    back() {
      if(!this.materialData) return;
      let path = '/creation/materials';
      if(this.materialData.mid) path = `/creation/material/${this.materialData.mid}`;
      this.$router.push({
        path: path,
      });
    },
    //创建文件夹
    createFolder(data) {
      nkcAPI('/creation/materials', 'POST', {
        name: data[0].value,
        type: 'folder',
        mid: this.mid,
      })
        .then(res => {
          this.getFolders();
        })
      .catch(err => {
        console.log(err);
        sweetError(err);
      })
    },
    //多选
    selectFolders() {
      this.mark = true;
    },
    //选中文件夹
    selected(id) {
      if(!this.mark) return;
      if(this.selectFoldersId.includes(id)) {
        const index = this.selectFoldersId.indexOf(id);
        this.selectFoldersId.splice(index, 1);
      } else {
        this.selectFoldersId.push(id);
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
        if(!this.selectFoldersId.includes(folder._id)) {
          this.selectFoldersId.push(folder._id);
        };
      })
    },
    //取消全选
    allUnSelected() {
      this.selectFoldersId = [];
    },
    //删除选中文件夹
    delFolders() {
      const {folders} = this;
      const self = this;
      if(self.selectFoldersId.length === 0) return sweetWarning('请先选择文件或文件夹');
      return sweetQuestion(`确定要执行当前操作？`)
        .then(() => {
          return nkcAPI('/creation/materials/del', 'POST', {
            selectFoldersId: self.selectFoldersId,
          })
          .then(res => {
            // for(const f of folders) {
            //   if(!self.selectFoldersId.includes(f._id)) continue;
            //   const index = folders.indexOf(f);
            //   folders.splice(index, 1);
            // }
            self.getFolders();
          })
          .catch(err => {
            console.log(err);
            sweetError(err);
          })
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    //删除单个文件夹
    delFolder(folder) {
      const {folders} = this;
      const self = this;
      return sweetQuestion(`确定要执行当前操作？`)
        .then(() => {
          return nkcAPI(`/creation/material/${folder._id}`, 'DELETE', {})
            .then(res => {
              for(const f of folders) {
                if(f._id !== folder._id) continue;
                const index = folders.indexOf(f);
                folders.splice(index, 1);
                return;
              }
            })
            .catch(err => {
              console.log(err);
              sweetError(err);
            })
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    //移动文件夹
    moveFolders() {
      if(this.selectFoldersId.length === 0) return sweetWarning('请先选择文件夹');
    },
    //添加文件
    addFiles(resource) {
      const self = this;
      if(!resource) return sweetWarning('请选择资源文件');
      let materialName = '文件夹';
      if(resource.length === 1) materialName = '文件';
      self.$refs.editorModal.open(function(data) {
        if(!data) return sweetError('参数错误');
        let option = {
          name: data[0].value,
          type: 'resource',
          mid: self.mid?self.mid:'',
          targetId: resource[0].rid
        };
        if(resource.length > 1) {
          option = {
            name: data[0].value,
            resource: resource,
            type: 'folder',
            mid: self.mid?self.mid:'',
          };
        }
        nkcAPI('/creation/materials', 'POST', option)
          .then(res => {
            self.$refs.editorModal.close();
            self.getFolders();
          })
          .catch(err => {
            console.log(err);
            sweetError(err);
          })
      }, {
        data: [
          {
            label: `请输入${materialName}名`,
            dom: "input",
            value: resource.length === 1?resource[0].oname:'',
          },
          {
            label: `请输入${materialName}详情`,
            dom: "input",
            value: ''
          }
        ],
        title: `添加资源${materialName}`
      })
    },
    //编辑文档
    editorDocument(folder) {
      if(folder.type !== 'document') return;
      this.$router.push({
        path: `/creation/materials/editor`,
        query: {
          mid: this.mid,
          documentId: folder.targetId || folder.betaDid,
          name: folder.name,
          _id: folder._id,
        }
      });
    },
    //重命名
    editorFolder(folder) {
      const self = this;
      let url = '/creation/materials/editor';
      if(self.mid) url = `/creation/material/${folder._id}/editor`
      self.$refs.editorModal.open(function(data) {
        if(data) {
          if(data[0].value === '') return sweetError('请输入文件夹名');
          nkcAPI(url, 'POST', {
            name: data[0].value,
            _id: folder._id,
            mid: self.mid,
          })
            .then(res => {
              self.$refs.editorModal.close();
              self.getFolders();
            })
            .catch(err => {
              console.log(err);
              sweetError(err);
            })
        }
      }, {
        data: [
          {
            label: "请输入文件夹名",
            dom: "input",
            value: folder.name
          },
          {
            label: "请输入文件夹描述信息",
            dom: "input",
            value: folder.decoration
          }
        ],
        title: "编辑"
      });
    },
    //打开菜单
    openMenu(e, item) {
      this.rightClickItem = item;
      let x = e.clientX;
      let y = e.clientY;
      this.top = y;
      this.left = x;
      this.visible = true;
    },
    //关闭菜单
    closeMenu() {
      this.visible = false;
    },
    drag(e, folder) {
      e.stopPropagation();
      e.preventDefault();
      this.dragId = folder._id
    },
    dragenter(e, folder) {
      if(folder.type !== 'folder') return;
      this.dragenterId = folder._id;
    },
    //拖拽结束时触发修改文件或文件夹的mid
    dragend() {
      const {dragenterId, dragId, folders} = this;
      if(dragId === dragenterId) return;
      if(!dragenterId || !dragId) return;
      const self = this;
      nkcAPI('/creation/materials/drag', 'post', {
        dragenterId,
        dragId
      })
      .then(()  => {
        for(const folder of folders) {
          if(folder._id !== dragId) continue;
          const index = folders.indexOf(folder);
          folders.splice(index, 1);
          return;
        }
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //添加文档
    addDocument() {
      this.$router.push({
        path: `/creation/materials/editor`,
        query: {
          mid: this.mid,
        }
      });
    },
    downloadFile(rid) {
      this.$refs.downloadPanel.open(rid);
    }
  }
}
</script>
