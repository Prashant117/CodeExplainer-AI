import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConversationCard = ({ conversation, onResume, onDelete, onArchive }) => {
  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date?.toLocaleDateString();
    }
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: 'FileText',
      python: 'Code',
      java: 'Coffee',
      cpp: 'Zap',
      html: 'Globe',
      css: 'Palette',
      react: 'Component',
      default: 'Code2'
    };
    return icons?.[language] || icons?.default;
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'text-yellow-600 bg-yellow-50',
      python: 'text-blue-600 bg-blue-50',
      java: 'text-red-600 bg-red-50',
      cpp: 'text-purple-600 bg-purple-50',
      html: 'text-orange-600 bg-orange-50',
      css: 'text-pink-600 bg-pink-50',
      react: 'text-cyan-600 bg-cyan-50',
      default: 'text-gray-600 bg-gray-50'
    };
    return colors?.[language] || colors?.default;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getLanguageColor(conversation?.language)}`}>
            <Icon name={getLanguageIcon(conversation?.language)} size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {conversation?.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {formatDate(conversation?.lastActivity)}
              </span>
              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
              <span className="text-sm text-muted-foreground capitalize">
                {conversation?.language}
              </span>
              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
              <span className="text-sm text-muted-foreground">
                {conversation?.messageCount} messages
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArchive(conversation?.id)}
            iconName="Archive"
            iconSize={16}
          >
            <span className="sr-only">Archive conversation</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(conversation?.id)}
            iconName="Trash2"
            iconSize={16}
          >
            <span className="sr-only">Delete conversation</span>
          </Button>
        </div>
      </div>
      {/* Code Preview */}
      <div className="mb-4">
        <div className="bg-muted rounded-md p-3 border">
          <pre className="text-sm text-muted-foreground font-mono overflow-hidden">
            <code>{conversation?.codePreview}</code>
          </pre>
        </div>
      </div>
      {/* Summary */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {conversation?.summary}
        </p>
      </div>
      {/* Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        {conversation?.topics?.slice(0, 3)?.map((topic, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-md"
          >
            {topic}
          </span>
        ))}
        {conversation?.topics?.length > 3 && (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
            +{conversation?.topics?.length - 3} more
          </span>
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last message: {formatDate(conversation?.lastMessage)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResume(conversation?.id)}
          iconName="ArrowRight"
          iconPosition="right"
          iconSize={16}
        >
          Resume Chat
        </Button>
      </div>
    </div>
  );
};

export default ConversationCard;