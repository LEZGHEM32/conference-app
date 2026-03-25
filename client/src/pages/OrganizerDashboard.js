import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

function ConferenceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', location: '', start_date: '', end_date: '', max_participants: 100
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.conferenceForm}>
      <label>عنوان الملتقى *
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
      </label>
      <label>الوصف
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
      </label>
      <label>الموقع
        <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
      </label>
      <div className={styles.row}>
        <label>تاريخ البداية *
          <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
        </label>
        <label>تاريخ النهاية *
          <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
        </label>
      </div>
      <label>الحد الأقصى للمشاركين
        <input type="number" min={1} value={form.max_participants} onChange={e => setForm({...form, max_participants: +e.target.value})} />
      </label>
      <div className={styles.formActions}>
        <button type="submit">حفظ</button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editConf, setEditConf] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.getMyConferences();
      setConferences(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form) {
    try {
      await api.createConference(form);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(form) {
    try {
      await api.updateConference(editConf.id, form);
      setEditConf(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملتقى؟')) return;
    try {
      await api.deleteConference(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>لوحة تحكم المنظم</h1>
        <p className={styles.subtitle}>مرحباً {user.name}! أدِر ملتقياتك العلمية هنا.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!showForm && !editConf && (
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>+ إنشاء ملتقى جديد</button>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h2>إنشاء ملتقى جديد</h2>
          <ConferenceForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editConf && (
        <div className={styles.formCard}>
          <h2>تعديل الملتقى</h2>
          <ConferenceForm initial={editConf} onSave={handleUpdate} onCancel={() => setEditConf(null)} />
        </div>
      )}

      {loading ? (
        <p className={styles.loading}>جارٍ التحميل...</p>
      ) : (
        <div className={styles.section}>
          <h2>ملتقياتي ({conferences.length})</h2>
          {conferences.length === 0 ? (
            <p className={styles.empty}>لم تقم بإنشاء أي ملتقى بعد.</p>
          ) : (
            <div className={styles.grid}>
              {conferences.map(conf => (
                <div key={conf.id} className={styles.confCard}>
                  <h3>{conf.title}</h3>
                  <p>📍 {conf.location || 'غير محدد'}</p>
                  <p>📅 {conf.start_date} – {conf.end_date}</p>
                  <p>👥 المسجلون: {conf.participant_count} / {conf.max_participants}</p>
                  {conf.description && <p className={styles.desc}>{conf.description}</p>}
                  <div className={styles.cardActions}>
                    <button onClick={() => setEditConf(conf)} className={styles.editBtn}>تعديل</button>
                    <button onClick={() => handleDelete(conf.id)} className={styles.deleteBtn}>حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
