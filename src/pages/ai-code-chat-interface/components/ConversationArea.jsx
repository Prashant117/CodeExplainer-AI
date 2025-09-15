import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { Plus, Settings, Code, MessageCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';


const ConversationArea = ({ 
  messages, 
  isLoading, 
  onNewConversation, 
  onCopyCode, 
  aiProvider,
  isConfigured,
  onConfigureAI
}) => {
  const messagesEndRef = useRef(null);
  const conversationRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getProviderIcon = () => {
    if (aiProvider === 'openai') return '🤖';
    if (aiProvider === 'gemini') return '✨';
    return '🔧';
  };

  const getProviderName = () => {
    if (aiProvider === 'openai') return 'OpenAI (GPT)';
    if (aiProvider === 'gemini') return 'Google Gemini';
    return 'AI Provider';
  };

  // Empty state when no messages and not configured
  const renderEmptyState = () => {
    if (!isConfigured) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">Welcome to CodeExplainer AI</h2>
              <p className="text-muted-foreground leading-relaxed">
                To get started, you need to configure your AI provider and API key. 
                Choose between OpenAI's powerful GPT models or Google's efficient Gemini AI.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={onConfigureAI} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure AI Provider
              </Button>
              <div className="text-xs text-muted-foreground">
                Your API keys are stored securely in your browser
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Empty state when configured but no messages
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Code className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              {getProviderIcon()} Ready to Analyze Code!
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connected to <span className="font-medium text-foreground">{getProviderName()}</span>. 
              Paste your code below to get intelligent explanations, identify patterns, 
              and learn programming concepts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-accent/50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="font-medium mb-1">Smart Analysis</div>
              <div className="text-muted-foreground text-xs">
                Understand code structure and logic
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <Code className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="font-medium mb-1">Multi-Language</div>
              <div className="text-muted-foreground text-xs">
                JavaScript, Python, React, and more
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="text-lg mx-auto mb-2 w-5 h-5 flex items-center justify-center">
                🎓
              </div>
              <div className="font-medium mb-1">Learn & Improve</div>
              <div className="text-muted-foreground text-xs">
                Get tips and best practices
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">
              AI Code Analysis
            </h1>
            <p className="text-xs text-muted-foreground">
              {isConfigured ? `Powered by ${getProviderName()}` : 'Configure AI to get started'}
            </p>
          </div>
        </div>

        {messages?.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewConversation}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        )}
      </div>

      {/* Messages Area */}
      {messages?.length === 0 ? (
        renderEmptyState()
      ) : (
        <div 
          ref={conversationRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages?.map((message) => (
            <ChatMessage
              key={message?.id}
              message={message}
              onCopyCode={onCopyCode}
            />
          ))}

          {isLoading && <TypingIndicator aiProvider={aiProvider} />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ConversationArea;