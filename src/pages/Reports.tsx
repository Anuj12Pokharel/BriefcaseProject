import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Filter
} from 'lucide-react';

function Reports() {
  const [fileFilter, setFileFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();
  // Demo: currentStep can be 1 (Upload), 2 (Prepare), 3 (Send)
  // In real app, this should come from context or router

  const stats = [
    {
      label: 'Total Documents',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Completed',
      value: '189',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Pending',
      value: '58',
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Active Recipients',
      value: '124',
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    }
  ];

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

  const topDocuments = [
    { name: 'Employment Contract', count: 45, percentage: 18 },
    { name: 'NDA Agreement', count: 38, percentage: 15 },
    { name: 'Service Agreement', count: 32, percentage: 13 },
    { name: 'Vendor Contract', count: 28, percentage: 11 },
    { name: 'Consulting Agreement', count: 24, percentage: 10 }
  ];

  // Filtered activity
  const filteredActivity = recentActivity.filter((activity) => {
    const fileMatch = fileFilter === '' || activity.document.toLowerCase().includes(fileFilter.toLowerCase());
    const dateMatch = dateFilter === '' || activity.date.toLowerCase().includes(dateFilter.toLowerCase());
    const statusMatch = statusFilter === '' || activity.status === statusFilter;
    return fileMatch && dateMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-lg text-gray-600">Track your document performance and activity</p>
          </div>
        </div>

        {/* Reports & Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Document Status Overview</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Completed</div>
                    <div className="text-sm text-gray-600">189 documents</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">76%</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Pending</div>
                    <div className="text-sm text-gray-600">58 documents</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">24%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Document Types</h2>
            <div className="space-y-4">
              {topDocuments.map((doc, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <span className="text-sm text-gray-600">{doc.count} docs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${doc.percentage * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Section (single) */}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Document
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">
                        No recent activity matches your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredActivity.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{activity.document}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{activity.action}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{activity.user}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{activity.date}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : activity.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {activity.status === 'completed'
                              ? 'Completed'
                              : activity.status === 'in-progress'
                              ? 'In Progress'
                              : 'Pending'}
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

export default Reports;
