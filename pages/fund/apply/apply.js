import LifePhotoPanel from '../../publicModules/lifePhotoPanel.vue';
import PostPanel from '../postPanel.vue';
import {timeFormat} from '../../lib/js/time';
import {debounce} from '../../lib/js/execution';
const forumSelector = new NKC.modules.ForumSelector();
const commonModal = new NKC.modules.CommonModal();
const data = NKC.methods.getDataById('data');
console.log(data);
const {
  applicationForm,
  fund,
  fundSettings,
  users,
  posts,
  applicant,
  forums,
  members,
  project,
} = data.settingsData;

const selectUser = new NKC.modules.SelectUser();
const app = new Vue({
  el: '#app',
  data: {
    uid: NKC.configs.uid,
    form: applicationForm,
    fund,
    fundSettings: data.fundSettings,
    members,
    applicant,
    users,
    posts,
    showPhotoPanel: false,
    showPostPanel: false,
    forums,
    editor: null,
    project,
    timeAutoSave: null,
    submitting: false,
    saving: false,
  },
  components: {
    'life-photo-panel': LifePhotoPanel,
    'post-panel': PostPanel
  },
  computed: {
    // 文章对象
    postsObj() {
      const obj = {};
      for(const post of this.posts) {
        obj[post.tid] = post;
      }
      return obj;
    },
    // 用户对象
    usersObj() {
      const obj = {};
      for(const u of this.users) {
        obj[u.uid] = u;
      }
      return obj;
    },
    // 专业对象
    forumsObj() {
      const obj = {};
      for(const f of this.forums) {
        obj[f.fid] = f;
      }
      return obj;
    },
    // 添加的组员
    formMembers() {
      const arr = [];
      const {usersObj, members} = this;
      for(const m of members) {
        const {agree, uid} = m;
        const {avatar, username} = usersObj[uid];
        arr.push({
          agree,
          uid,
          avatar,
          username
        });
      }
      return arr;
    },
    // 已选择的文章列表
    formThreads() {
      return this.form.threadsId.applying.map(tid => this.postsObj[tid]);
    },
    // 已选择的专业
    formForum() {
      return this.forumsObj[this.form.category];
    },
    // 资金预算合计
    totalMoney() {
      const {budgetMoney} = this.form;
      let sum = 0;
      for(const b of budgetMoney) {
        sum += Math.round(this.calculateMoney(b.count, b.money) * 100);
      }
      return sum / 100;
    },
    // 添加的技术文章
    applyingPosts() {
      const {applying} = this.form.threadsId;
      const self = this;
      return applying.map(tid => self.postsObj[tid]);
    }
  },
  mounted() {
    const self = this;
    setTimeout(() => {
      self.initEditor();
      self.autoSaveForm();

    }, 1000);
  },
  watch: {

  },

  methods: {
    getUrl: NKC.methods.tools.getUrl,
    timeFormat: NKC.methods.tools.timeFormat,
    selectMember() {
      const self = this;
      selectUser.open(data => {
        self.users = self.users.concat(data.users);
        return self.addMembers(data.usersId)
          .then(() => {
            // selectUser.close();
            setTimeout(floatUserPanel.initPanel);
          })
          .catch(err => {
            sweetError(err);
          });
      });
    },
    // 添加组员
    addMembers(usersId) {
      const self = this;
      return nkcAPI(`/fund/a/${this.form._id}/settings/member`, 'POST', {
        usersId
      })
        .then((data) => {
          self.members = data.members;
        })
    },
    // 移除组员
    removeMember(uid) {
      const self = this;
      sweetQuestion(`确定要移除当前组员？`)
        .then(() => {
          return nkcAPI(`/fund/a/${this.form._id}/settings/member?uid=${uid}`, 'DELETE');
        })
        .then(data => {
          self.members = data.members;
          console.log(data.members)
        })
        .catch(sweetError);
    },
    // 添加照片
    selectPhoto(photo) {
      if(!this.applicant.lifePhotosId.includes(photo._id)) {
        this.applicant.lifePhotosId.push(photo._id);
      }
    },
    // 从数组中删除元素
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    // 切换照片面板的显隐
    switchPhotoPanel() {
      this.showPhotoPanel = !this.showPhotoPanel;
    },
    // 切换文章面板的显隐
    switchPostPanel() {
      this.showPostPanel = !this.showPostPanel;
    },
    // 资金预算计算总计金额
    calculateMoney(count, money) {
      money = Math.round(count * money * 100);
      return money / 100;
    },
    // 添加一项资金预算
    addBudgetMoney() {
      this.form.budgetMoney.push({
        purpose: `用途 ${this.form.budgetMoney.length + 1}`,
        count: 1,
        money: 1
      });
    },
    // 格式化金额，保留小数点后两位
    formatMoney(index) {
      const b = this.form.budgetMoney[index];
      b.money = Math.round(b.money * 100) / 100;
    },
    // 选择文章
    selectPost(post) {
      this.posts.push(post);
      if(!this.form.threadsId.applying.includes(post.tid)) {
        this.form.threadsId.applying.push(post.tid);
      }
    },
    // 选择专业
    selectForum() {
      const self = this;
      forumSelector.open(data => {
        self.forums.push(data.forum);
        self.form.category = data.fid;
      });
    },
    // 初始化编辑器
    initEditor() {
      const self = this;
      this.editor = UE.getEditor('fundEditor', NKC.configs.ueditor.fundConfigs)
      this.editor.addListener('ready', () => {
        self.editor.setContent(self.project.c);
        console.log(self.project.c)
      });
    },
    // 添加关键词
    selectKeyword() {
      const self = this;
      commonModal.open(data => {
        console.log(data);
        let keywordsCn = data[0].value;
        let keywordsEn = data[1].value;
        keywordsCn = keywordsCn.replace(/，/g, ',').replace(/\s/g, '').split(',').filter(k => !!k);
        keywordsEn = keywordsEn.replace(/，/g, ',').replace(/\s/g, '').split(',').filter(k => !!k);
        self.project.keyWordsCn = [...new Set(keywordsCn)];
        self.project.keyWordsEn = [...new Set(keywordsEn)];
        commonModal.close();
      }, {
        data: [
          {
            label: "中文，添加多个请以逗号分隔",
            dom: "textarea",
            value: this.project.keyWordsCn.join("，")
          },
          {
            label: "英文，添加多个请以逗号分隔",
            dom: "textarea",
            value: this.project.keyWordsEn.join(",")
          }
        ],
        title: "添加关键词"
      })
    },
    // 从编辑器获取内容
    getContent() {
      return this.editor.getContent();
    },
    // 设置 project 项目内容
    setProjectContent() {
      this.project.c = this.getContent();
    },

    // 自动保存
    autoSaveForm() {
      const self = this;
      setTimeout(() => {
        self.saveForm()
          .then(self.autoSaveForm)
      }, 30000);
    },
    giveUp() {

    },
    saveForm() {
      const self = this;
      const {form, project, applicant} = this;
      self.saving = true;
      this.setProjectContent();
      return nkcAPI(`/fund/a/${form._id}/settings`, 'POST', {
        form,
        project,
        applicant
      })
        .then(data => {
          self.saving = false;
          self.timeAutoSave = `${timeFormat("HH:mm:ss", new Date())}`
        })
        .catch(err => {
          self.saving = false;
          sweetError(err);
        });
    },
    // 暂存
    saveFormTimeout: debounce(function() {
      this.saveForm();
    }, 1000),
    // 提交
    submitForm() {
      const self = this;
      const {form, project, applicant} = this;
      self.submitting = true;
      this.setProjectContent();
      return nkcAPI(`/fund/a/${form._id}/settings`, 'POST', {
        type: 'submit',
        form,
        project,
        applicant
      })
        .then(data => {
          self.submitting = false;
        })
        .catch(err => {
          self.submitting = false;
          sweetError(err);
        })
    }
  }
});