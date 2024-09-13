import CoreBreadcrumbs from "./Breadcrumbs.vue";
import CoreBreadcrumbsItem from "./BreadcrumbsItem.vue";
import CoreIcon from "../icon/Icon.vue";

export default {
  title: "Core/Breadcrumbs",
  component: CoreBreadcrumbs,
};

const Template = {
  render: (args) => ({
    components: {
      CoreBreadcrumbs,
      CoreBreadcrumbsItem,
      CoreIcon,
    },
    template: `
    <CoreBreadcrumbs>
      <template v-slot:item="{ item }">
        <CoreBreadcrumbsItem>
          {{item.title}}
        </CoreBreadcrumbsItem>
      </template>
      <template v-slot:divider>
        <CoreIcon>fas fa-angle-right</CoreIcon>
      </template>
    </CoreBreadcrumbs>
    `,
  }),
};

export const WithSlots = {
  ...Template,
  args: {
    items: ["Breadcrumb1", "Breadcrumb2"],
  },
};

export const Default = {
  args: {
    items: ["Breadcrumb1", "Breadcrumb2"],
  },
};
