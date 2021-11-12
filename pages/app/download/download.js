var app = new Vue({
  el: '#app',
  data() {
    return {
      files: {},
    }
  },
  mounted() {
    this.getDownloadFiles();
    // NKC.methods.appConsoleLog({files:this.files})
    window.onerror = function(err) {
      NKC.methods.appConsoleLog({err: err})
    };
  },
  computed: {
  },
  methods: {
    openFile(item){
      if(item){
        if(item.progress === '100'){
          NKC.methods.rn.emit('openFile', {item: item}, function () {
          })
        }
      }
    },
    // app删除文件
    delFile(item){
      if(item){
        const delId = Date.now();
        return asyncSweetSelf('确定要执行当前操作？', `
          <div>
            <h4>确认要进行操作？</h4>
            </div>
          <div>
            <input name="${delId}" type="radio" value="true"/>
            <span>同时删除文件</span>
          </div>
          `)
          .then(() => {
            let isDelSource = false;
            const val = $(`input[name='${delId}']:checked`).val();
            if(val){
              isDelSource = true;
            }
            item.isDelSource = isDelSource;
            NKC.methods.rn.emit('delFile', {file: item}, function () {
            })
          })
          .then(() => {
          })
          .catch(sweetError)
      }
    },
    //格式化时间
    fromNow(time, files){
      const toc = NKC.methods.tools.fromNowTwo(new Date(time));
      return toc;
    },
    //获取下载信息
    getDownloadFiles(){
      const _this = this;
      setInterval(function (){
        this.files = NKC.methods.rn.emit('getFiles', [], function (res){
          if(res.files === {}) return _this.file = null;
          _this.files = res.files.reverse();
        })
      },1000)
    }
  }
});