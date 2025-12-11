import { column, Schema, Table } from "@powersync/react-native";

const Trackable = new Table({
  user_id: column.text,
  name: column.text,
  type: column.text,
});

export const AppSchema = new Schema({
  Trackable,
});

export type Database = (typeof AppSchema)["types"];

// OR:
// export type Todo = RowType<typeof todos>;
//export type ListRecord = Database["lists"];
