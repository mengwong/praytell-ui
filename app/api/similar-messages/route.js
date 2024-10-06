// app/api/similar-messages/route.js
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: '192.168.252.60:8080', // Update this with your Weaviate instance address
});

export async function POST(req) {
  const { message } = await req.json();

  const result = await client.graphql
    .get()
    .withClassName('Message')
    .withFields(['content'])
    .withNearText({ concepts: [message] })
    .withLimit(3)
    .do();

  const similar = result.data.Get.Message.map(m => m.content);

  return new Response(JSON.stringify({ similar }), {
    headers: { 'Content-Type': 'application/json' },
  });
}