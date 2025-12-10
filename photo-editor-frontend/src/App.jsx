import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { PublicRoute } from './components/shared/PublicRoute';

// Pages (we'll create these next)
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import EditorSimple from './pages/Editor';
import SharedAlbum from './pages/SharedAlbum';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/shared/:token" element={<SharedAlbum />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/albums" element={
            <ProtectedRoute>
              <Albums />
            </ProtectedRoute>
          } />
          
          <Route path="/albums/:id" element={
            <ProtectedRoute>
              <AlbumDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/editor/:photoId" element={
            <ProtectedRoute>
              <EditorSimple />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;