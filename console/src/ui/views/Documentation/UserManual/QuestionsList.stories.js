import QuestionsListComponent from "./QuestionsList.vue";

export default {
  title: "Views/Documentation/UserManual/QuestionsList",
  component: QuestionsListComponent,
};

export const QuestionsList = {
  args: {
    list: [
      {
        theme: "account",
        topics: ["HowToCreateAccount"],
      },
      {
        theme: "project",
        topics: [
          "HowToCreateTheProject",
          "HowToChangeTheProjectNameDescriptionAndLocation",
          "HowToChangeTheProjectPicture",
          "HowToDeleteTheProject",
          "HowCanIFindTheProjectInTheHomepage",
        ],
      },
    ],
  },
};
