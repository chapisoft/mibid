'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TenderCommandCenterPage } from './TenderCommandCenterPage';
import { CmsScreen } from '../../shared/types';

interface WorkflowFeatureProps {
  onNavigate?: (screen: CmsScreen) => void;
}

export function WorkflowFeature({ onNavigate }: WorkflowFeatureProps) {
  const router = useRouter();

  const handleOpenBpmDesigner = (workflowId?: string) => {
    const targetUrl = workflowId ? `/workflows?id=${encodeURIComponent(workflowId)}` : '/workflows';
    if (onNavigate) {
      onNavigate('workflows');
    } else {
      router.push(targetUrl);
    }
  };

  const handleNavigateScreen = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen as CmsScreen);
    } else {
      router.push(`/${screen}`);
    }
  };

  return (
    <TenderCommandCenterPage
      onOpenBpmDesigner={handleOpenBpmDesigner}
      onNavigateScreen={handleNavigateScreen}
    />
  );
}
