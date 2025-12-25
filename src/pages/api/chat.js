// src/pages/api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversation, user, message, threadId } = req.body;

  // Validate the API key is set
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Missing OpenRouter API key in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing API key' });
  }

  const referer = req.headers.origin || 'http://localhost';

  const systemPromptLines = [
    'You are Edutu, an empathetic African opportunity coach who helps learners uncover scholarships, training, and career pathways.',
    'Share practical, actionable recommendations and explain why they matter.',
    'Keep responses concise, friendly, and focused on steps a learner can take now.',
    'Prioritize opportunities and resources that are accessible to African students and young professionals.'
  ];

  if (user?.name || user?.age) {
    const learnerDetails = [
      user?.name ? `The learner is named ${user.name}.` : '',
      user?.age ? `They are ${user.age} years old.` : ''
    ]
      .filter(Boolean)
      .join(' ');

    if (learnerDetails) {
      systemPromptLines.push(learnerDetails);
    }
  }

  // Determine which format is being used
  let messages;
  if (conversation) {
    // Original format with conversation array
    messages = [
      { role: 'system', content: systemPromptLines.join(' ') },
      ...conversation
        .filter((message) => !message.isTyping && message.content.trim().length > 0)
        .map((message) => ({
          role: message.type === 'user' ? 'user' : 'assistant',
          content: message.content
        }))
    ];
  } else if (message) {
    // New format with single message and threadId
    // If we have a threadId, we could potentially load previous messages from storage
    // For now, just use the system message and the current user message
    messages = [
      { role: 'system', content: systemPromptLines.join(' ') },
      { role: 'user', content: message }
    ];
  } else {
    return res.status(400).json({ error: 'Either conversation or message must be provided' });
  }

  const requestBody = {
    model: 'z-ai/glm-4.6',
    messages: messages
  };

  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'Edutu'
      },
      body: JSON.stringify(requestBody)
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter error:', errorText);
      return res.status(openRouterResponse.status).json({ error: `OpenRouter error: ${errorText}` });
    }

    const data = await openRouterResponse.json();
    const aiMessage = data?.choices?.[0]?.message?.content;

    if (!aiMessage || typeof aiMessage !== 'string') {
      console.error('Unexpected OpenRouter response:', data);
      return res.status(500).json({ error: 'OpenRouter returned an unexpected response' });
    }

    res.status(200).json({ message: aiMessage.trim() });
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  runtime: 'edge', // Optional: Use edge runtime for faster responses
};