<template>
  <div class="course-editor">
    <h1>課程編輯器</h1>

    <button @click="addSection">新增章節</button>

    <draggable
      v-model="sections"
      item-key="id"
      group="sections"
      handle=".drag-handle"
    >
      <template #item="{ element: section, index: sIndex }">
        <div class="section">
          <div class="drag-handle">☰</div>
          <input v-model="section.title" placeholder="章節名稱" />

          <button @click="addLesson(sIndex)">新增小節</button>

          <draggable
            v-model="section.lessons"
            item-key="id"
            group="lessons"
            handle=".drag-handle"
          >
            <template #item="{ element: lesson, index: lIndex }">
              <SectionEditor
                v-model:title="lesson.title"
                :file="lesson.file"
                @file-change="(file) => updateLessonFile(sIndex, lIndex, file)"
              />
            </template>
          </draggable>
        </div>
      </template>
    </draggable>

    <button @click="submit">送出課程內容與影片</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import draggable from "vuedraggable";
import SectionEditor from "./SectionEditor.vue";
import axios from "axios";

const sections = ref([]);

function addSection() {
  sections.value.push({
    id: uuidv4(),
    title: "",
    lessons: [],
  });
}

function addLesson(sectionIndex) {
  sections.value[sectionIndex].lessons.push({
    id: uuidv4(),
    title: "",
    file: null,
  });
}

function updateLessonFile(sectionIndex, lessonIndex, file) {
  sections.value[sectionIndex].lessons[lessonIndex].file = file;
}

async function submit() {
  // 提交整個課程資料
  const payload = sections.value.map((section, sIndex) => ({
    title: section.title,
    order: sIndex,
    lessons: section.lessons.map((lesson, lIndex) => ({
      title: lesson.title,
      order: lIndex,
    })),
  }));

  const res = await axios.post("/api/v1/courses", payload);
  const courseId = res.data.courseId;

  // 接著依序上傳每支影片
  for (const [sIndex, section] of sections.value.entries()) {
    for (const [lIndex, lesson] of section.lessons.entries()) {
      if (lesson.file) {
        const uploadRes = await axios.post("/api/v1/courses/upload-mux/upload");
        const { uploadUrl } = uploadRes.data;

        const formData = new FormData();
        formData.append("file", lesson.file);

        await fetch(uploadUrl, {
          method: "PUT",
          body: lesson.file,
        });
      }
    }
  }

  alert("影片與課程上傳完成！");
}
</script>

<style scoped>
.course-editor {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
}
.section {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.drag-handle {
  cursor: move;
  margin-bottom: 0.5rem;
  color: #888;
}
</style>
