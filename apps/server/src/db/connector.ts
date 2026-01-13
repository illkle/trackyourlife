import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from "@powersync/web";

import { SyncEntry } from "@tyl/db/powersync-apply";

import { authClient } from "~/auth/client";

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data, error } = await authClient.token();
    if (error) {
      throw new Error("no auth");
    }
    const jwtToken = data.token;
    console.log("jwtToken", jwtToken);

    return {
      endpoint: import.meta.env.VITE_POWERSYNC_DOMAIN,
      // Use a development token (see Authentication Setup https://docs.powersync.com/installation/authentication-setup/development-tokens) to get up and running quickly
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

    await fetch("/api/powersync/syncbatch", {
      method: "POST",
      body: JSON.stringify(mapped),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await transaction.complete();
  }
}
