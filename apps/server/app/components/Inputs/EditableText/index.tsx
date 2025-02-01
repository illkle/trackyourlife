import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@shad/utils";

interface IEditableTextBase {
  classNameInput?: string;
  classNameText?: string;
  className?: string;
  style?: React.CSSProperties;
  editModeSetter?: (val: boolean) => void;
  saveOnChange?: boolean;
}

interface IEditableTextDefaultProps extends IEditableTextBase {
  isNumber?: false;
  value?: string;
  updater: (val: string) => void | Promise<void>;
}

interface IEditableTextNumberProps extends IEditableTextBase {
  isNumber: true;
  value?: number;
  updater: (val: number) => void | Promise<void>;
}

type IEditableTextProps = IEditableTextDefaultProps | IEditableTextNumberProps;

const EditableText = ({
  isNumber,
  value,
  updater,
  className,
  classNameText,
  classNameInput,
  editModeSetter,
  saveOnChange,
  style,
}: IEditableTextProps) => {
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const [waiting, setWaiting] = useState(false);
  const [focusNext, setFocusNext] = useState(false);

  const goToEdit = (e: MouseEvent | FocusEvent) => {
    e.stopPropagation();
    setInputVal(value);
    if (editModeSetter) editModeSetter(true);
    setEditMode(true);
    setFocusNext(true);
  };

  const save = async (val: string | number | undefined) => {
    if (isNumber) {
      await updater(Number(val));
    } else {
      //@ts-expect-error this is correct
      await updater(val);
    }
  };

  const commit = async () => {
    if (waiting) return;
    setWaiting(true);
    await save(inputVal);
    setEditMode(false);
    if (editModeSetter) editModeSetter(false);
    setWaiting(false);
  };

  const handelEdit = (e: ChangeEvent<HTMLInputElement>) => {
    if (waiting) return;
    setInputVal(e.target.value);
    if (saveOnChange) {
      void save(e.target.value);
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void commit();
    }

    if (e.key === "Escape") {
      setEditMode(false);
    }
  };

  useEffect(() => {
    if (!focusNext || !inputRef.current) return;

    inputRef.current.focus();
    inputRef.current.select();
    setFocusNext(false);
  }, [focusNext]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  if (editMode) {
    return (
      <input
        inputMode={isNumber ? "decimal" : "text"}
        type={isNumber ? "number" : "text"}
        ref={inputRef}
        value={inputVal}
        onChange={handelEdit}
        onBlur={() => void commit()}
        className={cn(className, classNameInput)}
        onKeyUp={handleKeyUp}
        style={style}
      />
    );
  }

  return (
    <div
      tabIndex={0}
      onFocus={goToEdit}
      onClick={goToEdit}
      className={cn(className, classNameText)}
      style={style}
    >
      {value}
    </div>
  );
};

export default EditableText;
