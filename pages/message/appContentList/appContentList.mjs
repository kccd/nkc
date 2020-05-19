const data = NKC.methods.getDataById('data');
console.log(data.messages);
const app = new Vue({
  el: '#container',
  data: {
    inputContainerHeight: 5,
    messages: data.messages,
    content: ''
  },
  methods: {
    timeFormat: NKC.methods.timeFormat,
    getUrl: NKC.methods.tools.getUrl,
    visitImages(url) {
      let urls = [];
      for(const m of this.messages) {
        if(m.contentType === 'img') {
          urls.push({
            name: m.content.filename,
            url: m.content.fileUrl
          });
        }
      }
      urls.reverse();
      const index = urls.map(u => u.url).indexOf(url);
      urls.map(u => u.url = location.origin + u.url);
      NKC.methods.rn.emit('viewImage', {
        index,
        urls
      })
    },
    openUserHome(uid) {
      NKC.methods.rn.emit('openNewPage', {
        href: location.origin + this.getUrl('userHome', uid)
      });
    }
  },
  computed: {
    inputContainerStyle() {
      return `height: ${this.inputContainerHeight}rem;`
    },
    listContainerStyle() {
      return `padding-bottom: ${this.inputContainerHeight}rem;`
    }
  }
})
