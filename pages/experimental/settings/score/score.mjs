const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const {scores} = data.scoreSettings;
const arr = [];
const typeArr = [];
const nameArr = [];
const iconArr = [];
const unitArr = [];
const weightArr = [];
const m2sArr = [];
const s2mArr = [];
const s2oArr = [];
const o2sArr = [];

for(const s of scores) {
  const {
    type, enabled, name, icon, unit,
    money2score, score2other, other2score, score2money,
    weight
  } = s;
  typeArr.push({
    type,
    enabled,
  });
  nameArr.push({
    type,
    name,
  });
  iconArr.push({
    type,
    icon,
    iconFile: '',
    iconData: ''
  });
  unitArr.push({
    type,
    unit
  });
  weightArr.push({
    type,
    weight
  });
  m2sArr.push({
    type,
    money2score
  });
  s2mArr.push({
    type,
    score2money
  });
  s2oArr.push({
    type,
    score2other
  });
  o2sArr.push({
    type,
    other2score
  });
}

const app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    typeArr,
    nameArr,
    iconArr,
    unitArr,
    weightArr,
    m2sArr,
    s2mArr,
    s2oArr,
    o2sArr
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectIcon(a) {
      selectImage.show(blob => {
        const file = NKC.methods.blobToFile(blob);
        NKC.methods.fileToUrl(file)
          .then(data => {
            a.iconData = data;
            a.iconFile = file;
            selectImage.close();
          });
      }, {
        aspectRatio: 1
      });
    },
    save() {

    }
  }
});

