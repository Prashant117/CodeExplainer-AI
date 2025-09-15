import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';


const AISettings = ({ isOpen, onClose, onSave }) => {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: ''
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    gemini: false
  });
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI (GPT)',
      description: 'Advanced reasoning, coding, and multimodal capabilities with GPT-5',
      features: ['Text Generation', 'Code Analysis', 'Image Analysis', 'Function Calling'],
      icon: '🤖'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Fast and efficient AI with multimodal understanding',
      features: ['Text Generation', 'Multimodal Input', 'Code Execution', 'Real-time Search'],
      icon: '✨'
    }
  ];

  useEffect(() => {
    // Load saved settings
    const savedProvider = localStorage.getItem('ai-provider') || 'openai';
    const savedOpenAIKey = localStorage.getItem('openai-api-key') || '';
    const savedGeminiKey = localStorage.getItem('gemini-api-key') || '';

    setSelectedProvider(savedProvider);
    setApiKeys({
      openai: savedOpenAIKey,
      gemini: savedGeminiKey
    });
  }, [isOpen]);

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
    // Clear error when user types
    if (errors?.[provider]) {
      setErrors(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const toggleShowApiKey = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev?.[provider]
    }));
  };

  const validateApiKey = (provider, key) => {
    if (!key?.trim()) {
      return `${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key is required`;
    }

    if (provider === 'openai') {
      if (!key?.startsWith('sk-')) {
        return 'OpenAI API key must start with "sk-"';
      }
      if (key?.length < 45) {
        return 'OpenAI API key appears to be invalid (too short)';
      }
    } else if (provider === 'gemini') {
      // More flexible Gemini key validation
      if (!key?.startsWith('AIza') && key?.length < 30) {
        return 'Gemini API key appears to be invalid. Please check the format.';
      }
      if (key?.length > 200) {
        return 'Gemini API key appears to be too long. Please check the key.';
      }
    }

    return null;
  };

  const handleSave = async () => {
    setIsValidating(true);
    const newErrors = {};

    // Validate current provider's API key
    const currentKeyError = validateApiKey(selectedProvider, apiKeys?.[selectedProvider]);
    if (currentKeyError) {
      newErrors[selectedProvider] = currentKeyError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors)?.length === 0) {
      // Save to localStorage
      localStorage.setItem('ai-provider', selectedProvider);
      localStorage.setItem('openai-api-key', apiKeys?.openai);
      localStorage.setItem('gemini-api-key', apiKeys?.gemini);

      // Callback to parent component
      onSave?.({
        provider: selectedProvider,
        apiKey: apiKeys?.[selectedProvider],
        allKeys: apiKeys
      });

      onClose();
    }

    setIsValidating(false);
  };

  const getKeyStatus = (provider) => {
    if (errors?.[provider]) {
      return 'error';
    }
    if (apiKeys?.[provider]?.trim()) {
      return 'valid';
    }
    return 'empty';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure your AI provider and API keys</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Provider Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">Choose AI Provider</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiProviders?.map((provider) => (
                <div
                  key={provider?.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProvider === provider?.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' :'border-border hover:border-border/80 hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedProvider(provider?.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{provider?.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{provider?.name}</h4>
                        {selectedProvider === provider?.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{provider?.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider?.features?.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-foreground">API Key Configuration</h3>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Security Notice
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                    API keys are stored locally in your browser and are never sent to our servers.
                    For production applications, consider using environment variables or a secure key management system.
                  </p>
                </div>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  OpenAI API Key
                  {selectedProvider === 'openai' && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  {getKeyStatus('openai') === 'valid' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {getKeyStatus('openai') === 'error' && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="relative">
                <Input
                  type={showApiKeys?.openai ? 'text' : 'password'}
                  value={apiKeys?.openai}
                  onChange={(e) => handleApiKeyChange('openai', e?.target?.value)}
                  placeholder="sk-..."
                  className={errors?.openai ? 'border-destructive' : ''}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => toggleShowApiKey('openai')}
                >
                  {showApiKeys?.openai ? '👁️' : '👁️‍🗨️'}
                </Button>
              </div>
              {errors?.openai && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors?.openai}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Google Gemini API Key
                  {selectedProvider === 'gemini' && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  {getKeyStatus('gemini') === 'valid' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {getKeyStatus('gemini') === 'error' && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="relative">
                <Input
                  type={showApiKeys?.gemini ? 'text' : 'password'}
                  value={apiKeys?.gemini}
                  onChange={(e) => handleApiKeyChange('gemini', e?.target?.value)}
                  placeholder="AIza..."
                  className={errors?.gemini ? 'border-destructive' : ''}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => toggleShowApiKey('gemini')}
                >
                  {showApiKeys?.gemini ? '👁️' : '👁️‍🗨️'}
                </Button>
              </div>
              {errors?.gemini && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors?.gemini}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isValidating}
              className="min-w-[100px]"
            >
              {isValidating ? 'Validating...' : 'Save & Apply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;