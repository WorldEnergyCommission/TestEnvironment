<template>
  <div v-resize="handleResize" class="rooms-list">
    <grid-layout
      v-if="!$vuetify.display.mobile && !globalIsMini"
      ref="layout"
      :auto-size="true"
      :col-num="6"
      :is-draggable="dndActiveAndAllowed"
      :is-mirrored="false"
      :is-resizable="false"
      :layout="dndLayout"
      :margin="[20, 20]"
      :row-height="areasHeight"
      :use-css-transforms="true"
      :vertical-compact="false"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        v-for="item in dndLayout"
        :key="item.i"
        :h="item.h"
        :i="item.i"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        drag-allow-from="i.dnd-handler"
        style="overflow: hidden"
      >
        <RoomItem
          :areas-mini-view="isAreasMiniView"
          :is-active="activeRoom(item.room.id)"
          :room-data="item.room"
          :dnd-active-and-allowed="dndActiveAndAllowed"
          @handle-room-active-status="$emit('handleRoomActiveStatus', $event)"
        />
      </grid-item>
    </grid-layout>

    <CoreTabs v-else center-active :model-value="activeRoomOrEmit" density="compact">
      <CoreTab
        v-for="item in sortedLayout"
        :key="item.i"
        :value="item.room.id"
        @click="$emit('handleRoomActiveStatus', item.room.id)"
      >
        {{ item.room.name }}
      </CoreTab>
    </CoreTabs>

    <CoreDivider v-if="!$vuetify.display.mobile && !globalIsMini" color="accent" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import GridItem from "@/gridLayout/GridItem.vue";
import GridLayout from "@/gridLayout/GridLayout.vue";
import { IProject } from "@/store/modules/projects/types";
import { IRoom, IRoomDndLayout } from "@/store/modules/rooms/types";
import { RootState } from "@/store/types";
import RoomItem from "@/ui/components/lists/RoomsList/RoomItem.vue";

/**
 * Component that represent all rooms in Drag and Drop grid.
 * Used in Areas page.
 */
