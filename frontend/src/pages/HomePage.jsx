import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:3001/api/conferences')
      .then(res => setConferences(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">ملتقيات علمية</h1>
          <p className="text-xl text-indigo-200 mb-8">منصة تربط بين المنظمين والراغبين بالمشاركة</p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                ابدأ الآن
              </Link>
              <Link to="/login" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Conferences */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">الملتقيات المتاحة</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : conferences.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">لا توجد ملتقيات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map(conf => (
              <Link key={conf.id} to={`/conferences/${conf.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
                <div className="bg-indigo-600 h-2"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {conf.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{conf.description}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(conf.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{conf.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>{conf.registration_count}/{conf.capacity} مشارك</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    المنظم: {conf.organizer_name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
