<template>
  <div>
    <div class="flex space-x-2 ">
      <app-image
        v-if="$auth.loggedIn"
        class="w-10 h-10 overflow-hidden rounded-full"
        :src="$auth.user.profilePhoto"
        :alt="$auth.user.name"
      />

      <div
        @click="handleOpenEditor"
        v-if="!open"
        class="flex items-center justify-center flex-1 w-full h-10 transition duration-150 bg-gray-100 rounded-full cursor-pointer dark:bg-gray-700 hover:bg-gray-200"
      >
        Leave a comment
      </div>

      <div
        v-show="open"
        class="flex-1 p-2 border-2 border-dashed dark:border-gray-700"
      >
        <markdown-td v-model="comment" />

        <button
          class="px-2 py-1 text-white rounded-md bg-primary"
          @click="handleSave"
        >
          Submit
        </button>
        <button
          type="button"
          class="px-2 py-1 text-white bg-red-500 rounded-md"
          @click="open = false"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import swal from "sweetalert";
export default {
  data() {
    return {
      comment: "",
      open: false
    };
  },
  methods: {
    handleOpenEditor() {
      if (!this.$auth.loggedIn) {
        swal({
          title: "আপনি লগইন অবস্থায় নেই",
          icon: "error"
        });
        return;
      }

      this.open = true;
    },
    handleSave() {
      this.$emit("save", this.comment);
      this.open = false;
      this.comment = "";
    }
  }
};
</script>
