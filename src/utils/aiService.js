import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.currentProvider = null;
    this.openaiClient = null;
    this.geminiClient = null;
    this.initialized = false;
  }

  // Initialize the AI service with provider and API key
  initialize(provider, apiKey) {
    try {
      this.currentProvider = provider;

      if (provider === 'openai') {
        this.openaiClient = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });
      } else if (provider === 'gemini') {
        this.geminiClient = new GoogleGenerativeAI(apiKey);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      this.initialized = false;
      return false;
    }
  }

  // Check if service is ready
  isReady() {
    return this.initialized && this.currentProvider && 
           ((this.currentProvider === 'openai' && this.openaiClient) ||
            (this.currentProvider === 'gemini' && this.geminiClient));
  }

  // Get provider info
  getProviderInfo() {
    const providers = {
      openai: {
        name: 'OpenAI (GPT)',
        model: 'gpt-4-turbo',
        icon: '🤖'
      },
      gemini: {
        name: 'Google Gemini',
        model: 'gemini-1.5-flash',
        icon: '✨'
      }
    };

    return providers?.[this.currentProvider] || null;
  }

  // Analyze code with selected provider
  async analyzeCode(code, language = 'javascript') {
    if (!this.isReady()) {
      throw new Error('AI service not initialized. Please configure your API key.');
    }

    try {
      if (this.currentProvider === 'openai') {
        return await this.analyzeCodeOpenAI(code, language);
      } else if (this.currentProvider === 'gemini') {
        return await this.analyzeCodeGemini(code, language);
      }
    } catch (error) {
      console.error('Code analysis failed:', error);
      
      // Enhanced error handling with provider-specific messages
      if (this.currentProvider === 'gemini') {
        if (error?.message?.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key in the settings.');
        }
        if (error?.message?.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please check your usage limits.');
        }
        if (error?.message?.includes('SAFETY')) {
          throw new Error('Content blocked by Gemini safety filters. Please try different code.');
        }
      } else if (this.currentProvider === 'openai') {
        if (error?.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key in the settings.');
        }
        if (error?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please wait and try again.');
        }
      }
      
      throw error;
    }
  }

  // OpenAI code analysis
  async analyzeCodeOpenAI(code, language) {
    const systemPrompt = `You are an expert code analyzer and educator. Analyze the provided code and explain it in a clear, educational manner. Focus on:

1. **Code Structure**: Explain the overall structure and organization
2. **Key Concepts**: Identify and explain programming concepts used
3. **Functionality**: Describe what the code does step by step
4. **Best Practices**: Point out good practices and potential improvements
5. **Learning Points**: Highlight important concepts for learning

Make your explanation beginner-friendly but thorough. Use clear headings and bullet points for better readability.`;

    try {
      const response = await this.openaiClient?.chat?.completions?.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` 
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return response?.choices?.[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw error;
    }
  }

  // Gemini code analysis
  async analyzeCodeGemini(code, language) {
    try {
      const model = this.geminiClient?.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          }
        ]
      });

      const prompt = `You are an expert code analyzer and educator. Analyze the provided ${language} code and explain it in a clear, educational manner. Focus on:

1. **Code Structure**: Explain the overall structure and organization
2. **Key Concepts**: Identify and explain programming concepts used  
3. **Functionality**: Describe what the code does step by step
4. **Best Practices**: Point out good practices and potential improvements
5. **Learning Points**: Highlight important concepts for learning

Make your explanation beginner-friendly but thorough. Use clear headings and bullet points for better readability.

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

      const result = await model?.generateContent(prompt);
      const response = await result?.response;
      
      if (!response) {
        throw new Error('No response received from Gemini API');
      }
      
      return response?.text();
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      throw error;
    }
  }

  // Stream code analysis
  async streamCodeAnalysis(code, language, onChunk) {
    if (!this.isReady()) {
      throw new Error('AI service not initialized. Please configure your API key.');
    }

    try {
      if (this.currentProvider === 'openai') {
        return await this.streamOpenAI(code, language, onChunk);
      } else if (this.currentProvider === 'gemini') {
        return await this.streamGemini(code, language, onChunk);
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      throw error;
    }
  }

  // OpenAI streaming
  async streamOpenAI(code, language, onChunk) {
    const systemPrompt = `You are an expert code analyzer and educator. Analyze the provided code and explain it in a clear, educational manner suitable for learning programming concepts.`;

    try {
      const stream = await this.openaiClient?.chat?.completions?.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` 
          }
        ],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      });

      for await (const chunk of stream) {
        const content = chunk?.choices?.[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('OpenAI streaming failed:', error);
      throw error;
    }
  }

  // Gemini streaming
  async streamGemini(code, language, onChunk) {
    try {
      const model = this.geminiClient?.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      });

      const prompt = `Analyze and explain this ${language} code in a clear, educational manner:

\`\`\`${language}
${code}
\`\`\``;

      const result = await model?.generateContentStream(prompt);

      for await (const chunk of result?.stream) {
        const text = chunk?.text();
        if (text) {
          onChunk(text);
        }
      }
    } catch (error) {
      console.error('Gemini streaming failed:', error);
      throw error;
    }
  }

  // Get coding insights based on user's coding patterns
  async getCodingInsights(codeHistory) {
    if (!this.isReady()) {
      throw new Error('AI service not initialized. Please configure your API key.');
    }

    const languages = [...new Set(codeHistory.map(item => item.language))];
    const totalSessions = codeHistory?.length;
    const recentPatterns = codeHistory?.slice(-10); // Last 10 sessions

    const insightsPrompt = `Based on the user's coding history, provide personalized insights:

**Coding Statistics:**
- Total code analysis sessions: ${totalSessions}
- Languages used: ${languages?.join(', ')}
- Recent coding patterns: ${recentPatterns?.map(p => p?.language)?.join(', ')}

**Recent Code Topics:**
${recentPatterns?.map((item, i) => `${i + 1}. ${item?.language}: ${item?.topic || 'General analysis'}`)?.join('\n')}

Provide:
1. **Learning Progress**: What concepts the user seems to be working on
2. **Skill Assessment**: Areas of strength and improvement
3. **Recommendations**: Next steps for learning
4. **Practice Suggestions**: Specific coding exercises or projects

Keep it encouraging and actionable.`;

    try {
      if (this.currentProvider === 'openai') {
        const response = await this.openaiClient?.chat?.completions?.create({
          model: 'gpt-4-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a supportive coding mentor who provides personalized learning insights.' 
            },
            { role: 'user', content: insightsPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.8
        });

        return response?.choices?.[0]?.message?.content;
      } else if (this.currentProvider === 'gemini') {
        const model = this.geminiClient?.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.8,
          }
        });

        const result = await model?.generateContent(insightsPrompt);
        const response = await result?.response;
        return response?.text();
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }

  // Test API key validity
  async testConnection() {
    if (!this.isReady()) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      if (this.currentProvider === 'openai') {
        const response = await this.openaiClient?.chat?.completions?.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
          ],
          max_tokens: 20
        });

        return { 
          success: true, 
          message: response?.choices?.[0]?.message?.content || 'Connection successful',
          provider: 'OpenAI'
        };
      } else if (this.currentProvider === 'gemini') {
        const model = this.geminiClient?.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 20,
            temperature: 0.1,
          }
        });

        const result = await model?.generateContent('Hello, this is a connection test. Please respond with "Connection successful".');
        const response = await result?.response;

        return {
          success: true,
          message: response?.text() || 'Connection successful',
          provider: 'Google Gemini'
        };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      let errorMessage = error?.message || 'Unknown connection error';
      
      // Provide more specific error messages
      if (this.currentProvider === 'gemini') {
        if (error?.message?.includes('API_KEY_INVALID')) {
          errorMessage = 'Invalid API key. Please check your Gemini API key.';
        } else if (error?.message?.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      } else if (this.currentProvider === 'openai') {
        if (error?.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (error?.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait and try again.';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        provider: this.currentProvider
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;