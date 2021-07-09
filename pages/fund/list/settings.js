const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();

window.app = new Vue({
  el: '#app',
  data: {
    fund: data.fund,
    roles: data.roles,
    users: data.users,
    avatarFile: null,
    avatarUrl: null,
    bannerFile: null,
    bannerUrl: null
  },
  computed: {
    image() {
      let {avatar, banner} = this.fund;
      if(avatar) avatar = this.getUrl('attach', avatar);
      if(banner) banner = this.getUrl('attach', banner);
      const {avatarUrl, bannerUrl} = this;
      avatar = avatarUrl || avatar;
      banner = bannerUrl || banner;
      return {
        avatar,
        banner
      };
    },
    usersObj() {
      const obj = {};
      for(const u of this.users) {
        obj[u.uid] = u;
      }
      return obj;
    }
  },
  mounted() {
    const colorInput = $(this.$refs.colorInput);
    NKC.methods.initAsColorSelector(colorInput, (color) => {
      app.fund.color = color;
    });
  },
  methods: {
    //colorInput
    getUrl: NKC.methods.tools.getUrl,
    selectImage(type) {
      const isAvatar = type === 'avatar';
      const options = {
        aspectRatio: isAvatar? 3/2: 4/1
      };
      selectImage.show((data) => {
        NKC.methods.fileToUrl(data)
          .then(url => {
            if(isAvatar) {
              app.avatarFile = data;
              app.avatarUrl = url;
            } else {
              app.bannerFile = data;
              app.bannerUrl = url;
            }
            selectImage.close();
          });
      }, options);
    },
    save() {
      const {fund} = this;
      nkcAPI(`/fund/list/${fund._id}/settings`, 'PUT', {fund})
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});