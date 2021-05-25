import Sortable from "sortablejs";

var data = NKC.methods.getDataById('data');

var categoryTree = data.categoryTree;
var minorCategories = data.minorCategories;

var categories = [];
var categoriesObj = {};
var minorCategoriesObj = {};

for(const minorCategory of minorCategories) {
  minorCategoriesObj[minorCategory._id] = minorCategory;
}

var getChildren = function(categoryArray) {
  for(var i = 0; i < categoryArray.length; i++) {
    var category = categoryArray[i];
    var childrenId = [];
    for(var j = 0; j < category.children.length; j ++) {
      childrenId.push(category.children[j]._id);
    }
    var _category = {
      _id: category._id,
      name: category.name,
      description: category.description,
      order: category.order,
      parentId: category.parentId,
      childrenId: childrenId,
      type: category.type,
    };
    categories.push(_category);
    categoriesObj[category._id] = _category;
    if(category.children && category.children.length) {
      getChildren(category.children);
    }
  }
}
getChildren(categoryTree);

var nestedSortables = [].slice.call(document.querySelectorAll('.column-categories-item-container, .column-category-container'));
for (var i = 0; i < nestedSortables.length; i++) {
  new Sortable(nestedSortables[i], {
    group: 'nested',
    invertSwap: true,
    handle: '.column-category-handle',
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: mainCategoryOnEnd
  });
}

new Sortable(document.getElementsByClassName('column-categories-minor')[0], {
  group: 'nested2',
  invertSwap: true,
  handle: '.column-category-handle',
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  onEnd: minorCategoryOnEnd
});

function mainCategoryOnEnd(e) {
  // 处理顺序
  const itemsContainer = $('.column-categories-item-container');

  for(let j = 0; j < itemsContainer.length; j++) {
    const itemContainer = itemsContainer.eq(j);
    const items = itemContainer.children('.column-category-item');
    for(let i = 0; i < items.length; i++) {
      const item = items.eq(i);
      const categoryId = Number(item.attr('data-id'));
      const category = categoriesObj[categoryId];
      category.order = i + 1;
    }
  }

  for(const category of categories) {
    category.childrenId = [];
  }

  const items = $('.column-category-item');
  for(let i = 0; i < items.length; i++) {
    const item = items.eq(i);
    const categoryId = Number(item.attr('data-id'));
    const parentDom = item.parent().parent().parent();
    const category = categoriesObj[categoryId];
    // 处理层级关系
    if(!parentDom.hasClass('column-category-item')) {
      // 顶层
      category.parentId = null;
    } else {
      const parentId = Number(parentDom.attr('data-id'));
      const parent = categoriesObj[parentId];
      parent.childrenId.push(categoryId);
      category.parentId = parentId;
    }
  }
  optionControl();
  putCategories();
}

function optionControl() {
  for(var i = 0; i < categories.length; i++) {
    var category = categories[i];
    var button = $('.column-category-item[data-id="'+category._id+'"]>.column-category-info button.btn-danger');
    if(category.childrenId && category.childrenId.length) {
      // 存在下级分类
      button.addClass('hidden');
    } else {
      // 不存在下级分类
      button.removeClass('hidden');
    }
  }
}


function removeCategory(type, id) {
  sweetQuestion('确定要删除当前分类？')
    .then(function() {
      return nkcAPI('/m/' + data.columnId + '/category/' + id, 'DELETE');
    })
    .then(function() {
      var categoryArr, categoryObj;
      if(type === 'main') {
        categoryArr = categories;
        categoryObj = categoriesObj;
      } else {
        categoryArr = minorCategories;
        categoryObj = minorCategoriesObj;
      }
      var category = categoryObj[id];
      if(!category || (category.childrenId && category.childrenId.length)) return;
      if(category.parentId) {
        var parent = categoryObj[category.parentId];
        var cIndex = parent.childrenId.indexOf(category._id);
        if(cIndex !== -1) parent.childrenId.splice(cIndex, 1);
      }
      var index = categoryArr.indexOf(category);
      if(index !== -1) categoryArr.splice(index, 1);
      $(
        '.column-category-item[data-id="'+id+'"], .column-category-minor-item[data-id="'+id+'"]'
      ).remove();
    })
    .catch(sweetError)

}

function minorCategoryOnEnd() {
  var items = $('.column-category-minor-item');
  for(var i = 0; i < items.length; i++) {
    var item = items.eq(i);
    var categoryId = Number(item.attr('data-id'));
    var category = minorCategoriesObj[categoryId];
    category.order = i + 1;
  }
  putCategories();
}

var CommonModel = new NKC.modules.CommonModal();

function createCategory() {
  return window.categoryForm.newCategory();
  CommonModel.open(function(formData) {
    var type = formData[0].value;
    var name = formData[1].value;
    var description = formData[2].value;
    nkcAPI('/m/' + data.columnId + '/category', 'POST', {
      type: type,
      name: name,
      description: description,
      parentId: null
    })
      .then(function(res) {
        CommonModel.close();
        window.location.reload();
      })
      .catch(function(err) {
        sweetError(err);
      });
  }, {
    title: '新建分类',
    data: [
      {
        dom: 'radio',
        label: '分类类型',
        value: 'main',
        radios: [
          {
            name: '主分类',
            value: 'main'
          },
          {
            name: '辅分类',
            value: 'minor'
          }
        ]
      },
      {
        dom: 'input',
        label: '分类名'
      },
      {
        dom: 'textarea',
        label: '分类简介'
      },
    ]
  })
}

