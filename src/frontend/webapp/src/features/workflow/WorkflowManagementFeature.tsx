'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkflowListPage } from './WorkflowListPage';
import { WorkflowDesignerPage } from './WorkflowDesignerPage';

export function WorkflowManagementFeature() {
  const searchParams = useSearchParams();
  const urlId = searchParams?.get('id');
  const urlProjectId = searchParams?.get('projectId') || undefined;

  const [viewMode, setViewMode] = useState<'list' | 'designer'>(
    urlId || urlProjectId ? 'designer' : 'list'
  );
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(urlId || null);
  const [projectId, setProjectId] = useState<string | undefined>(urlProjectId);

  useEffect(() => {
    if (urlId || urlProjectId) {
      if (urlId) setSelectedWorkflowId(urlId);
      if (urlProjectId) setProjectId(urlProjectId);
      setViewMode('designer');
    } else {
      setViewMode('list');
      setSelectedWorkflowId(null);
      setProjectId(undefined);
    }
  }, [urlId, urlProjectId]);

  const handleSelectWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setViewMode('designer');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', id);
      window.history.pushState({ id }, '', url.toString());
    }
  };

  const handleBackToList = () => {
    setSelectedWorkflowId(null);
    setProjectId(undefined);
    setViewMode('list');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('projectId');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (viewMode === 'designer' && (selectedWorkflowId || projectId)) {
    return (
      <WorkflowDesignerPage
        workflowId={selectedWorkflowId || undefined}
        projectId={projectId}
        onBackToList={
          projectId
            ? () => {
                if (typeof window !== 'undefined') window.location.href = '/projects';
              }
            : handleBackToList
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <WorkflowListPage onSelectWorkflow={handleSelectWorkflow} />
    </div>
  );
}
