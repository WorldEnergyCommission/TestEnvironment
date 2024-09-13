<template>
  <CoreRow class="flex-column flex-sm-row">
    <CoreColumn class="v-col-sm-4">
      <CoreSelect
        v-model="params.method"
        :items="
          disableBody === false
            ? ['POST', 'PUT', 'DELETE', 'GET', 'PATCH']
            : ['POST', 'PUT', 'DELETE', 'PATCH']
        "
        :label="$t('modals.webhookActions.method')"
        hide-details
        hide-selected
      />
    </CoreColumn>
    <CoreColumn class="">
      <CoreTextField v-model="params.url" label="URL" />
    </CoreColumn>
  </CoreRow>
  <CoreRow>
    <CoreColumn>
      <h4>{{ $t("modals.webhookActions.headers") }}</h4>
      <div class="mt-5">
        <CoreRow
          v-for="(header, index) in headers"
          :key="index"
          dense
          class="flex-column flex-sm-row align-center mb-2"
        >
          <CoreColumn class="v-col-sm-5">
            <CoreTextField
              v-model="header.key"
              :label="$t('modals.webhookActions.key')"
              hide-details
            />
          </CoreColumn>
          <CoreColumn class="v-col-sm-5">
            <CoreTextField
              v-model="header.value"
              :label="$t('modals.webhookActions.value')"
              hide-details
            />
          </CoreColumn>
          <CoreColumn class="v-col-sm-2">
            <CoreButton button-type="deleteIcon" @click="removeHeader(index)">
              <CoreIcon> mdi:mdi-delete</CoreIcon>
            </CoreButton>
          </CoreColumn>
        </CoreRow>
      </div>
      <CoreButton class="mt-5" button-type="primary" @click="addHeader">
        {{ $t("modals.webhookActions.addHeader") }}
      </CoreButton>
    </CoreColumn>
    <CoreColumn v-if="disableBody === false" class="mt-5" cols="12">
      <CoreTextarea v-model="params.body" :label="$t('modals.webhookActions.body')" />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Webhook action component.
 * Manages webhook.
 */
export default defineComponent({
  props: {
    modelValue: Object as PropType<any>,
    disableBody: { default: false, type: Boolean },
  },
  data() {
    const headers: any = [];

    return {
      headers,
    };
  },
  computed: {
    params: {
      get(): any {
        return this.modelValue;
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  watch: {
    headers: [{ deep: true, handler: "onHeadersChange" }],
  },
  created() {
    this.headers = Object.keys(this.params.headers).map((k) => ({
      key: k,
      value: this.params.headers[k],
    }));
  },
  methods: {
    addHeader() {
      this.headers.push({ key: "", value: "" });
    },
    removeHeader(index: number) {
      this.headers.splice(index, 1);
    },
    onHeadersChange() {
      this.params.headers = this.headers.reduce((acc: any, cur: any) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});
    },
  },
});
</script>
