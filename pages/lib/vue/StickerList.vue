<template lang="html">
  <div class="sticker-list-container">

  </div>
</template>

<script>
export default {
  // type: own or share or upload
  props: ['type'],
  data: () => ({
    a: 1,
    perPage: 24,
    stickers: [],
    paging: {},
  }),
  methods: {
    getStickers(page = 0) {
      const {type} = this;
      if(!["own", "share"].includes(type)) return;
      let url = `/sticker?page=${page}&c=own&reviewed=true&perpage=${this.perPage}`;
      if(type === "share") {
        url = `/stickers?page=${page}&perpage=${this.perPage}`;
      }
      const self = this;
      nkcAPI(url, "GET")
        .then(data => {
          self.stickers = data.stickers;
          self.paging = data.paging;
          self.notesAboutUsing = data.notesAboutUsing;
          self.notesAboutUploading = data.notesAboutUploading;
          if(data.emoji) {
            self.emoji = data.emoji;
          }
        })
        .catch(sweetError);
    },
  },
  mounted() {

  },
}
</script>