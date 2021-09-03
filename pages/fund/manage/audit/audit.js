const appElement = document.getElementById('app');
const {applicationForm, type} = NKC.methods.getDataById('data');
applicationForm.budgetMoney.map(b => {
  if(b.suggest === null) b.suggest = b.total;
  if(b.fact === null) b.fact = b.suggest;
});
window.app = new Vue({
  el: '#app',
  data: {
    type,
    applicationForm,
    budgetMoney: applicationForm.budgetMoney,
    times: 2,
    refuseReason: ''
  },
  mounted() {
    if(this.type === 'info') {
      this.setRemittance();
    }
  },
  computed: {
    total() {
      let num = 0;
      const {budgetMoney} = this;
      for(const b of budgetMoney) {
        num += b.count * (b.money * 100);
      }
      return num / 100;
    },
    suggestTotal() {
      let num = 0;
      const {budgetMoney} = this;
      for(const b of budgetMoney) {
        num += b.suggest * 100;
      }
      return num / 100;
    },
    factTotal() {
      let num = 0;
      const {budgetMoney} = this;
      for(const b of budgetMoney) {
        num += b.fact * 100;
      }
      return num / 100;
    },
    factMoney() {
      const {applicationForm, factTotal} = this;
      if(applicationForm.fixedMoney) {
        return applicationForm.money;
      } else {
        return factTotal;
      }
    },
    fixedMoneyRadio() {
      const {type, total, suggestTotal, factTotal} = this;
      let newTotal, name;
      if(type === 'project') {
        newTotal = suggestTotal;
        name = '专家建议';
      } else {
        newTotal = factTotal;
        name = '实际批准';
      }
      if(newTotal / total < 0.8) {
        return name + '金额小于预算金额的 80%，资金预算审核只能选择不合格';
      }
    },
    remittanceInfo() {
      const {remittance} = this.applicationForm;
      let total = 0;
      for (const r of remittance) {
        if(r.money < 0.01) {
          return `每期金额不能小于 0.01 元`;
        }
        total += r.money * 100;
      }
      console.log(total, this.factMoney)
      if(total !== this.factMoney * 100) {
        return `分期金额不等于实际批准金额`
      }
    }
  },
  methods: {
    setRemittance() {
      let {factMoney, times} = this;
      factMoney *= 100;
      const money = Math.floor(factMoney / times);
      const remainder = factMoney - money * times;
      const arr = new Array(times - 1);
      arr.fill(money / 100);
      arr.push((money + remainder) / 100);
      const remittance = [];
      for(const m of arr) {
        remittance.push({
          money: m,
        });
      }
      this.applicationForm.remittance = remittance;
    },
    formatMoney(index) {
      const m = this.budgetMoney[index];
      m.suggest = Math.round(m.suggest * 100) / 100;
      m.fact = Math.round(m.fact * 100) / 100;
      this.setRemittance();
    },
    refuse() {
      const self = this;
      return sweetPrompt(`请输入拒绝的理由`, this.refuseReason)
        .then((reason) => {
          self.refuseReason = reason;
          return nkcAPI(`/fund/a/${self.applicationForm._id}/manage/refuse`, 'POST', {
            reason
          })
        })
        .then(() => {
          NKC.methods.visitUrl(`/fund/a/${self.applicationForm._id}`);
        })
        .catch(err => {
          sweetError(err);
        })
    },
    submit() {
      const self = this;
      return Promise.resolve()
        .then(() => {
          if(self.type === 'project') {
            const userInfoReason = getReasonObj('userInfoAudit');
            const projectReason = getReasonObj('projectAudit');
            const moneyReason = getReasonObj('moneyAudit');

            if(self.fixedMoneyRadio && moneyReason.passed) {
              throw new Error(self.fixedMoneyRadio);
            }
            const suggest = self.budgetMoney.map(b => b.suggest);

            const comments = [
              {
                type: 'userInfoAudit',
                c: userInfoReason.reason,
                support: userInfoReason.passed
              },
              {
                type: 'projectAudit',
                c: projectReason.reason,
                support: projectReason.passed
              },
              {
                type: 'moneyAudit',
                c: moneyReason.reason,
                support: moneyReason.passed
              }
            ];
            return nkcAPI(`/fund/a/${self.applicationForm._id}/manage/audit/project`, 'POST', {
              comments,
              suggest
            })
          } else {
            const moneyReason = getReasonObj('adminAudit');
            if(self.fixedMoneyRadio && moneyReason.passed) {
              throw new Error(self.fixedMoneyRadio);
            }
            const fact = self.budgetMoney.map(b => b.fact);
            const comment = {
              type: 'adminAudit',
              c: moneyReason.reason,
              support: moneyReason.passed,
            };
            return nkcAPI(`/fund/a/${self.applicationForm._id}/manage/audit/info`, 'POST', {
              comment,
              fact,
              reportNeedThreads: applicationForm.reportNeedThreads,
              remittance: applicationForm.remittance.map(r => r.money),
            });
          }

        })
        .then(() => {
          NKC.methods.visitUrl(`/fund/a/${self.applicationForm._id}`);
        })
        .catch(err => {
          sweetError(err);
        });

    }
  }
})

const types = {
  'moneyAudit': '资金预算',
  'userInfoAudit': '申请人信息',
  'projectAudit': '项目信息',
  'adminAudit': ''
};

function getReasonObj(type) {
  const reason = $(`div[data-type="${type}"] textarea`).val();
  const passed = $(`div[data-type="${type}"] input`).eq(0).prop('checked');
  if(!passed && reason.length === 0) {
    throw new Error(`${types[type]}审核评语不能为空`);
  }
  return {
    reason,
    passed
  }
}