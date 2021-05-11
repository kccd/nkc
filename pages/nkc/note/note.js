window.disableNote = (id, disable) => {
  nkcAPI(`/nkc/note`, "POST", {
    type: disable? "disable": "cancelDisable",
    noteContentId: id
  })
    .then(() => {
      window.location.reload();
    })
    .catch(sweetError)
};
window.editNote = (id, content) => {
  if(!window.commonModal) {
    window.commonModal = new NKC.modules.CommonModal();
  }
  window.commonModal.open(data => {
    nkcAPI("/nkc/note", "POST", {
      type: "modify",
      noteContentId: id,
      content: data[0].value
    })
      .then(() => {
        window.commonModal.close();
        window.location.reload();
      })
      .catch(sweetError)
  }, {
    title: "编辑笔记",
    data: [
      {
        dom: "textarea",
        value: NKC.methods.strToObj(content).content
      }
    ]
  });
};