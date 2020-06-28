import React from 'react';
import { useHistory } from 'react-router';

export const withHistory = Component => props => <Component { ...props } history={useHistory()} />;
