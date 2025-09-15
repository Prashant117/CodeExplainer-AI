import React, { useState, useRef, useEffect } from "react";

import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import { Code, Zap, Settings } from "lucide-react";

// Language detection function
const detectLanguage = (code) => {
  const lowerCode = code?.toLowerCase();

  // JavaScript/TypeScript patterns
  if (
    (lowerCode?.includes("import") && lowerCode?.includes("from")) ||
    lowerCode?.includes("require(") ||
    lowerCode?.includes("export") ||
    lowerCode?.includes("console.log") ||
    lowerCode?.includes("function") ||
    lowerCode?.includes("const ") ||
    lowerCode?.includes("let ") ||
    lowerCode?.includes("var ")
  ) {
    if (
      lowerCode?.includes("interface") ||
      lowerCode?.includes(": string") ||
      lowerCode?.includes(": number")
    ) {
      return "typescript";
    }
    return "javascript";
  }

  // Python patterns
  if (
    lowerCode?.includes("def ") ||
    lowerCode?.includes("import ") ||
    lowerCode?.includes("print(") ||
    lowerCode?.includes("if __name__") ||
    (lowerCode?.includes("class ") && lowerCode?.includes(":"))
  ) {
    return "python";
  }

  // Java patterns
  if (
    lowerCode?.includes("public class") ||
    lowerCode?.includes("public static void main") ||
    lowerCode?.includes("system.out.println")
  ) {
    return "java";
  }

  // C++ patterns
  if (
    lowerCode?.includes("#include") ||
    lowerCode?.includes("std::") ||
    lowerCode?.includes("cout <<")
  ) {
    return "cpp";
  }

  // React JSX patterns
  if (
    lowerCode?.includes("jsx") ||
    (lowerCode?.includes("<") && lowerCode?.includes("/>")) ||
    lowerCode?.includes("usestate") ||
    lowerCode?.includes("useeffect") ||
    lowerCode?.includes("return (")
  ) {
    return "jsx";
  }

  // HTML patterns
  if (
    lowerCode?.includes("<!doctype") ||
    lowerCode?.includes("<html") ||
    lowerCode?.includes("<body") ||
    lowerCode?.includes("<div")
  ) {
    return "html";
  }

  // CSS patterns
  if (
    lowerCode?.includes("{") &&
    lowerCode?.includes("}") &&
    (lowerCode?.includes("color:") ||
      lowerCode?.includes("font-") ||
      lowerCode?.includes("margin:"))
  ) {
    return "css";
  }

  return "javascript"; // Default fallback
};

const CodeInput = ({
  onSendMessage,
  onStreamMessage,
  isLoading,
  isConfigured,
  aiProvider,
}) => {
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "jsx", label: "React JSX" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "php", label: "PHP" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "other", label: "Other" },
  ];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef?.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea?.scrollHeight, 300)}px`;
    }
  }, [code]);

  // Auto-detect language when code changes
  useEffect(() => {
    if (code?.trim()?.length > 20) {
      const detected = detectLanguage(code);
      if (detected !== selectedLanguage) {
        setSelectedLanguage(detected);
      }
    }
  }, [code]);

  const handleSubmit = (streaming = false) => {
    if (!code?.trim() || isLoading) return;

    const message = {
      id: Date.now(),
      sender: "user",
      type: "code",
      content: code,
      code: code,
      language: selectedLanguage,
      timestamp: new Date(),
      streaming: streaming,
    };

    if (streaming && onStreamMessage) {
      setIsStreaming(true);
      onStreamMessage(message);
    } else {
      onSendMessage(message);
    }

    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter" && (e?.ctrlKey || e?.metaKey)) {
      e?.preventDefault();
      handleSubmit(false);
    } else if (e?.key === "Enter" && e?.shiftKey) {
      e?.preventDefault();
      handleSubmit(true); // Streaming mode
    }
  };

  const getPlaceholder = () => {
    if (!isConfigured) {
      return "Configure your AI provider first to analyze code...";
    }

    return `Paste your ${selectedLanguage} code here for AI analysis...
    
💡 Tips:
• Ctrl+Enter or Cmd+Enter: Standard analysis
• Shift+Enter: Streaming analysis (real-time)
• Code will be auto-detected for language`;
  };

  const getProviderIcon = () => {
    if (aiProvider === "openai") return "🤖";
    if (aiProvider === "gemini") return "✨";
    return "🔧";
  };

  useEffect(() => {
    if (!isLoading) {
      setIsStreaming(false);
    }
  }, [isLoading]);

  return (
    <div className="border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label
              htmlFor="language-select"
              className="text-sm font-medium text-foreground"
            >
              Language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-40 p-1 rounded border border-border bg-background text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {isConfigured && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{getProviderIcon()}</span>
              <span>
                {aiProvider === "openai" ? "OpenAI GPT" : "Google Gemini"} Ready
              </span>
            </div>
          )}
        </div>

        {/* Code Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e?.target?.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={!isConfigured}
            className={`w-full min-h-[120px] max-h-[300px] p-4 bg-background border border-border rounded-lg 
                       font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary 
                       focus:border-transparent transition-all
                       ${!isConfigured ? "opacity-50 cursor-not-allowed" : ""}`}
          />

          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {code?.length} chars
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConfigured ? (
              <>
                <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">
                  Ctrl+Enter
                </kbd>
                <span>Standard</span>
                <span>•</span>
                <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">
                  Shift+Enter
                </kbd>
                <span>Streaming</span>
              </>
            ) : (
              <>
                <Settings className="w-3 h-3" />
                <span>Configure AI provider to start analyzing code</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Streaming Button */}
            {isConfigured && onStreamMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={!code?.trim() || isLoading}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isStreaming ? "Streaming..." : "Stream"}
              </Button>
            )}

            {/* Standard Analysis Button */}
            <Button
              onClick={() => handleSubmit(false)}
              disabled={!code?.trim() || isLoading || !isConfigured}
              className="flex items-center gap-2 min-w-[100px]"
            >
              <Code className="w-4 h-4" />
              {isLoading && !isStreaming ? "Analyzing..." : "Analyze Code"}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        {!isConfigured && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
              <Settings className="w-4 h-4" />
              <span>
                Click "Configure AI" in the header to set up your OpenAI or
                Gemini API key.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeInput;
