import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
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
        <h2 className={styles.title}>إنشاء حساب جديد</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>الاسم الكامل
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </label>
        <label>البريد الإلكتروني
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </label>
        <label>كلمة المرور
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
        </label>
        <label>نوع الحساب
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="participant">مشارك</option>
            <option value="organizer">منظم</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>{loading ? 'جارٍ التحميل...' : 'إنشاء الحساب'}</button>
        <p>لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
      </form>
    </div>
  );
}
