'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { uploadCmsFile } from '@/lib/cms-upload-client'

type TinyEditor = {
  getContent: () => string
  setDirty: (state: boolean) => void
  uploadImages: () => Promise<unknown>
}

type TinyBlobInfo = {
  blob: () => Blob
  filename: () => string
}

type TinyFilePickerCallback = (url: string, meta?: Record<string, string>) => void

export interface RichTextEditorHandle {
  getContent: () => string
  resetDirty: () => void
  uploadImages: () => Promise<void>
}

interface RichTextEditorProps {
  disabled?: boolean
  folder?: 'tin-tuc' | 'tuyen-truyen' | 'chuyen-doi-so' | 'lich-cong-tac' | 'niem-yet' | 'van-ban'
  height?: number
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

function createFileFromBlob(blobInfo: TinyBlobInfo) {
  const blob = blobInfo.blob()
  return new File([blob], blobInfo.filename() || `image-${Date.now()}.png`, {
    type: blob.type || 'image/png',
  })
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  { disabled = false, folder = 'tin-tuc', height = 560, placeholder, value, onChange },
  ref
) {
  const editorRef = useRef<TinyEditor | null>(null)

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getContent() || value,
    resetDirty: () => editorRef.current?.setDirty(false),
    uploadImages: async () => {
      await editorRef.current?.uploadImages()
    },
  }), [value])

  async function handleImageUpload(blobInfo: TinyBlobInfo, progress: (percent: number) => void) {
    const file = createFileFromBlob(blobInfo)
    const uploaded = await uploadCmsFile(file, {
      folder,
      allowedMimePrefixes: ['image/'],
      onProgress: progress,
    })
    return uploaded.url
  }

  function handleFilePick(callback: TinyFilePickerCallback, _value: string, meta: { filetype?: string }) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = meta.filetype === 'image' ? 'image/*' : 'image/*,application/pdf'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const uploaded = await uploadCmsFile(file, {
          folder,
          allowedMimePrefixes: meta.filetype === 'image' ? ['image/'] : ['image/', 'application/pdf'],
        })

        if (meta.filetype === 'image') {
          callback(uploaded.url, { alt: uploaded.fileName, title: uploaded.fileName })
        } else {
          callback(uploaded.url, { text: uploaded.fileName, title: uploaded.fileName })
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Không thể tải tệp lên')
      }
    }

    input.click()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-primary">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        disabled={disabled}
        onInit={(_event, editor) => {
          editorRef.current = editor as TinyEditor
        }}
        onEditorChange={onChange}
        init={{
          height,
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'anchor', 'autolink', 'autosave', 'charmap', 'code',
            'fullscreen', 'help', 'image', 'insertdatetime', 'link', 'lists',
            'preview', 'quickbars', 'searchreplace', 'table', 'visualblocks',
            'wordcount',
          ],
          toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
            'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            'link image table blockquote hr | removeformat code preview fullscreen',
          ].join(' | '),
          block_formats: 'Đoạn văn=p; Tiêu đề 2=h2; Tiêu đề 3=h3; Tiêu đề 4=h4; Trích dẫn=blockquote',
          font_family_formats: 'Be Vietnam Pro=Be Vietnam Pro,Arial,sans-serif; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif',
          font_size_formats: '12px 14px 16px 18px 20px 24px 28px 32px',
          branding: false,
          promotion: false,
          placeholder,
          automatic_uploads: true,
          paste_data_images: true,
          images_file_types: 'jpeg,jpg,jpe,png,gif,webp,avif',
          images_upload_handler: handleImageUpload,
          file_picker_callback: handleFilePick,
          file_picker_types: 'file image',
          image_caption: true,
          image_title: true,
          link_assume_external_targets: 'https',
          link_default_target: '_blank',
          object_resizing: true,
          quickbars_selection_toolbar: 'bold italic underline | quicklink h2 h3 blockquote',
          quickbars_insert_toolbar: 'quickimage quicktable',
          table_default_attributes: {
            border: '0',
          },
          table_default_styles: {
            width: '100%',
            borderCollapse: 'collapse',
          },
          content_style: `
            body {
              color: #102033;
              font-family: "Be Vietnam Pro", Arial, sans-serif;
              font-size: 16px;
              line-height: 1.75;
              margin: 1rem;
            }
            p { margin: 0 0 1rem; }
            h2, h3, h4 { color: #064f8f; line-height: 1.3; margin: 1.35rem 0 0.65rem; }
            h2 { font-size: 1.35rem; }
            h3 { font-size: 1.15rem; }
            h4 { font-size: 1rem; }
            a { color: #0878c9; }
            blockquote {
              border-left: 4px solid #0878c9;
              color: #38566f;
              margin: 1rem 0;
              padding: 0.25rem 0 0.25rem 1rem;
            }
            img { height: auto; max-width: 100%; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #cfe4ef; padding: 0.5rem; }
          `,
        }}
      />
    </div>
  )
})

export default RichTextEditor
