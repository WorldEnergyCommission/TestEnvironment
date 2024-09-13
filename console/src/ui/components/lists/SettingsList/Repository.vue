<template>
  <CoreCard class="repository-settings">
    <div class="repository-settings-title">
      {{ $t("uiComponents.settings.repository.title") }}
    </div>

    <div class="repository-settings-upload-field-section">
      <div v-if="hasCurrentMemberPermission('createDocument')" class="upload-file-field-wrapper">
        <CoreFileInput
          v-model="file"
          class="pa-0 ma-0 upload-file-field"
          hide-details
          label="Select"
          prepend-inner-icon="fas fa-paperclip"
        />
        <CoreButton
          :loading="uploading"
          class="ml-2"
          button-type="primary"
          @click="uploadMultipartFile"
        >
          {{ $t("uiComponents.buttons.upload") }}
        </CoreButton>
      </div>
      <div class="upload-description">
        {{ $t("uiComponents.settings.repository.uploadDescriptions") }}
      </div>
    </div>

    <ProjectDocumentsList />
  </CoreCard>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";

import api from "@/store/api";
import { RootState } from "@/store/types";
import ProjectDocumentsList from "@/ui/components/lists/ProjectDocumentsList.vue";
import { envDomain } from "@/utils/env";

/**
 * Component that shows Repository settings tab
 * Here users can, for e.g upload datasheets from his machine or project
 */
export default defineComponent({
  components: {
    ProjectDocumentsList,
  },
  data() {
    const file = [] as File[];

    return {
      file,
      uploading: false,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    projectId() {
      return this.projectsState.projectId;
    },
    hasCurrentMemberPermission(): (permission: string) => boolean {
      return this.$store.getters["members/hasPermission"];
    },
  },
  async created() {
    await this.loadProjectFiles();
  },
  methods: {
    async loadProjectFiles() {
      await this.$store.dispatch("projects/loadFiles");
    },
    /**
     * Uploads files
     */
    async uploadProjectFiles() {
      if (!this.file || this.file.length < 1) return;
      const { name, size, type } = this.file[0];

      const res = await api.fetch(`/projects/${this.projectId}/documents`, "POST", {
        name,
        size,
        content_type: type != "" ? type : "",
      });
      const formData = new FormData();
      Object.keys(res.form).forEach((key) => {
        formData.append(key, res.form[key]);
      });
      formData.append("file", this.file[0]);
      this.uploading = true;
      await axios
        .post(`https://s3.${envDomain}/documents/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.setReport({
            type: "success",
            message: this.$t("uiComponents.settings.repository.uploadSuccess"),
            value: true,
          });
        })
        .catch(() => {
          this.setReport({
            type: "error",
            message: this.$t("uiComponents.settings.repository.uploadError"),
            value: true,
          });
        });
      this.uploading = false;
      await this.loadProjectFiles();
    },
    async uploadMultipartFile() {
      try {
        this.uploading = true;
        const FILE_CHUNK_SIZE = 10000000; // 10MB
        const fileSize = this.file[0].size;
        const NUM_CHUNKS = Math.floor(fileSize / FILE_CHUNK_SIZE) + 1;

        let start, end, blob;

        const { name, size } = this.file[0];
        const type =
          this.file[0].type && this.file[0].type != "" ? this.file[0].type : "text/plain";
        const { upload_id, asset } = await api.fetch(
          `/projects/${this.projectId}/documents/multipart`,
          "POST",
          {
            name,
            size,
            content_type: type,
          },
        );

        const uploadPartsArray = [] as { part_number: number; etag: string }[];

        for (let index = 1; index < NUM_CHUNKS + 1; index++) {
          start = (index - 1) * FILE_CHUNK_SIZE;
          end = index * FILE_CHUNK_SIZE;
          blob = index < NUM_CHUNKS ? this.file[0].slice(start, end) : this.file[0].slice(start);

          // (1) Generate presigned URL for each part
          const getUploadUrlResp = await api.fetch(
            `/projects/${this.projectId}/documents/${asset.id}/multipart/part/${index}`,
            "PUT",
            {
              upload_id,
            },
          );

          const { url } = getUploadUrlResp as { url: string };

          // (2) Puts each file part into the storage server
          const uploadResp = await axios.put(url, blob, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadPartsArray.push({
            etag: uploadResp.headers.etag, //.replaceAll('"', ""),
            part_number: index,
          });
        }

        // (3) Calls the CompleteMultipartUpload endpoint in the backend server
        const completeUploadResp = await api.fetch(
          `/projects/${this.projectId}/documents/${asset.id}/multipart/complete`,
          "PUT",
          {
            parts: uploadPartsArray,
            upload_id,
          },
        );
        this.setReport({
          type: "success",
          message: this.$t("uiComponents.settings.repository.uploadSuccess"),
          value: true,
        });
      } catch (err) {
        this.setReport({
          type: "error",
          message: this.$t("uiComponents.settings.repository.uploadError"),
          value: true,
        });
        console.log(err);
      } finally {
        this.uploading = false;
        this.loadProjectFiles();
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>

<style lang="scss">
.repository-settings {
  .repository-settings-title {
    font-size: 20px;
    line-height: 1;
  }

  .repository-settings-upload-field-section {
    .upload-file-field-wrapper {
      display: flex;
      align-items: center;
      margin-top: 20px;

      .upload-file-field {
        width: 450px !important;

        .v-input__prepend-outer {
          display: none !important;
        }
      }
    }

    .upload-description {
      font-size: 10px;
      margin: 10px 0 0 25px;
    }
  }
}
</style>
