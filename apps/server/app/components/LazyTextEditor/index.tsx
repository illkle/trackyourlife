import { useCallback, useEffect, useState } from "react";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { EditorContent, EditorProvider, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { throttle } from "@tyl/helpers";

const extensions = [
  StarterKit.configure(),
  Highlight,
  CharacterCount.configure({
    limit: 10000,
  }),
];

export const LazyTextEditor = ({
  content,
  contentTimestamp,
  updateContent,
}: {
  content: string;
  contentTimestamp: number;
  updateContent: (content: string, timestamp: number) => void;
}) => {
  const [snapshot, setsnapshot] = useState(contentTimestamp);

  const [externalUpdate, setExternalUpdate] = useState(0);

  useEffect(() => {
    if (contentTimestamp !== snapshot) {
      setExternalUpdate(externalUpdate + 1);
    }
  }, [contentTimestamp]);

  const throttledUpdate = useCallback(
    throttle(
      (content: string) => {
        const ts = Date.now();

        updateContent(content, ts);

        setsnapshot(ts);
      },
      1000,
      { leading: false },
    ),

    [updateContent],
  );

  console.log(content, contentTimestamp, externalUpdate);

  const editor = useEditor(
    {
      extensions,
      content,
      onUpdate: ({ editor }) => {
        throttledUpdate(editor.getHTML());
      },
      autofocus: "end",
      editorProps: {
        attributes: {
          class: "h-full",
        },
      },
    },
    [externalUpdate],
  );

  return <EditorContent editor={editor} className="h-full"></EditorContent>;
};
