<template>
  <draggable :title="title" ref="draggableInstance" max-width="40rem">
    <div slot="content" class="p-a-1">
      <div v-if="name === names.list">
        <div class="m-b-1">
          已选标签：
          <span v-if="selectedTags.length === 0">无</span>
          <span
            v-else
            v-for="(tag, index) in selectedTags"
            class="question-tag selected-tag"
            @click="cancelSelectedTag(index)"
          >
            {{tag.name}}
            <span class="fa fa-remove remove-tag-icon" />
          </span>
        </div>
        <div class="p-t-2 p-b-2 text-center" v-if="loading">加载中...</div>
        <div class="m-b-1" v-else>
          <span
            class="question-tag"
            v-for="tag in tags"
            :title="tag.desc"
            @click="selectTag(tag)"
          >{{tag.name}}</span>
        </div>
        <div class="text-right">
          <button
            v-if="manageQuestionTagsPermission"
            class="btn btn-default btn-sm pull-left"
            @click="setName(names.editor)"
          >创建新标签</button>
          <button
            class="btn btn-default btn-sm"
            @click="close"
          >取消</button>
          <button
            class="btn btn-primary btn-sm"
            @click="submitSelectedTags"
            :disabled="selectedTags.length === 0"
          >确定</button>
        </div>

      </div>
      <div v-else>
        <div class="form">
          <div class="form-group">
            <label>标签名</label>
            <input type="text" class="form-control" v-model.trim="tag.name">
          </div>
          <div class="form-group">
            <label>简介</label>
            <textarea rows="3" class="form-control" v-model.trim="tag.desc"></textarea>
          </div>
        </div>
        <div class="text-right">
          <button class="btn btn-default btn-sm" @click="editorCancel">取消</button>
          <button
            class="btn btn-primary btn-sm"
            @click="submitTagInfo"
            :disabled="!tag.name"
          >提交</button>
        </div>
      </div>
    </div>
  </draggable>
</template>


<script>
import Draggable from './publicVue/draggable.vue'
import { HttpMethods, nkcAPI } from "../js/netAPI";
import {sweetError} from "../js/sweetAlert";
import {checkString} from "../js/checkData";
import {Close} from "@icon-park/vue";

const names = {
  list: 'list',
  editor: 'editor'
};
const defaultTag = {
  _id: null,
  name: '',
  desc: ''
};
export default {
  components: {
    draggable: Draggable,
    'close-icon': Close,
  },
  data: () => ({
    names: names,
    name: names.list, // list, editor,
    defaultName: names.list,
    tags: [],
    tag: {...defaultTag},
    selectedTagsId: [],
    callback: null,
    loading: true,
    manageQuestionTagsPermission: false,
  }),
  computed: {
    selectedTags() {
      const tags = [];
      for(const tagId of this.selectedTagsId) {
        tags.push(this.tagsObj[tagId]);
      }
      return tags;
    },
    tagsObj() {
      const obj = {};
      for(const tag of this.tags) {
        obj[tag._id] = tag;
      }
      return obj;
    },
    draggableInstance() {
      return this.$refs.draggableInstance;
    },
    title() {
      if(this.name === this.names.list) {
        return '创建新标签';
      } else if(this.tag._id === null) {
        return '新建标签';
      } else {
        return '编辑标签';
      }
    }
  },
  methods: {
    open(props) {
      const {
        name = this.names.list,
        tag = {...defaultTag},
        callback = null,
      } = props;
      this.defaultName = name;
      this.name = name;
      this.tag = tag;
      this.callback = callback;
      this.draggableInstance.open();
      this.selectedTagsId = [];
      this.getAllTags();
    },
    close() {
      this.draggableInstance.close();
    },
    setName(name) {
      this.name = name;
    },
    submitTagInfo() {
      if(this.tag._id) {
        this.modifyTag();
      } else {
        this.createTag();
      }
    },
    submitSelectedTags() {
      const {selectedTagsId, selectedTags} = this;
      if(this.callback) {
        this.callback({
          tagsId: [...selectedTagsId],
          tags: selectedTags.map(tag => {
            return {
              _id: tag._id,
              toc: tag.toc,
              name: tag.name,
              desc: tag.desc,
            }
          }),
        });
      }
    },
    checkTagInfo() {
      const {name, desc} = this.tag;
      checkString(name, {
        name: '标签名',
        minLength: 1,
        maxLength: 20,
      });
      checkString(desc, {
        name: '标签简介',
        maxLength: 200
      });
    },
    createTag() {
      this.checkTagInfo();
      const {name, desc} = this.tag;
      nkcAPI(`/api/v1/exam/tags`, HttpMethods.POST, {
        tag: {
          name,
          desc
        }
      })
        .then((res) => {
          this.editorCallback(res.data.tag);
        })
        .catch(sweetError)
    },
    initTag() {
      this.tag = {...defaultTag};
    },
    modifyTag() {
      this.checkTagInfo();
      const {name, desc, _id} = this.tag;
      nkcAPI(`/api/v1/exam/tag/${_id}`, HttpMethods.PUT, {
        name,
        desc,
      })
        .then((res) => {
          this.editorCallback(res.data.tag);
        })
        .catch(sweetError);
    },
    editorCallback(newTag) {
      this.initTag();
      if(this.defaultName === this.names.list) {
        this.tags.push(newTag);
        this.setName(this.names.list);
      } else if(this.callback) {
        this.callback(newTag);
      }
    },
    getAllTags() {
      return nkcAPI(`/api/v1/exam/tags`, HttpMethods.GET)
        .then(res => {
          this.tags = [...res.data.tags];
          this.manageQuestionTagsPermission = res.data.manageQuestionTagsPermission;
          this.loading = false;
        })
        .catch(sweetError)
    },
    cancelSelectedTag(index) {
      this.selectedTagsId.splice(index, 1);
    },
    selectTag(tag) {
      if(!this.selectedTagsId.includes(tag._id)) {
        this.selectedTagsId.push(tag._id);
      }
    },
    editorCancel() {
      if(this.defaultName === this.names.list) {
        this.setName(this.names.list)
      } else {
        this.close();
      }
    }
  }
}
</script>

<style lang="less" scoped>
  @import "../../publicModules/base";
  .question-tag{
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    padding: 0 0.5rem;
    background-color: @gray;
    color: #333;
    margin: 0 0.5rem 0.5rem 0;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    &:hover{
      background-color: @primary;
      color: #fff;
    }
  }
  .selected-tag{
    background-color: @primary;
    color: #fff;
  }
</style>
