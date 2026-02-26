import { useSyncExternalStore } from "react";

import type { IColorValue } from "@tyl/db/jsonValidators";
import type { DatePickerLimits } from "@tyl/helpers/date/datePicker";

type Listener = () => void;

export type InputEditorModalKind = "color" | "date";

type InputEditorModalDraftByKind = {
  color: {
    value: IColorValue;
    onChange: (value: IColorValue) => void;
    title?: string;
  };
  date: {
    value?: Date;
    onChange: (value?: Date) => void;
    limits?: DatePickerLimits;
    title?: string;
  };
};

type InputEditorModalDraftInputByKind = {
  [K in InputEditorModalKind]: {
    kind: K;
  } & InputEditorModalDraftByKind[K];
};

export type InputEditorModalDraftInput<K extends InputEditorModalKind = InputEditorModalKind> =
  InputEditorModalDraftInputByKind[K];

type InputEditorModalDraftRecordByKind = {
  [K in InputEditorModalKind]: {
    id: string;
    createdAt: number;
    updatedAt: number;
  } & InputEditorModalDraftInputByKind[K];
};

type InputEditorModalDraftRecord<K extends InputEditorModalKind = InputEditorModalKind> =
  InputEditorModalDraftRecordByKind[K];

export type InputEditorModalDraft = InputEditorModalDraftRecordByKind[InputEditorModalKind];

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
  const nextDraft = {
    ...draft,
    id,
    createdAt: now,
    updatedAt: now,
  } as InputEditorModalDraft;

  inputEditorModalDrafts.set(id, nextDraft);

  emit();

  return id;
};

export function updateInputEditorModalDraft(
  kind: "color",
  id: string,
  nextValue: InputEditorModalDraftByKind["color"]["value"],
): void;
export function updateInputEditorModalDraft(
  kind: "date",
  id: string,
  nextValue: InputEditorModalDraftByKind["date"]["value"],
): void;
export function updateInputEditorModalDraft(
  kind: InputEditorModalKind,
  id: string,
  nextValue: InputEditorModalDraftByKind[InputEditorModalKind]["value"],
) {
  const current = inputEditorModalDrafts.get(id);
  if (!current || current.kind !== kind) {
    return;
  }

  if (current.kind === "color") {
    const nextDraft: InputEditorModalDraftRecord<"color"> = {
      ...current,
      value: nextValue as InputEditorModalDraftByKind["color"]["value"],
      updatedAt: Date.now(),
    };

    inputEditorModalDrafts.set(id, nextDraft);
    nextDraft.onChange(nextDraft.value);
    emit();
    return;
  }

  if (current.kind === "date") {
    const nextDraft: InputEditorModalDraftRecord<"date"> = {
      ...current,
      value: nextValue as InputEditorModalDraftByKind["date"]["value"],
      updatedAt: Date.now(),
    };

    inputEditorModalDrafts.set(id, nextDraft);
    nextDraft.onChange(nextDraft.value);
    emit();
    return;
  }

  emit();
}

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
