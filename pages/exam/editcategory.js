import { sweetError } from '../lib/js/sweetAlert';
import { visitUrl } from '../lib/js/pageSwitch';

let app = new Vue({
  el: '#app',
  data: {
    category: {
      rolesId: [],
      name: '',
      description: '',
      volume: 'A',
      passScore: '',
      disabled: false,
      type: 'secret',
      from: [],
    },
    roles: [],
    allTag: [],
    showForums: false,
  },
  computed: {
    questionsCount: function () {
      let count = 0;
      for (let i = 0; i < this.category.from.length; i++) {
        count += this.category.from[i].count || 0;
      }
      return count;
    },
  },
  mounted: function () {
    let data = document.getElementById('data');
    data = data.innerHTML;
    data = JSON.parse(data);
    this.roles = data.roles;
    this.allTag = data.tag;
    if (data.category) {
      this.category = data.category;
    }
  },
  methods: {
    addTag: function (tag) {
      const newTag = Object.assign({}, tag);
      const res = this.category.from.some((item) => {
        return item._id === tag._id;
      });
      if (
        this.category.from.length > 0 &&
        this.category.from[0].volume !== tag.volume
      ) {
        sweetError('请勿添加不同难度的试卷');
      } else if (!res) {
        this.category.from.push(newTag);
      } else {
        sweetError('当前标签已经存在');
      }
    },
    removeTag: function (tag) {
      this.category.from = this.category.from.filter(
        (item) => item._id !== tag._id,
      );
    },
    checkTagCount(category, tags) {
      for (const item of category.from) {
        for (const tag of tags) {
          if (item._id === tag._id && item.count > tag.count) {
            sweetError(`超出${tag.name}题库数量`);
          }
        }
        if (item.count <= 0) {
          sweetError(`所选${item.name}题库数量不能为0或小于0`);
        }
      }
    },
    save: function () {
      let category = JSON.parse(JSON.stringify(this.category));
      const { tagA, tagB } = this.allTag;
      if (category.name === '') {
        return screenTopWarning('请输入考卷名称');
      } else if (category.description === '') {
        return screenTopWarning('请输入考卷介绍');
      } else if (['A', 'B'].indexOf(category.volume) === -1) {
        return screenTopWarning('请选择考卷难度');
      } else if (category.from.length === 0) {
        return screenTopWarning('请选择试题来源');
      } else if (category.volume === 'A') {
        this.checkTagCount(category, tagA);
      } else if (category.volume === 'B') {
        this.checkTagCount(category, tagB);
      } else if (
        category.passScore < 1 ||
        category.passScore > this.questionsCount
      ) {
        return screenTopWarning('及格分数不能大于试题总数且不能小于1');
      } else if (category.time <= 0) {
        return screenTopWarning('答题时间必须大于0分钟');
      }
      category.disabled = ['true', true].indexOf(category.disabled) !== -1;
      category.from = category.from.map((item) => {
        const { _id, count } = item;
        return { tag: _id, count: count };
      });
      let method = 'POST',
        url = '/exam/categories';
      if (category._id) {
        method = 'PUT';
        url = '/exam/category/' + category._id;
      }
      nkcAPI(url, method, { category })
        .then(function () {
          screenTopAlert('保存成功');
          visitUrl('/exam');
        })
        .catch(function (data) {
          screenTopWarning(data);
        });
    },
  },
});
