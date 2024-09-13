<template>
  <v-col cols="12">
    <LabelUnitWrapper :is-default-view="false">
      <template #label>
        {{ $t("devices.SSP.mainView.control") }}
      </template>
      <template #value>
        <div class="w-100 d-flex justify-center align-center">
          <SwitchBase :variable-data="props.mappings" :instance="props.controlInstance" />
        </div>
      </template>
    </LabelUnitWrapper>
  </v-col>
  <v-col cols="12">
    <LabelUnitWrapper>
      <template #label>
        {{ $t("devices.SSP.mainView.actualPower") }}
      </template>
      <template #value>
        <div class="w-100 d-flex justify-center align-center">
          <OutputFieldBase
            :is-decimal="true"
            :variable-data="props.mappings"
            :instance="props.outputInstance"
          />
          <span class="pl-2">kW</span>
        </div>
      </template>
    </LabelUnitWrapper>
  </v-col>
</template>
<script lang="ts" setup>
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";

// Properties
interface Props {
  mappings: Record<string, string>;
  // name of record for control variable
  controlInstance: string;
  // name of record for output variable
  outputInstance: string;
}

const props = defineProps<Props>();
</script>
