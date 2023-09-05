<template lang="pug">
  draggable(:title="title" @close="close" ref="draggable" max-width="26rem")
    .subscribe-types-container
      div(v-if="!loaded")
        .p-t-2.p-b-2.text-center 加载中...
      div(v-else)
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
          .subscribe-type-item(v-for="(t, index) in types" :class="{'p-l-1': !!t.pid}")
            .checkbox(v-if="!editType")
              label
                input(type="checkbox" :value="t._id" v-model="selectedTypesId")
                span {{t.name}}
            .type-li(v-else)
              span {{t.name}}
              .type-buttons
                .fa.fa-pencil(@click="modifyType(index)" title="编辑")
                .fa.fa-arrow-circle-o-up(@click="moveType(index, 'up')" title="上移")
                .fa.fa-arrow-circle-o-down(@click="moveType(index, 'down')" title="下移")
                .fa.fa-trash(@click="removeType(index)" title="删除")
          div
            .checkbox.m-t-0.m-b-05.text-left(v-if="!hideInfo && !editType")
              label
                input(type="checkbox" :value="true" v-model="selectTypesWhenSubscribe")
                span(style="font-size: 1rem;") 下次不再弹出（可在设置-偏好设置中开启）
            div
              button(type="button" class="btn btn-sm btn-default" @click="addType") 添加分类
              .pull-right(v-if="!editType")
                button.m-r-05(type="button" class="btn btn-sm btn-default" @click="close") 取消
                button(type="button" class="btn btn-sm btn-primary" @click="complete") 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.subscribe-types-container{
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.subscribe-type-item{
  margin-bottom: 0.5rem;
  &:last-child{
    margin-bottom: 0;
  }
}
@buttonWidth: 6rem;
@typeLiHeight: 3rem;
.type-buttons{
  position: absolute;
  top: 0;
  right: 0.5rem;
  height: @typeLiHeight;
  line-height: @typeLiHeight;
  .fa{
    font-size: 1.4rem;
    margin-right: 0.5rem;
    cursor: pointer;
    &:last-child{
      margin-right: 0;
    }
  }

}
.type-li{
  background-color: #e1e1e1;
  border-radius: 3px;
  padding-left: 0.5rem;
  position: relative;
  padding-right: @buttonWidth;
  height: @typeLiHeight;
  line-height: @typeLiHeight;
}
</style>

<script>
import Draggable from '../vue/publicVue/draggable.vue';
import {DraggableElement} from "../js/draggable";
import {getState} from "../js/state";
export default {
  components: {
    draggable: Draggable
  },
  data: () => {
    return {
      edit: false,
      editType: false, // 管理分类
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
  computed: {
    draggable() {
      return this.$refs.draggable;
    },
    title() {
      if(this.edit) {
        return this.type._id? '编辑分类': '添加分类'
      } else if(!this.editType) {
        return '选择分类'
      } else {
        return '管理分类'
      }
    },
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
      sweetQuestion("确定要删除分类“"+type.name+"”吗？")
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
        self.showPanel();
      } catch(err) {
        sweetError(err);
      }

    },
    close() {
      this.draggable.close();
    },
    showPanel() {
      this.draggable.open();
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
