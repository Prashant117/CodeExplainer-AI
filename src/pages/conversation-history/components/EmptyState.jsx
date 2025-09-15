import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ type = 'no-conversations', onStartNewChat, onClearFilters }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-conversations':
        return {
          icon: 'MessageSquare',
          title: 'No Conversations Yet',
          description: `Start your first conversation with CodeExplainer AI to begin building your code explanation history. Ask questions about any code snippet and get detailed explanations in simple language.`,
          primaryAction: {
            text: 'Start New Chat',
            onClick: onStartNewChat,
            icon: 'Plus'
          }
        };
      
      case 'no-results':
        return {
          icon: 'Search',
          title: 'No Results Found',
          description: `We couldn't find any conversations matching your search criteria. Try adjusting your filters or search terms to find what you're looking for.`,
          primaryAction: {
            text: 'Clear Filters',
            onClick: onClearFilters,
            icon: 'X'
          },
          secondaryAction: {
            text: 'Start New Chat',
            onClick: onStartNewChat,
            icon: 'Plus'
          }
        };
      
      case 'archived':
        return {
          icon: 'Archive',
          title: 'No Archived Conversations',
          description: `You haven't archived any conversations yet. Archive conversations you want to keep but don't need immediate access to.`,
          primaryAction: {
            text: 'View All Conversations',
            onClick: onClearFilters,
            icon: 'ArrowLeft'
          }
        };
      
      default:
        return {
          icon: 'MessageSquare',
          title: 'Nothing Here',
          description: 'There are no conversations to display at the moment.',
          primaryAction: {
            text: 'Start New Chat',
            onClick: onStartNewChat,
            icon: 'Plus'
          }
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name={content?.icon} size={40} className="text-muted-foreground" />
      </div>
      {/* Title */}
      <h3 className="text-2xl font-semibold text-foreground mb-3">
        {content?.title}
      </h3>
      {/* Description */}
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {content?.description}
      </p>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          onClick={content?.primaryAction?.onClick}
          iconName={content?.primaryAction?.icon}
          iconPosition="left"
          iconSize={20}
        >
          {content?.primaryAction?.text}
        </Button>
        
        {content?.secondaryAction && (
          <Button
            variant="outline"
            onClick={content?.secondaryAction?.onClick}
            iconName={content?.secondaryAction?.icon}
            iconPosition="left"
            iconSize={20}
          >
            {content?.secondaryAction?.text}
          </Button>
        )}
      </div>
      {/* Additional Help Text */}
      {type === 'no-conversations' && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-lg">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={20} className="text-accent mt-0.5" />
            <div className="text-left">
              <h4 className="font-medium text-foreground mb-1">Getting Started Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Paste any code snippet you want explained</li>
                <li>• Ask specific questions about code functionality</li>
                <li>• Request explanations in beginner-friendly language</li>
                <li>• Continue conversations for deeper understanding</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;