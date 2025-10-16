import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { DocumentProvider } from './context/DocumentContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Templates from './pages/Templates';
import Prepare from './pages/Prepare';
import Sign from './pages/Sign';
import Send from './pages/Send';
import Reports from './pages/Reports';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/prepare" element={<Prepare />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/send" element={<Send />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </Router>
    </DocumentProvider>
  );
}

export default App;
