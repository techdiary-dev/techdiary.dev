<template>
    <mavon-editor
        ref="md"
        :toolbars="markdownOption"
        placeholder="এখান থেকে আর্টিক্যাল লিখা শুরু করুন..."
        defaultOpen="subfield=false"
        :imageClick="$imageClick"
        :ishljs="false"
        v-model="body"
        fontSize="18px"
        language="en"
        @imgAdd="uploadImage"
        @imgDel="deleteImage"
    >
    </mavon-editor>
</template>
<script>
import upload from "~/mixins/upload";
export default {
    props: ["value"],
    name: "MarkdownEditor",
    mixins: [upload],
    data() {
        return {
            markdownOption: {
                bold: true,
                italic: true,
                header: true,
                // underline: true,
                // strikethrough: true,
                // mark: true,
                // superscript: true,
                // subscript: true,
                quote: true,
                ol: true,
                ul: true,
                link: true,
                imagelink: true,
                code: true,
                table: true,
                fullscreen: true,
                readmodel: false,
                htmlcode: false,
                help: true,
                /* 1.3.5 */
                undo: true,
                redo: true,
                // trash: true,
                // save: true,
                /* 1.4.2 */
                // navigation: true,
                /* 2.1.8 */
                // alignleft: true,
                // aligncenter: true,
                // alignright: true,
                /* 2.2.1 */
                // subfield: true,
                // preview: true,
            },
        };
    },
    computed: {
        body: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value);
            },
        },
    },
    methods: {
        $imageClick() {
            return false;
        },
        async uploadImage(pos, $file) {
            try {
                const url = await this.uploadFile(
                    $file,
                    "techdiary-article-covers"
                );
                this.$refs.md.$img2Url(pos, url);
            } catch (error) {
                alert("Failed to upload image");
            }
        },
        async deleteImage([url]) {
            try {
                await this.deleteFile(url);
            } catch (error) {
                alert("Failed to delete image");
            }
        },
    },
};
</script>

<style>
.mavonEditor {
    width: 100%;
    height: 100%;
}

textarea.auto-textarea-input {
    @apply ring-0;
}
.v-note-wrapper {
    box-shadow: none !important;
}
.v-note-op {
    border: none !important;
    @apply sticky top-0 left-0;
}
.v-note-wrapper
    .v-note-panel
    .v-note-edit.divarea-wrapper
    .content-input-wrapper {
    padding-left: 10px !important;
}
</style>
