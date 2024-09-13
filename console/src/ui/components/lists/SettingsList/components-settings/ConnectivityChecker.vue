<template>
  <div style="width: 100%">
    <h3 style="padding-bottom: 5px; padding-left: 10px">
      {{ $t("uiComponents.settings.notification.connectivityChecker.title") }}
    </h3>
    <CoreCheckbox
      v-model="conModel.enabled"
      :false-value="false"
      :label="$t('uiComponents.settings.notification.connectivityChecker.active')"
      :true-value="true"
      class="ml-5"
      hide-details
    />
    <div class="pa-5">
      <p style="width: 100%" class="mb-5">
        {{ $t("uiComponents.settings.notification.connectivityChecker.action") }}
      </p>
      <div class="mb-5">
        <CoreButton class="mr-2 mb-2" button-type="primary" @click="addAction('email')">
          {{ $t("uiComponents.settings.notification.connectivityChecker.addEmailAction") }}
        </CoreButton>
        <CoreButton class="mr-2 mb-2" button-type="primary" @click="addAction('webhook')">
          {{ $t("uiComponents.settings.notification.connectivityChecker.addWebhookAction") }}
        </CoreButton>
        <CoreButton class="mr-2 mb-2" button-type="primary" @click="addAction('alert')">
          {{ $t("uiComponents.settings.notification.connectivityChecker.addAlertAction") }}
        </CoreButton>
      </div>
      <div v-for="(item, index) in conModel.actions" :key="index" class="mb-5">
        <h3 class="py-5">
          {{ $t("uiComponents.settings.notification.connectivityChecker.action") }} {{ item.type }}
        </h3>
        <component :is="item.type" v-model="item.params" class="ml-2" />
        <!-- Button to delete an Action-->
        <CoreButton button-type="delete" @click="deleteActionByIndex(index)">
          {{ $t("uiComponents.settings.notification.connectivityChecker.deleteAction") }}
        </CoreButton>
      </div>
      <div style="margin-top: 15px">
        <CoreButton button-type="primary" style="margin-top: 10px" @click="submitChanges()">
          {{ $t("uiComponents.settings.notification.connectivityChecker.submitChanges") }}
        </CoreButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import AlertAction from "@/ui/components/forms/actions/AlertAction.vue";
import EmailAction from "@/ui/components/forms/actions/EmailAction.vue";
import WebhookAction from "@/ui/components/forms/actions/WebhookAction.vue";

/**
 * Component that shows project connectivity status
 */
export default defineComponent({
  components: {
    email: EmailAction,
    webhook: WebhookAction,
    alert: AlertAction,
  },
  data() {
    const conModel: any = {
      actions: [],
      enabled: false,
    };

    return {
      conModel,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    project() {
      return this.projectsState.project;
    },
  },
  created() {
    this.conModel = JSON.parse(JSON.stringify(this.project.connectivity));
  },
  methods: {
    /**
     * addAction pushes a new action for a specific type to the actions list
     * @param {string} type action type
     */
    addAction(type: string) {
      const action = { type, params: {} };

      switch (type) {
        case "webhook":
          action.params = {
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
            body: "",
            url: "",
          };
          break;
        case "email":
          action.params = {
            recipients: ["example@mail.com"],
            subject: "",
            body: "",
          };
          break;
        case "alert":
          action.params = {
            type: 0,
            body: "",
          };
          break;
      }

      this.conModel.actions.push(action);
    },
    /**
     * delete the Action based on the Index passed from the Button
     * @param {number} index action index
     */
    deleteActionByIndex(index: number) {
      this.conModel.actions.splice(index, 1);
    },
    async submitChanges() {
      const localProject = JSON.parse(JSON.stringify(this.project));
      localProject.connectivity = this.conModel;
      await this.updateProject(localProject);
    },
    updateProject(project: any): Promise<Promise<void>> {
      return this.$store.dispatch("projects/updateProject", project);
    },
  },
});
</script>
