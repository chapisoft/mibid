'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { VendorRfqPage } from '../../../../features/vendor/VendorRfqPage';

export default function VendorRfqTokenRoutePage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : Array.isArray(params?.token) ? params.token[0] : '';

  return <VendorRfqPage token={token} />;
}
