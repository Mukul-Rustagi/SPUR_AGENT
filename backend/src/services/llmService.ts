import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "./conversationService.js";
import { cacheService } from "./cacheService.js";

const STORE_KNOWLEDGE = `
You are a helpful and friendly customer support agent for "SpurStore", a small e-commerce store specializing in tech accessories and gadgets.

Store Information:
- Shipping Policy: We offer free shipping on orders over $50. Standard shipping (5-7 business days) is $5.99. Express shipping (2-3 business days) is $12.99. We ship to USA, Canada, UK, and Australia.
- Return/Refund Policy: Items can be returned within 30 days of purchase in original condition. Full refunds are processed within 5-7 business days after we receive the item. Items must be unopened and in original packaging.
- Support Hours: Our support team is available Monday-Friday, 9 AM - 6 PM EST. We respond to emails within 24 hours.
- Payment Methods: We accept all major credit cards, PayPal, Apple Pay, and Google Pay.
- Product Warranty: All products come with a 1-year manufacturer warranty. Extended warranties available at checkout.

Guidelines:
- Be concise and helpful (2-3 sentences max per response)
- Use a friendly, professional tone
- If asked about something not in your knowledge base, politely say you'll need to check with the team and ask them to email support@spurstore.com
- Always end with a helpful follow-up question or offer to help with something else
`;

export class LLMService {
  private readonly maxTokens = 200;
  private readonly maxHistoryMessages = 10;

  private getProvider(): 'openai' | 'groq' | 'gemini' {
    const llmProvider = (process.env.LLM_PROVIDER || 'openai').toLowerCase().trim();
    
    if (llmProvider === 'groq') {
      return 'groq';
    } else if (llmProvider === 'gemini') {
      return 'gemini';
    } else {
      return 'openai';
    }
  }

  async generateReply(
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<string> {
    if (conversationHistory.length === 0) {
      const cached = await cacheService.get(userMessage);
      if (cached) {
        console.log("💾 Cache hit");
        return cached;
      }
    }

    const provider = this.getProvider();
    
    let reply: string;
    switch (provider) {
      case "groq":
        reply = await this.generateWithGroq(userMessage, conversationHistory);
        break;
      case "gemini":
        reply = await this.generateWithGemini(userMessage, conversationHistory);
        break;
      case "openai":
      default:
        reply = await this.generateWithOpenAI(userMessage, conversationHistory);
        break;
    }

    if (conversationHistory.length === 0) {
      await cacheService.set(userMessage, reply);
    }

    return reply;
  }

  private async generateWithGroq(
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<string> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY || 
        GROQ_API_KEY.trim() === '' || 
        GROQ_API_KEY === 'your_groq_api_key_here' ||
        !GROQ_API_KEY.startsWith('gsk_')) {
      throw new Error(
        'Groq API key not configured. Please set a valid GROQ_API_KEY in backend/.env file. Get free key at https://console.groq.com/keys'
      );
    }

    try {
      const groq = new OpenAI({
        apiKey: GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const recentHistory = conversationHistory.slice(-this.maxHistoryMessages);
      
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: STORE_KNOWLEDGE,
        },
        ...recentHistory.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim();

      if (!reply) {
        throw new Error('Empty response from Groq');
      }

      return reply;
    } catch (error: any) {
      return this.handleError(error, 'Groq');
    }
  }

  private async generateWithGemini(
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<string> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error(
        'Gemini API key not configured. Please set GEMINI_API_KEY in backend/.env file. Get free key at https://aistudio.google.com/app/apikey'
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: 0.7,
        },
      });

      const recentHistory = conversationHistory.slice(-this.maxHistoryMessages);
      let conversationContext = STORE_KNOWLEDGE + '\n\nConversation History:\n';
      
      for (const msg of recentHistory) {
        conversationContext += `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.text}\n`;
      }
      
      conversationContext += `\nCustomer: ${userMessage}\nAgent:`;

      const result = await model.generateContent(conversationContext);
      const response = await result.response;
      const reply = response.text().trim();

      if (!reply) {
        throw new Error('Empty response from Gemini');
      }

      return reply;
    } catch (error: any) {
      return this.handleError(error, 'Gemini');
    }
  }

  private async generateWithOpenAI(
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    const isValidApiKey = OPENAI_API_KEY && 
      OPENAI_API_KEY.trim() !== '' && 
      OPENAI_API_KEY !== 'your_openai_api_key_here' &&
      OPENAI_API_KEY.startsWith('sk-');

    if (!isValidApiKey) {
      throw new Error(
        'OpenAI API key not configured. Please set a valid OPENAI_API_KEY in backend/.env file. Get your key at https://platform.openai.com/api-keys'
      );
    }

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY! });

      const recentHistory = conversationHistory.slice(-this.maxHistoryMessages);
      
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: STORE_KNOWLEDGE,
        },
        ...recentHistory.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim();

      if (!reply) {
        throw new Error('Empty response from OpenAI');
      }

      return reply;
    } catch (error: any) {
      return this.handleError(error, 'OpenAI');
    }
  }

  private handleError(error: any, provider: string): never {
    const status = error?.status || error?.response?.status;
    
    if (status === 401) {
      throw new Error(`Invalid ${provider} API key. Please check your API key.`);
    }
    if (status === 429) {
      throw new Error(
        `${provider} rate limit exceeded. Please wait a moment and try again.`
      );
    }
    if (status === 503) {
      throw new Error(
        `${provider} service temporarily unavailable. Please try again in a moment.`
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error(
        `Request to ${provider} timed out. Please try again.`
      );
    }

    console.error(`${provider} Error:`, error);
    throw new Error(
      `Failed to generate reply with ${provider}: ${error.message || 'Unknown error'}`
    );
  }
}

export const llmService = new LLMService();
