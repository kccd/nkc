<template lang="pug">
  .location-container
    draggable(title="地区选择" @clock="close" ref="draggable" maxWidth="30rem")
      div(slot="content")
        .selected-locations(style="padding-left: 0.5rem;")
          .selected-location(v-if="!selectedLocations.length") 请选择
          .selected-location(v-else ="!selectedLocations.length" @click="selectAll" :class="{'active':!activeLocation}") 全部
          .selected-location(v-for="sl in selectedLocations" @click="cancelSelect(sl)" :class="{'active': activeLocation.id === sl.id}") {{sl.cname}}
        .locations(v-if="childrenLocations && childrenLocations.length")
          .location(
            style="padding-left: 1rem;"
            @click="selectLocation(location)"  
            :class="{'active': selectedLocations.indexOf(location) !== -1}" 
            v-for="location of childrenLocations"
            )
            span {{location.cname}}
            .pull-right(v-if="selectedLocations.indexOf(location) !== -1")
              .fa.fa-check-circle
        .modal-footer
          button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
          button(type="button" class="btn btn-primary btn-sm"  v-if="canClickButton" @click="selected") 确定
          button(type="button" class="btn btn-primary btn-sm" disabled v-else) 确定
</template>

<script>
import Draggable from '../../lib/vue/publicVue/draggable.vue'
import { screenTopWarning } from '../js/topAlert';
export default {
  components: {
    'draggable': Draggable,
  },
  data: () => ({
    showPanel: false,
    locationsOrigin: null,
    onlyChina: true,
    selectedLocations: [],
    activeLocation: "",
    callback: null,
  }),
  computed: {
    canClickButton: function() {
      var selectedLocations = this.selectedLocations;
      if(!selectedLocations.length) return false;
      var arr = selectedLocations[selectedLocations.length - 1].childrens;
      return !arr || !arr.length;
    },
    childrenLocations: function() {
      if (!this.locations || this.locations.length === 0) return [];
      if(!this.activeLocation) {
        return this.locations;
      } else {
        return this.activeLocation.childrens || [];
      }
    },
    locationsObj: function() {
      var locations = this.locations || [];
      var obj = {};
      var arr = [];
      var func = function(ls) {
        for(var i = 0; i < ls.length; i++) {
          var lss = ls[i];
          arr.push(lss);
          if(lss.childrens && lss.childrens.length > 0) {
            func(lss.childrens);
          }
        }
      };
      func(locations);
      for(var i = 0; i < arr.length; i++) {
        var a = arr[i];
        obj[a.id] = a;
      }
      return obj;
    },
    locations: function() {
      if(!this.locationsOrigin) return [];
      if(this.onlyChina) {
        return (this.locationsOrigin[0] && this.locationsOrigin[0].childrens) || [];
      } else {
        return this.locationsOrigin || [];
      }
    }
  },
  methods: {
    loadLocations() {
      if (this.locationsOrigin && this.locationsOrigin.length) return Promise.resolve();
      // 通过网络加载 JSON（使用 jQuery $.getJSON）
      return new Promise((resolve, reject) => {
        // 根据站点部署，优先尝试绝对路径
        window.$
          .getJSON('/location.v2.json')
          .done((data) => {
            this.locationsOrigin = data || [];
            resolve();
          })
          .fail((err) => {
            reject(err);
          });
      });
    },
    show() {
      this.$refs.draggable.open();
    },
    hide() {
      this.$refs.draggable.close();
    },
    open(callback, options) {
      this.callback = callback;
      options = options || {};
      if(options.onlyChina !== undefined) {
        this.onlyChina = options.onlyChina;
      } else {
        this.onlyChina = true;
      }
      this.loadLocations()
        .then(() => {
          this.show();
        })
        .catch((err) => {
          screenTopWarning((err && (err.message || err.error)) || '地区数据加载失败，请稍后重试');
        });
    },
    close() {
      this.hide();
    },
    selected: function() {
      var arr = [];
      for(var i = 0; i < this.selectedLocations.length; i++) {
        arr.push(this.selectedLocations[i].cname);
      }
      this.callback(arr);
      this.close();
    },
    selectAll: function() {
      this.activeLocation = "";
    },
    getLocationById: function(id) {
      return this.locationsObj[id];
    },
    getLevel: function(location) {
      var index = 0;
      var locations = this.locations;
      var l = location;
      while(1) {
        var parent = this.getLocationById(l.pid);
        if(parent) {
          index++;
          l = parent;
        } else {
          break;
        }
      }
      return index;
    },
    selectLocation: function(location) {
      var selectedLocations = this.selectedLocations;
      var level = this.getLevel(location);
      if(selectedLocations[level] === location) return;
      selectedLocations[level] = location;
      selectedLocations.splice(level+1, 100);
      this.activeLocation = location;
    },
    // 点击已选择的地区，清除下级已选择的地区
    cancelSelect: function(location) {
      this.activeLocation = location;
      /*var selectedLocations = this.selectedLocations;
      var index = selectedLocations.indexOf(location);
      selectedLocations.splice(index, 99);*/
    }
  }
}
</script>

<style lang="less" scoped>
@media (min-width: 768px){
  .modal-dialog{
    width: 400px;
  }
}
.modal-header{
  border-bottom: none;
}
.modal-body{
  padding-top: 0;
  padding-bottom: 0;
}
.modal-footer{
  border-top: none;
}
.selected-locations{
  padding-bottom: 0;
  /*height: 3rem;
  line-height: 3rem;*/
}
.selected-location{
  display: inline-block;
  height: 2.5rem;
  line-height: 2.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  margin-right: 0.5rem;
}
.selected-location.active{
  border-bottom: 2px solid #e85a71;
}
.location{
  display: block;
  padding: 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
}
.location.active{
  border: 2px solid #b0d2b0;
  border-radius: 3px;
}
.location .fa{
  color: green;
  font-size: 16px;
}
.location:hover{
  background-color: #f4f4f4;
}
/*.location:first-child{
  margin-top: 1rem;
}
.location:last-child{
  margin-bottom: 1rem;
}*/
.locations{
  padding: 1rem 0;
  max-height: 30rem;
  overflow-y: scroll;
}
.location-container{
  width: 30rem;
  max-width: 100%;
}
</style>
