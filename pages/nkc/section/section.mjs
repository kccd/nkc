import ElementUI from 'element-ui';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  data: {
    editableTabsValue: '0',
    editableTabs: [{
      title: '主页',
      name: '0',
      link: 'http://127.0.0.1:9000/?t=home'
    }, {
      title: '最新',
      name: '1',
      link: 'http://127.0.0.1:9000/?t=latest'
    }, {
      title: '关注',
      name: '2',
      link: 'http://127.0.0.1:9000/?t=subscribe'
    }]
  },
  methods: {
    handleChange: function(){
      console.log("改变了");
    },
    handleClick: function() {
      console.log("点击了");
    },
    addTab: function(t) {
      console.log(t);
    },
    removeTab: function(name) {
      let self = this;
      this.$confirm('确定要删除此条导航链接吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        self.editableTabs.forEach((tab, index) => {
          if(tab.name === name) {
            self.editableTabs.splice(index, 1);
          }
        })
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {});
    }
  },
  handleTabsEdit: function() {
    
  }
});

console.log("脚本执行完毕");
