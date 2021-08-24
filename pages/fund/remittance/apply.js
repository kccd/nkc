import PostPanel from '../postPanel';
const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#applyApp',
  data: {
    uid: NKC.configs.uid,
    form: data.form,
    selectedPosts: [],
    content: '',
    number: data.number,
    showPostPanel: false,
  },
  components: {
    'post-panel': PostPanel
  },
  computed: {
    selectedPostsId() {
      return this.selectedPosts.map(s => s.pid);
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    applyRemittance() {
      const {content, number, form, selectedPosts} = this;
      nkcAPI(`/fund/a/${form._id}/remittance/apply`, 'POST', {
        number,
        c: content,
        selectedThreads: selectedPosts.map(s => s.tid)
      })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    selectPost(p) {
      const {selectedPosts, selectedPostsId} = this;
      if(selectedPostsId.includes(p.pid)) return;
      selectedPosts.push(p);
    },
    switchPostPanel() {
      this.showPostPanel = !this.showPostPanel;
    },
  }
})

window.verifyRemittance = (number, formId) => {
  return sweetQuestion(`确定要执行此操作吗？`)
    .then(() => {
      return nkcAPI('/fund/a/'+formId+'/remittance/verify', 'PUT', {number: number});
    })
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError)
}

window.applyRemittance = (number, formId) => {
  nkcAPI(`/fund/a/${formId}/remittance/apply`, 'POST', {
    number
  })
    .then(() => {
      window.location.reload();
    })
    .catch(sweetError);
}