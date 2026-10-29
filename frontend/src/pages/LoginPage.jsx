import React from 'react';
import { RoleSelectionPage } from './RoleSelectionPage';

/**
 * Re-exports RoleSelectionPage at /login for role destination selection
 */
export const LoginPage = () => {
  return <RoleSelectionPage />;
};

export default LoginPage;
