import type { ReactExtensions, ReactFrameworkOutput } from "@remirror/react";
import type { ReactNode } from "react";
import type { KeyBindingCommandFunction } from "remirror";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  EditorComponent,
  Remirror,
  useKeymap,
  useRemirror,
} from "@remirror/react";
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

const extensions = () => [
  new BoldExtension({}),
  new ItalicExtension({}),
  new UnderlineExtension({}),
  new HeadingExtension({}),
  new BulletListExtension({}),
  new OrderedListExtension({}),
  new LinkExtension({}),
  new MarkdownExtension({ copyAsMarkdown: true }),
];
type Extensions = ReactExtensions<
  | BoldExtension
  | ItalicExtension
  | UnderlineExtension
  | HeadingExtension
  | BulletListExtension
  | OrderedListExtension
  | LinkExtension
  | MarkdownExtension
>;

export const LazyTextEditor = ({
  content,
  contentTimestamp,
  updateContent,
  className,
  children,
  autoFocus = false,
  debug,
}: {
  content: string;
  contentTimestamp: number;
  updateContent: (content: string, timestamp: number) => void;
  className?: string;
  children?: ReactNode;
  autoFocus?: boolean;
  debug?: boolean;
}) => {
  const log = (...args: unknown[]) => {
    if (debug) {
      console.log(...args);
    }
  };

  const lastUpdatedContent = useRef(content);

  const { manager, getContext, onChange } = useRemirror({
    extensions: extensions,

    content: content,
    selection: "end",
    stringHandler: "markdown",
  });

  const editorRef = useRef<ReactFrameworkOutput<Extensions> | undefined>(null);

  useImperativeHandle(editorRef, () => getContext(), [getContext]);

  const snapshotTimestamp = useRef(contentTimestamp);

  const [externalUpdate, setExternalUpdate] = useState(0);

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      lastUpdatedContent.current = content;
      log("first update", lastUpdatedContent.current);
      return;
    }

    if (contentTimestamp !== snapshotTimestamp.current) {
      setExternalUpdate(externalUpdate + 1);
      snapshotTimestamp.current = contentTimestamp;

      const context = getContext();

      context?.setContent(content);
      //lastUpdatedContent.current = content;
    }
  }, [contentTimestamp]);

  const throttledUpdate = useCallback(
    throttle(
      () => {
        const r = editorRef.current;
        if (!r) {
          return;
        }
        const update = r.helpers.getMarkdown();
        if (update === lastUpdatedContent.current) {
          log("skip update");
          return;
        }
        log("update", update, "last", lastUpdatedContent.current, "c", content);

        const ts = Date.now();
        updateContent(update, ts);
        snapshotTimestamp.current = ts;
        lastUpdatedContent.current = update;
      },
      400,
      { leading: false },
    ),

    [updateContent, lastUpdatedContent],
  );

  return (
    <Remirror
      manager={manager}
      autoFocus={autoFocus}
      initialContent={content}
      classNames={[className]}
      onChange={(e) => {
        if (e.tr?.docChanged) {
          throttledUpdate();
        }
        onChange(e);
      }}
    >
      <EditorComponent />
      {children}
    </Remirror>
  );
};

export const SubmitHook = ({ onSubmit }: { onSubmit: () => void }) => {
  const os = useCallback<KeyBindingCommandFunction>(
    ({ next }) => {
      onSubmit();

      return next();
    },
    [onSubmit],
  );

  useKeymap("Mod-Enter", os);

  return null;
};
