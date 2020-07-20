const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const {scores} = data.scoreSettings;
data.scoreSettings._withdrawTimeBegin = getHMS(data.scoreSettings.withdrawTimeBegin);
data.scoreSettings._withdrawTimeEnd = getHMS(data.scoreSettings.withdrawTimeEnd);

data.scoreSettings._creditMin = data.scoreSettings.creditMin / 100;
data.scoreSettings._creditMax = data.scoreSettings.creditMax / 100;

const types = data.scoresType;
data.scoreSettings.operations.map(operation => {
  for(const type of types) {
    const oldValue = operation[type];
    operation[`_${type}`] = oldValue === undefined? 0: oldValue / 100;
  }
});

const iconArr = [];

for(const score of scores) {
  const {type, icon} = score;
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
    scores,
    types,
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
      const self = this;
      Promise.resolve()
        .then(() => {
          scoreSettings.operations.map(operation => {
            for(const type of self.types) {
              const oldValue = operation[`_${type}`];
              self.checkNumber(oldValue, {
                name: '积分策略中加减的积分值',
                fractionDigits: 2,
              });
              operation[type] = parseInt(oldValue * 100);
              delete operation[`_${type}`];
            }
          });

          this.checkNumber(scoreSettings._creditMin, {
            name: '最小鼓励金额',
            min: 0.01,
            fractionDigits: 2
          });
          this.checkNumber(scoreSettings._creditMax, {
            name: '最大鼓励金额',
            min: 0.01,
            fractionDigits: 2
          });
          if(scoreSettings._creditMin > scoreSettings._creditMax) throw '鼓励金额设置错误';
          scoreSettings.creditMin = parseInt(scoreSettings._creditMin * 100);
          scoreSettings.creditMax = parseInt(scoreSettings._creditMax * 100);
          delete scoreSettings._creditMin;
          delete scoreSettings._creditMax;
          delete scoreSettings._withdrawTimeEnd;
          delete scoreSettings._withdrawTimeBegin;
          const formData = new FormData();
          formData.append('scoreSettings', JSON.stringify(scoreSettings));
          for(const icon of iconArr) {
            const {iconFile, type} = icon;
            if (!iconFile) continue;
            formData.append(type, iconFile, iconFile.name);
          }
          return nkcUploadFile('/e/settings/score', 'PATCH', formData)
        })
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
