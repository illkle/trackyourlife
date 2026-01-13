import { UpdateType } from "@powersync/web";

import { authClient } from "~/auth/client";

export class Connector {
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

  async uploadData() {
    // Implement uploadData to send local changes to your backend service.
    // You can omit this method if you only want to sync data from the database to the client
    // See example implementation here: https://docs.powersync.com/client-sdk-references/javascript-web#3-integrate-with-your-backend
  }
}
