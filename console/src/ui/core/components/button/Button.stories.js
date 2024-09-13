import { action } from "@storybook/addon-actions";

import CoreButton from "./Button.vue";
import CoreIcon from "../icon/Icon.vue";

export default {
  title: "Core/Button",
  component: CoreButton,
};

export const Default = {
  args: {
    default: "Button content",
    onClick: action("on-click"),
  },
};

export const PrimaryButton = {
  args: {
    buttonType: "primary",
    default: "Button content",
    onClick: action("on-click"),
  },
};

export const SecondaryButton = {
  args: {
    buttonType: "secondary",
    default: "Button content",
    onClick: action("on-click"),
  },
};

export const TerciaryButton = {
  args: {
    buttonType: "terciary",
    default: "Button content",
    onClick: action("on-click"),
  },
};

export const DeleteButton = {
  args: {
    buttonType: "delete",
    default: "Button content",
    onClick: action("on-click"),
  },
};

const TemplatePrimaryButtonWithIconRight = {
  render: (args) => ({
    components: {
      CoreButton,
      CoreIcon,
    },
    template: `
    <CoreButton>
      <template #iconRight>
        <CoreIcon size="small"> fas fa-chevron-right</CoreIcon>
      </template>
      Next
    </CoreButton>
    `,
  }),
};

export const PrimaryButtonWithIconRight = {
  ...TemplatePrimaryButtonWithIconRight,
  args: {
    buttonType: "primary",
    onClick: action("on-click"),
  },
};

const TemplateSecondaryButtonWithIconLeft = {
  render: (args) => ({
    components: {
      CoreButton,
      CoreIcon,
    },
    template: `
    <CoreButton>
      <template #icon>
        <CoreIcon size="small"> fas fa-chevron-left</CoreIcon>
      </template>
      Previous
    </CoreButton>
    `,
  }),
};

export const SecondaryButtonWithIconLeft = {
  ...TemplateSecondaryButtonWithIconLeft,
  args: {
    buttonType: "secondary",
    onClick: action("on-click"),
  },
};

const TemplateIconButton = {
  render: (args) => ({
    components: {
      CoreButton,
      CoreIcon,
    },
    template: `
    <CoreButton>
      <CoreIcon size="18">fas fa-info</CoreIcon>
    </CoreButton>
    `,
  }),
};

export const IconButton = {
  ...TemplateIconButton,
  args: {
    buttonType: "icon",
    onClick: action("on-click"),
  },
};

const TemplateDeleteIconButton = {
  render: (args) => ({
    components: {
      CoreButton,
      CoreIcon,
    },
    template: `
    <CoreButton>
      <CoreIcon> mdi:mdi-delete</CoreIcon>
    </CoreButton>
    `,
  }),
};

export const DeleteIconButton = {
  ...TemplateDeleteIconButton,
  args: {
    buttonType: "deleteIcon",
    onClick: action("on-click"),
  },
};

const TemplateStandardIconButton = {
  render: (args) => ({
    components: {
      CoreButton,
      CoreIcon,
    },
    template: `
    <CoreButton>
      <CoreIcon size="18">fas fa-info</CoreIcon>
    </CoreButton>
    `,
  }),
};

export const StandardIconButton = {
  ...TemplateStandardIconButton,
  args: {
    buttonType: "standardIcon",
    onClick: action("on-click"),
  },
};
