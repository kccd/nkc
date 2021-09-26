module.exports = {
  _id: 'library',
  c: {
    authLevelMin: 1,
    exam: {
      volumeA: true,
      volumeB: true,
      notPass: {
        status: false,
        countLimit: 5,
        unlimited: true
      }
    },
    permission: {
      roles: [],
      /* {
        roleId: String,
        operations: ["createFolder", ...]
      } */
      grades: []
    },
    libraryTip: {
      tip1: "",
      tip2: ""
    }
  }
};