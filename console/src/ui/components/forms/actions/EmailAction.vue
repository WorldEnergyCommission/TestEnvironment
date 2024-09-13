<template>
  <CoreRow no-gutters>
    <CoreColumn cols="12">
      <h4>{{ $t("modals.emailActions.recipients") }}</h4>
      <CoreButton class="mt-2" button-type="primary" @click="addRecipient">
        {{ $t("modals.emailActions.addRecipient") }}
      </CoreButton>
      <div class="my-5">
        <CoreRow v-for="(_, index) in params.recipients" :key="index" class="align-center">
          <CoreColumn cols="8" md="11">
            <CoreTextField
              v-model="params.recipients[index]"
              :label="$t('modals.emailActions.recipient')"
              type="email"
              hide-details
            />
          </CoreColumn>
          <CoreColumn cols="4" md="1">
            <CoreButton
              v-if="index !== 0"
              class="mt-3"
              button-type="delete"
              @click="deleteRecipient(index)"
            >
              {{ $t("uiComponents.buttons.delete") }}
            </CoreButton>
          </CoreColumn>
        </CoreRow>
      </div>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextField
        v-model="params.subject"
        :label="$t('modals.emailActions.subject')"
        :rules="[rules.required]"
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextarea
        v-model="params.body"
        :label="$t('modals.emailActions.body')"
        :rules="[rules.required]"
      />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { Validation } from "@/ui/mixins/validation";

/**
 * Email action component.
 * Manages emails.
 */
export default defineComponent({
  extends: Validation,
  props: {
    modelValue: Object as PropType<any>,
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
  methods: {
    deleteRecipient(index: number) {
      this.params.recipients.splice(index, 1);
    },
    addRecipient() {
      this.params.recipients.push("mail@example.com");
    },
  },
});
</script>
