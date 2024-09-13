<template>
  <div style="width: 100% !important">
    <CoreSelect
      v-model="selected"
      :items="items"
      :label="label"
      hide-details
      hide-selected
      item-title="name"
      item-value="value"
    />
    <div v-if="enableSendButton">
      <CoreButton button-type="primary" @mousedown="sendVal">
        <lynus-icon color="theme" name="send" size="20" />
      </CoreButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent DropDown Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    label: {
      type: String,
    },
    /**
     * Object of format *{0: "Entry0", 1: "Entry1", ...}*
     */
    textMapping: { required: true, type: Object as PropType<any> },
    enableSendButton: { default: false, type: Boolean },
    enableVariableButtonColor: { default: false, type: Boolean },
  },
  data() {
    const items: any = null;
    const selectedForButtonSend: any = undefined;

    return {
      selectedForButtonSend,
      items,
    };
  },
  computed: {
    selected: {
      get() {
        if (this.targetMeasurement === undefined || !this.measurementIncludedInKeys) {
          return this.textMapping[0];
        } else {
          // valid value from backend
          return this.textMapping[this.targetMeasurement];
        }
      },
      set(value: string) {
        // result contains the selected obj of the text Mapping format: {name:string,value:number}
        const result = this.items.filter((object: any) => {
          return object.value === value;
        });
        this.selectedForButtonSend = value;
        if (!this.enableSendButton) {
          this.send([{ v: parseInt(value, 10), n: this.measurementsClean.targetValue, u: "" }]);
        }
      },
    },
    sendButtonColor() {
      // default way Button only has one color
      const isStateEqualToOne = this.measurements.get(this.measurementsClean.state) === 1;
      if (isStateEqualToOne || !this.enableVariableButtonColor) return "accent";
      else return "#4b6978";
    },
    targetMeasurement() {
      return this.measurements.get(this.measurementsClean.targetValue);
    },
    textKeys() {
      return Object.keys(this.textMapping);
    },
    measurementIncludedInKeys() {
      return this.textKeys.includes(this.targetMeasurement?.toString());
    },
  },
  watch: {
    textMapping: [
      {
        handler: "onMappingChange",
      },
    ],
  },
  created() {
    this.items = this.handleTextMappings();
  },
  methods: {
    handleTextMappings() {
      return Object.keys(this.textMapping).map((key: string) => {
        return {
          name: this.textMapping[key],
          value: key,
        };
      });
    },
    sendVal() {
      this.send([
        {
          v: parseInt(this.selectedForButtonSend, 10),
          n: this.measurementsClean.targetValue,
          u: "",
        },
      ]);
    },
    onMappingChange() {
      this.items = this.handleTextMappings();
    },
  },
});
</script>

<style lang="scss" scoped></style>
