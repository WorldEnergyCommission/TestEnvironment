import CoreList from "./List.vue";
import CoreListItem from "./ListItem.vue";
import CoreListItemSubtitle from "./ListItemSubtitle.vue";
import CoreListItemTitle from "./ListItemTitle.vue";

export default {
  title: "Core/List",
  component: CoreList,
};

const Template = {
  render: (args) => ({
    components: {
      CoreList,
      CoreListItem,
      CoreListItemTitle,
      CoreListItemSubtitle,
    },
    template: `
    <CoreList>
      <CoreListItem>
        <CoreListItemTitle>List Item Title 1</CoreListItemTitle>
        <CoreListItemSubtitle>List Item Subtitle 1</CoreListItemSubtitle>
        List Item content 1
      </CoreListItem>
      <CoreListItem>
        <CoreListItemTitle>List Item Title 2</CoreListItemTitle>
        <CoreListItemSubtitle>List Item Subtitle 2</CoreListItemSubtitle>
        List Item content 2
      </CoreListItem>
  </CoreList>
    `,
  }),
};

export const List = {
  ...Template,
  args: {},
};
