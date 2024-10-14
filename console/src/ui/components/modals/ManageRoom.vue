<template>
  <FormModal
    :form-title="formTitle"
    max-width="800"
    default-height
    @handle-dialog-change="onDialogChange"
  >
    <template #activator>
      <slot />
    </template>
    <template #content>
      <CoreForm ref="form" v-model="valid" lazy-validation @submit.prevent>
        <div>
          <CoreTextField
            v-model="room.name"
            :label="$t('modals.manageAreas.name')"
            :rules="[rules.required]"
            counter="30"
            max-length="30"
          />
        </div>
        <div>
          <CoreRadioGroup v-model="radioGroup">
            <CoreRadio :label="$t('modals.manageAreas.image')" :value="0" />
            <CoreRadio :label="$t('modals.manageAreas.icon')" :value="1" />
          </CoreRadioGroup>
        </div>
        <!-- Place where picture can be added -->
        <div v-if="radioGroup === 0">
          <CoreFileInput
            v-model="pictureObject"
            :hint="$t('modals.manageAreas.pictureFieldDescription')"
            :label="$t('modals.manageAreas.pictureFieldLabel')"
            persistent-hint
          />
        </div>
        <!-- Place where icon can be added -->
        <div v-else>
          <IconList
            :icons="icons"
            :search="search"
            :search-timeout="350"
            outlined
            @selected="onSelected"
          />
        </div>
        <div>
          <CoreButton :disabled="!valid" button-type="primary" @click="validate">
            {{ $t("uiComponents.buttons.save") }}
          </CoreButton>
        </div>
      </CoreForm>
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import api from "@/store/api";
import IconList, { Icon } from "@/ui/components/components/IconList.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";
import { rules } from "@/utils/validationUtils";

/**
 * A component that allows to create or modify a room
 */
export default defineComponent({
  components: {
    IconList,
    FormModal,
  },
  props: {
    formTitle: { type: String },
    disabled: { default: false, type: Boolean },
    roomData: { default: () => ({ name: "", meta: {} }), type: Object as PropType<any> },
  },
  emits: ["handleRoom"],
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const icons: Icon[] = [];
    const iconObject = undefined as Icon | undefined;
    const pictureObject: File = null;
    const dialog: boolean | undefined = false;

    return {
      radioGroup: 0,
      dialog,
      room: {
        name: "",
        meta: {},
      },
      pictureObject,
      iconObject,
      icons,
      valid: true,
      rules: rules,
    };
  },
  watch: {
    dialog: [
      {
        handler: "onDialogChange",
      },
    ],
  },
  methods: {
    /**
     * Search icons by inserted name
     * @param q name of the icon
     * @return list of icons
     */
    search(q: string) {
      // clear icons if the query is smaller than 3 chars
      if (q.length < 3) {
        return new Promise<void>((res) => {
          this.icons = [];
          res();
        });
      }

      return api
        .fetch(`/icons?q=${q}`, "GET")
        .then(
          (icons) => (this.icons = icons.map((icon: any) => ({ term: icon.term, id: icon.id }))),
        );
    },
    onSelected(icon: Icon) {
      this.iconObject = icon;
    },
    /**
     * Creates room with certain parameters
     */
    send() {
      if (this.room.name.length === 0) {
        return;
      }

      // prepares room data for request data
      const args = {
        room: this.room,
      } as any;

      // save picture data in room object if a picture was selected when creating the room
      if (this.radioGroup === 0 && this.pictureObject) {
        console.log("HERE", this.pictureObject);
        args.cover = this.pictureObject;
        args.coverType = "picture";
      }
      // save icon data in room object if icon was selected when creating the room
      if (this.radioGroup === 1 && this.iconObject) {
        args.cover = this.iconObject.id;
        args.coverType = "icon";
      }

      this.$emit("handleRoom", args);
      this.dialog = false;
    },
    async validate() {
      await ((this.form as any).coreForm as any).validate();
      this.send();
    },
    onDialogChange(val: any) {
      if (val) this.room = JSON.parse(JSON.stringify(this.roomData));
    },
  },
});
</script>

<style lang="scss"></style>
