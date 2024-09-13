import CoreExpansionPanel from "./ExpansionPanel.vue";
import CoreExpansionPanels from "./ExpansionPanels.vue";
import CoreExpansionPanelText from "./ExpansionPanelText.vue";
import CoreExpansionPanelTitle from "./ExpansionPanelTitle.vue";

export default {
  title: "Core/ExpansionPanels",
  component: CoreExpansionPanels,
};

const Template = {
  render: (args) => ({
    components: {
      CoreExpansionPanels,
      CoreExpansionPanel,
      CoreExpansionPanelTitle,
      CoreExpansionPanelText,
    },
    template: `
    <CoreExpansionPanels>
      <CoreExpansionPanel>
        <CoreExpansionPanelTitle>
        Title 1
        </CoreExpansionPanelTitle>
        <CoreExpansionPanelText>
        Text 1
        </CoreExpansionPanelText>
      </CoreExpansionPanel>
      <CoreExpansionPanel>
        <CoreExpansionPanelTitle>
        Title 2
        </CoreExpansionPanelTitle>
        <CoreExpansionPanelText>
        Text 2
        </CoreExpansionPanelText>
      </CoreExpansionPanel>
  </CoreExpansionPanels>
    `,
  }),
};

export const ExpansionPanels = {
  ...Template,
  args: {},
};
