<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title(v-if="edit") {{!type._id?"新建分类":"编辑分类"}}
      .module-dialog-title(v-else) 选择分类
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .modal-body(v-if="!loaded")
        .m-t-3.m-b-3.text-center 加载中...
      .modal-body(v-else)
        .from(v-if="edit")
          .form-group
            label 分类名(不超过20字符)
            input.form-control(type="text" v-model.trim="type.name" autofocus="autofocus" @keyup.enter="save")
          .form-group
            label 父分类
            select.form-control(v-model="type.pid")
              option(:value="null") 无
              option(v-for="t in parentTypes" :value="t._id" v-if="type._id !== t._id") {{t.name}}
          .form-group
            button.btn.btn-sm.btn-block.btn-primary(@click="save") 保存
            button.btn.btn-sm.btn-block.btn-default(@click="closeForm") 取消
        div(v-else)
          .list(v-for="(t, index) in types")
            label(v-if="!editType")
              span(v-html="'&nbsp;&nbsp;&nbsp;'" v-if="t.pid")
              input(type="checkbox" :value="t._id" v-model="selectedTypesId")
              span {{t.name}}
            .type-li(v-else)
              span(v-html="'&nbsp;&nbsp;&nbsp;'" v-if="t.pid")
              span {{t.name}}
              .type-buttons
                .fa.fa-pencil(@click="modifyType(index)" title="编辑")
                .fa.fa-arrow-circle-o-up(@click="moveType(index, 'up')" title="上移")
                .fa.fa-arrow-circle-o-down(@click="moveType(index, 'down')" title="下移")
                .fa.fa-trash(@click="removeType(index)" title="删除")
          .text-center
            .pointer(@click="addType").m-t-05.m-b-05
              .fa.fa-plus-circle &nbsp;添加分类
      .modal-footer(v-if="!edit && !editType")
        .checkbox.m-t-0.m-b-05.text-left(v-if="!hideInfo")
          label
            input(type="checkbox" :value="true" v-model="selectTypesWhenSubscribe")
            span(style="font-size: 1rem;") 下次不再弹出（可在设置-偏好设置中开启）
        button(type="button" class="btn btn-sm btn-default" @click="close") 取消
        button(type="button" class="btn btn-sm btn-primary" @click="complete") 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 34rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
    .type-li{
      position: relative;
      padding-right: 5.5rem;
      height: 2rem;
      line-height: 2rem;
      word-break: break-word;
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    .type-buttons{
      position: absolute;
      top: 0;
      right: 0;
    }
    .type-buttons .fa{
      color: #888;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .type-buttons .fa:hover{
      color: #282c37;
    }
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";
import {getState} from "../js/state";
export default {
  data: () => {
    return {
      show: false,
      edit: false,
      editType: false, // 无法选择分类，仅仅只能编辑分类
      fastAdd: false,
      uid: getState().uid,
      loaded: false,
      types: [],
      selectTypesWhenSubscribe: [],
      selectedTypesId: [],
      hideInfo: false,
      type: {
        name: "",
        pid: null
      },
      backdrop: "statics"
    }
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  computed: {
    selectedTypes: function() {
      var arr = [];
      for(var i = 0; i < this.selectedTypesId.length; i++) {
        var _id = this.selectedTypesId[i];
        var t = this.getTypeById(_id);
        if(t) arr.push(t);
      }
      return arr;
    },
    parentTypes: function() {
      var arr = [];
      for(var i = 0; i < this.types.length; i++) {
        var type = this.types[i];
        if(!type.pid) arr.push(type);
      }
      return arr;
    }
  },
  methods: {
    getSubscribeSettings() {
      return nkcAPI('/account/subscribe_settings', 'GET').then(res => res.subscribeSettings);
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    submit: function() {
      this.callback(this.data);
    },
    getTypeById: function(id) {
      for(var i = 0; i < this.types.length; i++) {
        var type = this.types[i];
        if(type._id === id) return type;
      }
    },
    getTypes: function() {
      const self = this;
      return nkcAPI("/account/subscribe_types", "GET")
        .then(function(data) {
          self.types = data.types;
          self.loaded = true;
          return Promise.resolve()
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    addType: function() {
      this.fastAdd = true;
      this.edit = true;
    },
    complete: function() {
      var selectedTypesId = this.selectedTypesId;
      if(!this.hideInfo && this.selectTypesWhenSubscribe && this.selectTypesWhenSubscribe.length > 0) {
        var uid = NKC.configs.uid;
        nkcAPI("/u/" + uid + "/settings/apps", "PUT", {selectTypesWhenSubscribe: false})
          .catch(function(data) {
            screenTopWarning(data);
          })
      }
      this.callback(selectedTypesId);
    },
    closeForm: function() {
      if(this.fastAdd) {
        this.edit = false;
        this.fastAdd = false;
      } else {
        this.edit = false;
        this.type = "";
      }
      this.type = {
        name: "",
        pid: null
      }
    },
    modifyType: function(index) {
      this.type = this.types[index];
      this.edit = true;
    },
    moveType: function(index, d) {
      var type = this.types[index];
      var self = this;
      nkcAPI("/account/subscribe_types/" + type._id, "PUT", {
        type: "order",
        direction: d
      })
        .then(function() {
          self.getTypes();
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    removeType: function(index) {
      var type = this.types[index];
      var self = this;
      sweetConfirm("确定要删除分类“"+type.name+"”吗？")
        .then(function() {
          nkcAPI("/account/subscribe_types/" + type._id, "DELETE")
            .then(function() {
              self.getTypes();
            })
            .catch(function(data) {
              sweetError(data);
            })
        })
    },
    save: function() {
      var name = this.type.name;
      var pid = this.type.pid;
      var _id = this.type._id;
      var url = "/account/subscribe_types";
      var method = "POST";
      var body = {
        name: name,
        pid: pid
      };
      if(_id) {
        url = "/account/subscribe_types/" + _id;
        method = "PUT";
        body.type = "info";
      }
      const self = this;
      nkcAPI(url, method, body)
        .then(function() {
          self.getTypes();
          self.closeForm();
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    async open(callback, options) {
      try{
        const self = this;
        options = options || {};
        if(options.selectTypesWhenSubscribe === undefined) {
          const subscribeSettings = await this.getSubscribeSettings();
          options.selectTypesWhenSubscribe = !!subscribeSettings.selectTypesWhenSubscribe;
        }
        if(!options.selectTypesWhenSubscribe) return callback([]);
        self.editType = options.editType || false;
        self.hideInfo = options.hideInfo || false;
        self.edit = !!options.edit;
        self.selectedTypesId = [];
        self.callback = callback;
        await self.getTypes();
        // 修改分类
        if(self.edit && options.typeId) {
          var type = self.getTypeById(options.typeId);
          if(type) {
            self.type = type;
          }
        }
        // 更改关注分类
        if(options.selectedTypesId && options.selectedTypesId.length > 0) {
          self.selectedTypesId = [];
          for(var i = 0; i < options.selectedTypesId.length; i++) {
            var typeId = options.selectedTypesId[i];
            var t = self.getTypeById(typeId);
            if(t) self.selectedTypesId.push(t._id);
          }
        }
        self.callback = callback;
        self.draggableElement.show();
        self.show = true;
      } catch(err) {
        sweetError(err);
      }

    },
    close() {
      this.draggableElement.hide();
      this.show = false;
    },
    //关注或者取关用户
    subscribeUser(id, sub) {
      const self = this;
      if(sub) {
        self.open(function(cid) {
          self.subscribeUserPromise(id, sub, cid)
            .then(function() {
              self.close();
              sweetSuccess("关注成功");
            })
            .catch(function(data) {
              sweetError(data);
            })
        });
      } else {
        self.subscribeUserPromise(id, sub)
          .then(function() {
            sweetSuccess("关注已取消");
          })
          .catch(function(data) {
            sweetError(data);
          })
      }
    },
    subscribeUserPromise(id, sub, cid) {
      var method = sub? "POST": "DELETE";
      return nkcAPI("/u/" + id + "/subscribe", method, {cid: cid || []});
    }
  }
}
</script>
