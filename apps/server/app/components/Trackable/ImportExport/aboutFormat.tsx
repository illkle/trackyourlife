const formatExample = `z.object({
  date: z
    .string()
    .datetime() // this means 
    .transform((val) => new Date(val)),
  value: z.string(),
  createdAt: z.number().nullable().optional(),
  trackableRecordAttributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["text", "number", "boolean"]),
      }),
    )
    .optional(),
});
`;

export const aboutFormat = (
  <div className="grid grid-cols-2 grid-rows-[auto_1fr] gap-2 gap-x-8 max-sm:grid-cols-1">
    <div className="row-span-2">
      <pre className="mt-2 rounded-md border p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800">
        {formatExample}
      </pre>
      <p className="mt-1 text-xs opacity-30">
        This is actual JS code used to validate input JSON using{" "}
        <a className="underline" href="https://zod.dev/">
          ZOD
        </a>
      </p>
    </div>
    <p className="mt-2 max-sm:row-start-1">
      If you are parsing and transforming your own data, use the following
      format.
    </p>

    <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-400">
      Date is ISO string: {new Date().toISOString()}
      <br /> <br />
      Value is always string. Boolean is "true" or "false".
      <br /> Number is only numbers, no spaces or commas.
      <br />
      Decimals are written as "10.5".
    </p>
  </div>
);
