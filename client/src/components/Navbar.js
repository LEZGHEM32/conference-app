import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>🎓 منصة الملتقيات العلمية</div>
      <div className={styles.links}>
        {user ? (
          <>
            <span className={styles.greeting}>أهلاً، {user.name}</span>
            <Link to={user.role === 'organizer' ? '/organizer' : '/participant'}>لوحة التحكم</Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>تسجيل الخروج</button>
          </>
        ) : (
          <>
            <Link to="/login">تسجيل الدخول</Link>
            <Link to="/register">إنشاء حساب</Link>
          </>
        )}
      </div>
    </nav>
  );
}
