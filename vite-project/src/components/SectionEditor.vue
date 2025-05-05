<template>
  <div class="lesson">
    <div class="drag-handle">☰</div>
    <input
      v-model="localTitle"
      @input="$emit('update:title', localTitle)"
      placeholder="小節名稱"
    />
    <input type="file" accept="video/*" @change="onFileChange" />
    <span v-if="file">{{ file.name }}</span>
    <p v-if="uploadProgress !== null">上傳進度：{{ uploadProgress }}%</p>
  </div>
</template>

<script setup>
// Vue API
import { ref, watch } from "vue";

// 使用 CommonJS 引入 upchunk
const UpChunk = require("@mux/upchunk");

// Props 和 Emits
const props = defineProps({
  title: String,
  file: File,
});

const emit = defineEmits(["update:title", "file-change", "update:assetId"]);

// 本地狀態
const localTitle = ref(props.title || "");
const file = ref(null);
const uploadProgress = ref(null);

// 處理選檔
async function onFileChange(e) {
  const selected = e.target.files[0];
  if (!selected) return;

  file.value = selected;
  emit("file-change", selected);
  try {
    // 1. 呼叫後端取得 Mux Upload URL
    const res = await fetch("/api/v1/courses/upload-mux/upload", {
      method: "POST",
    });
    const data = await res.json();
    const uploadUrl = data.uploadUrl;
    const assetId = data.asset.id; // 假設後端也回傳了 Mux 的 asset.id

    // 2. 使用 UpChunk 進行上傳
    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file: selected,
      chunkSize: 6 * 1024 * 1024,
    });

    upload.on("progress", (event) => {
      uploadProgress.value = Math.floor(event.detail);
    });

    upload.on("success", () => {
      console.log("✅ 上傳成功");
      uploadProgress.value = null;
      emit("update:assetId", assetId); // 將 assetId 傳出
    });

    upload.on("error", (err) => {
      console.error("❌ 上傳錯誤", err);
      uploadProgress.value = null;
    });
  } catch (err) {
    console.error("❌ 無法取得上傳 URL", err);
  }
}
</script>

<style scoped>
.lesson {
  border: 1px dashed #ccc;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 5px;
}
</style>
