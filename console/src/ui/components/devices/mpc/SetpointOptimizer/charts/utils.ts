import { defineComponent } from "vue";

export const Utils = defineComponent({
  data() {
    const systems: any = [
      "heating_air_systems",
      "heating_water_systems",
      "cooling_air_systems",
      "cooling_water_systems",
      "hybrid_water_systems",
      "hybrid_air_systems",
    ];

    return {
      chartColors: [
        "#6ca2d8",
        "#90ed7d",
        "#f7a35c",
        "#8085e9",
        "#f15c80",
        "#e4d354",
        "#2b908f",
        "#f45b5b",
        "#91e8e1",
      ],
      systems,
    };
  },
  methods: {
    /**
     * Division of group systems into subgroups depending on the value of the separator.
     * @param {string} groupName group name
     * @param {object} targetObject object containing a collection of elements
     * @param {number} splitter separator determining the number of elements in a subgroup
     * @param {boolean} returnOnlyInstances status defining the format of the result
     * @return {array} list of grouped elements. Depends on returnOnlyInstances status can be: [list] or [groupName, [list]]
     */
    divisionIntoEqualParts(
      groupName: string,
      targetObject: any,
      splitter: number,
      returnOnlyInstances = false,
    ) {
      const instancesArr: any = Object.keys(targetObject);
      const count: any = Math.ceil(instancesArr.length / splitter);
      let instancesArrGrouped: any = [];
      const initChartList = (n: number, arr: any) => {
        if (n > 0) {
          initChartList(n - 1, arr);
          instancesArrGrouped = [
            ...instancesArrGrouped,
            arr.slice(n * splitter - splitter, n * splitter),
          ];
        } else {
          return null;
        }
      };
      initChartList(count, instancesArr);

      return returnOnlyInstances ? instancesArrGrouped : [groupName, instancesArrGrouped];
    },
    /**
     * Init what system chart will load when open page.
     * @param {object} targetArr
     * @return {object} { system: system name, ['instance1', 'instance2'] }
     */
    initFirstSystemByDefault(targetArr: any) {
      const filtered: any = targetArr.filter((el: any) => el[1].length);
      return filtered.length
        ? {
            system: filtered[0][0],
            instances: filtered[0][1][0],
          }
        : {
            system: null,
            instances: [],
          };
    },
  },
});
