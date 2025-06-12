import { useEffect, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import TestComponentSort from "~/components/Trackable/Settings/logsDisplay/quickRepo";
import { useLinkedBinding } from "~/utils/useDbLinkedValue";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

interface ComplexValue {
  value: string;
  secondValue: number;
}

function RouteComponent() {
  const [storage, setStorage] = useState<ComplexValue>({
    value: "",
    secondValue: 0,
  });

  const [timestamp, setTimestamp] = useState(Date.now());

  return (
    <div className="mx-auto max-w-md">
      <div className="hidden">
        <div className="gap-4">
          {JSON.stringify(storage)}
          <Button
            onClick={() => setStorage({ value: "kek", secondValue: 1337 })}
          >
            External Update
          </Button>
        </div>
        <ChildComponent
          value={storage}
          timestamp={timestamp}
          onChange={(v, ts) => {
            setStorage(v);
            setTimestamp(ts);
          }}
        />{" "}
      </div>

      <TestComponentSort />
    </div>
  );
}

const ChildComponent = ({
  value,
  timestamp,
  onChange,
}: {
  value: ComplexValue;
  timestamp: number;
  onChange: (v: ComplexValue, ts: number) => void;
}) => {
  const form = useForm({
    defaultValues: value,
    onSubmit: ({ value }) => {
      onChange(value, Date.now());
    },
  });

  return (
    <>
      <button
        onClick={() => {
          form.store.state.values = { value: "kek", secondValue: 1337 };
          console.log("form", form.store.state.values);
        }}
      >
        test
      </button>
      <form.Field
        name="value"
        children={(field) => (
          <TestInput
            value={field.state.value}
            onChange={(e) => field.handleChange(e)}
          />
        )}
      />
      <form.Field
        name="secondValue"
        validators={{
          onChange: z.number().min(100),
          onBlur: z.number().min(100),
        }}
        children={(field) => {
          console.log("field", field.state);
          return (
            <TestInput
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e))}
              className={field.state.meta.errors.length > 0 ? "bg-red-500" : ""}
            />
          );
        }}
      />
    </>
  );
};

const TestInput = ({
  value,
  onChange,
  className,
}: {
  value: string | number;
  onChange: (v: string) => void;
  className?: string;
}) => {
  console.log("testinput render", value);
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
};
