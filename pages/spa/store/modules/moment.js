export default {
  //存放初始值
  state: {
    permissions: '',
  },
  //改变state中的值
  mutations: {
    savePermissions(state, val) {
      state.permissions = val;
    }
  },
  //调用mutations中的方法
  actions: {
  
  },
  //相当于store中的计算属性
  getters: {
  
  },
};
