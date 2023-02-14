const data = NKC.methods.getDataById('data');
const commonModel = new NKC.modules.CommonModal();
import Sortable from 'sortablejs';

const app = new Vue({
  el: '#app',
  data: {
    categoryTree: data.categoryTree,
    articleCategoryTree: data.articleCategoryTree
  },
  mounted() {
    // this.initSort();
    this.initSortable();
  },
  computed: {
    categories() {
      const obj = {};
      const {categoryTree} = this;
      for(const c of categoryTree) {
        obj[c._id] = c;
        for(const n of c.nodes) {
          obj[c._id] = n;
        }
      }
      return obj;
    }
  },
  methods: {
    setAsDefault(c, status, value) {
      if(status) {
        c.defaultNode = value.toString();
      } else {
        c.defaultNode = 'none';
      }
      nkcAPI(`/e/settings/threadCategory/${c._id}/default`, 'PUT', {
        defaultNode: c.defaultNode
      })
        .then(() => {
          sweetSuccess(`操作成功`);
        })
        .catch(sweetError)
    },
    initSortable() {
      const masterContainer = document.getElementsByClassName('thread-categories')[0];
      new Sortable(masterContainer, {
        group: 'master',
        invertSwap: true,
        handle: '.thread-category-master-handle',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: this.saveOrder
      });
      const nodeContainer = document.getElementsByClassName('thread-category-node-list');
      for(let i = 0; i < nodeContainer.length; i ++) {
        const node = nodeContainer[i];
        new Sortable(node, {
          group: `node_${i}`,
          invertSwap: true,
          handle: '.thread-category-node',
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
          onEnd: this.saveOrder
        });
      }
      const articleMasterContainer = document.getElementsByClassName('article-categories')[0];
      new Sortable(articleMasterContainer, {
        group: 'master',
        invertSwap: true,
        handle: '.article-category-master-handle',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: this.saveOrder
      });
      const articleNodeContainer = document.getElementsByClassName('article-category-node-list');
      for(let i = 0; i < articleNodeContainer.length; i ++) {
        const node = articleNodeContainer[i];
        new Sortable(node, {
          group: `node_${i}`,
          invertSwap: true,
          handle: '.article-category-node',
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
          onEnd: this.saveOrder
        });
      }
    },
    saveOrder() {
      const masters = $('.thread-category-master');
      const articles = $('.article-category-master');
      const nodes = $('.thread-category-node');
      const articleNodes = $('.article-category-node');
      const categories = [];
      for(let i = 0; i < masters.length; i++) {
        const m = masters.eq(i);
        const cid = Number(m.attr('data-cid'));
        categories.push({
          cid,
          order: i
        });
      }
      for(let i = 0; i < articles.length; i++) {
        const m = articles.eq(i);
        const cid = Number(m.attr('data-cid'));
        categories.push({
          cid,
          order: i
        });
      }
      for(let i = 0; i < nodes.length; i++) {
        const n = nodes.eq(i);
        categories.push({
          cid: Number(n.attr('data-cid')),
          order: i
        });
      }
      for(let i = 0; i < articleNodes.length; i++) {
        const n = articleNodes.eq(i);
        categories.push({
          cid: Number(n.attr('data-cid')),
          order: i
        });
      }
      nkcAPI(`/e/settings/threadCategory`, 'PUT', {
        categories
      })
        .then(() => {
          console.log(`顺序已保存`);
        })
        .catch(sweetError);
    },
    newCategory(cid, _source) {
      let data = [
        {
          dom: 'input',
          label: '名称',
          value: ''
        },
        {
          dom: 'textarea',
          label: '介绍',
          value: ''
        },
        {
          dom: 'textarea',
          label: '注意事项',
          value: ''
        },
        {
          dom: 'textarea',
          label: '文章公告',
          value: ''
        }
      ];
      if(!_source){
        data.splice(3, 0,
          {
          dom: 'radio',
          label: '来源',
          radios: [{name:'社区文章',value:'thread'},{name:'独立文章',value:'article'}],
        })
      }
      commonModel.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        let threadWarning, source;
        if(!_source){
          threadWarning = data[4].value;
          source = data[3].value
        }else {
          threadWarning = data[3].value;
          source = _source;
        }
        nkcAPI(`/e/settings/threadCategory`, 'POST', {
          name,
          description,
          warning,
          threadWarning,
          cid,
          source,
        })
          .then(data => {
            commonModel.close();
            window.location.reload();
            sweetSuccess('添加成功');
          })
          .catch(sweetError);
      }, {
        title: '新建分类',
        data
      })
    },
    editDefaultCategory(category) {
      commonModel.open(data => {
        const nodeName = data[0].value;
        nkcAPI(`/e/settings/threadCategory/${category._id}`, 'PUT', {
          type: 'modifyNodeName',
          nodeName,
        })
          .then(data => {
            category.nodeName = nodeName;
            commonModel.close();
          })
          .catch(sweetError);
      }, {
        title: '修改默认分类名',
        data: [
          {
            dom: 'input',
            label: '默认名称',
            value: category.nodeName
          }
        ]
      })
    },
    editCategory(category, _source) {
      commonModel.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        const threadWarning = data[3].value;
        nkcAPI(`/e/settings/threadCategory/${category._id}`, 'PUT', {
          type: 'modifyInfo',
          name,
          description,
          warning,
          threadWarning,
          source:_source
        })
          .then(data => {
            commonModel.close();
            category.name = name;
            category.description = description;
            category.warning = warning;
            category.threadWarning = threadWarning;
          })
          .catch(sweetError);
      }, {
        title: '编辑分类',
        data: [
          {
            dom: 'input',
            label: '名称',
            value: category.name
          },
          {
            dom: 'textarea',
            label: '介绍',
            value: category.description
          },
          {
            dom: 'textarea',
            label: '注意事项',
            value: category.warning
          },
          {
            dom: 'textarea',
            label: '文章公告',
            value: category.threadWarning
          }
        ]
      })
    },
    removeCategory(cid) {
      return sweetQuestion('确定要执行当前操作？')
        .then(() => {
          return nkcAPI(`/e/settings/threadCategory/${cid}`, 'DELETE')
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError)
    },
    disableCategory(cid, disabled) {
      return sweetQuestion('确定要执行当前操作？')
        .then(() => {
          return nkcAPI(`/e/settings/threadCategory/${cid}`, 'PUT', {
            type: 'modifyDisable',
            disabled
          })
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError)
    }
  }
})
