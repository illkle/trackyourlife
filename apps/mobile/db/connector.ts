import { AuthClient } from "@/lib/authClient";
import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from "@powersync/react-native";
import { SyncEntry } from "@tyl/db/server/powersync-apply";

export class Connector implements PowerSyncBackendConnector {
  private powersyncURL: string;
  private authClient: AuthClient;
  private serverURL: string;

  constructor({
    powersyncURL,
    serverURL,
    authClient,
  }: {
    powersyncURL: string;
    serverURL: string;
    authClient: AuthClient;
  }) {
    this.serverURL = serverURL;
    this.powersyncURL = powersyncURL;
    this.authClient = authClient;
  }

  async fetchCredentials() {
    const { data, error } = await this.authClient.token();
    if (error) {
      throw new Error("no auth");
    }
    const jwtToken = data.token;

    return {
      endpoint: this.powersyncURL,
      token: jwtToken,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getCrudBatch(25);

    if (!transaction) {
      return;
    }

    const mapped = transaction.crud.map(
      (op) =>
        ({
          op: op.op,
          opData: op.opData,
          table: op.table,
          id: op.id,
        }) satisfies SyncEntry,
    );

    console.log("UPLOAD DATA", mapped);

    await fetch(`${this.serverURL}/api/powersync/syncbatch`, {
      method: "POST",
      body: JSON.stringify(mapped),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await transaction.complete();
  }
}
