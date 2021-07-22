const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const selectUser = new NKC.modules.SelectUser();
window.app = new Vue({
  el: '#app',
  data: {
    fund: data.fund,
    roles: data.roles,
    users: data.users,
    avatarFile: null,
    avatarUrl: null,
    bannerFile: null,
    bannerUrl: null,
    submitting: false,
    progress: 0,
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
        aspectRatio: isAvatar? 2/1: 6/1
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
    addUser(key) {
      const {appointed} = this.fund[key];
      const self = this;
      selectUser.open(({usersId = [], users = []}) => {
        self.users = self.users.concat(users);
        self.fund[key].appointed = [...new Set([...appointed, ...usersId])];
      });
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    save() {
      const self = this;
      const {fund, avatarFile, bannerFile} = this;
      const formData = new FormData();
      formData.append('fund', JSON.stringify(fund));
      if(avatarFile) formData.append('avatar', avatarFile);
      if(bannerFile) formData.append('banner', bannerFile);
      self.submitting = true;
      nkcUploadFile(`/fund/list/${fund._id}/settings`, 'PUT', formData, (e, num) => {
        self.progress = num;
      })
        .then(() => {
          self.submitting = false;
          sweetSuccess('保存成功');
        })
        .catch(err => {
          self.submitting = false;
          sweetError(err);
        });
    }
  }
});