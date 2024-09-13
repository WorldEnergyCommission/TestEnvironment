<template>
  <div>
    <CoreTextField v-model="input" label="Icon" />
    <div v-if="loading" class="loading">
      <CoreProgressCircular indeterminate />
    </div>
    <div v-else class="icon-list v-card">
      <div
        v-for="(icon, index) in icons"
        :key="index"
        :class="{ 'icon-item--active': selected.id === icon.id }"
        class="icon-item"
        @click="change(icon)"
      >
        <img
          :alt="icon.term"
          :class="{ 'img-white': $vuetify.theme.current.dark }"
          :src="`https://static.${domain}/icons/${icon.id}.svg`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { envDomain } from "@/utils/env";

// Icon holds information for an icon
export interface Icon {
  term: string;
  id: string;
}

// IconList is a general component that can be used with
// any icon library. It implements a typing timeout to
// improve  performance.
// When clicking on an icon, the event @selected will be
// emitted and will return the icon
//
// Example:
// <IconList :-timeout="350" @selected="onSelected" :icons="icons" :="" style="margin: 24px;"/>
// icons: Icon[] = []
//
// (q: string) {
//   // clear icons if the query is smaller than 3 chars
//   if (q.length < 3) {
//     return new Promise((res) => {
//       this.icons = [];
//       res();
//     });
//   }
//
//   return api.fetch(`/icons?q=${q}`, 'GET')
//     .then(icons => this.icons = icons.map((icon: any) => ({ term: icon.term, url: icon.icon_url })));
// }
//
// onSelected(icon: Icon) {
//   console.log(icon);
// }
export default defineComponent({
  props: {
    /**
     * searchTimeout is the time a user has stopped typing
     * which is needed to trigger the @search event. This
     * prevents sending too much api requests
     */
    searchTimeout: { default: 350, type: Number },
    /**
     * search is a prop func that returns the icons as a Promise
     */
    search: { required: true, type: Function as PropType<(q: string) => Promise<Icon[]>> },
    /**
     * icons list.
     * This is exposed as prop so that we can take out
     * the icon handling logic from IconList
     */
    icons: { required: true, type: Array as PropType<Icon[]> },
    outlined: { default: true, type: Boolean },
  },
  emits: ["selected"],
  data() {
    const domain: string = envDomain;
    const selected: Icon = { term: "", id: "" };
    const typingTimer = undefined as number | undefined;

    return {
      typingTimer,
      loading: false,
      input: "",
      selected,
      domain,
    };
  },
  watch: {
    input: [
      {
        handler: "onSearch",
      },
    ],
  },
  methods: {
    change(icon: Icon) {
      this.selected = icon;
      this.$emit("selected", icon);
    },
    onSearch(q: string) {
      clearTimeout(this.typingTimer);

      this.loading = true;
      this.typingTimer = window.setTimeout(() => {
        this.search(q).finally(() => (this.loading = false));
      }, this.searchTimeout);
    },
  },
});
</script>

<style lang="scss" scoped>
.loading {
  max-height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-list {
  display: flex;
  padding: 8px;
  flex-flow: wrap;
  max-height: 240px;
  overflow-y: auto;

  > .icon-item {
    padding: 2px;
    height: 64px;
    width: 64px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover,
    &.icon-item--active {
      border-radius: 4px;
      cursor: pointer;
      outline: 1px solid rgb(var(--v-theme-accent));
    }

    img {
      width: 100%;
      height: 100%;
    }

    .img-white {
      filter: brightness(0) invert(1);
    }
  }
}
</style>