function putCategories() {
  var newCategories = [];
  var _categories = categories.concat(minorCategories);
  for(var i = 0; i < _categories.length; i++) {
    var category = _categories[i];
    newCategories.push({
      _id: category._id,
      parentId: category.parentId,
      order: category.order
    });
  }
  nkcAPI('/m/' + data.columnId + '/settings/category', 'PUT', {
    categories: newCategories
  })
    .then(function() {
      console.log('保存成功');
    })
    .catch(function(err) {
      screenTopWarning(err.error || '保存失败');
    })
}

function editCategory(categoryId) {
  return window.categoryForm.editCategory(categoryId);
  var category = categoriesObj[categoryId] || minorCategoriesObj[categoryId];
  CommonModel.open(function(formData) {
    var name = formData[0].value;
    var description = formData[1].value;
    nkcAPI('/m/' + data.columnId + '/category/' + categoryId, 'PUT', {
      name: name,
      description: description,
    })
      .then(function(res) {
        category.name = name;
        category.description = description;
        var categoryDom;
        if(category.type === 'main') {
          categoryDom = $('.column-category-item[data-id="'+categoryId+'"]>.column-category-info>.column-category-name');
        } else {
          categoryDom = $('.column-category-minor-item[data-id="'+categoryId+'"]>.column-category-info>.column-category-name');
        }
        categoryDom.text(name);
        CommonModel.close();
      })
      .catch(function(err) {
        sweetError(err);
      });
  }, {
    title: '编辑分类',
    data: [
      {
        dom: 'input',
        label: '分类名',
        value: category.name
      },
      {
        dom: 'textarea',
        label: '分类简介',
        value: category.description
      },
    ]
  })
}

function insertCategory(category) {
  var type = category.type;
  var categoryArr, categoryObj, containerDom;
  if(type === 'main') {
    categoryArr = categories;
    categoryObj = categoriesObj;
  } else {
    categoryArr = minorCategories;
    categoryObj = minorCategoriesObj;
  }
  category.childrenId = [];
  categoryArr.push(category);
  categoryObj[category._id] = category;
}

/*
* 专栏分类 编辑器
* */

window.categoryForm = new Vue({
  el: '#categoryForm',
  data: {

    showForm: false,

    categoryId: '',
    disableCategoryType: false,
    type: 'main',
    name: '',
    brief: '',
    description: '',
    categoryEditor: null,
  },
  mounted() {
    this.categoryEditor = UE.getEditor("columnCategoryEditor", NKC.configs.ueditor.columnCategory);
  },
  methods: {
    setDescription() {
    this.categoryEditor.setContent(this.description);
    },
    getDescription() {
      this.description = this.categoryEditor.getContent();
    },
    newCategory() {
      this.disableCategoryType = false;
      this.type = 'main';
      this.name = '';
      this.brief = '';
      this.description = '';
      this.categoryId = '';
      this.setDescription();
      this.showForm = true;
    },
    editCategory(categoryId) {
      nkcAPI(`/m/${data.columnId}/settings/category/${categoryId}`, 'GET')
        .then(({category}) => {
          const {
            _id,
            type,
            name,
            brief,
            description,
          } = category;
          this.categoryId = _id;
          this.name = name;
          this.brief = brief;
          this.description = description;
          this.type = type;
          this.disableCategoryType = true;
          this.setDescription();
          this.showForm = true;
          window.location.href = window.location.pathname + '#categoryForm';
        })
        .catch(sweetError);
    },
    saveCategoryForm() {
      this.getDescription();
      const {
        categoryId,
        name,
        brief,
        description,
        type,
      } = this;
      let method;
      let url;
      let body;
      if(!categoryId) {
        method = 'POST';
        url = `/m/${data.columnId}/category`;
        body = {
          type,
          name,
          brief,
          description,
          parentId: null
        };
      } else {
        method = 'PUT';
        url = `/m/${data.columnId}/category/${categoryId}`;
        body = {
          name,
          description,
          brief
        }
      }
      const _this = this;
      nkcAPI(url, method, body)
        .then(() => {
          if(method === 'POST') {
            window.location.reload();
          } else {
            const category = categoriesObj[categoryId] || minorCategoriesObj[categoryId];
            category.name = name;
            category.description = description;
            var categoryDom;
            if(category.type === 'main') {
              categoryDom = $('.column-category-item[data-id="'+categoryId+'"]>.column-category-info>.column-category-name');
            } else {
              categoryDom = $('.column-category-minor-item[data-id="'+categoryId+'"]>.column-category-info>.column-category-name');
            }
            categoryDom.text(name);
            _this.closeCategoryForm();
            screenTopAlert('提交成功');
          }
        })
        .catch(sweetError);
    },
    closeCategoryForm() {
      this.showForm = false;
    }
  }
})


Object.assign(window, {
  mainCategoryOnEnd,
  optionControl,
  editCategory,
  removeCategory,
  insertCategory,
  putCategories,
  createCategory,
  minorCategoryOnEnd,
  getChildren,
  CommonModel
})
