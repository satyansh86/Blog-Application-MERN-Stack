import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import "./Editor.css";

export default function Editor({ value, onChange, theme = "snow" }) {
  const [charCount, setCharCount] = useState(value.length);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"], // 'clean' removes formatting, making it work like a clear function
    ],
  };

  const handleChange = (content) => {
    onChange(content);
    setCharCount(content.replace(/<[^>]*>/g, "").length); // Count text characters only
  };

  return (
    <div className="content">
      <ReactQuill
        value={value}
        theme={theme}
        onChange={handleChange}
        modules={modules}
        placeholder="Start writing your content here..."
      />
      <div className="character-count">
        Character Count: {charCount}
      </div>
    </div>
  );
}
