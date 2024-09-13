<template>
  <div style="overflow: auto">
    <CoreDataTable
      :headers="headers"
      :items="arr"
      class="prices-table"
      disable-pagination
      hide-default-footer
      style="min-width: 1000px"
    >
      <template #column.month="{ column }">
        <CoreSelect
          :items="months"
          :label="$t(`uiComponents.pricesTable.headers.${column.title}`)"
          class="ma-0 pa-0"
          density="compact"
          hide-details
          hide-selected
          variant="solo"
        />
      </template>
      <template #body="{ items }">
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.invoiceDescription }}</td>
            <td>{{ item.due_AT }}</td>
            <td>{{ item.paid_AT }}</td>
            <td>{{ item.price.toFixed(2) }} $</td>
          </tr>
          <tr v-if="resultInvoices.length > 0">
            <td />
            <td />
            <td>{{ $t("uiComponents.pricesTable.total") }}:</td>
            <td>{{ total.toFixed(2) }} $</td>
          </tr>
        </tbody>
      </template>
    </CoreDataTable>
    <h2 v-if="resultInvoices.length === 0" style="margin-left: 45%">
      {{ $t("uiComponents.common.noDataFound") }}
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import api from "@/store/api";
import { IProject } from "@/store/modules/projects/types";

/**
 * Component that shows table of invoices
 */
export default defineComponent({
  data() {
    const resultInvoices: any = [];
    const arr: any = [];

    return {
      packages: [
        { package: "M", datapoints: "0-50", price: 4.9 },
        { package: "L", datapoints: "0-500", price: 9.9 },
        { package: "XL", datapoints: "0-1000", price: 14.9 },
      ],
      arr,
      total: 0,
      months: ["November", "October", "September"],
      resultInvoices,
    };
  },
  computed: {
    headers(): any {
      return [
        {
          title: "description",
          align: "start",
          sortable: false,
          value: "invoiceDescription",
          width: "60%",
        },
        {
          title: "dueAt",
          align: "start",
          sortable: true,
          value: "due_AT",
          width: "15%",
        },
        {
          title: "paidAt",
          align: "start",
          sortable: false,
          value: "paid_AT",
          width: "15%",
        },
        {
          title: "price",
          align: "start",
          sortable: true,
          value: "price",
          width: "10%",
        },
      ];
    },
    projects(): IProject[] {
      return this.$store.getters["projects/projects"];
    },
  },
  async mounted() {
    // load all the Invoices from the API to display it on the Billing Page
    this.resultInvoices = await api.fetch("/invoices", "GET");
    this.arr = await Promise.all(this.projectsMod());
    this.total = this.arr.map((item: any) => item.price).reduce((a: number, b: number) => a + b, 0);
  },
  methods: {
    /**
     * Prepares the data for the price table
     */
    projectsMod() {
      return this.resultInvoices.map(async (invoice: any, index: number) => {
        const dateDue = new Date(invoice.due_at);
        let datePaid: any = new Date(invoice.paid_at);
        if (datePaid.getFullYear() === 1970) {
          datePaid = "Not paid";
        } else {
          datePaid = `${datePaid.getDate()}.${datePaid.getMonth() + 1}.${datePaid.getFullYear()}`;
        }
        return {
          id: invoice.id,
          invoiceDescription: invoice.description,
          paid_AT: datePaid,
          due_AT: `${dateDue.getDate()}.${dateDue.getMonth() + 1}.${dateDue.getFullYear()}`,
          price: invoice.amount,
        };
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.prices-table {
  .v-input {
    max-width: 150px;
  }
}
</style>
