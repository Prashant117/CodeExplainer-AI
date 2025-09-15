import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActions = ({ 
  selectedConversations, 
  onSelectAll, 
  onDeselectAll, 
  onBulkDelete, 
  onBulkArchive, 
  onBulkExport,
  totalConversations,
  isAllSelected 
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState('');

  const selectedCount = selectedConversations?.length;
  const hasSelection = selectedCount > 0;

  const handleBulkAction = (type) => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    switch (actionType) {
      case 'delete':
        onBulkDelete(selectedConversations);
        break;
      case 'archive':
        onBulkArchive(selectedConversations);
        break;
      case 'export':
        onBulkExport(selectedConversations);
        break;
    }
    setShowConfirmDialog(false);
    setActionType('');
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setActionType('');
  };

  const getActionText = () => {
    switch (actionType) {
      case 'delete':
        return `delete ${selectedCount} conversation${selectedCount > 1 ? 's' : ''}`;
      case 'archive':
        return `archive ${selectedCount} conversation${selectedCount > 1 ? 's' : ''}`;
      case 'export':
        return `export ${selectedCount} conversation${selectedCount > 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  if (!hasSelection && !showConfirmDialog) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <Checkbox
              checked={isAllSelected}
              onChange={isAllSelected ? onDeselectAll : onSelectAll}
              label={`${selectedCount} of ${totalConversations} selected`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              iconName="Download"
              iconPosition="left"
              iconSize={16}
            >
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('archive')}
              iconName="Archive"
              iconPosition="left"
              iconSize={16}
            >
              Archive
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              iconName="Trash2"
              iconPosition="left"
              iconSize={16}
            >
              Delete
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              iconName="X"
              iconSize={16}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Confirm Action
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to {getActionText()}? 
              {actionType === 'delete' && ' This will permanently remove them from your history.'}
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelAction}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'delete' ? 'destructive' : 'default'}
                onClick={confirmAction}
              >
                {actionType === 'delete' ? 'Delete' : 
                 actionType === 'archive' ? 'Archive' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;