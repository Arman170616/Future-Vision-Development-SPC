'use client';

import { Suspense } from 'react';
import ExpenseRequests from '@/components/ExpenseRequests';
import Shell from '@/components/Shell';

export default function RequestsPage() {
  return (
    <Suspense>
      <Shell crumbs={[{ label: 'Expense requests' }]} title="Expense requests">
        <ExpenseRequests />
      </Shell>
    </Suspense>
  );
}
