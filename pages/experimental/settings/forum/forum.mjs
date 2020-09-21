const data = NKC.methods.getDataById('data');

window.app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
    updating: false,
  },
  mounted() {
    setTimeout(() => {
      floatForumPanel.initPanel();
    }, 500)
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    updateForums() {
      const self = this;
      sweetQuestion(`确定要刷新所有专业信息？`)
        .then(() => {
          self.updating = true;
          return nkcAPI(`/e/settings/forum`, 'POST');
        })
        .then(() => {
          sweetSuccess(`刷新成功`);
          self.updating = false;
        })
        .catch(err => {
          sweetError(err);
          self.updating = false;
        });
    },
    move(index, arr, direction) {
      if(
        (index === 0 && direction === 'left') ||
        (index + 1 === arr.length && direction === 'right')
      ) return;
      const forum = arr[index];
      let _index;
      if(direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }
      const _forum = arr[_index];
      arr[_index] = forum;
      Vue.set(arr, index, _forum);
    },
    save() {
      const fidArr = this.forums.map(f => f.fid);
      const {forumCategories, forumSettings} = this;
      const {recycle} = forumSettings;
      const {checkString} = NKC.methods.checkData;
      const forumsInfo = this.getForumsInfo();
      Promise.resolve()
        .then(() => {
          if(!recycle) throw '请输入回收站专业ID';
          for(const fc of forumCategories) {
            checkString(fc.name, {
              name: '分类名',
              minLength: 1,
              maxLength: 20
            });
            checkString(fc.description, {
              name: '分类介绍',
              minLength: 0,
              maxLength: 100
            });
          }

          return nkcAPI('/e/settings/forum', 'PUT', {forumsInfo, categories: forumCategories, recycle});
        })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
    addForum() {
      const forumName = this.forumName;
      const self = this;
      Promise.resolve()
        .then(() => {
          if(!forumName) throw '专业名称不能为空';
          return sweetQuestion(`确定要创建专业「${forumName}」吗？`);
        })
        .then(() => {
          return nkcAPI('/f', 'POST', {displayName: forumName})
        })
        .then(data => {
          sweetSuccess('创建成功');
          // self.forums = data.forums;
        })
        .catch(sweetError);
    },
    addForumCategory() {
      this.forumCategories.push({
        name: '',
        description: '',
        displayStyle: 'simple'
      });
    },
    remove(index, arr) {
      arr.splice(index, 1);
    },
    getAllStyleInput() {

    },
    getInput() {
      const input = document.getElementsByTagName('input');
      const results = {
        style: [],
        allStyle: [],
        cover: [],
        allCover: [],
        order: []
      };
      for(let i = 0; i < input.length; i++) {
        const dom = $(input[i]);
        const name = dom.attr('data-name');
        if(name === 'forumThreadList') {
          results.style.push(dom);
        } else if(name === 'forumCover') {
          results.cover.push(dom);
        } else if(name === 'allThreadList') {
          results.allStyle.push(dom);
        } else if(name === 'allCover') {
          results.allCover.push(dom);
        } else if(name === 'forumOrder') {
          results.order.push(dom);
        }
      }
      return results;
    },
    selectAllThreadListStyle(t) {
      const {style, allStyle} = this.getInput();
      for(const d of style) {
        const value = d.attr('value');
        d.prop('checked', value === t);
      }
      for(const d of allStyle) {
        const value = d.attr('value');
        d.prop('checked', value === t);
      }
    },
    selectAllCover(t) {
      const {cover, allCover} = this.getInput();
      for(const d of cover) {
        const value = d.attr('value');
        d.prop('checked', value === t);
      }
      for(const d of allCover) {
        const value = d.attr('value');
        d.prop('checked', value === t);
      }
    },
    getForumsInfo() {
      const {style, cover, order} = this.getInput();
      const styleObj = {}, coverObj = {}, orderObj = {};
      for(const s of style) {
        if(!s.prop('checked')) continue;
        const value = s.attr('value');
        const fid = s.attr('data-fid');
        styleObj[fid] = value;
      }
      for(const c of cover) {
        if(!c.prop('checked')) continue;
        const value = c.attr('value');
        const fid = c.attr('data-fid');
        coverObj[fid] = value;
      }
      for(const o of order) {
        const fid = o.attr('data-fid');
        orderObj[fid] = Number(o.val());
      }
      const results = [];
      for(const fid in styleObj) {
        if(!styleObj.hasOwnProperty(fid)) continue;
        results.push({
          fid,
          threadListStyle: {
            type: styleObj[fid],
            cover: coverObj[fid],
          },
          order: orderObj[fid]
        });
      }
      return results;
    }
  }
});
