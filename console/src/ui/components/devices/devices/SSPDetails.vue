<template>
  <v-container>
    <v-row :dense="!$vuetify.display.mobile">
      <v-col cols="12" md="6">
        <v-row dense>
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.InputOutside") }}
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
                    :variable-data="mappings"
                    instance="InputOutside"
                  />
                  <span class="pl-2">kW</span>
                </div>
              </template>
            </LabelUnitWrapper>
          </v-col>

          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.InputPV") }}
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
                    :variable-data="mappings"
                    instance="InputPV"
                  />
                  <span class="pl-2">kW</span>
                </div>
              </template>
            </LabelUnitWrapper>
          </v-col>

          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.InputBattery") }}
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
                    :variable-data="mappings"
                    instance="InputBattery"
                  />
                  <span class="pl-2">kW</span>
                </div>
              </template>
            </LabelUnitWrapper>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6">
        <v-row dense>
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.Output32A1") }}
          </v-col>
          <SSPOutputControls
            :mappings="mappings"
            control-instance="Output32A1"
            output-instance="Output32A1"
          />
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.Output32A2") }}
          </v-col>
          <SSPOutputControls
            :mappings="mappings"
            control-instance="Output32A2"
            output-instance="Output32A2"
          />
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.Output16A") }}
          </v-col>
          <SSPOutputControls
            :mappings="mappings"
            control-instance="Output16A"
            output-instance="Output16A"
          />
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.OutputECharger") }}
          </v-col>
          <SSPOutputControls
            :mappings="mappings"
            control-instance="OutputECharger"
            output-instance="OutputECharger"
          />
          <v-col cols="12" :class="['text-h6', { 'text-center': $vuetify.display.mobile }]">
            {{ $t("devices.SSP.mainView.OutputSchuko") }}
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
                    :variable-data="mappings"
                    instance="OutputSchuko"
                  />
                  <span class="pl-2">kW</span>
                </div>
              </template>
            </LabelUnitWrapper>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import SSPOutputControls from "@/ui/components/devices/devices/SSPOutputControls.vue";

// Properties
interface Props {
  mappings: Record<string, string>;
}

const props = defineProps<Props>();
</script>
