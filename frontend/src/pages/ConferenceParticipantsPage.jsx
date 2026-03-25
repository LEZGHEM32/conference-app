import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ConferenceParticipantsPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'organizer') {
      navigate('/');
      return;
    }
    Promise.all([
      api.get(`/api/conferences/${id}`),
      api.get(`/api/registrations/conference/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([confRes, regRes]) => {
        setConference(confRes.data);
        setParticipants(regRes.data);
      })
      .catch(() => navigate('/organizer'))
      .finally(() => setLoading(false));
  }, [id, user, token, navigate]);

  const handleStatusChange = async (regId, newStatus) => {
    try {
      await api.put(`/api/registrations/${regId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParticipants(prev => prev.map(p => p.id === regId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/organizer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← العودة للوحة التحكم
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
            <h1 className="text-xl font-bold mb-1">المشاركون في: {conference?.title}</h1>
            <p className="text-indigo-200 text-sm">
              {participants.length} مسجل من أصل {conference?.capacity} مقعد
            </p>
          </div>

          <div className="p-6">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                لا يوجد مشاركون مسجلون بعد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right text-sm font-medium text-gray-500 border-b border-gray-100">
                      <th className="pb-3 pr-0">الاسم</th>
                      <th className="pb-3">البريد الإلكتروني</th>
                      <th className="pb-3">تاريخ التسجيل</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {participants.map(p => (
                      <tr key={p.id} className="text-sm">
                        <td className="py-3 pr-0 font-medium text-gray-900">{p.participant_name}</td>
                        <td className="py-3 text-gray-500" dir="ltr">{p.participant_email}</td>
                        <td className="py-3 text-gray-500">{formatDate(p.registered_at)}</td>
                        <td className="py-3">
                          {p.status === 'confirmed'
                            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">مؤكد</span>
                            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">قيد الانتظار</span>
                          }
                        </td>
                        <td className="py-3">
                          {p.status === 'pending' ? (
                            <button
                              onClick={() => handleStatusChange(p.id, 'confirmed')}
                              className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              تأكيد
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(p.id, 'pending')}
                              className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-100 transition-colors"
                            >
                              إعادة للانتظار
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
