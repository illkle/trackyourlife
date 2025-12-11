import { authClient } from "@/lib/authClient";
import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/react-native";

export class Connector implements PowerSyncBackendConnector {
  /**
   * Implement fetchCredentials to obtain a JWT from your authentication service.
   * See https://docs.powersync.com/installation/authentication-setup
   * If you're using Supabase or Firebase, you can re-use the JWT from those clients, see:
   * https://docs.powersync.com/installation/authentication-setup/supabase-auth
   * https://docs.powersync.com/installation/authentication-setup/firebase-auth
   */
  async fetchCredentials() {
    const { data, error } = await authClient.token();
    if (error) {
      throw new Error("no auth");
    }
    const jwtToken = data.token;
    // Use this token for authenticated requests to external services

    return {
      // The PowerSync instance URL or self-hosted endpoint
      endpoint: "https://tyl-powersync-vkfma0-97632a-188-225-87-82.illkle.com/",
      /**
       * To get started quickly, use a development token, see:
       * Authentication Setup https://docs.powersync.com/installation/authentication-setup/development-tokens) to get up and running quickly
       */
      token: jwtToken,
    };
  }

  /**
   * Implement uploadData to send local changes to your backend service.
   * You can omit this method if you only want to sync data from the database to the client
   * See example implementation here:https://docs.powersync.com/client-sdk-references/react-native-and-expo#3-integrate-with-your-backend
   *
   */

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
