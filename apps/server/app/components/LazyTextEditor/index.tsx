import { useCallback, useEffect, useRef, useState } from "react";
import { Remirror, useRemirror } from "@remirror/react";
import {
  BoldExtension,
  BulletListExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  OrderedListExtension,
  UnderlineExtension,
} from "remirror/extensions";

import { throttle } from "@tyl/helpers";

export const LazyTextEditor = ({
  content,
  contentTimestamp,
  updateContent,
  className,
}: {
  content: string;
  contentTimestamp: number;
  updateContent: (content: string, timestamp: number) => void;
  className?: string;
}) => {
  console.log("redner editor");

  const { manager, getContext } = useRemirror({
    extensions: () => [
      new BoldExtension({}),
      new ItalicExtension({}),
      new UnderlineExtension({}),
      new HeadingExtension({}),
      new BulletListExtension({}),
      new OrderedListExtension({}),
      new LinkExtension({}),
      new MarkdownExtension({ copyAsMarkdown: true }),
    ],
    content: content,
    selection: "end",
    stringHandler: "markdown",
  });

  const snapshotTimestamp = useRef(contentTimestamp);

  const [externalUpdate, setExternalUpdate] = useState(0);

  useEffect(() => {
    if (contentTimestamp !== snapshotTimestamp.current) {
      console.log(
        "external update",
        contentTimestamp,
        snapshotTimestamp.current,
      );
      setExternalUpdate(externalUpdate + 1);
      snapshotTimestamp.current = contentTimestamp;

      const context = getContext();

      context?.setContent(content);
    }
  }, [contentTimestamp]);

  const throttledUpdate = useCallback(
    throttle(
      (content: string) => {
        const ts = Date.now();
        updateContent(content, ts);
        snapshotTimestamp.current = ts;
      },
      300,
      { leading: false },
    ),

    [updateContent],
  );

  return (
    <Remirror
      manager={manager}
      autoFocus
      initialContent={content}
      classNames={[className]}
      onChange={({ helpers }) => {
        throttledUpdate(helpers.getMarkdown());
      }}
    />
  );
};
