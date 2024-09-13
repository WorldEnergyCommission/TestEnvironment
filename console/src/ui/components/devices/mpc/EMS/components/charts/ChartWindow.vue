<template>
  <div>
    <CoreTabs :key="$i18n.locale" v-model="tab">
      <CoreTab v-for="(item, index) in items" :key="index">
        {{ item.title }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in items" :key="`t-${index}`">
        <slot :tab="tab" />
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    items: { default: null, type: Array as PropType<any[]> },
    isPreview: { default: false, type: Boolean },
  },
  data() {
    return {
      tab: 0,
    };
  },
});
</script>
