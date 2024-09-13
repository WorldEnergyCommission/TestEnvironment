<template>
  <div class="central-endpoint-background central-endpoint-background-1">
    <div class="central-endpoint-background central-endpoint-background-2">
      <div class="central-endpoint">
        <span>{{ centralEndpointTitle || $t("mlModel.EMS.mainView.centralEndpoint") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component represent central circle which used in EMS, EnergyView...
 */
export default defineComponent({
  props: {
    centralEndpointTitle: { default: null, type: String },
  },
});
</script>

<style lang="scss" scoped>
.central-endpoint-background {
  padding: 5px;
  z-index: 1;
  font-size: 12px;
  position: relative;
  background: rgb(var(--v-theme-accent));

  .central-endpoint {
    border-radius: 20px;
    background: rgb(var(--v-theme-accent));
    background: linear-gradient(
      120deg,
      rgba(var(--v-theme-accent-darken-1), 1) 0%,
      rgba(var(--v-theme-accent-lighten-3), 1) 100%
    );
    color: rgb(var(--v-theme-on-accent));
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;

    @media all and (max-width: 900px) {
      font-size: 10px;
    }
  }
}

.central-endpoint-background-1 {
  border-radius: 30px;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-accent), 0.25) 0%,
    rgba(var(--v-theme-surface), 0.1) 100%
  );
  width: 100px;
  height: 100px;

  @media all and (max-width: 1450px) and (min-width: 1264px) {
    width: 100px;
    height: 100px;
  }
  @media all and (max-width: 900px) {
    width: 75px;
    height: 75px;
    background: transparent;
  }
}

.central-endpoint-background-2 {
  border-radius: 25px;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-accent), 0.5) 0%,
    rgba(var(--v-theme-surface), 0.1) 100%
  );
  width: 90px;
  height: 90px;

  @media all and (max-width: 1450px) and (min-width: 1264px) {
    width: 90px;
    height: 90px;
  }
  @media all and (max-width: 900px) {
    width: 65px;
    height: 65px;
  }
}
</style>
