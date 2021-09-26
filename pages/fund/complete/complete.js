import PostPanel from '../postPanel';
const {form} = NKC.methods.getDataById('data');
if(form.actualMoney.length === 0) {
  for(const b of form.budgetMoney) {
    const {
      purpose,
      model,
      money,
      count,
      unit
    } = b;
    form.actualMoney.push({
      purpose,
      model,
      money,
      count,
      unit
    });
  }
}
const app = new Vue({
  el: '#app',
  data: {
    form,
    successful: true,
    content: '',
    selectedPosts: [],
    showPostPanel: false,
  },
  components: {
    'post-panel': PostPanel
  },
  computed: {
    totalMoney() {
      const {actualMoney} = this.form;
      let sum = 0;
      for(const b of actualMoney) {
        sum += Math.round(this.calculateMoney(b.count, b.money) * 100);
      }
      sum = sum / 100;
      return isNaN(sum)? 0: sum;
    },
    factMoney() {
      let factTotal = 0;
      for(const b of this.form.budgetMoney) {
        factTotal += b.fact * 100;
      }
      return factTotal / 100;
    },
    returnMoney() {
      const {factMoney, totalMoney} = this;
      if(factMoney > totalMoney) {
        return (factMoney * 100 - totalMoney * 100) / 100;
      } else {
        return 0;
      }
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    formatMoney(index) {
      const b = this.form.actualMoney[index];
      b.money = Math.round(b.money * 100) / 100;
    },
    calculateMoney(count, money) {
      money = Math.round(count * money * 100);
      return money / 100;
    },
    switchPostPanelStatus() {
      this.showPostPanel = !this.showPostPanel;
    },
    selectPost(post) {
      const postsId = this.selectedPosts.map(s => s.pid);
      if(postsId.includes(post.pid)) return;
      this.selectedPosts.push(post);
    },
    addItem() {
      this.form.actualMoney.push({
        purpose: '',
        model: '',
        money: 0,
        count: 0,
        unit: ''
      });
    },
    refund(money) {
      var obj = {
        fundId: fundId,
        money: money,
        type: 'refund',
        actualMoney: actualMoney
      };
      var newWindow;
      var isPhone = NKC.methods.isPhone();
      var url = '/fund/donation?getUrl=true&fundId=' + obj.fundId + '&money=' + obj.money + '&type=' + obj.type + '&actualMoney=' + obj.actualMoney;
      if(NKC.configs.platform !== 'reactNative') {
        if(isPhone) {
          url += '&redirect=true';
          screenTopAlert("正在前往支付宝...");
          return window.location.href = url;
        } else {
          newWindow = window.open();
        }
      }
      nkcAPI(url, 'GET')
        .then(function(data) {
          if(NKC.configs.platform === 'reactNative') {
            NKC.methods.visitUrl(data.url, true);
          } else {
            newWindow.location = data.url;
          }
          sweetInfo('请在浏览器新打开的窗口完成支付！若没有新窗口打开，请检查新窗口是否已被浏览器拦截。');
        })
        .catch(function(data) {
          sweetError(data);
          if(newWindow) {
            newWindow.document.body.innerHTML = data.error || data;
          }
        });
    },
    submit() {
      const {
        form,
        selectedPosts,
        successful,
        content
      } = this;
      const {actualMoney} = form;
      const selectedThreads = selectedPosts.map(s => s.tid);
      return Promise.resolve()
        .then(() => {
          if(selectedThreads.length === 0) throw new Error(`请至少选择一篇文章作为结题报告`);
          if(!content) throw new Error(`项目完成情况简介不能为空`);
          return nkcAPI(`/fund/a/${form._id}/complete`, 'POST', {
            successful,
            selectedThreads,
            c: content,
            actualMoney
          });
        })
        .then(() => {
          sweetSuccess('提交成功');
          window.location.reload();
        })
        .catch(sweetError);
    }
  }
});