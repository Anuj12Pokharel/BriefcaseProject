import { FileText, Clock, CheckCircle, AlertCircle, MoreVertical, Download, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DocumentCardProps {
  title: string;
  status: 'pending' | 'completed' | 'waiting';
  date: string;
  recipients: number;
  signed: number;
}

export default function DocumentCard({ title, status, date, recipients, signed }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    pending: {
      icon: Clock,
      text: 'Pending',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    completed: {
      icon: CheckCircle,
      text: 'Completed',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    waiting: {
      icon: AlertCircle,
      text: 'Waiting for Others',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
            <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border mb-4`}>
        <StatusIcon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{signed}</span> of{' '}
          <span className="font-medium text-gray-900">{recipients}</span> signed
        </div>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(signed / recipients) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900">
          {Math.round((signed / recipients) * 100)}%
        </span>
      </div>
    </div>
  );
}
