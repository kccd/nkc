import Chat from '../lib/vue/message/Chat.vue';
import Vue from 'vue';
new Vue({
  el: '#App',
  data() {
    return {
      messageStatus: true,
      messageApp: null,
    };
  },
  mounted() {
    this.openChat();
  },
  components: {
    chat: Chat,
  },
  methods: {
    openChat() {
      const targetUserId = document.getElementById('targetUserId').innerText;
      this.messageApp = this.$refs.chat;
      this.messageApp.showMessagePanel(targetUserId || '');
      const windowWidth = window.innerWidth;
      if (windowWidth < 768) {
        this.messageApp.setMaximize();
      } else {
        this.messageStatus = false;
      }
    },
  },
});
