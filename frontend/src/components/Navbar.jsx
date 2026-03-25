import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-wide">
            ملتقيات علمية
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-indigo-200 text-sm">
                  {user.name} ({user.role === 'organizer' ? 'منظم' : 'مشارك'})
                </span>
                {user.role === 'organizer' ? (
                  <>
                    <Link to="/organizer" className="hover:text-indigo-200 transition-colors text-sm">
                      لوحة التحكم
                    </Link>
                    <Link to="/conferences/create" className="bg-white text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors">
                      إنشاء ملتقى
                    </Link>
                  </>
                ) : (
                  <Link to="/participant" className="hover:text-indigo-200 transition-colors text-sm">
                    ملتقياتي
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-indigo-200 hover:text-white transition-colors text-sm"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-200 transition-colors text-sm">
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="bg-white text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
