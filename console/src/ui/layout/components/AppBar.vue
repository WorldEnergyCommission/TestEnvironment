<template>
  <CoreAppBar
    :class="[
      'primary',
      'app-bar',
      'curved-display-margin-top',
      { 'app-bar-home': $route.name === 'Home' },
    ]"
    :height="appBarHeight"
    flat
  >
    <CoreContainer class="px-5 py-0 ma-0" fluid>
      <CoreRow no-gutters>
        <CoreColumn
          :class="[
            'd-flex',
            'align-center',
            'justify-space-between',
            'left-section',
            'section',
            { 'pr-3': !$vuetify.display.mobile },
          ]"
          cols="12"
          lg="6"
          xl="5"
          style="height: 60px"
        >
          <CoreAppBarNavIcon
            v-if="$vuetify.display.mobile"
            variant="text"
            @click="drawer = !drawer"
          />
          <!-- Spacer to center title on mobile -->
          <CoreSpacer v-if="$vuetify.display.mobile" />
          <div
            v-if="$route.meta.locale && typeof $route.meta.locale == 'string'"
            class="lynusText--text project-page-title"
          >
            <div v-if="$route.meta?.advancedTitle">
              {{ $t($route.meta?.locale) }} ({{ measurementsLength }})
            </div>
            <div v-else>
              {{ $t($route.meta?.locale) }}
            </div>
          </div>
          <CoreSpacer v-if="$vuetify.display.mobile" />
          <CoreSlideYReverseTransition>
            <CoreButton
              v-if="$route.meta?.search && !hasSecondCol && $vuetify.display.mobile"
              button-type="standardIcon"
              @click="focusSearch"
            >
              <CoreIcon size="small"> fas fa-search </CoreIcon>
            </CoreButton>
          </CoreSlideYReverseTransition>
          <div v-if="!$vuetify.display.mobile && hasUserPlatformPermission('createProject')">
            <CreateProject v-if="$route.meta?.addProject" />
          </div>
          <div v-if="!$route.meta?.appNavigation" class="d-flex align-center">
            <!-- Offline Timer Part -->
            <OfflineTimer v-if="!$vuetify.display.mobile" />
            <div v-if="!$vuetify.display.mobile" class="project-name">
              {{ projectName }}
            </div>
          </div>
        </CoreColumn>
        <CoreExpandTransition :disabled="!$vuetify.display.mobile">
          <CoreColumn
            v-if="hasSecondCol"
            ref="secondCol"
            :class="[
              'd-flex',
              'align-center',
              'justify-space-between',
              'right-section',
              'section',
              { 'pl-3': !$vuetify.display.mobile },
            ]"
            cols="12"
            lg="6"
            xl="7"
            style="height: 60px"
          >
            <!-- Search -->
            <div :class="$vuetify.display.mobile ? 'flex-grow-1' : ''">
              <Search v-if="$route.meta?.search" ref="search" class="mr-2" />
            </div>
            <div class="d-flex align-center">
              <!-- Create Project -->
              <div
                v-if="
                  $route.meta?.addProject &&
                  $vuetify.display.mobile &&
                  hasUserPlatformPermission('createProject')
                "
              >
                <CreateProject />
              </div>

              <!-- Create Areas button -->
              <div
                v-if="$route.meta?.addAreaButton"
                :class="[{ 'pr-3': !$vuetify.display.mobile }]"
              >
                <ManageRoom
                  :form-title="$t('modals.manageAreas.createArea')"
                  :disabled="!canCreateRoom"
                  @handle-room="createRoom"
                >
                  <TopBarAddButton
                    :text="$t('uiComponents.buttons.addArea')"
                    :disabled="!canCreateRoom"
                  />
                </ManageRoom>
              </div>
              <!-- Toggle Areas View Button -->
              <div
                v-if="$route.meta.toggleAreasViewButton && !$vuetify.display.mobile"
                class="pr-2"
              >
                <CoreTooltip location="bottom">
                  <template #activator="{ props }">
                    <CoreButton
                      :disabled="!isMemberAndAdmin"
                      height="35"
                      button-type="standardIcon"
                      v-bind="props"
                      width="35"
                      @click="handleAreasView"
                    >
                      <CoreIcon :color="isAreasMiniView ? 'accent' : undefined">
                        fas fa-arrows-alt-v
                      </CoreIcon>
                    </CoreButton>
                  </template>
                  <span>{{ $t("uiComponents.tooltips.areasSize") }}</span>
                </CoreTooltip>
              </div>
              <!-- Drag and Drop button -->
              <div v-if="$route.meta.dndSwitch && !$vuetify.display.mobile" class="pr-2">
                <CoreTooltip location="bottom">
                  <template #activator="{ props }">
                    <CoreButton
                      :disabled="!isMemberAndAdmin"
                      height="35"
                      button-type="standardIcon"
                      v-bind="props"
                      width="35"
                      @click="handleDnd"
                    >
                      <lynus-icon
                        :color="isDnDActive ? 'accent' : 'theme'"
                        :style="{ opacity: !canUseDnD ? 0.6 : 1 }"
                        name="drag"
                      />
                    </CoreButton>
                  </template>
                  <span>{{ $t("uiComponents.tooltips.dnd") }}</span>
                </CoreTooltip>
              </div>
              <!-- Workbench buttons (changing regarding of tabs on workbench page) -->
              <div
                v-if="$route.meta?.workbenchButtons"
                :class="[{ 'pr-3': !$vuetify.display.mobile }]"
              >
                <template
                  v-if="
                    workbenchButtons[workbenchCurrentTab] &&
                    workbenchButtons[workbenchCurrentTab].visible
                  "
                >
                  <component
                    :is="workbenchButtons[workbenchCurrentTab].form"
                    v-if="
                      hasCurrentMemberPermission(workbenchButtons[workbenchCurrentTab].permission)
                    "
                    :form-title="workbenchButtons[workbenchCurrentTab].formTitle"
                    @handle-control="handleWorkbenchButton"
                  >
                    <TopBarAddButton :text="workbenchButtons[workbenchCurrentTab].btnTitle" />
                  </component>
                  <TopBarAddButton
                    v-else
                    :disabled="true"
                    :text="workbenchButtons[workbenchCurrentTab].btnTitle"
                  />
                </template>
              </div>
              <!-- Add Rule button -->
              <div
                v-if="$route.meta?.addRuleButton && canCreateRule"
                :class="[{ 'pr-4': !$vuetify.display.mobile }]"
              >
                <CreateRuleModal />
              </div>
              <!-- Add Report button -->
              <div
                v-if="$route.meta?.createReportButton && canCreateReport"
                :class="[{ 'pr-4': !$vuetify.display.mobile }]"
              >
                <CreateReportModal />
              </div>
              <div
                v-if="$route.meta?.addDocumentButton"
                :class="[{ 'pr-4': !$vuetify.display.mobile }]"
              >
                <UploadDocument />
              </div>
            </div>
          </CoreColumn>
        </CoreExpandTransition>
      </CoreRow>
    </CoreContainer>
  </CoreAppBar>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { IAnomalyDetectionState } from "@/store/modules/anomalyDetection/types";
