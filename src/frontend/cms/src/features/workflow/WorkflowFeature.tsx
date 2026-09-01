'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TenderCommandCenterPage } from './TenderCommandCenterPage';
import { WorkflowListPage } from './WorkflowListPage';
import { WorkflowDesignerPage } from './WorkflowDesignerPage';

export function WorkflowFeature() {
  const searchParams = useSearchParams();
  const urlId = searchParams?.get('id');
  const urlMode = searchParams?.get('mode');

  const [viewMode, setViewMode] = useState<'command-center' | 'designer' | 'list'>(
    urlId ? 'designer' : urlMode === 'list' ? 'list' : 'command-center'
  );
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(urlId || null);

  useEffect(() => {
    if (urlId) {
      setSelectedWorkflowId(urlId);
      setViewMode('designer');
    }
  }, [urlId]);

  const handleSelectWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setViewMode('designer');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', id);
      url.searchParams.delete('mode');
      window.history.pushState({ id }, '', url.toString());
    }
  };

  const handleBackToList = () => {
    setSelectedWorkflowId(null);
    setViewMode('list');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.set('mode', 'list');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleOpenBpmDesigner = (workflowId?: string) => {
    if (workflowId) {
      setSelectedWorkflowId(workflowId);
      setViewMode('designer');
    } else {
      setViewMode('list');
    }
  };

  const handleBackToCommandCenter = () => {
    setSelectedWorkflowId(null);
    setViewMode('command-center');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('mode');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (viewMode === 'designer' && selectedWorkflowId) {
    return (
      <WorkflowDesignerPage
        workflowId={selectedWorkflowId}
        onBackToList={handleBackToList}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToCommandCenter}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            ← Quay Lại Trung Tâm Điều Phối 3-in-1
          </button>
        </div>
        <WorkflowListPage onSelectWorkflow={handleSelectWorkflow} />
      </div>
    );
  }

  return (
    <TenderCommandCenterPage
      onOpenBpmDesigner={handleOpenBpmDesigner}
      onNavigateScreen={(screen) => {
        if (typeof window !== 'undefined') {
          window.location.href = `/${screen}`;
        }
      }}
    />
  );
}
