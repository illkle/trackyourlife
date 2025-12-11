import { authClient } from "@/lib/authClient";
import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/react-native";

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data, error } = await authClient.token();
    if (error) {
      throw new Error("no auth");
    }
    const jwtToken = data.token;
    console.log("jwtToken", jwtToken);

    return {
      endpoint: "https://tyl-dev.illkle.com/powersync",
      token: jwtToken,
    };
  }

  // TODO
  async uploadData(database: AbstractPowerSyncDatabase) {
    // batched crud transactions, use data.getCrudBatch(n);
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    for (const op of transaction.crud) {
      // The data that needs to be changed in the remote db
      const record = { ...op.opData, id: op.id };
      switch (op.op) {
        case UpdateType.PUT:
          // TODO: Instruct your backend API to CREATE a record
          break;
        case UpdateType.PATCH:
          // TODO: Instruct your backend API to PATCH a record
          break;
        case UpdateType.DELETE:
          //TODO: Instruct your backend API to DELETE a record
          break;
      }
    }

    // Completes the transaction and moves onto the next one
    await transaction.complete();
  }
}
