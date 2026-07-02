import { lazy, Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import AuthInterceptorSetup from './components/AuthInterceptorSetup'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './pages/RegisterPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import SpeciesListPage from './pages/SpeciesListPage.tsx'
import SpeciesDetailPage from './pages/SpeciesDetailPage.tsx'
import SimulatorPage from './pages/SimulatorPage.tsx'
import MyTanksPage from './pages/MyTanksPage.tsx'
import TankFormPage from './pages/TankFormPage.tsx'
import IdentifyPage from './pages/IdentifyPage.tsx'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const SpeciesManagePage = lazy(() => import('./pages/SpeciesManagePage'))
const SpeciesFormPage = lazy(() => import('./pages/SpeciesFormPage'))
const CompatibilityExceptionPage = lazy(() => import('./pages/CompatibilityExceptionPage'))
const FlagReviewPage = lazy(() => import('./pages/FlagReviewPage'))

const adminFallback = <div className="p-6 text-ink-muted">Đang tải...</div>

function RootLayout() {
  return (
    <>
      <AuthInterceptorSetup />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <ProtectedRoute><SpeciesListPage /></ProtectedRoute> },
      { path: '/species/:id', element: <ProtectedRoute><SpeciesDetailPage /></ProtectedRoute> },
      { path: '/simulator', element: <ProtectedRoute><SimulatorPage /></ProtectedRoute> },
      { path: '/tanks', element: <ProtectedRoute><MyTanksPage /></ProtectedRoute> },
      { path: '/tanks/new', element: <ProtectedRoute><TankFormPage /></ProtectedRoute> },
      { path: '/tanks/:id/edit', element: <ProtectedRoute><TankFormPage /></ProtectedRoute> },
      { path: '/identify', element: <ProtectedRoute><IdentifyPage /></ProtectedRoute> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <LoginPage /> },
      {
        path: '/admin',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={adminFallback}>
              <AdminPage />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/species" replace /> },
          {
            path: 'species',
            element: <Suspense fallback={adminFallback}><SpeciesManagePage /></Suspense>,
          },
          {
            path: 'species/new',
            element: <Suspense fallback={adminFallback}><SpeciesFormPage /></Suspense>,
          },
          {
            path: 'species/:id/edit',
            element: <Suspense fallback={adminFallback}><SpeciesFormPage /></Suspense>,
          },
          {
            path: 'compatibility',
            element: <Suspense fallback={adminFallback}><CompatibilityExceptionPage /></Suspense>,
          },
          {
            path: 'flags',
            element: <Suspense fallback={adminFallback}><FlagReviewPage /></Suspense>,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
