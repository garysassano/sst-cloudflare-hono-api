import { Hono } from "hono";
import { Resource } from "sst";

const app = new Hono()
  .put("/*", async (c) => {
    const key = crypto.randomUUID();

    await Resource.MyBucket.put(key, c.req.raw.body, {
      httpMetadata: {
        contentType: c.req.header("content-type"),
      },
    });

    return c.text(`Object created with key: ${key}`);
  })

  .get("/", async (c) => {
    const sortedObjects = await Resource.MyBucket.list().then((res) =>
      res.objects.sort((x, y) => x.uploaded.getTime() - y.uploaded.getTime())
    );

    if (sortedObjects.length > 0) {
      const oldestObject = sortedObjects[0];
      const result = await Resource.MyBucket.get(oldestObject.key);

      return c.newResponse(result.body, {
        headers: {
          "content-type": result.httpMetadata.contentType,
        },
      });
    } else {
      return c.text("No objects found in the bucket", 404);
    }
  });

export default app;
