import WebhookActionComponent from "./WebhookAction.vue";

export default {
  title: "Forms/Actions/WebhookAction",
  component: WebhookActionComponent,
};

export const WebhookAction = {
  args: {
    modelValue: {
      headers: [],
      body: "",
    },
  },
};
