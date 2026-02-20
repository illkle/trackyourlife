import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from "@powersync/web";

import { SyncEntry } from "@tyl/db/server/powersync-apply";

import { authClient } from "~/auth/client";

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data, error } = await authClient.token();
    if (error) {
      throw new Error("no auth");
    }
    const jwtToken = data.token;
    console.log("JWT TOKEN", jwtToken);
    console.log("POWERSYNC DOMAIN", import.meta.env.VITE_POWERSYNC_DOMAIN);

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

    console.log("CALLING /api/powersync/syncbatch", mapped);

    const res = await fetch("/api/powersync/syncbatch", {
      method: "POST",
      body: JSON.stringify(mapped),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("res /api/powersync/syncbatch", res.status);

    await transaction.complete();

    console.log("await transaction.complete() finished");
  }
}
