<template>
  <div class="curved-display-margin-bottom">
    <CoreTabs>
      <!-- Item 1 (Contains list with the Items that need to be accepted) -->
      <CoreTab @click="switchTab(1)">
        {{ $t("uiComponents.eventListTable.eventListTabs.events") }}
      </CoreTab>
      <!-- Item 2 (Contains list with the Items that are already accepted)-->
      <CoreTab @click="switchTab(2)">
        {{ $t("uiComponents.eventListTable.eventListTabs.accepted") }}
      </CoreTab>
    </CoreTabs>
    <CoreWindow v-model="openedTab">
      <CoreWindowItem style="overflow: auto" :value="1">
        <OpenEventsTable
          :model-value="pageOpen"
          :items-per-page="itemsPerPage"
          :needto-accept="needtoAcceptList"
          :page-count="pageCountNeedtoAccept"
          @accept-item="(eventId: string) => acceptItem(eventId)"
          @page-swap="(page: number) => pageSwap(page, false)"
        />
      </CoreWindowItem>
      <CoreWindowItem style="overflow: auto" :value="2">
        <AcceptedEventsTable
          :model-value="pageAccepted"
          :accepted-list="acceptedList"
          :items-per-page="itemsPerPage"
          :page-count="pageCountAcceptedList"
          @page-swap="(page: number) => pageSwap(page, true)"
        />
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IUser } from "@/store/modules/app/types";
import { IEvent } from "@/store/modules/events/types";
import { IMember } from "@/store/modules/members/types";
import AcceptedEventsTable from "@/ui/components/tables//events/AcceptedEventsTable.vue";
import OpenEventsTable from "@/ui/components/tables/events/OpenEventsTable.vue";

/**
 * Event list page that shows table of events
 */
