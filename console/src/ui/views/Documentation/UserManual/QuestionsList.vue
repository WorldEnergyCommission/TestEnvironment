<template>
  <CoreCard class="header-list">
    <CoreList class="pa-0" tag="ul" lines="two">
      <CoreListItem v-for="(item, index) in list" :key="index" tag="li">
        <CoreListItemTitle class="item-title">
          {{ $t(`userManual.topics.${item.theme}.title`) }}
        </CoreListItemTitle>
        <div class="topics">
          <ul>
            <li v-for="(topic, topicIndex) in item.topics" :key="topicIndex">
              <p @click="$emit('handleScroll', topic)">
                {{ topicIndex + 1 }}.
                {{ $t(`userManual.topics.${item.theme}.list.${topic}.question`) }}
              </p>
            </li>
          </ul>
        </div>
      </CoreListItem>
    </CoreList>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component render list of questions for User Manual page
 */
export default defineComponent({
  props: {
    list: { type: Array<any>, default: [] },
  },
});
</script>

<style lang="scss" scoped>
.header-list {
  .item-title {
    color: rgb(var(--v-theme-accent)) !important;
  }

  .topics {
    ul {
      padding: 0 0 0 0;

      li {
        list-style: none;
        padding: 5px 0 0 0;

        p {
          margin: 0;
          color: grey;
          font-size: 0.9rem;
          cursor: pointer;

          &:hover {
            color: rgb(var(--v-theme-accent));
          }
        }
      }
    }
  }
}
</style>
