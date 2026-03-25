import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ConferenceCard.module.css';

export default function ConferenceCard({ conference }) {
  const { id, title, location, start_date, end_date, participant_count, max_participants, organizer_name } = conference;
  const isFull = participant_count >= max_participants;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.meta}>📍 {location || 'غير محدد'}</p>
      <p className={styles.meta}>📅 {start_date} – {end_date}</p>
      <p className={styles.meta}>👤 المنظم: {organizer_name}</p>
      <p className={`${styles.meta} ${isFull ? styles.full : styles.open}`}>
        👥 {participant_count} / {max_participants} {isFull ? '(مكتمل)' : '(مفتوح)'}
      </p>
      <Link to={`/conferences/${id}`} className={styles.link}>عرض التفاصيل</Link>
    </div>
  );
}
