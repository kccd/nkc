const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: "#app",
  data: {
    t: data.t || '',
    searchType: data.searchType || 'rid',
    searchContent: data.searchContent || '',
  },
  methods: {
    search() {
      const {searchType, searchContent, t} = this;
      if(!searchContent) return sweetError('请输入搜索内容');
      window.location.href = `/e/log/resource?t=${t}&c=${searchType},${searchContent}`;
    }
  }
});
function  initiate(rid, disabled){
      nkcAPI('/r/' + rid, 'PUT', {
        disabled: !!disabled
      }).then(()=>{
        sweetSuccess('执行成功');
      }).catch((err)=>{
        sweetError(err);
      });
}
Object.assign(window, {
  initiate
});

