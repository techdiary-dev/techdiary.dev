<template>
  <div class="action-links">
    <nuxt-link to="/" class="action-links__link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 action-links__icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>

      <p action-links__label>হোম</p>
    </nuxt-link>

    <nuxt-link :to="{ name: 'dashboard-bookmarks' }" class="action-links__link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        class="w-5 h-5 action-links__icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        ></path>
      </svg>

      <p class="action-links__label">রিডিং লিস্ট</p>
    </nuxt-link>

    <button @click="sperkArticle" class="action-links__link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 action-links__icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>

      <p class="action-links__label">নতুন ডায়েরি</p>
    </button>
  </div>
</template>

<script>
import swal from "sweetalert";

export default {
  methods: {
    async sperkArticle() {
      if (!this.$auth.loggedIn) {
        swal({
          title: "আপনি লগইন অবস্থায় নেই",
          icon: "error"
        });
        return;
      }

      const post = await this.$axios.$post("api/articles/spark");

      this.$router.push({
        name: "dashboard-diaries-edit-id",
        params: { id: post.uuid }
      });
    }
  }
};
</script>

<style lang="scss">
.action-links {
  @apply flex flex-col space-y-2;

  &__link {
    @apply flex items-center gap-1;
    @apply text-base font-light;
    @apply hover:bg-gray-100 dark:hover:bg-slate-700 transition duration-100;
    @apply p-1 rounded-sm;
    @apply text-sm;
    @apply text-gray-700 dark:text-gray-400;

    &--active {
      @apply bg-gray-100;
    }
  }
  &__icon {
    @apply text-gray-700 dark:text-gray-400;
  }
}
</style>