export default defineComponent({
  components: {
    OpenEventsTable,
    AcceptedEventsTable,
  },
  data() {
    const localEventList: any[] = [];

    return {
      /** state of pages for open table*/
      pageOpen: 1,
      /** state of pages for accepted table*/
      pageAccepted: 1,
      /** count of pages for open table */
      pageCountNeedtoAccept: 0,
      /** count of pages for accepted table */
      pageCountAcceptedList: 0,
      itemsPerPage: 20,
      /** tab state       */
      openedTab: 1,
      permissionToDelete: false,
      /** contains all Events */
      localEventList,
    };
  },
  computed: {
    acceptedList() {
      const list = this.localEventList
        .filter((event: any) => event.accepted_at && event.accepted_by)
        .map((event: any) => {
          event.created_at = this.parseDate(event.created_at);
          event.accepted_at = this.parseDate(event.accepted_at);
          return event;
        });

      // sort lists by date
      list.sort((a: any, b: any) => {
        return b.accepted_at - a.accepted_at;
      });

      return list;
    },
    needtoAcceptList() {
      const list = this.localEventList
        .filter((event: any) => !event.accepted_at && !event.accepted_by)
        .map((event: any) => {
          event.created_at = this.parseDate(event.created_at);
          return event;
        });

      // sort lists by date
      list.sort((a: any, b: any) => {
        return b.created_at - a.created_at;
      });

      return list;
    },
    getEventList(): IEvent[] {
      return this.$store.getters["events/getEventList"];
    },
    membersList(): IMember[] {
      return this.$store.getters["members/members"];
    },
    currentUser(): IUser {
      return this.$store.getters["app/getUser"];
    },
    hasCurrentMemberPermission(): (permission: string) => boolean {
      return this.$store.getters["members/hasPermission"];
    },
    getIsAllAccepted(): any {
      return this.$store.getters["events/getIsAllAccepted"];
    },
  },
  watch: {
    getEventList: [
      {
        handler: "changesSearchBar",
      },
    ],
    pageOpen: [
      {
        handler: "loadOpenEvents",
      },
    ],
    pageAccepted: [
      {
        handler: "loadAcceptedEvents",
      },
    ],
  },
  async created() {
    // load Members on Page reload to avoid error in the Column Accepted_by
    await this.fetchMembers(this.$route.params.id as string);
    // loads the new Alerts when the Page is refreshed
    this.localEventList = [];
    const page = 1;
    const bol = false;
    const resLoadEvents = await this.$store.dispatch("events/loadEvents", { page, bol });
    this.localEventList = resLoadEvents.data;
    this.pageCountNeedtoAccept = resLoadEvents.pages;
  },
  methods: {
    /**
     * Fetch events list according to pagination page and table
     * @param accepted
     */
    pageSwap(page: number, accepted: boolean) {
      if (accepted) {
        this.pageAccepted = page;
      } else {
        this.pageOpen = page;
      }
    },
    /**
     * Toggles between tables "Events", "Accepted",
     * fetch data according to table
     * @param index tab index
     */
    async switchTab(index: number) {
      const page = 1;
      let bol = false;
      this.openedTab = index;
      if (index === 1) {
        const resLoadEvents = await this.$store.dispatch("events/loadEvents", { page, bol });
        this.localEventList = resLoadEvents.data;
        this.pageCountNeedtoAccept = resLoadEvents.pages;
      } else {
        bol = true;
        const resLoadEvents = await this.$store.dispatch("events/loadEvents", { page, bol });
        this.localEventList = resLoadEvents.data;
        this.pageCountAcceptedList = resLoadEvents.pages;
      }
    },
    parseDate(dateString: string) {
      return new Date(dateString);
    },
    /** accepts single event or all events if id is null */
    async acceptItem(eventId: string | null) {
      // checks if the current Member has the Permissions to Accept an Event
      // permissionsToDelete = true when the User can accept
      Object.values(this.membersList).forEach((value: any) => {
        if (this.currentUser.id === value.id) {
          this.permissionToDelete = this.hasCurrentMemberPermission("writeAlert") || value.admin;
        }
      });

      // Only Users with Admin rights can accept an Event
      if (this.permissionToDelete) {
        if (eventId !== null) {
          await this.$store.dispatch("events/acceptOneEvent", { id: eventId }).then(() => {
            this.setReport({
              type: "success",
              message: this.$t("uiComponents.eventListTable.eventAcceptedSuccessfull"),
              value: true,
            });
          });
        } else {
          await this.$store.dispatch("events/acceptEveryEvent").then(() => {
            this.setReport({
              type: "success",
              message: this.$t("uiComponents.eventListTable.eventsAcceptedSuccessfull"),
              value: true,
            });
          });
          const page = 1;
          const bol = false;
          // loads the new Eventlist after all events are Accepted
          const resLoadEvents = await this.$store.dispatch("events/loadEvents", { page, bol });
          this.localEventList = resLoadEvents.data;
          this.pageCountNeedtoAccept = resLoadEvents.pages;
        }
      }
    },
    /**
     * Watches for changes when you type something in the Searchbar
     * and filters the Lists based on the input
     */
    changesSearchBar() {
      this.localEventList = this.getEventList;
    },
    async loadOpenEvents(page: number) {
      console.log("loadOpenEvents", page);
      const resLoadEvents = await this.$store.dispatch("events/loadEvents", {
        page,
        bol: false,
      });
      this.localEventList = resLoadEvents.data;
      this.pageCountNeedtoAccept = resLoadEvents.pages;
    },
    async loadAcceptedEvents(page: number) {
      console.log("loadAcceptedEvents", page);

      const resLoadEvents = await this.$store.dispatch("events/loadEvents", {
        page,
        bol: true,
      });
      this.localEventList = resLoadEvents.data;
      this.pageCountAcceptedList = resLoadEvents.pages;
    },
    fetchMembers(payload: any): any {
      return this.$store.dispatch("members/fetchMembers", payload);
    },
    acceptAllEvents() {
      this.$store.commit("events/acceptAllEvents");
    },
    acceptEvent() {
      this.$store.commit("events/acceptEvent");
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>

<style lang="scss" scoped></style>
