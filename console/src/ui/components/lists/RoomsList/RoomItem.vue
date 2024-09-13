<!-- eslint-disable vuetify/no-deprecated-props -->
<template>
  <CoreCard
    :class="[{ 'active-room': !!isActive }, 'pa-0', 'room-item']"
    elevated-card
    card-with-bg-color
    :min-height="breakpoints"
    :ripple="false"
    v-on="currentHandlers"
  >
    <div v-if="!loading">
      <div v-if="areasMiniView" class="mini-variant">
        <div class="mini-variant-title">
          {{ roomData?.name }}
        </div>
        <div>
          <CoreIcon
            v-if="dndActiveAndAllowed && areasMiniView"
            class="dnd-handler mini-dnd-handler swiper-no-swiping"
          >
            fas fa-arrows-alt
          </CoreIcon>
        </div>
        <CoreMenu v-if="!dndActiveAndAllowed && showMenu" v-model="isMenuOpen" location="bottom">
          <template #activator="{ props }">
            <CoreButton button-type="standardIcon" :size="btnSize" v-bind="props">
              <CoreIcon :size="btnSize"> fas fa-ellipsis-v </CoreIcon>
            </CoreButton>
          </template>

          <CoreList class="room-item-actions">
            <CoreListItem v-for="(item, index) in items" :key="index" link>
              <component
                :is="item.handle"
                :form-title="$t('modals.manageAreas.editArea')"
                :room-data="roomData"
                deleted-item-name="area"
                @delete-handler="deleteRoom"
                @handle-room="editRoom"
              >
                <div class="room-item-actions-title">
                  {{ $t(item.title) }}
                </div>
              </component>
            </CoreListItem>
          </CoreList>
        </CoreMenu>
      </div>
      <div v-else class="content">
        {{ roomData?.name }}
        <div class="image">
          <template v-if="isImageSource">
            <!-- image -->
            <CoreImage
              v-if="roomData?.meta.imageId"
              :src="`https://static.${domain}/assets/${roomData.meta.imageId}`"
              aspect-ratio="1.7"
              contain
            />
            <!-- icon -->
            <CoreImage
              v-if="roomData?.meta.cover"
              :src="`https://static.${domain}/${roomData.meta.cover}`"
              :style="iconTheme(roomData?.meta.cover)"
              aspect-ratio="1.7"
              class="room-icon"
              contain
            />
          </template>
          <!-- placeholder image if room don`t have any image, icon -->
          <PlaceHolderImage v-else style="width: 100%; height: 90%" />
        </div>
        <div class="text">
          <div class="devices-length">{{ devicesLength }} Active Devices</div>
          <CoreMenu v-if="showMenu" v-model="isMenuOpen" location="bottom">
            <template #activator="{ props }">
              <CoreButton button-type="standardIcon" :size="btnSize" v-bind="props">
                <CoreIcon :size="btnSize"> fas fa-ellipsis-v </CoreIcon>
              </CoreButton>
            </template>

            <CoreList class="room-item-actions">
              <CoreListItem v-for="(item, index) in items" :key="index" link>
                <component
                  :is="item.handle"
                  :form-title="$t('modals.manageAreas.editArea')"
                  :room-data="roomData"
                  deleted-item-name="area"
                  @delete-handler="deleteRoom"
                  @handle-room="editRoom"
                >
                  <div class="room-item-actions-title">
                    {{ $t(item.title) }}
                  </div>
                </component>
              </CoreListItem>
            </CoreList>
          </CoreMenu>
        </div>
      </div>
    </div>
    <CircleSpinner v-if="loading" />

    <CoreIcon v-if="dndActiveAndAllowed && !areasMiniView" class="dnd-handler">
      fas fa-arrows-alt
    </CoreIcon>
  </CoreCard>
</template>

<script lang="ts">
import { StyleValue, defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { IProject } from "@/store/modules/projects/types";
import { IRoom } from "@/store/modules/rooms/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import PlaceHolderImage from "@/ui/components/components/PlaceHolderImage.vue";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import ManageRoom from "@/ui/components/modals/ManageRoom.vue";
import { envDomain } from "@/utils/env";

/**
 * Component that represent room item
 */
export default defineComponent({
  components: {
    DeleteModalForm,
    ManageRoom,
    PlaceHolderImage,
    CircleSpinner,
  },
  props: {
    roomData: {
      type: Object as PropType<IRoom>,
    },
    isActive: {
      type: Boolean,
    },
    areasMiniView: {
      type: Boolean,
    },
    dndActiveAndAllowed: {
      type: Boolean,
    },
  },
  emits: ["handleRoomActiveStatus"],
  data() {
    const domain: string = envDomain;

    return {
      domain,
      isMenuOpen: false,
      isMenuOpenMiniView: false,
      isAllowedToDelete: true,
      loading: false,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    membersState() {
      return (this.$store.state as RootState).members;
    },
    /**
     * Define height of element according to window size
     * @return {number} height of room item
     */
    breakpoints() {
      if (this.areasMiniView) {
        return 0;
      }

      let height = 0;
      switch (this.$vuetify.display.name) {
        case "xs":
          height = 150;
          break;
        case "sm":
          height = 150;
          break;
        case "md":
          height = 210;
          break;
        default:
          height = 250;
          break;
      }

      return `calc(${height} - 10px)`;
    },
    /**
     * Define button size according to window size
     * @return {string} vuetify class
     */
    btnSize() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return "x-small";
        case "sm":
          return "x-small";
        case "md":
          return "small";
        default:
          return undefined;
      }
    },
    currentMember() {
      return this.membersState.currentMember;
    },
    devicesLength() {
      return this.devicesByRoom(this.roomData!.id).length;
    },
    /**
     * Checks current member access and define which actions to show
     * @return {array} list of manage modals forms
     */
    items() {
      const items = [];

      if (this.hasCurrentMemberScopedPermission("writeCollection", this.roomData!.id)) {
        items.push({ title: "uiComponents.areasActions.edit", handle: "ManageRoom" });
      }
      if (
        this.isAllowedToDelete &&
        this.hasCurrentMemberScopedPermission("deleteCollection", this.roomData!.id)
      ) {
        items.push({ title: "uiComponents.areasActions.delete", handle: "DeleteModalForm" });
      }
      return items;
    },
    showMenu() {
      return (
        this.hasCurrentMemberScopedPermission("writeCollection", this.roomData!.id) ||
        (this.isAllowedToDelete &&
          this.hasCurrentMemberScopedPermission("deleteCollection", this.roomData!.id))
      );
    },
    currentHandlers() {
      return !this.dndActiveAndAllowed ? { click: this.handleRoom } : null;
    },
    isImageSource() {
      return !!(this.roomData?.meta?.imageId || this.roomData?.meta?.cover);
    },
    project(): IProject {
      return (this.$store.state as RootState).projects.project;
    },
    devicesByRoom(): (roomId: string) => IDevice[] {
      return this.$store.getters["devices/devicesByRoom"];
    },
    hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
      return this.$store.getters["members/hasScopedPermission"];
    },
  },
  methods: {
    /**
     * Converts icon color according to current theme
     * @param {string} source icon id
     * @return {object} styles object
     */
    iconTheme(source: string): StyleValue | undefined {
      const isIcon = /icons/g.test(source);
      if (isIcon && this.$vuetify.theme.current.dark) return { filter: "brightness(0) invert(1)" };
    },
    handleRoom() {
      this.$emit("handleRoomActiveStatus", this.roomData!.id);
    },
    async editRoom(room: IRoom) {
      this.loading = true;
      await this.$store.dispatch("rooms/updateRoom", room);
      this.isMenuOpen = false;
      this.loading = false;
    },
    deleteRoom() {
      this.deleteRoomState(this.roomData!.id);
    },
    deleteRoomState(id: string): Promise<Promise<void>> {
      return this.$store.dispatch("rooms/deleteRoom", id);
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.rooms-list {
  .room-item {
    margin: 5px;

    .dnd-handler {
      position: absolute;
      right: 8px;
      top: 30px;
    }

    .room-item-title {
      font-size: 18px;
      line-height: 1;
      height: 23px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media (min-width: 960px) and (max-width: 1264px) {
        font-size: 12px;
      }
      @media (max-width: 960px) {
        font-size: 10px;
      }
    }

    .content {
      padding-bottom: 14px !important;
      padding: 10px;
      @media (min-width: 960px) and (max-width: 1264px) {
        padding: 10px;
        border-radius: 15px;
      }
      @media (max-width: 960px) {
        padding: 5px;
        border-radius: 10px;
      }

      .image {
        border-radius: 10px;
        overflow: hidden;
        height: 140px;
        display: flex;
        align-content: center;
        @media (min-width: 960px) and (max-width: 1264px) {
          height: 115px;
        }
        @media (max-width: 960px) {
          height: 80px;
        }
      }

      .text {
        margin: 10px 0 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .devices-length {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          @media (min-width: 960px) and (max-width: 1264px) {
            font-size: 12px;
          }
          @media (max-width: 960px) {
            font-size: 8px;
          }
        }
      }
    }

    .mini-variant {
      height: 33px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .mini-variant-title {
        line-height: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .mini-dnd-handler {
        position: static;
      }
    }
  }

  .active-room {
    opacity: 1;

    .mini-variant,
    .content {
      background: rgb(var(--v-theme-accent));
      color: rgb(var(--v-theme-on-accent));
    }
  }
}

.room-item-actions {
  .v-list-item {
    min-height: 0 !important;
    padding: 0 !important;

    & > span {
      display: block;
      width: 100%;
    }

    .room-item-actions-title {
      width: 100%;
      min-height: 48px;
      padding: 0 16px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
