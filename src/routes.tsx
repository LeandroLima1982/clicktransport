
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import QueueSystemPage from './pages/admin/QueueSystemPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/admin/queue',
        element: <QueueSystemPage />,
      },
      // Add more routes here as needed
    ],
  },
]);

export default router;
