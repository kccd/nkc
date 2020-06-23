const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const {scores} = data.scoreSettings;
data.scoreSettings._withdrawTimeBegin = getHMS(data.scoreSettings.withdrawTimeBegin);
data.scoreSettings._withdrawTimeEnd = getHMS(data.scoreSettings.withdrawTimeEnd);

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

const types = [
  'score1',
  'score2',
  'score3',
  'score4',
  'score5'
];

for(const type of types) {
  if(!scores.hasOwnProperty(type)) continue;
  const {
    enabled, name, icon, unit,
    money2score, score2other, other2score, score2money,
    weight
  } = scores[type];
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
    o2sArr,

    submitting: false,
  },
  computed: {
    mainScoreSelect() {
      const arr = [
        {
          type: '',
          name: '无'
        }
      ];
      this.nameArr.map(n => {
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    },
    commonScoreSelect() {
      const arr = [
        {
          type: '',
          name: '无'
        },
        {
          type: 'mainScore',
          name: '交易积分'
        }
      ];
      this.nameArr.map(n => {
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getHMS,
    HMSToNumber,
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
        typeArr, nameArr, iconArr, unitArr,
        weightArr, m2sArr, s2mArr, s2oArr, o2sArr
      } = this;
      const scoreSettings = JSON.parse(JSON.stringify(this.scoreSettings));
      const scoresObj = scoreSettings.scores;
      typeArr.map(({type, enabled}) => {
        scoresObj[type].enabled = enabled;
      });
      nameArr.map(({type, name}) => {
        scoresObj[type].name = name;
      });
      unitArr.map(({type, unit}) => {
        scoresObj[type].unit = unit;
      });
      weightArr.map(({type, weight}) => {
        scoresObj[type].weight = weight;
      });
      m2sArr.map(({type, money2score}) => {
        scoresObj[type].money2score = money2score;
      });
      s2mArr.map(({type, score2money}) => {
        scoresObj[type].score2money = score2money;
      });
      s2oArr.map(({type, score2other}) => {
        scoresObj[type].score2other = score2other;
      });
      o2sArr.map(({type, other2score}) => {
        scoresObj[type].other2score = other2score;
      });
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
