import { defineComponent } from "vue";

export const Time = defineComponent({
  methods: {
    /**
     * Convert seconds to days - hours - minutes
     * @param seconds number of seconds
     * @return object with properties days, hours, minutes converted from seconds
     */
    getDateFromSeconds(seconds: number) {
      let delta = seconds;

      const days = Math.floor(delta / 86400);
      delta -= days * 86400;

      const hours = Math.floor(delta / 3600) % 24;
      delta -= hours * 3600;

      const minutes = Math.floor(delta / 60) % 60;

      return { days, hours, minutes };
    },
  },
});
