import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ConferenceDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/api/conferences/${id}`)
      .then(res => setConference(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    if (user?.role === 'participant' && token) {
      api.get('/api/registrations/my', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setRegistered(res.data.some(r => r.conference_id === parseInt(id)));
      }).catch(console.error);
    }
  }, [id, user, token, navigate]);

  const handleRegister = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.post('/api/registrations', 
        { conferenceId: parseInt(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistered(true);
      setMessage('تم التسجيل بنجاح!');
      setConference(prev => ({ ...prev, registration_count: prev.registration_count + 1 }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.delete(`/api/registrations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistered(false);
      setMessage('تم إلغاء التسجيل');
      setConference(prev => ({ ...prev, registration_count: prev.registration_count - 1 }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!conference) return null;

  const isFull = conference.registration_count >= conference.capacity;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{conference.title}</h1>
            <p className="text-indigo-200">المنظم: {conference.organizer_name}</p>
          </div>
          <div className="p-8">
            {conference.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">الوصف</h2>
                <p className="text-gray-600 leading-relaxed">{conference.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs text-gray-500 mb-1">التاريخ</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(conference.date)}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-xs text-gray-500 mb-1">المكان</div>
                <div className="text-sm font-medium text-gray-900">{conference.location}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-xs text-gray-500 mb-1">المشاركون</div>
                <div className="text-sm font-medium text-gray-900">{conference.registration_count}/{conference.capacity}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>نسبة الإشغال</span>
                <span>{Math.round((conference.registration_count / conference.capacity) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min((conference.registration_count / conference.capacity) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {message && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('نجاح') || message.includes('تم') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            {user?.role === 'participant' && (
              <div className="flex gap-3">
                {registered ? (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 px-6 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'جاري الإلغاء...' : 'إلغاء التسجيل'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={actionLoading || isFull}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'جاري التسجيل...' : isFull ? 'الملتقى ممتلئ' : 'التسجيل في الملتقى'}
                  </button>
                )}
              </div>
            )}

            {!user && (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">سجل دخولك للتسجيل في هذا الملتقى</p>
                <a href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  تسجيل الدخول
                </a>
              </div>
            )}

            {user?.role === 'organizer' && user.id === conference.organizer_id && (
              <div className="flex gap-3">
                <a href={`/conferences/${id}/edit`} className="flex-1 text-center bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 px-6 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                  تعديل الملتقى
                </a>
                <a href={`/conferences/${id}/participants`} className="flex-1 text-center bg-gray-50 text-gray-700 border border-gray-200 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  عرض المشاركين
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
