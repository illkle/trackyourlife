import { useSyncExternalStore } from "react";

import type { IColorValue } from "@tyl/db/jsonValidators";

type Listener = () => void;

export type InputEditorModalKind = "color";

type InputEditorModalDraftByKind = {
  color: {
    value: IColorValue;
    onChange: (value: IColorValue) => void;
    title?: string;
  };
};

export type InputEditorModalDraftInput<K extends InputEditorModalKind = InputEditorModalKind> = {
  kind: K;
} & InputEditorModalDraftByKind[K];

type InputEditorModalDraftRecord<K extends InputEditorModalKind = InputEditorModalKind> = {
  id: string;
  createdAt: number;
  updatedAt: number;
} & InputEditorModalDraftInput<K>;

export type InputEditorModalDraft = InputEditorModalDraftRecord;

const inputEditorModalDrafts = new Map<string, InputEditorModalDraft>();
const listeners = new Set<Listener>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const makeDraftId = () => {
  return `input-editor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const subscribeToInputEditorModalDrafts = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const getInputEditorModalDraft = (id: string) => {
  return inputEditorModalDrafts.get(id);
};

export const openInputEditorModalDraft = <K extends InputEditorModalKind>(
  draft: InputEditorModalDraftInput<K>,
) => {
  const now = Date.now();
  const id = makeDraftId();

  inputEditorModalDrafts.set(id, {
    ...draft,
    id,
    createdAt: now,
    updatedAt: now,
  });

  emit();

  return id;
};

export const updateInputEditorModalDraft = <K extends InputEditorModalKind>(
  kind: K,
  id: string,
  nextValue: InputEditorModalDraftByKind[K]["value"],
) => {
  const current = inputEditorModalDrafts.get(id);
  if (!current || current.kind !== kind) {
    return;
  }

  const nextDraft = {
    ...current,
    value: nextValue,
    updatedAt: Date.now(),
  } as InputEditorModalDraftRecord<K>;

  inputEditorModalDrafts.set(id, nextDraft);
  nextDraft.onChange(nextValue);
  emit();
};

export const closeInputEditorModalDraft = (id: string) => {
  if (!inputEditorModalDrafts.has(id)) {
    return;
  }

  inputEditorModalDrafts.delete(id);
  emit();
};

export const useInputEditorModalDraft = (id: string) => {
  return useSyncExternalStore(
    subscribeToInputEditorModalDrafts,
    () => getInputEditorModalDraft(id),
    () => getInputEditorModalDraft(id),
  );
};
