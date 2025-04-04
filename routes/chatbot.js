import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const conversations = new Map();

const LANGUAGE_INSTRUCTIONS = {
  en: "English",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  it: "Italian (Italiano)",
  pt: "Portuguese (Português)",
  nl: "Dutch (Nederlands)",
  ja: "Japanese (日本語)",
  zh: "Chinese (中文)",
  ko: "Korean (한국어)",
  ru: "Russian (Русский)",
  ar: "Arabic (العربية)",
  sv: "Swedish (Svenska)",
  no: "Norwegian (Norsk)",
  da: "Danish (Dansk)",
  fi: "Finnish (Suomi)",
  pl: "Polish (Polski)",
  el: "Greek (Ελληνικά)",
  cs: "Czech (Čeština)",
  hu: "Hungarian (Magyar)",
  ro: "Romanian (Română)",
  tr: "Turkish (Türkçe)",
  hi: "Hindi (हिन्दी)",
  th: "Thai (ไทย)",
  vi: "Vietnamese (Tiếng Việt)",
  id: "Indonesian (Bahasa Indonesia)",
  ms: "Malay (Bahasa Melayu)",
  tl: "Tagalog (Filipino)",
  he: "Hebrew (עברית)",
  uk: "Ukrainian (Українська)",
  fa: "Persian (فارسی)",
  bn: "Bengali (বাংলা)",
  sw: "Swahili (Kiswahili)",
  ur: "Urdu (اردو)"
};

router.post('/ask', async (req, res) => {
  try {
    const { message, language = 'en', sessionId = 'default' } = req.body;
    const languageName = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, { messages: [], context: { lastTopic: null, location: null } });
    }
    const conversation = conversations.get(sessionId);
    conversation.messages.push({ role: 'user', content: message });
    if (conversation.messages.length > 10) {
      conversation.messages = conversation.messages.slice(-10);
    }
    const contextAnalysisResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You're analyzing conversation context. Examine the message and determine:
          1. If it mentions a location (country, city, region), extract it.
          2. What topic is being discussed (cuisine, attractions, hotels, etc.)
          3. If it's a short reply to a previous question, note that.
          Format your response exactly as: {"location": "location name or null", "topic": "topic name or null", "isFollowUp": true/false}`
        },
        { role: 'user', content: `Previous context: ${JSON.stringify(conversation.context)}\nCurrent message: ${message}` }
      ],
      max_tokens: 150,
      temperature: 0.1,
    });
    let contextUpdate = { lastTopic: null, location: null };
    try {
      contextUpdate = JSON.parse(contextAnalysisResponse.choices[0].message?.content || '{}');
    } catch (e) {}
    conversation.context = {
      lastTopic: contextUpdate.topic || conversation.context.lastTopic,
      location: contextUpdate.location || conversation.context.location,
      isFollowUp: contextUpdate.isFollowUp || false
    };
    let systemInstruction = `You are a helpful tourist assistant chatbot. Provide informative and friendly responses about travel destinations, attractions, restaurants, local customs, and travel advice.
    IMPORTANT:
    - Respond in ${languageName}. Make sure your entire response is in this language.
    - Be conversational and engaging, not overly formal.
    - Keep responses concise but informative.`;
    if (conversation.context.location) {
      systemInstruction += `\n- The user is asking about ${conversation.context.location}.`;
    }
    if (conversation.context.lastTopic) {
      systemInstruction += `\n- The current topic is ${conversation.context.lastTopic}.`;
    }
    if (conversation.context.isFollowUp) {
      systemInstruction += `\n- This appears to be a follow-up to the previous conversation. Maintain context.`;
    }
    const classificationResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `You determine if a message can be interpreted as related to tourism, travel, destinations, attractions, restaurants, food, local customs, or travel advice.
          Respond with ONLY "yes" for:
          - Questions directly about travel, tourism, destinations, attractions
          - Questions about locations, food, cuisine, culture that could have a travel context
          - Brief messages that refer to previous travel-related questions
          - One-word location names or follow-ups to travel questions
          Be very permissive - if there's any way to interpret the query in a travel context, respond "yes".`
        },
        { role: 'user', content: `Previous context: ${JSON.stringify(conversation.context)}\nCurrent message: ${message}` }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });
    const isTravelRelated = classificationResponse.choices[0].message?.content?.toLowerCase().trim() === 'yes';
    let assistantMessage;
    if (isTravelRelated) {
      const fullConversation = [
        { role: 'system', content: systemInstruction },
        ...conversation.messages.slice(0, -1),
        { role: 'user', content: message }
      ];
      if (message.length < 20 && conversation.context.lastTopic && conversation.context.isFollowUp) {
        const topic = conversation.context.lastTopic;
        fullConversation[fullConversation.length - 1].content = `For ${message}, tell me about ${topic === 'cuisine' ? 'local foods and dishes' : topic}`;
      }
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: fullConversation,
        max_tokens: 500,
        temperature: 0.7,
      });
      assistantMessage = response.choices[0].message?.content || 'No response';
    } else {
      const translationResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `Translate the following message to ${languageName}:
            "I'm a tourist assistant and can only answer questions related to travel, destinations, attractions, restaurants, local customs, or travel advice. Could you please ask me about a specific travel destination, attraction, or travel planning advice?"`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });
      assistantMessage = translationResponse.choices[0].message?.content || "I'm a tourist assistant. Please ask travel-related questions.";
    }
    conversation.messages.push({ role: 'assistant', content: assistantMessage });
    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error('Error calling OpenAI API:', error?.response?.data || error.message || error);
    res.status(500).json({ error: 'Something went wrong with OpenAI.' });
  }
});

export default router;
