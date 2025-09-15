import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchFilterBar = ({ onSearch, onFilter, onSort, filters, sortBy }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'language', label: 'By Language' },
    { value: 'messages', label: 'Message Count' },
    { value: 'title', label: 'Alphabetical' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleLanguageFilter = (language) => {
    onFilter({ ...filters, language });
  };

  const handleDateRangeFilter = (dateRange) => {
    onFilter({ ...filters, dateRange });
  };

  const handleSortChange = (sort) => {
    onSort(sort);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onSearch('');
    onFilter({ language: 'all', dateRange: 'all' });
    onSort('recent');
  };

  const hasActiveFilters = filters?.language !== 'all' || filters?.dateRange !== 'all' || searchQuery;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search conversations, code snippets, or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            iconName="Filter"
            iconPosition="left"
            iconSize={16}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-primary rounded-full"></span>
            )}
          </Button>
          
          <div className="w-48">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={handleSortChange}
              placeholder="Sort by..."
            />
          </div>
        </div>
      </div>
      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-border animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Language Filter */}
            <div>
              <Select
                label="Programming Language"
                options={languageOptions}
                value={filters?.language}
                onChange={handleLanguageFilter}
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={filters?.dateRange}
                onChange={handleDateRangeFilter}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                iconName="X"
                iconPosition="left"
                iconSize={16}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onSearch('');
                  }}
                  className="hover:bg-primary/20 rounded-sm p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            
            {filters?.language !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
                Language: {languageOptions?.find(opt => opt?.value === filters?.language)?.label}
                <button
                  onClick={() => handleLanguageFilter('all')}
                  className="hover:bg-primary/20 rounded-sm p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            
            {filters?.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md">
                Date: {dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}
                <button
                  onClick={() => handleDateRangeFilter('all')}
                  className="hover:bg-primary/20 rounded-sm p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;