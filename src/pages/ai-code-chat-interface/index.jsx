import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
// import Header from '../../components/ui/Header';
import ConversationArea from './components/ConversationArea';
import CodeInput from './components/CodeInput';
import AISettings from '../../components/ui/AISettings';
import aiService from '../../utils/aiService';
import { Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

const AiCodeChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    provider: null,
    apiKey: null,
    isConfigured: false
  });
  const [connectionStatus, setConnectionStatus] = useState('unchecked'); // unchecked, checking, success, error

  // Load configuration and initialize AI service
  useEffect(() => {
    const loadConfiguration = () => {
      const provider = localStorage.getItem('ai-provider');
      const openaiKey = localStorage.getItem('openai-api-key');
      const geminiKey = localStorage.getItem('gemini-api-key');

      if (provider && ((provider === 'openai' && openaiKey) || (provider === 'gemini' && geminiKey))) {
        const apiKey = provider === 'openai' ? openaiKey : geminiKey;
        const success = aiService?.initialize(provider, apiKey);
        
        setAiConfig({
          provider,
          apiKey,
          isConfigured: success
        });

        if (success) {
          testConnection();
        }
      }
    };

    loadConfiguration();
  }, []);

  // Load conversation from localStorage
  useEffect(() => {
    const savedConversation = localStorage.getItem('ai-code-chat-conversation');
    if (savedConversation) {
      try {
        const parsed = JSON.parse(savedConversation);
        setMessages(parsed?.messages || []);
        setConversationId(parsed?.id || null);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages?.length > 0 && conversationId) {
      const conversationData = {
        id: conversationId,
        messages,
        lastUpdated: new Date()?.toISOString(),
        provider: aiConfig?.provider,
        totalMessages: messages?.length
      };
      localStorage.setItem('ai-code-chat-conversation', JSON.stringify(conversationData));
    }
  }, [messages, conversationId, aiConfig?.provider]);

  const testConnection = async () => {
    if (!aiService?.isReady()) return;
    
    setConnectionStatus('checking');
    try {
      const result = await aiService?.testConnection();
      setConnectionStatus(result?.success ? 'success' : 'error');
      
      // Show connection result message
      if (result?.success) {
        console.log(`✅ ${result?.provider} connection successful:`, result?.message);
      } else {
        console.error(`❌ ${result?.provider || aiConfig?.provider} connection failed:`, result?.error);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
    }
  };

  const handleSettingsSave = (config) => {
    const success = aiService?.initialize(config?.provider, config?.apiKey);
    
    setAiConfig({
      provider: config?.provider,
      apiKey: config?.apiKey,
      isConfigured: success
    });

    if (success) {
      // Test connection after successful initialization
      setTimeout(() => {
        testConnection();
      }, 500);
      
      // Show success message
      const successMessage = {
        id: Date.now(),
        sender: 'system',
        type: 'success',
        content: `🎉 Successfully configured ${config?.provider === 'openai' ? 'OpenAI (GPT)' : 'Google Gemini'}! Testing connection...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
      if (!conversationId) {
        setConversationId(Date.now());
      }
    } else {
      // Show error message
      const errorMessage = {
        id: Date.now(),
        sender: 'system',
        type: 'error',
        content: `❌ Failed to configure ${config?.provider === 'openai' ? 'OpenAI (GPT)' : 'Google Gemini'}. Please check your API key and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async (message) => {
    if (!aiConfig?.isConfigured) {
      setShowSettings(true);
      return;
    }

    setMessages(prev => [...prev, message]);
    setIsLoading(true);

    if (!conversationId) {
      setConversationId(Date.now());
    }

    try {
      const response = await aiService?.analyzeCode(message?.code, message?.language);
      
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        type: 'explanation',
        content: response,
        timestamp: new Date(),
        relatedCode: message?.code,
        provider: aiConfig?.provider
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'system',
        type: 'error',
        content: `❌ **Error**: ${error?.message}\n\nPlease check your API key configuration or try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamMessage = async (message) => {
    if (!aiConfig?.isConfigured) {
      setShowSettings(true);
      return;
    }

    setMessages(prev => [...prev, message]);
    setIsLoading(true);

    if (!conversationId) {
      setConversationId(Date.now());
    }

    // Create AI response placeholder
    const aiResponseId = Date.now() + 1;
    const aiResponse = {
      id: aiResponseId,
      sender: 'ai',
      type: 'explanation',
      content: '',
      timestamp: new Date(),
      relatedCode: message?.code,
      provider: aiConfig?.provider,
      streaming: true
    };

    setMessages(prev => [...prev, aiResponse]);

    try {
      await aiService?.streamCodeAnalysis(
        message?.code, 
        message?.language, 
        (chunk) => {
          setMessages(prev => prev?.map(msg => 
            msg?.id === aiResponseId 
              ? { ...msg, content: msg?.content + chunk }
              : msg
          ));
        }
      );

      // Mark streaming as complete
      setMessages(prev => prev?.map(msg => 
        msg?.id === aiResponseId 
          ? { ...msg, streaming: false }
          : msg
      ));
    } catch (error) {
      console.error('Streaming failed:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        sender: 'system',
        type: 'error',
        content: `❌ **Streaming Error**: ${error?.message}\n\nPlease check your configuration or try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('ai-code-chat-conversation');
  };

  const handleCopyCode = () => {
    // Could show a toast notification here
    console.log('Code copied to clipboard');
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-2 h-2 bg-muted-foreground rounded-full" />;
    }
  };

  const getProviderDisplay = () => {
    if (!aiConfig?.isConfigured) return 'Not Configured';
    const info = aiService?.getProviderInfo();
    return info ? `${info?.icon} ${info?.name}` : aiConfig?.provider;
  };

  return (
    <>
      <Helmet>
        <title>CodeExplainer AI</title>
        <meta name="description" content="Get intelligent explanations for your code snippets through conversational AI interaction. Perfect for learning and understanding programming concepts." />
        <meta name="keywords" content="AI code explanation, programming help, code analysis, learn coding, code chat" />
      </Helmet>
      {/* <div className="min-h-screen bg-background"> */}
        {/* <Header /> */}
        
        {/* AI Configuration Bar */}
        {/* <div className="pt-16 border-b border-border bg-card/500 backdrop-blur-sm"> */}
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-foreground">
                  AI Provider: {getProviderDisplay()}
                </span>
              </div>
              {connectionStatus === 'success' && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  Connected
                </span>
              )}
              {connectionStatus === 'error' && (
                <span className="text-xs text-destructive">
                  Connection Failed
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure AI
            </Button>
          </div>
        {/* </div> */}

        <main className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Conversation Area */}
            <div className="flex-1 flex flex-col">
              <ConversationArea
                messages={messages}
                isLoading={isLoading}
                onNewConversation={handleNewConversation}
                onCopyCode={handleCopyCode}
                aiProvider={aiConfig?.provider}
                isConfigured={aiConfig?.isConfigured}
                onConfigureAI={() => setShowSettings(true)}
              />
            </div>
          </div>

          {/* Code Input Panel */}
          <div className="lg:border-t-0 border-t border-border">
            <CodeInput
              onSendMessage={handleSendMessage}
              onStreamMessage={handleStreamMessage}
              isLoading={isLoading}
              isConfigured={aiConfig?.isConfigured}
              aiProvider={aiConfig?.provider}
            />
          </div>
        </main>

        {/* Settings Modal */}
        <AISettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      {/* </div> */}
    </>
  );
};

export default AiCodeChatInterface;