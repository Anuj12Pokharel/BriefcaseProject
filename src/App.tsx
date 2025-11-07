import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { DocumentProvider } from './context/DocumentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Templates from './pages/Templates';
import ManageTemplates from './pages/ManageTemplates';
import FullPreview from './pages/FullPreview';
import Prepare from './pages/Prepare';
import Sign from './pages/Sign';
import SignAndSend from './pages/SignAndSend';
import Send from './pages/Send';
import SendSuccess from './pages/SendSuccess';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    // If not logged in, redirect to /login
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <AuthProvider>
      <DocumentProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Public pages: available to anyone */}
              <Route path="/" element={<Home />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/manage-templates" element={<ManageTemplates />} />
              <Route path="/reports" element={<Reports />} />

              {/* Protected pages: require authentication */}
              <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
              <Route path="/preview" element={<RequireAuth><FullPreview /></RequireAuth>} />
              <Route path="/prepare" element={<RequireAuth><Prepare /></RequireAuth>} />
              <Route path="/sign" element={<RequireAuth><Sign /></RequireAuth>} />
              {/* legacy route - keep for compatibility but primary flow routes to /send */}
              <Route path="/sign-and-send" element={<RequireAuth><SignAndSend /></RequireAuth>} />
              <Route path="/send" element={<RequireAuth><Send /></RequireAuth>} />
              <Route path="/send/success" element={<RequireAuth><SendSuccess /></RequireAuth>} />
            </Routes>
          </div>
        </Router>
      </DocumentProvider>
    </AuthProvider>
  );
}

// Login is imported statically above

export default App;
