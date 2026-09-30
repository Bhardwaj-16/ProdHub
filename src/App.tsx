import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Activity, LayoutDashboard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#58a6ff] selection:text-white">
        <header className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#238636] text-white p-1.5 rounded-md">
              <Activity size={20} />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Hub</h1>
          </div>
          <nav className="flex space-x-4">
            <Link to="/" className="text-[#8b949e] hover:text-[#c9d1d9] flex items-center space-x-1.5 text-sm font-medium transition-colors">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link to="/profile" className="text-[#8b949e] hover:text-[#c9d1d9] flex items-center space-x-1.5 text-sm font-medium transition-colors">
              <Activity size={16} />
              <span>Profile</span>
            </Link>
          </nav>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
