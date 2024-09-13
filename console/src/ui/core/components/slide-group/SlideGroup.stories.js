import CoreSlideGroup from "./SlideGroup.vue";
import CoreSlideGroupItem from "./SlideGroupItem.vue";

export default {
  title: "Core/SlideGroup",
  component: CoreSlideGroup,
};

const Template = {
  render: (args) => ({
    components: {
      CoreSlideGroup,
      CoreSlideGroupItem,
    },
    template: `
    <CoreSlideGroup>
      <CoreSlideGroupItem>
        Slide Group Item 1
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 2
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 3
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 4
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 5
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 6
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 7
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 8
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 9
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 10
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 11
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 12
      </CoreSlideGroupItem>
      <CoreSlideGroupItem>
        Slide Group Item 13
      </CoreSlideGroupItem>
    </CoreSlideGroup>
    `,
  }),
};

export const SlideGroup = {
  ...Template,
  args: {},
};
