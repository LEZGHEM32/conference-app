import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './ConferenceDetail.module.css';

export default function ConferenceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conf, setConf] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getConference(id);
        setConf(data);
        if (user.role === 'participant') {
          const check = await api.checkRegistration(id);
          setRegistered(check.registered);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user.role]);

  async function handleRegister() {
    setActionLoading(true);
    setError('');
    try {
      await api.register_conference(id);
      setRegistered(true);
      setConf(prev => ({ ...prev, participant_count: prev.participant_count + 1 }));
      setMessage('تم التسجيل بنجاح!');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnregister() {
    setActionLoading(true);
    setError('');
    try {
      await api.unregister_conference(id);
      setRegistered(false);
      setConf(prev => ({ ...prev, participant_count: prev.participant_count - 1 }));
      setMessage('تم إلغاء التسجيل.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className={styles.loading}>جارٍ التحميل...</div>;
  if (error && !conf) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => navigate(-1)}>← رجوع</button>
      {conf && (
        <div className={styles.card}>
          <h1 className={styles.title}>{conf.title}</h1>
          {conf.description && <p className={styles.description}>{conf.description}</p>}
          <div className={styles.details}>
            <div className={styles.detail}><span>📍</span><span>{conf.location || 'غير محدد'}</span></div>
            <div className={styles.detail}><span>📅</span><span>{conf.start_date} – {conf.end_date}</span></div>
            <div className={styles.detail}><span>👤</span><span>المنظم: {conf.organizer_name}</span></div>
            <div className={styles.detail}>
              <span>👥</span>
              <span>{conf.participant_count} / {conf.max_participants} مشارك
                {conf.participant_count >= conf.max_participants ? ' (مكتمل)' : ' (متاح)'}
              </span>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {message && <p className={styles.successMsg}>{message}</p>}

          {user.role === 'participant' && (
            <div className={styles.actions}>
              {registered ? (
                <button onClick={handleUnregister} disabled={actionLoading} className={styles.unregisterBtn}>
                  {actionLoading ? '...' : 'إلغاء التسجيل'}
                </button>
              ) : (
                <button onClick={handleRegister} disabled={actionLoading || conf.participant_count >= conf.max_participants} className={styles.registerBtn}>
                  {actionLoading ? '...' : 'التسجيل في الملتقى'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
