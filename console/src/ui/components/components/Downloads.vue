<template>
  <CoreCard>
    <CoreContainer fluid>
      <CoreRow>
        <CoreColumn>
          <CoreChipGroup v-model="selectedChips" color="accent" column multiple>
            <div v-for="(item, index) in chips" :key="index" :class="{ fullWidth }">
              <div v-if="item.sign" class="text-black">
                {{ item.sign }}
              </div>
              <CoreChip :value="item.value" color="accent" filter label>
                <a v-if="item.file" :href="item.file" class="href" download>
                  {{ item.title }}
                </a>
                <router-link v-else-if="item.link" :to="item.link" class="href">
                  {{ item.title }}
                </router-link>
                <div v-else>
                  {{ item.title }}
                </div>
              </CoreChip>
            </div>
          </CoreChipGroup>
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent Downloads.
 * Used to create different download sources.
 */
export default defineComponent({
  props: {
    chips: { type: Array },
    fullWidth: {
      type: Boolean,
    },
  },
  data() {
    return {
      selectedChips: [],
    };
  },
});
</script>

<style lang="scss" scoped>
.href {
  display: flex;
  text-decoration: none;
  width: 100%;
  height: 100%;
  align-items: center;
}

.fullWidth {
  width: 100%;
}
</style>
