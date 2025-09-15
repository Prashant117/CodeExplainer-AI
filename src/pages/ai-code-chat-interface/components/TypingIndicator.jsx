import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const TypingIndicator = ({ aiProvider }) => {
  const getProviderIcon = () => {
    if (aiProvider === 'gemini') {
      return <Sparkles className="w-5 h-5" />;
    }
    return <Bot className="w-5 h-5" />;
  };

  const getProviderColor = () => {
    if (aiProvider === 'gemini') {
      return 'bg-purple-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  const getProviderName = () => {
    if (aiProvider === 'openai') return 'OpenAI';
    if (aiProvider === 'gemini') return 'Gemini';
    return 'AI';
  };

  return (
    <div className="flex gap-3 justify-start">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getProviderColor()}`}>
        {getProviderIcon()}
      </div>
      
      <div className="max-w-[85%] space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {getProviderName()} is analyzing...
          </span>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground">
              Analyzing your code...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;