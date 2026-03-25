import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ParticipantDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'participant') {
      navigate('/');
      return;
    }
    api.get('/api/registrations/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRegistrations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  const handleCancel = async (conferenceId) => {
    if (!confirm('هل تريد إلغاء تسجيلك في هذا الملتقى؟')) return;
    try {
      await api.delete(`/api/registrations/${conferenceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(prev => prev.filter(r => r.conference_id !== conferenceId));
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    return status === 'confirmed'
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">مؤكد</span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">قيد الانتظار</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ملتقياتي</h1>
          <p className="text-gray-500 mt-1">مرحباً، {user?.name} - الملتقيات المسجل فيها</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">لم تسجل في أي ملتقى بعد</p>
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              تصفح الملتقيات المتاحة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(reg => (
              <div key={reg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{reg.title}</h3>
                      {getStatusBadge(reg.status)}
                    </div>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{reg.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(reg.date)}</span>
                      <span>📍 {reg.location}</span>
                      <span>👤 المنظم: {reg.organizer_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mr-4">
                    <Link
                      to={`/conferences/${reg.conference_id}`}
                      className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      عرض
                    </Link>
                    <button
                      onClick={() => handleCancel(reg.conference_id)}
                      className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
