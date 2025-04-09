<template>
  <div class="user-manual">
    <CoreCard>
      <div>{{ $t("userManual.title") }}</div>
    </CoreCard>
    <QuestionsList :list="questions" @handle-scroll="handleScroll" />
    <CoreCard class="answers-list">
      <div v-for="(theme, themeIndex) in answers" :key="themeIndex">
        <CoreList class="pa-0" tag="ul" lines="two">
          <CoreListItem
            v-for="(item, index) in theme.topics"
            :key="index"
            style="padding-left: 0"
            tag="li"
            :value="item.id"
          >
            <CoreListItemTitle :ref="item.id" class="answers-list-item-title">
              {{ index + 1 }}.
              {{ $t(`userManual.topics.${theme.theme}.list.${item.id}.question`) }}
            </CoreListItemTitle>
            <div class="topics">
              <ul>
                <li v-for="(topic, topicIndex) in item.list" :key="topicIndex">
                  <p>
                    {{ topicIndex + 1 }}.
                    {{
                      rt(tm(`userManual.topics.${theme.theme}.list.${item.id}.answers`)[topicIndex])
                    }}
                  </p>
                  <template v-if="topic.img.length">
                    <div class="img-wrapper">
                      <img
                        v-for="(topicImg, topicImgIndex) in topic.img"
                        :key="topicImgIndex"
                        :alt="topic.text"
                        :src="`/assets/images/user manual/${$i18n.locale}/${topicImg}`"
                        :style="topic.imgSize ? `width: ${topic.imgSize}` : null"
                      />
                    </div>
                  </template>
                </li>
              </ul>
            </div>
          </CoreListItem>
        </CoreList>
      </div>
    </CoreCard>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

import QuestionsList from "@/ui/views/Documentation/UserManual/QuestionsList.vue";

/**
 * User Manual page.
 */
