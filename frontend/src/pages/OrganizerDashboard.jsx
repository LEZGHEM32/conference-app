import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function OrganizerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'organizer') {
      navigate('/');
      return;
    }
    api.get('/api/conferences/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setConferences(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملتقى؟')) return;
    try {
      await api.delete(`/api/conferences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConferences(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المنظم</h1>
            <p className="text-gray-500 mt-1">مرحباً، {user?.name}</p>
          </div>
          <Link
            to="/conferences/create"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + إنشاء ملتقى جديد
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : conferences.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">لم تنشئ أي ملتقيات بعد</p>
            <Link to="/conferences/create" className="text-indigo-600 hover:text-indigo-700 font-medium">
              ابدأ بإنشاء ملتقاك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conferences.map(conf => (
              <div key={conf.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{conf.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{conf.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(conf.date)}</span>
                      <span>📍 {conf.location}</span>
                      <span>👥 {conf.registration_count}/{conf.capacity} مشارك</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mr-4">
                    <Link
                      to={`/conferences/${conf.id}/participants`}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      المشاركون
                    </Link>
                    <Link
                      to={`/conferences/${conf.id}/edit`}
                      className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(conf.id)}
                      className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${Math.min((conf.registration_count / conf.capacity) * 100, 100)}%` }}
                    ></div>
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
