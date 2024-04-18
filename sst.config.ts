/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-cloudflare-hono-api",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
    };
  },

  async run() {
    const bucket = new sst.cloudflare.Bucket("MyBucket");

    const honoApi = new sst.cloudflare.Worker("HonoApi", {
      handler: "index.ts",
      url: true,
      link: [bucket],
    });

    return {
      url: honoApi.url,
    };
  },
});
