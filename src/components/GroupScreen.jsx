import { useState } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import styles from './GroupScreen.module.css';

// Unambiguous 6-char alphabet: no O/0, I/1, S/5, Z/2 lookalikes
const CODE_CHARS = 'ABCDEFGHJKLMNPQRTUVWXY3467';

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function CodeDisplay({ code }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={styles.codeRow}>
      <span className={styles.inviteCode}>{code}</span>
      <button className={`btn btn-secondary btn-sm ${styles.copyBtn}`} onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function ActiveGroupView({ user, activeGroup, onLeave }) {
  const [confirmLeave, setConfirmLeave] = useState(false);

  const isOwner = activeGroup.createdBy === user.uid;

  return (
    <div className={styles.activeGroup}>
      <p className={styles.groupLabel}>Active Group</p>
      <h3 className={styles.groupName}>{activeGroup.name}</h3>
      <p className={styles.memberCount}>{activeGroup.members.length} member{activeGroup.members.length !== 1 ? 's' : ''}</p>

      <div className={styles.inviteSection}>
        <p className={styles.inviteLabel}>Invite Code</p>
        <CodeDisplay code={activeGroup.inviteCode} />
        <p className={styles.inviteHint}>Share this code so friends can join your group.</p>
      </div>

      {confirmLeave ? (
        <div className={styles.confirmLeave}>
          <p>{isOwner ? 'Leave group? (group continues for other members)' : 'Leave this group?'}</p>
          <div className={styles.confirmActions}>
            <button className="btn btn-danger" onClick={onLeave}>Yes, leave</button>
            <button className="btn btn-secondary" onClick={() => setConfirmLeave(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className={`btn btn-ghost btn-sm ${styles.leaveBtn}`} onClick={() => setConfirmLeave(true)}>
          Leave Group
        </button>
      )}
    </div>
  );
}

function CreateTab({ user, onGroupJoined }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const inviteCode = generateCode();
      const docRef = await addDoc(collection(db, 'groups'), {
        name: trimmed,
        inviteCode,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
      });
      onGroupJoined({ id: docRef.id, name: trimmed, inviteCode, createdBy: user.uid, members: [user.uid] });
    } catch (err) {
      setError('Failed to create group. Check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.tabContent} onSubmit={handleCreate}>
      <label className={styles.fieldLabel}>Group Name</label>
      <input
        className="input"
        type="text"
        placeholder="e.g. Friday Night Warlords"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        required
      />
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Creating…' : 'Create Group'}
      </button>
    </form>
  );
}

function JoinTab({ user, onGroupJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Enter the 6-character invite code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', trimmed));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No group found with that code.');
        setLoading(false);
        return;
      }
      const groupDoc = snap.docs[0];
      const groupData = groupDoc.data();
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(user.uid),
      });
      onGroupJoined({
        id: groupDoc.id,
        name: groupData.name,
        inviteCode: groupData.inviteCode,
        createdBy: groupData.createdBy,
        members: [...new Set([...(groupData.members ?? []), user.uid])],
      });
    } catch (err) {
      setError('Failed to join group. Check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.tabContent} onSubmit={handleJoin}>
      <label className={styles.fieldLabel}>Invite Code</label>
      <input
        className={`input ${styles.codeInput}`}
        type="text"
        placeholder="AB3X7K"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        autoCapitalize="characters"
        required
      />
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading || code.trim().length !== 6}>
        {loading ? 'Joining…' : 'Join Group'}
      </button>
    </form>
  );
}

export default function GroupScreen({ user, activeGroup, onGroupChange, onBack }) {
  const [tab, setTab] = useState('create');

  async function handleLeave() {
    try {
      await updateDoc(doc(db, 'groups', activeGroup.id), {
        members: arrayRemove(user.uid),
      });
    } catch {
      // best-effort
    }
    onGroupChange(null);
  }

  return (
    <div className={`screen ${styles.groupScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>Groups</h2>
      </div>

      {activeGroup ? (
        <ActiveGroupView user={user} activeGroup={activeGroup} onLeave={handleLeave} />
      ) : (
        <>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'create' ? styles.tabActive : ''}`}
              onClick={() => setTab('create')}
            >
              Create
            </button>
            <button
              className={`${styles.tab} ${tab === 'join' ? styles.tabActive : ''}`}
              onClick={() => setTab('join')}
            >
              Join
            </button>
          </div>

          {tab === 'create' ? (
            <CreateTab user={user} onGroupJoined={onGroupChange} />
          ) : (
            <JoinTab user={user} onGroupJoined={onGroupChange} />
          )}
        </>
      )}
    </div>
  );
}
