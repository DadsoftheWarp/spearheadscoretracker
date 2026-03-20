import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db } from '../firebase.js';
import styles from './FeedbackScreen.module.css';

const MAX_CHARS = 500;

export default function FeedbackScreen({ user, onBack }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'


  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'feature_requests'), {
        text: trimmed,
        submittedAt: serverTimestamp(),
        uid: user?.uid ?? null,
        displayName: user?.displayName ?? null,
      });

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          message: trimmed,
          from_name: user?.displayName ?? 'Anonymous',
          submitted_at: new Date().toLocaleString(),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      setStatus('success');
    } catch (err) {
      console.error('Feedback submit error:', err);
      setStatus('error');
    }
  }

  function handleAnother() {
    setText('');
    setStatus('idle');
  }

  return (
    <div className={`screen ${styles.feedbackScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>Suggest a Feature</h2>
      </div>

      {status === 'success' ? (
        <div className={styles.successState}>
          <p className={styles.successIcon}>🎉</p>
          <p className={styles.successTitle}>Thanks for the suggestion!</p>
          <p className={styles.successBody}>
            Your idea has been sent. We read every request and use them to shape what gets built next.
          </p>
          <button className="btn btn-primary" onClick={handleAnother}>Send Another</button>
          <button className="btn btn-ghost" onClick={onBack}>Back to Home</button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.hint}>
            What would make this app more useful for your group? Describe any feature, improvement, or missing piece.
          </p>

          <div className={styles.textareaWrap}>
            <textarea
              className={`input ${styles.textarea}`}
              placeholder="e.g. Add a way to track which spearhead abilities were used each round…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_CHARS}
              rows={6}
              required
            />
            <span className={`${styles.charCount} ${text.length >= MAX_CHARS ? styles.charCountMax : ''}`}>
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          {status === 'error' && (
            <p className="error-msg">Failed to send — check your connection and try again.</p>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={status === 'submitting' || !text.trim()}
          >
            {status === 'submitting' ? 'Sending…' : 'Send Suggestion'}
          </button>

          {!user && (
            <p className={styles.anonNote}>
              Submitting anonymously — sign in if you'd like us to follow up with you.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
