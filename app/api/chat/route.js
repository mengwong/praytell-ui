// app/api/chat-with-context/route.js
import weaviate from 'weaviate-ts-client';
import fetch from 'node-fetch';

const [ scheme, host ] = process.env.WEAVIATE_HOST.split('://')
const client = weaviate.client({
  scheme,
  host
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req) {
  const { message, location, datetime } = await req.json();

  // Find relevant context from Weaviate
  const result = await client.graphql
    .get()
    .withClassName('Praytell2')
    .withFields(['body', 'location', 'datetime'])
    .withNearText({ concepts: [message] })
    .withLimit(3)
    .do();

  const context = result.data.Get.Praytell2.map(m => ({
    content: m.content,
    location: m.location,
    datetime: m.datetime
  }));

  // Prepare messages for GPT-4
  const contextString = context.map(c => 
    `Message: ${c.body}\nLocation: ${c.location}\nDatetime: ${c.datetime}`
  ).join('\n\n');

  const messages = [
    { role: "system", content: "You are a helpful assistant. Consider the user's current location and the current datetime when formulating your response." },
    { role: "user", content: `Context:\n${contextString}\n\nCurrent User Location: ${location}\nCurrent Datetime: ${datetime}\n\nUser's message: ${message}` },
  ];

  // Query OpenAI with GPT-4 using node-fetch
  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        max_tokens: 150
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const completion = await openaiResponse.json();
    const reply = completion.choices[0].message.content.trim();

    return new Response(JSON.stringify({ reply, context }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}