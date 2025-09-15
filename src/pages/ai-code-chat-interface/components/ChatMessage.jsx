import React, { useState } from 'react';
import { Copy, User, Bot, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import Button from '../../../components/ui/Button';

// Syntax highlighting function (basic implementation)
const highlightSyntax = (code, language) => {
  if (!code) return code;
  
  // This is a basic implementation. In a real app, you'd use a proper syntax highlighting library
  let highlighted = code;
  
  // Basic keyword highlighting for JavaScript
  if (language === 'javascript' || language === 'typescript' || language === 'jsx') {
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'from'];
    keywords?.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted?.replace(regex, `<span class="text-blue-600 dark:text-blue-400 font-medium">${keyword}</span>`);
    });
  }
  
  return highlighted;
};

const formatMessageContent = (content, relatedCode, language) => {
  if (!content) return '';
  
  // Convert markdown-style formatting
  let formatted = content?.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')?.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')?.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-accent rounded text-accent-foreground font-mono text-sm">$1</code>')?.replace(/#{1,3}\s+(.*?)(?:\n|$)/g, '<h3 class="text-lg font-semibold text-foreground mt-4 mb-2">$1</h3>')?.replace(/\n\n/g, '</p><p class="mb-3">')?.replace(/\n/g, '<br>');
  
  // Wrap in paragraph tags
  if (!formatted?.includes('<p>') && !formatted?.includes('<h3>')) {
    formatted = `<p class="mb-3">${formatted}</p>`;
  }
  
  return formatted;
};

const ChatMessage = ({ message, onCopyCode }) => {
  const [showFullCode, setShowFullCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyCode?.();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getMessageIcon = () => {
    switch (message?.sender) {
      case 'user':
        return <User className="w-5 h-5" />;
      case 'ai':
        return message?.provider === 'gemini' ? 
          <Sparkles className="w-5 h-5" /> : 
          <Bot className="w-5 h-5" />;
      case 'system':
        return message?.type === 'error' ? 
          <AlertCircle className="w-5 h-5" /> : 
          message?.type === 'success' ?
          <CheckCircle2 className="w-5 h-5" /> :
          <Info className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getMessageColor = () => {
    switch (message?.sender) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'ai':
        return message?.provider === 'gemini'? 'bg-purple-500 text-white': 'bg-blue-500 text-white';
      case 'system':
        return message?.type === 'error'? 'bg-destructive text-destructive-foreground' : 
          message?.type === 'success'? 'bg-green-500 text-white': 'bg-muted text-muted-foreground';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  const getProviderLabel = () => {
    if (message?.provider === 'openai') return '🤖 OpenAI';
    if (message?.provider === 'gemini') return '✨ Gemini';
    return 'AI';
  };

  const shouldTruncateCode = message?.code && message?.code?.length > 500;
  const displayCode = shouldTruncateCode && !showFullCode 
    ? message?.code?.slice(0, 500) + '...'
    : message?.code;

  return (
    <div className={`flex gap-3 ${message?.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message?.sender !== 'user' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getMessageColor()}`}>
          {getMessageIcon()}
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${message?.sender === 'user' ? 'order-first' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 text-xs ${message?.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <span className="text-muted-foreground">
            {message?.sender === 'user' ? 'You' : 
             message?.sender === 'ai' ? getProviderLabel() :
             message?.sender === 'system' ? 'System' : 'AI'}
          </span>
          <span className="text-muted-foreground">
            {message?.timestamp ? 
              (message?.timestamp instanceof Date ? 
                message?.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                new Date(message?.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              ) : 
              new Date()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </span>
          {message?.streaming && (
            <span className="text-blue-500 text-xs flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Streaming
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-lg p-4 ${
          message?.sender === 'user' ?'bg-primary text-primary-foreground' :'bg-card border border-border'
        }`}>
          {/* Code Block for User Messages */}
          {message?.sender === 'user' && message?.code && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-90">
                  {message?.language?.charAt(0)?.toUpperCase() + message?.language?.slice(1)} Code
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(message?.code)}
                  className="text-primary-foreground/80 hover:text-primary-foreground h-auto p-1"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="bg-black/20 rounded p-3 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{ 
                    __html: highlightSyntax(displayCode, message?.language) 
                  }} />
                </pre>
                {shouldTruncateCode && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowFullCode(!showFullCode)}
                    className="text-primary-foreground/80 hover:text-primary-foreground mt-2 h-auto p-0 text-xs"
                  >
                    {showFullCode ? 'Show Less' : 'Show Full Code'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Regular Content */}
          {message?.content && (
            <div 
              className={`prose prose-sm max-w-none ${
                message?.sender === 'user' ?'text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground' :'text-foreground prose-headings:text-foreground prose-strong:text-foreground'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: formatMessageContent(message?.content, message?.relatedCode, message?.language) 
              }}
            />
          )}

          {/* Copy Button for AI Responses */}
          {message?.sender === 'ai' && message?.content && (
            <div className="flex justify-end mt-3 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(message?.content)}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Response'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {message?.sender === 'user' && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getMessageColor()}`}>
          {getMessageIcon()}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;