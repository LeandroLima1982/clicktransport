
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import QueueSystemPage from './pages/admin/QueueSystemPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import DriversPage from './pages/admin/DriversPage';
import VehiclesPage from './pages/admin/VehiclesPage';
import BookingsPage from './pages/admin/BookingsPage';
import NotFound from './pages/NotFound';

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
      {
        path: '/admin/companies',
        element: <CompaniesPage />,
      },
      {
        path: '/admin/drivers',
        element: <DriversPage />,
      },
      {
        path: '/admin/vehicles',
        element: <VehiclesPage />,
      },
      {
        path: '/admin/bookings',
        element: <BookingsPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