export default defineComponent({
  name: "RoomsList",
  components: {
    RoomItem,
    GridItem,
    GridLayout,
  },
  emits: ["handleRoomActiveStatus"],
  data() {
    const projectWithActualRoomsPositions: any = {};
    const dndLayout: IRoomDndLayout[] = [];

    return {
      dndLayout,
      filteredRoomsWithPositions: [],
      projectWithActualRoomsPositions,
      isAreasMiniView: false,
      ignoreResizing: false,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    roomsState() {
      return (this.$store.state as RootState).rooms;
    },
    dndActiveAndAllowed() {
      return (
        this.isDnDActive && this.hasCurrentMemberScopedPermission("writeProject", this.project.id)
      );
    },
    areasHeight() {
      const defaultSize = this.$vuetify.display.mobile ? 155 : 250;
      return this.isAreasMiniView ? 43 : defaultSize;
    },
    globalIsMini() {
      if (this.project) return this.project.meta?.isAreasMiniView;
      return false;
    },
    /**
     * Sort dndLayout by x&y for mobile list
     */
    sortedLayout() {
      return this.dndRooms.slice().sort((a, b) => {
        if (a.x === b.x) {
          return a.y - b.y;
        }
        return a.x - b.x;
      });
    },
    /**
     * Defines id of first room in sorted list
     * @return {string} room id
     */
    firstSortedRoomByParams() {
      if (this.dndRooms.length) {
        const filteredByKeys = this.dndRooms.map((room: any) => ({
          x: room.x,
          y: room.y,
          i: room.i,
        }));
        const sorted = filteredByKeys
          .sort((a: any, b: any) => a.x - b.x)
          .sort((a: any, b: any) => a.y - b.y);
        return sorted[0].i;
      }
      return null;
    },
    /**
     * Defines icon size
     * @return {number} size
     */
    itemWith() {
      return this.$vuetify.display.mobile ? 6 : 1;
    },
    activeRoomOrEmit() {
      if (this.$route.params.activeroom) {
        return this.$route.params.activeroom;
      }

      this.$emit("handleRoomActiveStatus", this.firstSortedRoomByParams);
      return this.firstSortedRoomByParams;
    },
    project(): IProject {
      return (this.$store.state as RootState).projects.project;
    },
    isDnDActive(): boolean {
      return this.$store.getters["projects/isDnDActive"];
    },
    currentRoomData(): IRoom {
      return this.$store.getters["rooms/currentRoomData"];
    },
    listOfRooms(): IRoom[] {
      return this.$store.getters["rooms/rooms"];
    },
    roomsPositions(): any[] {
      return this.$store.getters["rooms/roomPositions"];
    },
    hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
      return this.$store.getters["members/hasScopedPermission"];
    },
    dndRooms(): IRoomDndLayout[] {
      return this.$store.getters["rooms/dndLayout"];
    },
  },
  watch: {
    listOfRooms: [
      {
        handler: "onRoomsChange",
      },
    ],
    dndActiveAndAllowed: [
      {
        handler: "onDndActiveAndAllowedChange",
      },
    ],
    roomsPositions: [
      {
        handler: "roomsPositionWatcher",
      },
    ],
    globalIsMini: [{ immediate: true, handler: "handleAreasMiniView" }],
  },
  mounted() {
    this.initDndRooms(this.listOfRooms);
    if (this.project) this.isAreasMiniView = this.project.meta?.isAreasMiniView;
  },
  methods: {
    /**
     * Defines active room
     * @param {string} roomId room id
     * @return {boolean} status of room
     */
    activeRoom(roomId: string) {
      if (this.$route.params.activeroom) {
        return this.$route.params.activeroom === roomId;
      }

      this.$emit("handleRoomActiveStatus", this.firstSortedRoomByParams);
      return this.firstSortedRoomByParams === roomId;
    },
    /**
     * Prepares list of rooms for Drag and Drop grid
     * @param {array} rooms list of rooms
     */
    initDndRooms(rooms: any) {
      this.ignoreResizing = true;
      this.dndLayout = this.dndRooms.map((value) => {
        return { ...value, w: this.itemWith, h: 1 };
      });
      this.ignoreResizing = false;
    },
    /**
     * Saves actual rooms positions when Drag and Drop layout was updated
     * @param {array} layout Drag and Drop grid items list
     */
    layoutUpdatedEvent(layout: any) {
      this.filteredRoomsWithPositions = layout.map((item: any) => ({
        x: item.x,
        y: item.y,
        i: item.i,
      }));
      if (this.project) {
        const copy = JSON.parse(JSON.stringify(this.project));
        copy.meta.roomsPositions = this.filteredRoomsWithPositions;
        this.projectWithActualRoomsPositions = copy;
      }
    },
    handleRoom(id: string) {
      this.$emit("handleRoomActiveStatus", id);
    },
    handleResize() {
      if (this.isDnDActive || this.ignoreResizing) return;
      this.initDndRooms(this.listOfRooms);
    },
    /**
     * Watch on listOfRooms prop, compare changes and save rooms positions in project data
     * @param {array} newRooms actual list of rooms
     * @param {array} oldRooms list of rooms before they are changed
     */
    onRoomsChange(newRooms: IRoom[], oldRooms: IRoom[]) {
      if (!newRooms.length) this.$emit("handleRoomActiveStatus", "");

      if (newRooms.length !== oldRooms.length && oldRooms.length && oldRooms) {
        this.ignoreResizing = true;
        this.$nextTick(() => {
          this.$emit("handleRoomActiveStatus", this.firstSortedRoomByParams);
          this.updateProject(this.projectWithActualRoomsPositions);
        });
      }
      this.initDndRooms(newRooms);
      this.ignoreResizing = false;
    },

    /**
     * Watch on isDnDActive, when drag and drop turned on save current room positions in project data
     * @param {boolean} val drag and drop status
     */
    async onDndActiveAndAllowedChange(val: boolean) {
      if (!val) {
        // console.log('======= send dnd areas positions (Areas-project) =======');
        this.projectWithActualRoomsPositions.meta.isDNDActive = false;
        this.projectWithActualRoomsPositions.meta.isAreasMiniView = this.isAreasMiniView;
        this.updateProject(this.projectWithActualRoomsPositions);
      }
    },
    roomsPositionWatcher(data: any) {
      this.initDndRooms(data);
    },
    handleAreasMiniView(new_val: boolean, old: boolean) {
      this.ignoreResizing = true;
      this.isAreasMiniView = new_val;
      this.initDndRooms(this.listOfRooms);
      this.ignoreResizing = false;
    },
    updateProject(project: any): Promise<void> {
      return this.$store.dispatch("projects/updateProject", project);
    },
  },
});
</script>

<style lang="scss"></style>
