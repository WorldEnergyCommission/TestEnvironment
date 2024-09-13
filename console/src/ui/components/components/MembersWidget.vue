<template>
  <CoreCard class="lynusText--text members-widget">
    <div class="members-widget-title">
      {{ $t("uiComponents.membersWidget.title") }}
    </div>
    <CoreCard class="pt-5 members-group" min-height="120">
      <div class="members-group-wrapper">
        <CoreSlideGroup v-model="model" :show-arrows="true" selected-class="success">
          <CoreSlideGroupItem v-for="(member, index) in members" :key="index">
            <div
              class="avatar d-flex flex-column align-center"
              @click="$router.push(`/projects/${$route.params.id as string}/settings`)"
            >
              <lynus-icon
                :color="member.admin ? 'accent' : undefined"
                :size="iconSizes"
                name="avatar"
              />
              <div :style="`color: ${member.admin ? 'accent' : '#707070'};`">
                {{ initials(member) }}
              </div>
            </div>
          </CoreSlideGroupItem>
        </CoreSlideGroup>
      </div>
    </CoreCard>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IMember } from "@/store/modules/members/types";

/**
 * Component that represent project members list on Favorites page
 */
export default defineComponent({
  data() {
    return {
      model: null,
    };
  },
  computed: {
    iconSizes() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return 36;
        case "sm":
          return 36;
        case "md":
          return 40;
        default:
          return 57;
      }
    },
    members(): IMember[] {
      return this.$store.getters["members/members"];
    },
  },
  methods: {
    initials(m: IMember): string {
      return m.first_name.charAt(0).toUpperCase() + m.last_name.charAt(0).toUpperCase();
    },
  },
});
</script>

<style lang="scss" scoped>
.members-widget {
  .v-card {
    border-radius: 8px !important;
    border: 1px solid rgb(var(--v-theme-primaryBorder)) !important;
  }

  .members-widget-title {
    font-size: 20px;
    line-height: 1;
    @media (min-width: 960px) and (max-width: 1264px) {
      font-size: 15px;
    }
    @media (max-width: 960px) {
      font-size: 15px;
    }
  }

  .members-group {
    margin-top: 10px;
    padding-left: 16px;
    padding-right: 16px;

    .avatar {
      padding-left: 30px;
      cursor: pointer;

      &:first-of-type {
        padding-left: 0;
      }
    }
  }
}
</style>
