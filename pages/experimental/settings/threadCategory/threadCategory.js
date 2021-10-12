const data = NKC.methods.getDataById('data');
const commonModel = new NKC.modules.CommonModal();
import Sortable from 'sortablejs';

const app = new Vue({
  el: '#app',
  data: {
    categoryTree: data.categoryTree
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
    },
    saveOrder() {
      const masters = $('.thread-category-master');
      const nodes = $('.thread-category-node');
      const categories = [];
      for(let i = 0; i < masters.length; i++) {
        const m = masters.eq(i);
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
      nkcAPI(`/e/settings/threadCategory`, 'PUT', {
        categories
      })
        .then(() => {
          console.log(`顺序已保存`);
        })
        .catch(sweetError);
    },
    newCategory(cid) {
      const self = this;
      commonModel.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        nkcAPI(`/e/settings/threadCategory`, 'POST', {
          name,
          description,
          warning,
          cid,
        })
          .then(data => {
            commonModel.close();
            window.location.reload();
            sweetSuccess('添加成功');
          })
          .catch(sweetError);
      }, {
        title: '新建分类',
        data: [
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
          }
        ]
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
    editCategory(category) {
      commonModel.open(data => {
        const name = data[0].value;
        const description = data[1].value;
        const warning = data[2].value;
        nkcAPI(`/e/settings/threadCategory/${category._id}`, 'PUT', {
          type: 'modifyInfo',
          name,
          description,
          warning
        })
          .then(data => {
            commonModel.close();
            category.name = name;
            category.description = description;
            category.warning = warning;
          })
          .catch(sweetError);
      }, {
        title: '新建分类',
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