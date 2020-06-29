const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const {scores} = data.scoreSettings;
data.scoreSettings._withdrawTimeBegin = getHMS(data.scoreSettings.withdrawTimeBegin);
data.scoreSettings._withdrawTimeEnd = getHMS(data.scoreSettings.withdrawTimeEnd);


const iconArr = [];

const types = [
  'score1',
  'score2',
  'score3',
  'score4',
  'score5'
];
const _scores = [];
for(const type of types) {
  if(!scores.hasOwnProperty(type)) continue;
  _scores.push(scores[type]);
  const {
    icon
  } = scores[type];
  iconArr.push({
    type,
    icon,
    iconFile: '',
    iconData: ''
  });
}

const app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    scores: _scores,
    iconArr,
    submitting: false,
  },
  computed: {
    mainScoreSelect() {
      const arr = [];
      this.scores.map(n => {
        if(!n.enabled) return;
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    },
    commonScoreSelect() {
      return this.mainScoreSelect;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getHMS,
    HMSToNumber,
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
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
      const {
        iconArr
      } = this;
      const scoreSettings = JSON.parse(JSON.stringify(this.scoreSettings));
      scoreSettings.withdrawTimeBegin = HMSToNumber(scoreSettings._withdrawTimeBegin);
      scoreSettings.withdrawTimeEnd = HMSToNumber(scoreSettings._withdrawTimeEnd);
      delete scoreSettings._withdrawTimeEnd;
      delete scoreSettings._withdrawTimeBegin;
      const formData = new FormData();
      formData.append('scoreSettings', JSON.stringify(scoreSettings));
      for(const icon of iconArr) {
        const {iconFile, type} = icon;
        if (!iconFile) continue;
        formData.append(type, iconFile);
      }
      nkcUploadFile('/e/settings/score', 'PATCH', formData)
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(err => {
          sweetError(err);
        });
    }
  }
});


function getHMS(t) {
  return {
    hour: Math.floor(t/3600000),
    min: Math.floor(t/60000) % 60,
    sec: Math.floor(t/1000) % 60
  }
}

function HMSToNumber(t) {
  return t.hour * 60 * 60 * 1000 + t.min * 60 * 1000 + t.sec * 1000;
}
