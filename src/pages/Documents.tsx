import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Documents() {
  const navigate = useNavigate();

  // Recent activity sample data and filters (copied from Reports)
  const [fileFilter, setFileFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  const recentActivity = [
    {
      id: 1,
      document: 'Employment Contract - ',
      action: 'Completed',
      user: '',
      date: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      document: 'NDA - Tech Partnership',
      action: 'Signed',
      user: 'Jane Doe',
      date: '5 hours ago',
      status: 'in-progress'
    },
    {
      id: 3,
      document: 'Service Agreement Q4',
      action: 'Sent for signature',
      user: 'You',
      date: '1 day ago',
      status: 'pending'
    },
    {
      id: 4,
      document: 'Vendor Contract',
      action: 'Viewed',
      user: 'Mike Johnson',
      date: '1 day ago',
      status: 'pending'
    },
    {
      id: 5,
      document: 'Lease Agreement',
      action: 'Completed',
      user: 'Sarah Williams',
      date: '2 days ago',
      status: 'completed'
    }
  ];

  const filteredActivity = recentActivity.filter((activity) => {
    const fileMatch = fileFilter === '' || activity.document.toLowerCase().includes(fileFilter.toLowerCase());
    const dateMatch = dateFilter === '' || activity.date.toLowerCase().includes(dateFilter.toLowerCase());
    const statusMatch = statusFilter === '' || activity.status === statusFilter;
    return fileMatch && dateMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="bg-white rounded-xl p-8 mb-8 flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign PDF Documents Online</h1>
            <p className="text-gray-600 mb-6">Easily sign your PDF documents from any device with our secure and user-friendly platform.</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Get Started
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            {/* Enhanced illustrative card */}
            <div className="relative w-64 md:w-80 lg:w-96 h-44 md:h-56 lg:h-64 rounded-2xl bg-gradient-to-tr from-white to-sky-50 border border-blue-100 shadow-lg flex items-center justify-center">
              <div className="absolute -left-6 -top-6 w-36 h-36 rounded-full bg-gradient-to-tr from-sky-100 to-blue-200 opacity-40 blur-xl" />
              <div className="w-11/12 h-4/5 rounded-xl bg-white border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden relative">
                {/* Use the advanced animated signature SVG instead of the PNG */}
                <object type="image/svg+xml" data="/signature-illustration.svg" aria-label="Animated signature illustration" className="w-full h-full">
                  <img src="/signature-illustration.svg" alt="Animated signature illustration" className="w-full h-full object-contain" />
                </object>
              </div>
            </div>
          </div>
        </div>
        {/* Show assigned docs for signer */}
        {user?.role === 'signer' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents Assigned to You</h2>
              <button onClick={() => navigate('/sign')} className="text-sm text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {[
                { id: 'd1', title: 'Employment Contract', status: 'You can sign' },
                { id: 'd2', title: 'NDA - Tech Partnership', status: 'Placed in hierarchy order' },
                { id: 'd3', title: 'Service Agreement Q4', status: 'You can sign' }
              ].map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-800">{doc.title}</div>
                    <div className="text-sm text-gray-500">Status: {doc.status}</div>
                  </div>
                  <div>
                    {doc.status === 'You can sign' ? (
                      <button onClick={() => navigate('/sign', { state: { docId: doc.id, fileName: doc.title } })} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Open & Sign</button>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-sm text-gray-500">{doc.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to sign a PDF online - enhanced blue-themed design */}
        <div className="bg-gradient-to-b from-white to-blue-50 rounded-xl p-8 mt-8 border border-blue-100">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-sky-900">How to sign a PDF online</h2>
            <p className="text-sky-700 mt-3">A secure, fast and simple flow to sign PDF documents — designed for clarity and speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              n: 1,
              title: 'Choose your PDF',
              desc: 'Click "Get Started" or the Upload button and select the PDF from your device.'
            },{
              n: 2,
              title: 'Prepare fields',
              desc: 'Use the editor to add signature fields, dates, and text where needed.'
            },{
              n: 3,
              title: 'Sign or request',
              desc: 'Sign yourself or send requests to recipients for their signatures.'
            },{
              n: 4,
              title: 'Download & share',
              desc: 'Save the signed PDF and share it via email or download to your device.'
            }].map((step) => (
              <div
                key={step.n}
                className="relative group overflow-hidden rounded-2xl p-6 md:p-8 bg-white shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-1"
              >
                <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-tr from-sky-200 to-blue-300 opacity-30 blur-3xl pointer-events-none" />
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                      {step.n}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-sky-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-sky-700 leading-relaxed">{step.desc}</p>
                    {/* CTAs removed as requested */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats and overview removed per user request */}

        {/* Recent Activity Section (copied from Reports) */}
        {user ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by file name"
              value={fileFilter}
              onChange={e => setFileFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              style={{ minWidth: 180 }}
            />
            <input
              type="text"
              placeholder="Filter by date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              style={{ minWidth: 140 }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              style={{ minWidth: 140 }}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Document</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">No recent activity matches your filters.</td>
                  </tr>
                ) : (
                  filteredActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="text-sm font-medium text-gray-900">{activity.document}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{activity.action}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{activity.user}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{activity.date}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {activity.status === 'completed' ? 'Completed' : activity.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      </div>
    </div>
  );
}

export default Documents;
