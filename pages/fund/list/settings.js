const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const app = new Vue({
  el: '#app',
  data: {
    fund: data.fund,
    avatarFile: null,
    avatarUrl: null,
    bannerFile: null,
    bannerUrl: null
  },
  computed: {
    image() {
      let {avatar, banner} = this.fund;
      const {avatarUrl, bannerUrl} = this;
      avatar = avatarUrl || avatar;
      banner = bannerUrl || banner;
      return {
        avatar,
        banner
      };
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
    }
  }
});