import React from 'react';
import Icon from '../../../components/AppIcon';

const ConversationStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Conversations',
      value: stats?.totalConversations,
      icon: 'MessageSquare',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Languages Explored',
      value: stats?.languagesCount,
      icon: 'Code2',
      color: 'text-green-600 bg-green-50'
    },
    {
      label: 'Code Snippets Analyzed',
      value: stats?.codeSnippets,
      icon: 'FileText',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      label: 'This Week',
      value: stats?.thisWeek,
      icon: 'Calendar',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems?.map((item, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item?.color}`}>
              <Icon name={item?.icon} size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {item?.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {item?.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationStats;