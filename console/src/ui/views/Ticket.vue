<template>
  <div class="ticket-view pa-5">
    <div style="width: 500px; margin: 30px auto">
      <span id="hubspotForm" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

type SriptOrUndefined = HTMLScriptElement | undefined;

/**
 * ticket page for hubspot
 */
export default defineComponent({
  data() {
    const script = undefined as SriptOrUndefined;

    return {
      script,
    };
  },
  mounted() {
    this.script = document.createElement("script");
    this.script.src = "https://js.hsforms.net/forms/v2.js";
    document.body.appendChild(this.script);
    this.script.addEventListener("load", this.loadEventListener);
  },
  beforeUnmount() {
    this.script?.removeEventListener("load", this.loadEventListener);
    this.script && document.body.removeChild(this.script);
    this.script = undefined;
  },
  methods: {
    loadEventListener() {
      if ((window as any).hbspt) {
        (window as any).hbspt.forms.create({
          portalId: "8242216",
          formId: "e70e6184-38d6-4d34-aaaa-5ffe5b1081eb",
          target: "#hubspotForm",
        });
      }
    },
  },
});
</script>
