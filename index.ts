import { Hono } from "hono";
import { Resource } from "sst";

const app = new Hono()
  .put("/*", async (c) => {
    const key = crypto.randomUUID();
    const honoReqBody = c.req.raw.body;
    const honoReqContentType = c.req.header("content-type");

    await Resource.MyBucket.put(key, honoReqBody, {
      httpMetadata: {
        contentType: honoReqContentType,
      },
    });

    return c.text(`Object created with key: ${key}`);
  })

  .get("/", async (c) => {
    const sortedObjects = await Resource.MyBucket.list().then((res) =>
      res.objects.toSorted(
        (a, b) => a.uploaded.getTime() - b.uploaded.getTime()
      )
    );

    if (sortedObjects.length > 0) {
      const oldestObject = sortedObjects[0];
      const result = await Resource.MyBucket.get(oldestObject.key);

      return c.json(result.body, {
        headers: {
          "content-type": result.httpMetadata.contentType,
        },
      });
    } else {
      return c.text("No objects found in the bucket", 404);
    }
  });

export default app;
