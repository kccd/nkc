<template>
  <draggable :title="title" ref="draggableInstance" max-width="40rem">
    <div slot="content" class="p-a-1">
      <div v-if="name === names.list">
        <div class="text-right">
          <button
            class="btn btn-default btn-sm pull-left"
            @click="setName(names.editor)"
          >新建</button>
          <button
            class="btn btn-default btn-sm"
            @click="close"
          >取消</button>
          <button
            class="btn btn-default btn-sm"
            @click="submit"
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
          <button class="btn btn-default btn-sm" @click="setName(names.list)">取消</button>
          <button class="btn btn-primary btn-sm" @click="submit">提交</button>
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

const names = {
  list: 'list',
  editor: 'editor'
};
export default {
  components: {
    draggable: Draggable,
  },
  data: () => ({
    names: names,
    name: names.list, // list, editor,
    tags: [],
    tag: {
      _id: null,
      name: '',
      desc: ''
    }
  }),
  mounted() {
    this.getAllTags();
  },
  computed: {
    draggableInstance() {
      return this.$refs.draggableInstance;
    },
    title() {
      if(this.name === this.names.list) {
        return '试题标签';
      } else if(this.tag._id === null) {
        return '新建标签';
      } else {
        return '编辑标签';
      }
    }
  },
  methods: {
    open() {
      this.draggableInstance.open();
    },
    close() {
      this.draggableInstance.close();
    },
    setName(name) {
      this.name = name;
    },
    submit() {
      if(this.tag._id) {
        this.modifyTag();
      } else {
        this.createTag();
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
        .then(() => {
          this.getAllTags()
          this.setName(this.names.list);
        })
        .catch(sweetError)
    },
    modifyTag() {
      this.checkTagInfo();
      const {name, desc, _id} = this.tag;
      nkcAPI(`/api/v1/exam/tag/${_id}`, HttpMethods.POST, {
        name,
        desc,
      })
        .then(() => {
          this.getAllTags();
          this.setName(this.names.list);
        })
        .catch(sweetError);
    },
    getAllTags() {
      return nkcAPI(`/api/v1/exam/tags`, HttpMethods.GET)
        .then(res => {
          this.tags = [...res.data.tags];
        })
        .catch(sweetError)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
