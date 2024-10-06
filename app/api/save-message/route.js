// app/api/save-message/route.js
import weaviate from 'weaviate-ts-client';

const [ scheme, host ] = process.env.WEAVIATE_HOST.split('://')
const client = weaviate.client({
  scheme,
  host
});

export async function POST(req) {
  try {
    const { message, role, location, datetime } = await req.json();

    // Validate input
    if (!message || !role || !location || !datetime) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save message to Weaviate
    const result = await client.data
      .creator()
      .withClassName('Praytell2')
      .withProperties({
        body: message,
        role: role,
        location: location,
        datetime: datetime
      })
      .do();

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return new Response(JSON.stringify({ error: 'Failed to save message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}