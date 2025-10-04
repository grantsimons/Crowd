import React, { ReactElement } from 'react';
import { UserProvider } from '../contexts/UserContext';

export function TestWrapper({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
