<template>
  <div class="d-flex justify-center">
    <div class="d-flex flex-wrap justify-center">
      <div v-for="(group, groupIndex) in items" :key="groupIndex">
        <CoreMenu>
          <template #activator="{ props }">
            <CoreButton button-type="terciary" v-bind="props" size="x-small">
              {{ $t(`mlModel.SetpointOptimizer.systems.${group[0]}.title`) }}
            </CoreButton>
          </template>
          <CoreList v-if="group[1].length" density="compact">
            <CoreListItem
              v-for="(arrayOfSystemInstanceNames, arrayOfSystemInstanceNamesIndex) in group[1]"
              :key="arrayOfSystemInstanceNamesIndex"
              link
              @click="handleCurrentChart(group[0], arrayOfSystemInstanceNames)"
            >
              <CoreListItemTitle>
                <span>{{ defineMenuItemName(group[0]) }}</span>
                <span class="pl-1">{{ defineMenuItemCount(arrayOfSystemInstanceNames) }}</span>
              </CoreListItemTitle>
            </CoreListItem>
          </CoreList>
        </CoreMenu>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    items: Object as PropType<any>,
    isListItemsPlural: { default: true, type: Boolean },
  },
  methods: {
    defineMenuItemName(system: string) {
      if (this.isListItemsPlural)
        return this.$t(`mlModel.SetpointOptimizer.systems.${system}.title`);
      else return this.$t(`mlModel.SetpointOptimizer.systems.${system}.single`);
    },
    defineMenuItemCount(arr: any) {
      const filterFromNotNumber = (str: string) => +str.replace(/\D+/g, "");
      if (!arr.length) return null;
      if (arr.length === 1) return filterFromNotNumber(arr[0]);
      else {
        const first: any = arr[0];
        const last: any = arr[arr.length - 1];
        return `${filterFromNotNumber(first)}-${filterFromNotNumber(last)}`;
      }
    },
    handleCurrentChart(system: string, arr: any) {
      this.$emit("handleCurrentChart", { system, arr });
    },
  },
});
</script>

<style lang="scss" scoped></style>
