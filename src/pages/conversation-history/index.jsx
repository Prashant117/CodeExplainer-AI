import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import ConversationCard from './components/ConversationCard';
import SearchFilterBar from './components/SearchFilterBar';
import EmptyState from './components/EmptyState';
import ConversationStats from './components/ConversationStats';
import BulkActions from './components/BulkActions';

const ConversationHistory = () => {
  const navigate = useNavigate();
  
  // Mock conversation data
  const mockConversations = [
    {
      id: 1,
      title: "React useState Hook Explanation",
      language: "react",
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 8,
      codePreview: `const [count, setCount] = useState(0);\n\nconst increment = () => {\n  setCount(count + 1);\n};`,
      summary: "Detailed explanation of React's useState hook, including state initialization, state updates, and common patterns for managing component state.",
      topics: ["React Hooks", "State Management", "Functional Components", "Event Handling"],
      isArchived: false
    },
    {
      id: 2,
      title: "Python List Comprehension",
      language: "python",
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      lastMessage: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      messageCount: 12,
      codePreview: `numbers = [1, 2, 3, 4, 5]\nsquared = [x**2 for x in numbers if x % 2 == 0]\nprint(squared)  # [4, 16]`,
      summary: "Comprehensive breakdown of Python list comprehensions, covering syntax, filtering conditions, and performance benefits over traditional loops.",
      topics: ["Python", "List Comprehension", "Functional Programming", "Performance"],
      isArchived: false
    },
    {
      id: 3,
      title: "JavaScript Async/Await Pattern",
      language: "javascript",
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastMessage: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      messageCount: 15,
      codePreview: `async function fetchUserData(userId) {\n  try {\n    const response = await fetch(\`/api/users/\${userId}\`);\n    const userData = await response.json();\n    return userData;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}`,
      summary: "In-depth explanation of asynchronous JavaScript programming using async/await syntax, error handling, and best practices for API calls.",
      topics: ["JavaScript", "Async Programming", "Promises", "Error Handling", "API Calls"],
      isArchived: false
    },
    {
      id: 4,
      title: "CSS Flexbox Layout System",
      language: "css",
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      lastMessage: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      messageCount: 6,
      codePreview: `.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n}`,
      summary: "Complete guide to CSS Flexbox properties, including container and item properties, alignment options, and responsive design patterns.",
      topics: ["CSS", "Flexbox", "Layout", "Responsive Design"],
      isArchived: false
    },
    {
      id: 5,
      title: "Java Object-Oriented Programming",
      language: "java",
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      lastMessage: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      messageCount: 20,
      codePreview: `public class Car {\n  private String brand;\n  private int year;\n  \n  public Car(String brand, int year) {\n    this.brand = brand;\n    this.year = year;\n  }\n  \n  public void startEngine() {\n    System.out.println("Engine started!");\n  }\n}`,
      summary: "Fundamental concepts of object-oriented programming in Java, covering classes, objects, encapsulation, constructors, and method definitions.",
      topics: ["Java", "OOP", "Classes", "Encapsulation", "Constructors"],
      isArchived: false
    },
    {
      id: 6,
      title: "C++ Pointer Arithmetic",
      language: "cpp",
      lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      lastMessage: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      messageCount: 9,
      codePreview: `int arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\n\nfor(int i = 0; i < 5; i++) {\n  cout << *(ptr + i) << " ";\n}`,
      summary: "Detailed explanation of C++ pointers, pointer arithmetic, array traversal using pointers, and memory address manipulation.",
      topics: ["C++", "Pointers", "Memory Management", "Arrays"],
      isArchived: false
    }
  ];

  // State management
  const [conversations, setConversations] = useState(mockConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    language: 'all',
    dateRange: 'all'
  });
  const [sortBy, setSortBy] = useState('recent');
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'archived'

  // Filter and search logic
  const filteredConversations = useMemo(() => {
    let filtered = conversations?.filter(conv => {
      // Archive filter
      if (viewMode === 'archived' && !conv?.isArchived) return false;
      if (viewMode === 'all' && conv?.isArchived) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery?.toLowerCase();
        const matchesSearch = 
          conv?.title?.toLowerCase()?.includes(query) ||
          conv?.summary?.toLowerCase()?.includes(query) ||
          conv?.codePreview?.toLowerCase()?.includes(query) ||
          conv?.topics?.some(topic => topic?.toLowerCase()?.includes(query));
        if (!matchesSearch) return false;
      }

      // Language filter
      if (filters?.language !== 'all' && conv?.language !== filters?.language) {
        return false;
      }

      // Date range filter
      if (filters?.dateRange !== 'all') {
        const now = new Date();
        const convDate = conv?.lastActivity;
        const diffInDays = (now - convDate) / (1000 * 60 * 60 * 24);

        switch (filters?.dateRange) {
          case 'today':
            if (diffInDays > 1) return false;
            break;
          case 'week':
            if (diffInDays > 7) return false;
            break;
          case 'month':
            if (diffInDays > 30) return false;
            break;
          case 'quarter':
            if (diffInDays > 90) return false;
            break;
        }
      }

      return true;
    });

    // Sort conversations
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b?.lastActivity - a?.lastActivity;
        case 'oldest':
          return a?.lastActivity - b?.lastActivity;
        case 'language':
          return a?.language?.localeCompare(b?.language);
        case 'messages':
          return b?.messageCount - a?.messageCount;
        case 'title':
          return a?.title?.localeCompare(b?.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [conversations, searchQuery, filters, sortBy, viewMode]);

  // Statistics
  const stats = useMemo(() => {
    const activeConversations = conversations?.filter(conv => !conv?.isArchived);
    const languages = new Set(activeConversations.map(conv => conv.language));
    const thisWeekConversations = activeConversations?.filter(conv => {
      const diffInDays = (new Date() - conv?.lastActivity) / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    });

    return {
      totalConversations: activeConversations?.length,
      languagesCount: languages?.size,
      codeSnippets: activeConversations?.reduce((sum, conv) => sum + conv?.messageCount, 0),
      thisWeek: thisWeekConversations?.length
    };
  }, [conversations]);

  // Event handlers
  const handleStartNewChat = () => {
    navigate('/ai-code-chat-interface');
  };

  const handleResumeConversation = (conversationId) => {
    navigate(`/ai-code-chat-interface?conversation=${conversationId}`);
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev?.filter(conv => conv?.id !== conversationId));
    setSelectedConversations(prev => prev?.filter(id => id !== conversationId));
  };

  const handleArchiveConversation = (conversationId) => {
    setConversations(prev => 
      prev?.map(conv => 
        conv?.id === conversationId 
          ? { ...conv, isArchived: !conv?.isArchived }
          : conv
      )
    );
  };

  const handleSelectConversation = (conversationId, isSelected) => {
    if (isSelected) {
      setSelectedConversations(prev => [...prev, conversationId]);
    } else {
      setSelectedConversations(prev => prev?.filter(id => id !== conversationId));
    }
  };

  const handleSelectAll = () => {
    setSelectedConversations(filteredConversations?.map(conv => conv?.id));
  };

  const handleDeselectAll = () => {
    setSelectedConversations([]);
  };

  const handleBulkDelete = (conversationIds) => {
    setConversations(prev => prev?.filter(conv => !conversationIds?.includes(conv?.id)));
    setSelectedConversations([]);
  };

  const handleBulkArchive = (conversationIds) => {
    setConversations(prev => 
      prev?.map(conv => 
        conversationIds?.includes(conv?.id)
          ? { ...conv, isArchived: !conv?.isArchived }
          : conv
      )
    );
    setSelectedConversations([]);
  };

  const handleBulkExport = (conversationIds) => {
    // Mock export functionality
    const exportData = conversations?.filter(conv => conversationIds?.includes(conv?.id));
    console.log('Exporting conversations:', exportData);
    // In a real app, this would trigger a download
    setSelectedConversations([]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ language: 'all', dateRange: 'all' });
    setSortBy('recent');
    setViewMode('all');
  };

  const isAllSelected = selectedConversations?.length === filteredConversations?.length && filteredConversations?.length > 0;

  // Determine empty state type
  const getEmptyStateType = () => {
    if (conversations?.length === 0) return 'no-conversations';
    if (filteredConversations?.length === 0 && viewMode === 'archived') return 'archived';
    if (filteredConversations?.length === 0) return 'no-results';
    return 'no-conversations';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Conversation History
              </h1>
              <p className="text-muted-foreground">
                Access and manage your previous code explanation sessions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'all' ? 'archived' : 'all')}
                iconName={viewMode === 'all' ? 'Archive' : 'ArrowLeft'}
                iconPosition="left"
                iconSize={20}
              >
                {viewMode === 'all' ? 'View Archived' : 'Back to All'}
              </Button>
              
              <Button
                variant="default"
                onClick={handleStartNewChat}
                iconName="Plus"
                iconPosition="left"
                iconSize={20}
              >
                Start New Chat
              </Button>
            </div>
          </div>

          {/* Statistics */}
          {viewMode === 'all' && conversations?.length > 0 && (
            <ConversationStats stats={stats} />
          )}

          {/* Search and Filters */}
          {conversations?.length > 0 && (
            <SearchFilterBar
              onSearch={setSearchQuery}
              onFilter={setFilters}
              onSort={setSortBy}
              filters={filters}
              sortBy={sortBy}
            />
          )}

          {/* Bulk Actions */}
          <BulkActions
            selectedConversations={selectedConversations}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkDelete={handleBulkDelete}
            onBulkArchive={handleBulkArchive}
            onBulkExport={handleBulkExport}
            totalConversations={filteredConversations?.length}
            isAllSelected={isAllSelected}
          />

          {/* Conversations List */}
          {filteredConversations?.length > 0 ? (
            <div className="space-y-4">
              {filteredConversations?.map((conversation) => (
                <div key={conversation?.id} className="flex items-start gap-4">
                  <div className="pt-6">
                    <Checkbox
                      checked={selectedConversations?.includes(conversation?.id)}
                      onChange={(e) => handleSelectConversation(conversation?.id, e?.target?.checked)}
                    />
                  </div>
                  <div className="flex-1">
                    <ConversationCard
                      conversation={conversation}
                      onResume={handleResumeConversation}
                      onDelete={handleDeleteConversation}
                      onArchive={handleArchiveConversation}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              type={getEmptyStateType()}
              onStartNewChat={handleStartNewChat}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ConversationHistory;