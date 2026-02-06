import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "link",
    "image",
    "video",
    "blockquote",
    "code-block",
    "color",
    "background",
  ];

  return (
    <div className="h-[500px] mb-8">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-[450px]"
      />
    </div>
  );
};

export default QuillEditor;
