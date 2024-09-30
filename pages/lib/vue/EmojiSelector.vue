<template lang="pug">
  draggable-dialog(title="Emoji 表情" width="50rem" height='35rem' heightXS='70%' ref="draggableDialog")
    emoji-list(v-if="initialized" @select="selectEmoji")
</template>

<script>
  import {sweetError} from "../js/sweetAlert";
  import {getUrl} from "../js/tools";
  import {localStorageKeys, getFromLocalStorage, saveToLocalStorage} from "../js/localStorage";
  import {emojiGroups} from "../js/emoji";
  import DraggableDialog from './DraggableDialog/DraggableDialog.vue';
  import EmojiList from './EmojiList.vue';

  const emojiSelectorKey = localStorageKeys.emojiSelector;

  export default {
    data: () => ({
      initialized: false,
      callback: null,
      emoji: [],
      multipleSelection: true,
      selected: false,
      statusTimeout: null,
      emojiGroups: emojiGroups,
      selectedGroupName: emojiGroups[0].name,
      selectedEmoji: [],
    }),
    components: {
      'draggable-dialog': DraggableDialog,
      'emoji-list': EmojiList,
    },
    watch: {
      multipleSelection() {
        saveToLocalStorage(emojiSelectorKey, {multipleSelection: !!this.multipleSelection});
      }
    },
    mounted() {
      this.initMultipleSelection();
    },
    destroyed(){
      this.draggableElement && this.draggableElement.destroy();
    },
    computed: {
      emojiUrl() {
        const {emoji} = this;
        const url = [];
        for(const e of emoji) {
          url.push(getUrl('emoji', e));
        }
        return url;
      },
      emojiGroupsObject() {
        const obj = {};
        for(const item of emojiGroups) {
          obj[item.name] = item;
        }
        return obj;
      },
      selectedGroup() {
        return this.emojiGroupsObject[this.selectedGroupName];
      }
    },
    methods: {
      getUrl: getUrl,
      selectGroup(groupName) {
        this.selectedGroupName = groupName;
      },
      initMultipleSelection() {
        const {
          multipleSelection = true
        } = getFromLocalStorage(emojiSelectorKey);
        this.multipleSelection = multipleSelection;
      },

      initData() {
        const self = this;
        nkcAPI(`/sticker`, 'GET')
          .then(res => {
            self.emoji = res.emoji;
          })
          .catch(sweetError);
      },
      show() {
        this.$refs.draggableDialog.open();
      },
      hide() {
        this.$refs.draggableDialog.close();
      },
      open(callback) {
        this.initialized = true;
        this.initMultipleSelection();
        const self = this;
        self.callback = callback;
        self.show();
        self.initData();
      },
      close() {
        this.hide();
      },
      selectEmoji(res) {
        const {unicode} = res;
        const {callback} = this;
        if(!callback) return;
        this.callback({
          code: unicode,
          url: getUrl('emoji', unicode),
        })
        if(!this.multipleSelection){
          this.close();
        } else {
          this.setStatus()
        }
      },
      setStatus() {
        const self = this;
        self.selected = false;
        setTimeout(() => {
          clearTimeout(self.statusTimeout);
          self.selected = true;
          self.statusTimeout = setTimeout(() => {
            self.selected = false;
          }, 1500);
        }, 100)

      }
    }
  }
</script>
