<template>
  <div
    :class="{ 'grey lighten-2': active }"
    @drop.prevent="onDrop"
    @dragover.prevent
    @dragenter.prevent="setActive"
    @active.prevent="setActive"
    @dragleave.prevent="setInactive"
  >
    <CoreRow
      v-if="!props.uploading"
      class="d-flex flex-column"
      dense
      align="center"
      justify="center"
      style="cursor: pointer"
      @click="clickFileInput"
    >
      <CoreIcon :class="['mt-5']" :size="60" :color="active ? 'accent' : ''">
        mdi:mdi-cloud-upload
      </CoreIcon>
      <p>{{ $t("modals.uploadDocuments.text") }}</p>
    </CoreRow>

    <input
      ref="fileInput"
      type="file"
      multiple
      name="file"
      style="display: none"
      @change="onInputFieldChange"
    />

    <CoreList v-if="uploadedFiles.length > 0" class="my-3">
      <div v-for="(item, index) in uploadedFiles" :key="`${index}_${item['type']}_${item['name']}`">
        <CoreListItem>
          <template #prepend>
            <CoreImage
              v-if="['image/gif', 'image/jpeg', 'image/png'].includes(item['type'])"
              :width="60"
              aspect-ratio="1/1"
              :src="generateURL(item)"
            >
              <template #error>
                <CoreIcon size="small" color="accent"> fas fa-solid fa-file </CoreIcon>
              </template>
            </CoreImage>
            <CoreIcon v-else-if="item['type'] === 'application/pdf'" size="small" color="accent">
              fas fa-solid fa-file-pdf
            </CoreIcon>
            <CoreIcon
              v-else-if="['application/x-zip-compressed', 'application/zip'].includes(item['type'])"
              size="small"
              color="accent"
            >
              fas fa-solid fa-file-zipper
            </CoreIcon>
            <CoreIcon
              v-else-if="
                ['text/csv', 'application/csv', 'text/comma-separated-values'].includes(
                  item['type'],
                )
              "
              size="small"
              color="accent"
            >
              fas fa-solid fa-file-csv
            </CoreIcon>
            <CoreIcon v-else size="small" color="accent"> fas fa-solid fa-file </CoreIcon>
          </template>
          <CoreListItemTitle>
            {{ item.name }}
          </CoreListItemTitle>
          <CoreListItemSubtitle>
            <span class="ml-3 text--secondary"> {{ formatBytes(item.size) }} bytes</span>
          </CoreListItemSubtitle>
          <template #append>
            <CoreButton
              color="red"
              :disabled="props.uploading"
              button-type="standardIcon"
              @click.stop="removeFile(item.name)"
            >
              <CoreIcon> mdi:mdi-close-circle </CoreIcon>
            </CoreButton>
          </template>
        </CoreListItem>

        <CoreDivider v-if="index != uploadedFiles.length - 1" />
      </div>
    </CoreList>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";

import { formatBytes } from "@/utils/utilsFunctions.ts";

interface UploadDocumentsFormProps {
  multiple?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
}

const props = withDefaults(defineProps<UploadDocumentsFormProps>(), {
  multiple: true,
  uploading: false,
  uploadProgress: 0,
});

const uploadedFiles = defineModel<File[]>({ default: [] });
onMounted(async () => {
  uploadedFiles.value = [];
});

const active = ref(false);
const inActiveTimeout = ref<Timeout | Null>(null);

// setActive and setInactive use timeouts, so that when you drag an item over a child element,
// the dragleave event that is fired won't cause a flicker. A few ms should be plenty of
// time to wait for the next dragenter event to clear the timeout and set it back to active.
function setActive() {
  active.value = true;
  inActiveTimeout.value && clearTimeout(inActiveTimeout.value);
}
function setInactive() {
  inActiveTimeout.value = setTimeout(() => {
    active.value = false;
  }, 100);
}

const store = useStore();

function removeFile(fileName: string) {
  if (props.uploading) return;
  // Find the index of the
  const index = uploadedFiles.value.findIndex((file) => file.name === fileName);
  // If file is in uploaded files remove it
  if (index > -1) uploadedFiles.value.splice(index, 1);
}
function onDrop(e: DragEvent) {
  if (props.uploading) return;
  if (!e.dataTransfer) return;
  active.value = false;
  const files = [...e.dataTransfer.items];
  // If user has uploaded multiple files but the component is not multiple throw error
  if (!props.multiple && files.length > 1) {
    // store.dispatch("addNotification", {
    //   message: "Only one file can be uploaded at a time..",
    //   colour: "error",
    // });
    console.log("error only one file");
    return;
  }
  // Add each file to the array of uploaded files

  files.forEach((element) => traverseFileTree(element.webkitGetAsEntry()));
}

function traverseFileTree(item, path?: string | undefined) {
  path = path || "";
  if (item.isFile) {
    // Get file
    item.file(function (file) {
      uploadedFiles.value.push(file);
    });
  } else if (item.isDirectory) {
    // Get folder contents
    const dirReader = item.createReader();
    dirReader.readEntries(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        traverseFileTree(entries[i], path + item.name + "/");
      }
    });
  }
}

const fileInput = ref(null);
function onInputFieldChange(e: Event) {
  if (props.uploading) return;
  const target = e.target as HTMLInputElement;
  if (target && target.files) {
    [...target.files].forEach((element) => uploadedFiles.value.push(element));
  }
}

function clickFileInput() {
  if (props.uploading) return;
  fileInput.value && fileInput.value.click();
}

function generateURL(file) {
  const fileSrc = URL.createObjectURL(file);
  setTimeout(() => {
    URL.revokeObjectURL(fileSrc);
  }, 1000);
  return fileSrc;
}
</script>