import { IAppState } from "@/store/modules/app/types";
import { IDevice } from "@/store/modules/devices/types";
import { IProject, IProjectsState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import IconLights from "@/ui/components/components/IconLights.vue";
import OfflineTimer from "@/ui/components/components/OfflineTimer.vue";
import Search from "@/ui/components/components/Search.vue";
import StatusIndicator from "@/ui/components/components/StatusIndicator.vue";
import TopBarAddButton from "@/ui/components/components/TopBarAddButton.vue";
import UserProfile from "@/ui/components/components/UserProfile.vue";
import CreateProject from "@/ui/components/modals/CreateProject.vue";
import CreateReportModal from "@/ui/components/modals/CreateReportModal.vue";
import CreateRuleModal from "@/ui/components/modals/CreateRuleModal.vue";
import ManageAnomalyDetection from "@/ui/components/modals/ManageAnomalyDetection/ManageAnomalyDetection.vue";
import ManageCharts from "@/ui/components/modals/ManageChartsNew.vue";
import ManageDevice from "@/ui/components/modals/ManageDevice/ManageDevice.vue";
import ManageMLModel from "@/ui/components/modals/ManageMLModel/ManageMLModel.vue";
import ManageRoom from "@/ui/components/modals/ManageRoom.vue";
import UploadDocument from "@/ui/components/modals/UploadDocuments/index.vue";
import { envWorkbenchButtons } from "@/utils/env";

export default defineComponent({
  components: {
    IconLights,
    ManageMLModel,
    ManageDevice,
    ManageCharts,
    ManageAnomalyDetection,
    ManageRoom,
    Search,
    UserProfile,
    StatusIndicator,
    CreateProject,
    OfflineTimer,
    TopBarAddButton,
    CreateReportModal,
    CreateRuleModal,
    UploadDocument,
  },
  props: {
    modelValue: {
      type: Boolean,
    },
    appBarHeight: { default: 60, type: Number },
    hideSecondCol: { default: false, type: Boolean },
  },
  emits: ["update:modelValue", "update:hideSecondCol"],
  computed: {
    drawer: {
      get() {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
    membersState() {
      return (this.$store.state as RootState).members;
    },
    mpcState() {
      return (this.$store.state as RootState).mpc;
    },
    appState() {
      return (this.$store.state as RootState).app;
    },
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    anomalyDetectionState() {
      return (this.$store.state as RootState).anomalyDetection;
    },
    /** Permissions for Report*/
    canCreateReport() {
      return this.hasCurrentMemberPermission("createReport");
    },
    /** Permissions for Room */
    canCreateRoom() {
      return this.hasCurrentMemberPermission("createCollection");
    },
    /** Permissions  for rule*/
    canCreateRule() {
      return this.hasCurrentMemberPermission("createRule");
    },
    /** Collection of Workbench buttons */
    workbenchButtons() {
      return [
        {
          id: "device",
          form: "ManageDevice",
          formTitle: this.$t("modals.manageDevice.createDeviceTitle"),
          btnTitle: this.$t("uiComponents.buttons.addDevice"),
          visible: true,
          permission: "createDevice",
        },
        {
          id: "aiml",
          form: "ManageAnomalyDetection",
          formTitle: this.$t("modals.manageAnomalyDetection.createAnomalyDetectionTitle"),
          btnTitle: this.$t("uiComponents.buttons.addAnomalyDetection"),
          visible: true,
          permission: "createAI",
        },
        {
          id: "charts",
          form: "ManageCharts",
          formTitle: this.$t("modals.manageCharts.createChartTitle"),
          btnTitle: this.$t("uiComponents.buttons.addChart"),
          visible: true,
          permission: "createDevice",
        },
        {
          id: "mpc",
          form: "ManageMLModel",
          formTitle: this.$t("modals.manageMLModel.createDeviceTitle"),
          btnTitle: this.$t("uiComponents.buttons.addMlModel"),
          visible: this.isWeatherServiceActive,
          permission: "createAI",
        },
      ].filter((e) => envWorkbenchButtons.includes(e.form));
    },
    workbenchCurrentTab() {
      if (this.$route.meta?.workbenchCurrentTab) {
        return this.$route.meta?.workbenchCurrentTab;
      }
      return this.appState.workbenchCurrentTab ?? 0;
    },
    isWeatherServiceActive() {
      return true; //this.mpcState?.isWeatherServiceActive ?? false;
    },
    currentMember() {
      return this.membersState.currentMember;
    },
    isMemberAndAdmin() {
      return this.currentMember && this.currentMember.admin;
    },
    canUseDnD() {
      if (
        this.isMemberAndAdmin ||
        this.hasCurrentMemberScopedPermission("writeCollection", this.currentRoom)
      )
        return true;

      return false;
    },
    mlModelTypes() {
      return Object.keys(this.mpcState.mlModelTypes);
    },
    anomalyDetectionTypes() {
      return Object.keys(this.anomalyDetectionState.anomalyDetectionTypes);
    },
    measurementsLength() {
      return Object.keys(this.measurements).filter((meas) => meas).length;
    },
    isConnectivityCheckerEnabled() {
      return this.project?.connectivity?.enabled;
    },
    projectStatus() {
      return this.projectsState.projectStatus;
    },
    projectName() {
      return this.projectsState.project.name;
    },
    isAreasMiniView() {
      if (this.project) {
        return this.project.meta?.isAreasMiniView;
      }
      return false;
    },
    isNavigation() {
      return this.$route.meta?.navigation;
    },
    hasSecondCol() {
      return !this.$vuetify.display.mobile || (!this.hideSecondCol && this.appBarHeight !== 60);
    },
    hasCurrentMemberPermission(): (permission: string) => boolean {
      return this.$store.getters["members/hasPermission"];
    },
    getIsAllAccepted(): boolean {
      return this.$store.getters["app/getIsAllAccepted"];
    },
    project(): IProject {
      return this.projectsState.project;
    },
    measurements(): any {
      return this.$store.getters["measurements/measurements"];
    },
    isDnDActive(): boolean {
      return this.$store.getters["projects/isDnDActive"];
    },
    hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
      return this.$store.getters["members/hasScopedPermission"];
    },
    currentRoom(): string {
      return this.$store.getters["rooms/currentRoom"];
    },
    hasUserPlatformPermission(): (permission: string) => boolean {
      return this.$store.getters["permissions/hasPlatformPermission"];
    },
  },
  methods: {
    /**
     * Launch creation method according to device type.
     * @param payload device, MPC data
     */
    handleWorkbenchButton(payload: any) {
      const mpcApiTypes: string[] = [...this.mlModelTypes, ...this.anomalyDetectionTypes];
      const isMpc: boolean = mpcApiTypes.some((type: string) => type === payload.data.type);
      if (isMpc) {
        this.createMCCInstance(payload);
      } else {
        this.createDevice(payload);
      }
    },
    /**
     * Toggle drag and drop
     */
    async handleDnd() {
      this.$store.commit("projects/toggleDnD");
    },
    /**
     * Toggle area view between mini view and default view
     */
    async handleAreasView() {
      await this.$store.dispatch("projects/updateProject", {
        ...this.project,
        meta: {
          ...this.project.meta,
          isAreasMiniView: !this.isAreasMiniView,
        },
      });
    },
    createRoom(payload: any) {
      this.createRoomState(payload);
    },
    async focusSearch() {
      // this would be better if multiple v-models work, since it doesn't we need to emit
      this.$emit("update:hideSecondCol", false);

      // then after rendering happened focus on input
      this.$nextTick(() => {
        const searchRef = this.$refs.search as typeof Search;
        searchRef && searchRef.focusOnInput();
      });
    },
    createMCCInstance(payload: IDevice): any {
      return this.$store.dispatch("mpc/createMCCInstance", payload);
    },
    createDevice(control: IDevice): Promise<void> {
      return this.$store.dispatch("devices/createDevice", control);
    },
    createRoomState(roomName: string): Promise<void> {
      return this.$store.dispatch("rooms/createRoom", roomName);
    },
    loadCurrentProject(): any {
      return this.$store.dispatch("projects/loadProject");
    },
  },
});
</script>
<style lang="scss">
// App Drawer Stles
.v-app-bar {
  z-index: 10;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  box-shadow: 0px 24px 3px -24px rgba(var(--v-theme-accent), 0.5);

  .left-section {
    .project-page-title {
      font-size: 30px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media all and (max-width: 1500px) {
        font-size: 20px;
        white-space: break-spaces;
        line-height: 1;
      }

      @media all and (max-width: 640px) {
        font-size: 16px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .project-name {
      font-size: 20px;
      color: rgb(var(--v-theme-lynusText));
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      //min-width: 160px;
      text-align: right;

      @media all and (max-width: 1500px) {
        font-size: 18px;
        max-width: 200px;
      }

      @media all and (max-width: 640px) {
        font-size: 16px;
      }
    }
  }

  .app-logo {
    cursor: pointer;
  }
}
</style>
