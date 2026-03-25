import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>تسجيل الدخول</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>البريد الإلكتروني
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </label>
        <label>كلمة المرور
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'جارٍ التحميل...' : 'دخول'}</button>
        <p>ليس لديك حساب؟ <Link to="/register">إنشاء حساب</Link></p>
      </form>
    </div>
  );
}
