<template>
  <FormModal form-title="modals.createProject.createProjectTitle" max-width="500" default-height>
    <template #activator>
      <CoreButton
        button-type="primary"
        :icon="$vuetify.display.mobile"
        :size="buttonSize"
        :icon-size="iconSize"
        icon-name="plus"
      >
        <span v-if="!$vuetify.display.mobile">{{ $t("uiComponents.buttons.addProject") }}</span>
      </CoreButton>
    </template>

    <template #content>
      <CoreForm ref="form" v-model="valid" lazy-validation>
        <div>
          <CoreTextField
            v-model="project.name"
            :label="$t('modals.createProject.form.name')"
            counter="30"
            max-length="30"
          />
          <CoreTextField
            v-model="project.description"
            :label="$t('modals.createProject.form.description')"
            class="pt-2"
            counter="50"
            max-length="50"
          />
          <div v-if="isCustomLabel === true">
            <CoreSelect
              v-model="selectedDevice"
              :items="defaultDevice"
              class="py-2"
              hide-selected
              label="Default Device"
            />
            <CoreTextField
              v-if="selectedDevice !== ''"
              v-model="defaultDeviceName"
              class="py-2"
              counter="30"
              label="Device Name"
              max-length="30"
            />
          </div>
        </div>
        <div>
          <CoreButton
            v-if="isCustomLabel === true"
            :disabled="selectedDevice === ''"
            button-type="primary"
            @click="createNewProject"
          >
            {{ $t("uiComponents.buttons.create") }}
          </CoreButton>
          <CoreButton v-if="isCustomLabel !== true" button-type="primary" @click="createNewProject">
            {{ $t("uiComponents.buttons.create") }}
          </CoreButton>
        </div>
      </CoreForm>
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { RootState } from "@/store/types";
import FormModal from "@/ui/components/modals/FormModal.vue";
import { envAppShowProjectTypeSelection } from "@/utils/env";
import { rules } from "@/utils/validationUtils";

/**
 * Component that allows to create a new project
 */
export default defineComponent({
  components: {
    FormModal,
  },
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const defaultDeviceName: any = "";
    const selectedDevice: any = "";

    return {
      rules: rules,
      valid: false,
      dialog: false,
      project: {
        name: "",
        description: "",
      },
      isCustomLabel: envAppShowProjectTypeSelection,
      selectedDevice,
      defaultDeviceName,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    /**
     * Define button size according to current display size
     * @return string vuetify button size class
     */
    buttonSize() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return "x-small";
        case "sm":
          return "x-small";
        case "md":
          return "small";
        default:
          return undefined;
      }
    },
    /**
     * Define icon size according to current display size
     * @return number icon size
     */
    iconSize() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return 20;
        case "sm":
          return 13;
        case "md":
          return 18;
        default:
          return 20;
      }
    },
    currentUserMail() {
      return this.appState.user.email;
    },
  },
  methods: {
    async validate() {
      await ((this.form as any).coreForm as any).validate();
    },
    /**
     * Creates new project with certain parameters
     */
    async createNewProject() {
      if (this.project.name.length) {
        const newProject: any = {
          name: this.project.name,
          meta: {
            description: this.project.description,
            isDNDActive: false,
            isAreasMiniView: false,
          },
          connectivity: {
            enabled: true,
            actions: [
              {
                type: "alert",
                params: {
                  type: 2,
                  body: "Connectivity Check - Project is {{status}}",
                },
              },
              {
                type: "email",
                params: {
                  recipients: [this.currentUserMail],
                  subject: `${this.project.name}: Connectivity Check - Project is {{status}}`,
                  body: "Project ({{projectName}}) is {{status}}. ProjectID: {{projectId}}",
                },
              },
            ],
          },
        };

        if (envAppShowProjectTypeSelection === false) {
          this.createProject(newProject);
        }
      }

      this.dialog = false;
    },
    createProject(project: any): Promise<void> {
      return this.$store.dispatch("projects/createProject", project);
    },
  },
});
</script>

<style lang="scss"></style>
