import EmailActionComponent from "./EmailAction.vue";

export default {
  title: "Forms/Actions/EmailAction",
  component: EmailActionComponent,
};

export const EmailAction = {
  args: {
    modelValue: {
      recipients: [],
      subject: "",
      body: "",
    },
  },
};