export default defineComponent({
  name: "UserManual",
  components: {
    QuestionsList,
  },
  setup() {
    const { tm, rt } = useI18n();
    return { tm, rt };
  },
  data() {
    return {
      questions: [
        {
          theme: "project",
          topics: [
            "HowToCreateTheProject",
            "HowToChangeTheProjectNameDescriptionAndLocation",
            "HowToChangeTheProjectPicture",
            "HowToDeleteTheProject",
            "HowCanIFindTheProjectInTheHomepage",
          ],
        },
        {
          theme: "areas",
          topics: [
            "HowToAddTheRoom",
            "HowToEditRoomAndDeleteRoom",
            "CanIChangePlaceOfTheRooms",
            "HowCanIFindDeviceOrChartInRooms",
          ],
        },
        {
          theme: "favorites",
          topics: [
            "CanIFavoritesTheChartsOrDevicesWhichIUsuallyUse",
            "HowICanFindTheDeviceOrChartInTheFavorites",
          ],
        },
        {
          theme: "charts",
          topics: [
            "HowToCreateTheChartInWorkbench",
            "HowCanUserUploadTheCSVFileFromChartWithData",
            "CanISeeTheDifferentChartViewOfTheColumnChart",
            "WhereICanFindTheVisualizationOfChartsWhichICanCreate",
            "HowCanIActivateFullScreenChart",
            "WhereCanISeeLiveChart",
            "HowCanIGetDataForPeriod",
            "HowToUseChartCalculation",
          ],
        },
        {
          theme: "devices",
          topics: [
            "HowToCreateTheDeviceInWorkbench",
            "HowLookLikeAllDevicesWhichICanCreateInWorkbench",
            "WhatCanISeeUnderSettingsInDevice",
          ],
        },
        {
          theme: "profile",
          topics: ["HowToEditProfile", "HowToLogout"],
        },
        {
          theme: "additionalFunctions",
          topics: [
            "CanIChangeTheBackgroundInAnotherColor",
            "HowBackToHomeFastFromAnyPageOfTheSystem",
            "HowToSeeMoreDevicesOnThePage",
            "ToggleVisibilityOfOptionalVariablesInDevices",
          ],
        },
        {
          theme: "mlModel",
          topics: ["HowToAddMPCController"],
        },
        {
          theme: "anomalyDetection",
          topics: [
            "HowLookLikeAIMLChartsAndWhereICanGetInformationAboutIt",
            "HowToCreateAnomalyDetectionInWorkbench",
          ],
        },
        {
          theme: "map",
          topics: ["WhatCanISeeOnMap"],
        },
        {
          theme: "variables",
          topics: ["WhereICanSeeAllExistingVariables"],
        },
        {
          theme: "dragAndDrop",
          topics: ["CanIMoveDevicesAndChartsInDifferentOrder"],
        },
        {
          theme: "permissions",
          topics: ["WhatUserCanDoWithPermissions"],
        },
        {
          theme: "settings",
          topics: ["WhatICanFindInSettingsDocumentation", "WhereICanFindMQTTInformation"],
        },
        {
          theme: "beckhoffLibraryCertificate",
          topics: ["WhereICanDownloadTheBeckhoffLibraryAndCertificate"],
        },
        {
          theme: "rules",
          topics: [
            "WhatCanISeeUnderRulesAndHowICanAddARule",
            "WhichConditionsCanIChooseToFillInTheForm",
            "InformationAboutTheBody",
            "HowToCreateAnAutomaticRule",
            "WhatCanBeSetAboutTheTimeSettingInTheRules",
          ],
        },
        {
          theme: "eventList",
          topics: ["WhatCanISeeUnderEventList"],
        },
        {
          theme: "support",
          topics: ["WhereShouldIContactIfIHaveProblemsOrQuestions"],
        },
      ],
      answers: [
        {
          theme: "account",
          topics: [
            {
              id: "HowToCreateAccount",
              list: [
                {
                  img: ["HowToCreateAccount1.png"],
                },
                {
                  img: ["HowToCreateAccount2.png"],
                },
                {
                  img: ["HowToCreateAccount3.png"],
                },
                {
                  img: ["HowToCreateAccount4.png"],
                },
                {
                  img: ["HowToCreateAccount5.png"],
                },
              ],
            },
          ],
        },
        {
          theme: "project",
          topics: [
            {
              id: "HowToCreateTheProject",
              list: [
                {
                  img: ["HowToCreateTheProject1.jpg"],
                },
                {
                  img: ["HowToCreateTheProject2.jpg"],
                },
                {
                  img: ["HowToCreateTheProject3.jpg"],
                },
              ],
            },
            {
              id: "HowToChangeTheProjectNameDescriptionAndLocation",
              title: "How to change the project name, description and location?",
              list: [
                {
                  img: ["HowToChangeTheProjectNameDescriptionAndLocation1.jpg"],
                },
              ],
            },
            {
              id: "HowToChangeTheProjectPicture",
              title: "How to change the project picture?",
              list: [
                {
                  img: ["HowToChangeTheProjectPicture1.jpg"],
                },
                {
                  img: ["HowToChangeTheProjectPicture2.jpg"],
                },
              ],
            },
            {
              id: "HowToDeleteTheProject",
              title: "How to delete the project?",
              list: [
                {
                  img: ["HowToDeleteTheProject1.jpg"],
                },
              ],
            },
            {
              id: "HowCanIFindTheProjectInTheHomepage",
              title: "How can I find the project, on the homepage?",
              list: [
                {
                  img: ["HowCanIFindTheProjectInTheHomepage1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "areas",
          topics: [
            {
              id: "HowToAddTheRoom",
              list: [
                {
                  img: ["HowToAddTheRoom1.jpg"],
                },
                {
                  img: ["HowToAddTheRoom2.jpg"],
                },
              ],
            },
            {
              id: "HowToEditRoomAndDeleteRoom",
              list: [
                {
                  img: ["HowToEditRoomAndDeleteRoom1.jpg"],
                },
              ],
            },
            {
              id: "CanIChangePlaceOfTheRooms",
              list: [
                {
                  img: ["CanIChangePlaceOfTheRooms1.jpg"],
                },
              ],
            },
            {
              id: "HowCanIFindDeviceOrChartInRooms",
              list: [
                {
                  img: ["HowCanIFindDeviceOrChartInRooms1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "favorites",
          topics: [
            {
              id: "CanIFavoritesTheChartsOrDevicesWhichIUsuallyUse",
              list: [
                {
                  img: [
                    "CanIFavoritesTheChartsOrDevicesWhichIUsuallyUse1-1.jpg",
                    "CanIFavoritesTheChartsOrDevicesWhichIUsuallyUse1-2.jpg",
                  ],
                },
              ],
            },
            {
              id: "HowICanFindTheDeviceOrChartInTheFavorites",
              list: [
                {
                  img: ["HowICanFindTheDeviceOrChartInTheFavorites1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "charts",
          topics: [
            {
              id: "HowToCreateTheChartInWorkbench",
              list: [
                {
                  img: ["HowToCreateTheChartInWorkbench1.jpg"],
                },
                {
                  img: ["HowToCreateTheChartInWorkbench2.jpg"],
                },
                {
                  img: ["HowToCreateTheChartInWorkbench3.jpg"],
                },
                {
                  img: ["HowToCreateTheChartInWorkbench4.jpg"],
                },
              ],
            },
            {
              id: "HowCanUserUploadTheCSVFileFromChartWithData",
              list: [
                {
                  img: ["HowCanUserUploadTheCSVFileFromChartWithData1.jpg"],
                },
              ],
            },
            {
              id: "CanISeeTheDifferentChartViewOfTheColumnChart",
              list: [
                {
                  img: ["CanISeeTheDifferentChartViewOfTheColumnChart1.jpg"],
                },
              ],
            },
            {
              id: "WhereICanFindTheVisualizationOfChartsWhichICanCreate",
              list: [
                {
                  img: [
                    "WhereICanFindTheVisualizationOfChartsWhichICanCreate1-1.jpg",
                    "WhereICanFindTheVisualizationOfChartsWhichICanCreate1-2.jpg",
                  ],
                },
              ],
            },
            {
              id: "HowCanIActivateFullScreenChart",
              list: [
                {
                  img: ["HowCanIActivateFullScreenChart1.jpg"],
                },
              ],
            },
            {
              id: "WhereCanISeeLiveChart",
              list: [
                {
                  img: ["WhereCanISeeLiveChart1.jpg"],
                },
              ],
            },
            {
              id: "HowCanIGetDataForPeriod",
              list: [
                {
                  img: ["HowCanIGetDataForPeriod1.jpg"],
                },
              ],
            },
            {
              id: "HowToUseChartCalculation",
              list: [
                {
                  img: ["HowToUseChartCalculation1.jpg"],
                },
                {
                  img: ["HowToUseChartCalculation2.jpg"],
                },
                {
                  img: ["HowToUseChartCalculation3.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "devices",
          topics: [
            {
              id: "HowToCreateTheDeviceInWorkbench",
              list: [
                {
                  img: ["HowToCreateTheDeviceInWorkbench1.jpg"],
                },
                {
                  img: ["HowToCreateTheDeviceInWorkbench2.jpg"],
                },
                {
                  img: ["HowToCreateTheDeviceInWorkbench3.jpg"],
                },
                {
                  img: ["HowToCreateTheDeviceInWorkbench4.jpg"],
                },
                {
                  img: ["HowToCreateTheDeviceInWorkbench5.jpg"],
                },
              ],
            },
            {
              id: "HowLookLikeAllDevicesWhichICanCreateInWorkbench",
              list: [
                {
                  img: ["HowLookLikeAllDevicesWhichICanCreateInWorkbench1.jpg"],
                },
              ],
            },
            {
              id: "WhatCanISeeUnderSettingsInDevice",
              list: [
                {
                  img: ["WhatCanISeeUnderSettingsInDevice1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "profile",
          topics: [
            {
              id: "HowToEditProfile",
              list: [
                {
                  img: ["HowToEditProfile1.jpg"],
                },
              ],
            },
            {
              id: "HowToLogout",
              list: [
                {
                  img: ["HowToLogout1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "additionalFunctions",
          topics: [
            {
              id: "CanIChangeTheBackgroundInAnotherColor",
              list: [
                {
                  img: ["CanIChangeTheBackgroundInAnotherColor1.jpg"],
                },
              ],
            },
            {
              id: "HowBackToHomeFastFromAnyPageOfTheSystem",
              list: [
                {
                  img: [
                    "HowBackToHomeFastFromAnyPageOfTheSystem1-1.jpg",
                    "HowBackToHomeFastFromAnyPageOfTheSystem1-2.jpg",
                  ],
                },
              ],
            },
            {
              id: "HowToSeeMoreDevicesOnThePage",
              list: [
                {
                  img: ["HowToSeeMoreDevicesOnThePage1.jpg"],
                },
              ],
            },
            {
              id: "ToggleVisibilityOfOptionalVariablesInDevices",
              list: [
                {
                  img: ["ToggleVisibilityOfOptionalVariablesInDevices1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "mlModel",
          topics: [
            {
              id: "HowToAddMPCController",
              list: [
                {
                  img: ["HowToAddMPCController1.jpg"],
                },
                {
                  img: ["HowToAddMPCController2.jpg"],
                },
                {
                  img: ["HowToAddMPCController3.jpg"],
                },
                {
                  img: ["HowToAddMPCController4.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "anomalyDetection",
          topics: [
            {
              id: "HowLookLikeAIMLChartsAndWhereICanGetInformationAboutIt",
              list: [
                {
                  img: ["HowLookLikeAIMLChartsAndWhereICanGetInformationAboutIt1.jpg"],
                },
              ],
            },
            {
              id: "HowToCreateAnomalyDetectionInWorkbench",
              list: [
                {
                  img: ["HowToCreateAnomalyDetectionInWorkbench1.jpg"],
                },
                {
                  img: ["HowToCreateAnomalyDetectionInWorkbench2.jpg"],
                },
                {
                  img: ["HowToCreateAnomalyDetectionInWorkbench3.jpg"],
                },
                {
                  img: ["HowToCreateAnomalyDetectionInWorkbench4.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "map",
          topics: [
            {
              id: "WhatCanISeeOnMap",
              list: [
                {
                  img: ["WhatCanISeeOnMap1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "variables",
          topics: [
            {
              id: "WhereICanSeeAllExistingVariables",
              list: [
                {
                  img: ["WhereICanSeeAllExistingVariables1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "dragAndDrop",
          topics: [
            {
              id: "CanIMoveDevicesAndChartsInDifferentOrder",
              list: [
                {
                  img: ["CanIMoveDevicesAndChartsInDifferentOrder1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "permissions",
          topics: [
            {
              id: "WhatUserCanDoWithPermissions",
              list: [
                {
                  img: ["WhatUserCanDoWithPermissions1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "settings",
          topics: [
            {
              id: "WhatICanFindInSettingsDocumentation",
              list: [
                {
                  img: ["WhatICanFindInSettingsDocumentation1.jpg"],
                },
              ],
            },
            {
              id: "WhereICanFindMQTTInformation",
              list: [
                {
                  img: ["WhereICanFindMQTTInformation1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "beckhoffLibraryCertificate",
          topics: [
            {
              id: "WhereICanDownloadTheBeckhoffLibraryAndCertificate",
              list: [
                {
                  img: ["WhereICanDownloadTheBeckhoffLibraryAndCertificate1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "rules",
          topics: [
            {
              id: "WhatCanISeeUnderRulesAndHowICanAddARule",
              list: [
                {
                  img: ["WhatCanISeeUnderRulesAndHowICanAddARule1.jpg"],
                },
              ],
            },
            {
              id: "WhichConditionsCanIChooseToFillInTheForm",
              list: [
                {
                  img: ["WhichConditionsCanIChooseToFillInTheForm1.jpg"],
                },
              ],
            },
            {
              id: "InformationAboutTheBody",
              list: [
                {
                  img: ["InformationAboutTheBody1.jpg"],
                },
              ],
            },
            {
              id: "HowToCreateAnAutomaticRule",
              list: [
                {
                  img: ["HowToCreateAnAutomaticRule1.jpg"],
                },
              ],
            },
            {
              id: "WhatCanBeSetAboutTheTimeSettingInTheRules",
              list: [
                {
                  img: ["WhatCanBeSetAboutTheTimeSettingInTheRules1.png"],
                  imgSize: "50%",
                },
              ],
            },
          ],
        },
        {
          theme: "eventList",
          topics: [
            {
              id: "WhatCanISeeUnderEventList",
              list: [
                {
                  img: ["WhatCanISeeUnderEventList1.jpg"],
                },
              ],
            },
          ],
        },
        {
          theme: "support",
          topics: [
            {
              id: "WhereShouldIContactIfIHaveProblemsOrQuestions",
              list: [
                {
                  img: [],
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    handleScroll(id: string) {
      ((this.$refs as any)[id][0].$el as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    },
  },
});
</script>

<style lang="scss">
.user-manual {
  padding-top: 20px;

  .v-list-item {
    &:first-of-type {
      padding-top: 20px !important;
    }

    padding-top: 50px;
    padding-left: 0 !important;
    min-height: 0 !important;

    .v-list-item__content {
      padding: 0 !important;

      .item-title {
        color: #0f72ba;
        font-size: 20px;
      }

      .topics {
        p {
          font-size: 20px;
          padding-top: 5px;
          color: #525252;
        }
      }
    }
  }
}

.answers-list {
  margin: 40px 0 0 0;

  .answers-list-item-title {
    font-size: 1.2rem;
  }

  .topics {
    ul {
      padding: 0 0 0 0;

      li {
        list-style: none;

        p {
          margin: 20px 0 10px 0;
        }

        .img-wrapper {
          text-align: center;

          img {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
