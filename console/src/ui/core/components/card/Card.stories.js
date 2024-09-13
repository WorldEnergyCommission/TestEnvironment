import CoreCard from "./Card.vue";
import CoreCardActions from "./CardActions.vue";
import CoreCardItem from "./CardItem.vue";
import CoreCardSubtitle from "./CardSubtitle.vue";
import CoreCardText from "./CardText.vue";
import CoreCardTitle from "./CardTitle.vue";
import CoreButton from "../button/Button.vue";

export default {
  title: "Core/Card",
  component: CoreCard,
};

const Template = {
  render: (args) => ({
    components: {
      CoreCard,
      CoreCardActions,
      CoreCardItem,
      CoreCardSubtitle,
      CoreCardText,
      CoreCardTitle,
      CoreButton,
    },
    template: `
    <CoreCard>
      <CoreCardTitle>
        Card title
      </CoreCardTitle>
      <CoreCardSubtitle>
        Card subtitle
      </CoreCardSubtitle>
      <CoreCardItem>
        Card item
      </CoreCardItem>
      <CoreCardText>
        Card text
      </CoreCardText>
      <CoreCardActions>
        <CoreButton>Card action button</CoreButton>
      </CoreCardActions>
    </CoreCard>
    `,
  }),
};

export const Card = {
  ...Template,
  args: {},
};
