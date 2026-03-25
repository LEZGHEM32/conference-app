import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ConferenceCard from '../components/ConferenceCard';
import styles from './Dashboard.module.css';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [allConfs, setAllConfs] = useState([]);
  const [myConfs, setMyConfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    try {
      const [all, my] = await Promise.all([api.getConferences(), api.getMyRegistrations()]);
      setAllConfs(all);
      setMyConfs(my);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (tab === 'all' ? allConfs : myConfs).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>لوحة تحكم المشارك</h1>
        <p className={styles.subtitle}>مرحباً {user.name}! استعرض الملتقيات العلمية وسجّل اهتمامك.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button className={tab === 'all' ? styles.activeTab : styles.tab} onClick={() => setTab('all')}>
            جميع الملتقيات ({allConfs.length})
          </button>
          <button className={tab === 'my' ? styles.activeTab : styles.tab} onClick={() => setTab('my')}>
            ملتقياتي ({myConfs.length})
          </button>
        </div>
        <input
          className={styles.search}
          placeholder="ابحث عن ملتقى..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className={styles.loading}>جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>لا توجد ملتقيات.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(conf => <ConferenceCard key={conf.id} conference={conf} />)}
        </div>
      )}
    </div>
  );
}
