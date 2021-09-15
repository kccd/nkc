class ForumSelector extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleForumSelector`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        // 专业数组
        forums: [],
        forumCategories: [],
        subscribeForumsId: [],
        selectedForumCategory: '',
        selectedParentForum: '',
        selectedForum: '',
        selectedThreadType: '',

        // 外部传入 已选择的专业ID 用于禁止选择已选专业 且参与专业分类的互斥判断
        selectedForumsId: [],
        // 外部传入 屏蔽的专业 同上
        disabledForumsId: [],
        // 外部传入 高亮的专业
        highlightForumId: '',

        needThreadType: true,
        showThreadTypes: false,
      },
      computed: {
        forumData() {
          const {forumCategories, forums} = this;
          const results = [];
          const forumsObj = [];
          for(const f of forums) {
             if(!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
            forumsObj[f.categoryId].push(f);
          }
          for(const c of forumCategories) {
            const f = forumsObj[c._id];
            if(!f) continue;
            c.forums = f;
            results.push(c);
          }
          return results;
        },
        subscribeForums() {
          const {forums, subscribeForumsId} = this;
          if(!subscribeForumsId.length) return [];
          const results = [];
          for(const f of forums) {
            for(const cf of f.childForums) {
              if(!subscribeForumsId.includes(cf.fid)) continue;
              results.push(cf);
            }
          }
          return results;
        },
        forumsObj() {
          const {forums} = this;
          const obj = {};
          for(const f of forums) {
            obj[f.fid] = f;
            for(const ff of f.childForums) {
              obj[ff.fid] = ff;
            }
          }
          return obj;
        },
        disabledForumCategoriesId() {
          const {
            selectedForumsId, forumsObj,
            forumCategoriesId, forumCategoriesObj
          } = this;
          let arr = [];
          let excludedForumCategoriesId = [];
          for(const fid of selectedForumsId) {
            const forum = forumsObj[fid];
            if(!forum) continue;
            const index = arr.indexOf(forum.categoryId);
            if(index !== -1) continue;
            const category = forumCategoriesObj[forum.categoryId];
            if(!category) continue;
            const {
              excludedCategoriesId
            } = category;
            excludedForumCategoriesId = excludedForumCategoriesId.concat(excludedCategoriesId);
          }
          arr = [];
          for(const cid of excludedForumCategoriesId) {
            if(arr.includes(cid)) continue;
            arr.push(cid);
          }

          return arr;
        },
        disabledAllForumsId() {
          return this.disabledForumsId.concat(this.selectedForumsId);
        },
        forumCategoriesId() {
          return this.forumCategories.map(fc => fc._id);
        },
        forumCategoriesObj() {
          const {forumCategories} = this;
          const obj = {};
          for(const fc of forumCategories) {
            obj[fc._id] = fc;
          }
          return obj;
        }
      },
      mounted() {

      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open(callback, options = {}) {
          self.callback = callback;
          const {
            disabledForumsId = [],
            selectedForumsId = [],
            from = 'writable',
            needThreadType = true,
            highlightForumId = ''
          } = options;
          this.disabledForumsId = disabledForumsId;
          this.selectedForumsId = selectedForumsId;
          this.needThreadType = needThreadType;
          this.highlightForumId = highlightForumId;
          this.resetSelector();
          self.showPanel();
          nkcAPI(`/f?t=selector&f=${from}`, 'GET')
            .then(data => {
              self.app.loading = false;
              self.app.initForums(data);
            })
            .catch(err => {
              console.log(err);
              sweetError(err);
            });
        },
        close() {
          self.hidePanel();
          this.resetSelector();
        },
        selectForumCategory(c) {
          if(this.disabledForumCategoriesId.includes(c._id)) return;
          this.selectedForumCategory = c;
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
        },
        initForums(data) {
          const {forumCategories, forums, subscribeForumsId} = data;
          const forumsObj = [];
          for(const f of forums) {
            if(!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
            forumsObj[f.categoryId].push(f);
          }
          for(const c of forumCategories) {
            c.forums = forumsObj[c._id] || [];
          }
          this.forums = forums;
          this.forumCategories = forumCategories;
          this.subscribeForumsId = subscribeForumsId;
          let category = null;
          for(let i = forumCategories.length - 1; i >= 0; i--) {
            const c = forumCategories[i];
            if(this.disabledForumCategoriesId.includes(c._id)) continue;
            category = c;
            if(
              this.selectedForumCategory &&
              this.selectedForumCategory._id === c._id
            ) {
              break;
            }
          }
          if(category) {
            this.selectForumCategory(category);
          } else {
            this.resetSelector();
          }
          this.highlightForum();
        },
        highlightForum() {
          const {forumData, highlightForumId} = this;
          if(!highlightForumId) return;
          let _selectedCategory, _selectedParentForum, _selectedForum;
          loop1:
          for(const c of forumData) {
            _selectedCategory = c;
            for(const pf of c.forums) {
              _selectedParentForum = pf;
              for(const f of pf.childForums) {
                if(highlightForumId === f.fid) {
                  _selectedForum = f;
                  break loop1;
                }
              }
            }
          }
          if(_selectedForum) {
            this.selectedForumCategory = _selectedCategory;
            this.selectedParentForum = _selectedParentForum;
            this.selectedForum = _selectedForum;
          }
        },
        selectParentForum(pf) {
          if(this.disabledAllForumsId.includes(pf.fid)) return;
          this.selectedParentForum = pf;
          this.selectedForum = '';
          this.selectedThreadType = '';
          if(this.selectedParentForum.childForums.length === 1) {
            this.selectForum(this.selectedParentForum.childForums[0]);
          } else if(this.selectedParentForum.childForums.length === 0) {
            this.selectForum(this.selectedParentForum);
          }
        },
        selectForum(f) {
          if(this.disabledAllForumsId.includes(f.fid)) return;
          this.selectedThreadType = '';
          this.selectedForum = f;
          if(f.threadTypes.length === 0) {
            this.selectThreadType('none');
          }
        },
        selectThreadType(tt) {
          this.selectedThreadType = tt;
        },
        next() {
          this.showThreadTypes = true;
        },
        previous() {
          this.showThreadTypes = false;
          this.selectedThreadType = '';
        },
        resetSelector() {
          this.selectedForumCategory = '';
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
          this.showThreadTypes = false;
        },
        submit() {
          const {selectedForum, selectedThreadType} = this;
          if(!selectedForum) return sweetError(`请选择专业`);
          if(!selectedThreadType) return sweetError(`请选择文章分类`);
          self.callback({
            forum: selectedForum,
            threadType: selectedThreadType === 'none'? null: selectedThreadType,
            fid: selectedForum.fid,
            cid: selectedThreadType === 'none'? '': selectedThreadType.cid
          });
          this.close();
        },
        fastSubmit() {
          const {selectedForum} = this;
          if(!selectedForum) return sweetError(`请选择专业`);
          self.callback({
            forum: selectedForum,
            fid: selectedForum.fid,
          });
          this.close();
        }
      }
    })
  }
  open(props, options) {
          this.app.open(props, options);
  }
}
NKC.modules.ForumSelector = ForumSelector;
