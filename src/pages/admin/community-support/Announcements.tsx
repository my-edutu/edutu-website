import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp, Timestamp } from '../../../lib/firebaseMock';
import AnnouncementForm, {
  AnnouncementFormValues,
  AnnouncementAudience
} from '../../../components/admin/community/AnnouncementForm';

type AnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  scheduledAt: Date | null;
  createdAt: Date | null;
};

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!db) {
      setError('Firestore is not initialised. Check your Firebase configuration.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'announcements'));
      const items: AnnouncementRecord[] = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Record<string, unknown>;
        const scheduledAt = data.scheduledAt instanceof Timestamp ? data.scheduledAt.toDate() : null;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

        return {
          id: docSnapshot.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled announcement',
          body: typeof data.body === 'string' ? data.body : '',
          audience: (data.audience as AnnouncementAudience) || 'all',
          scheduledAt,
          createdAt
        };
      });

      items.sort((a, b) => {
        const lhs = (a.scheduledAt ?? a.createdAt ?? new Date(0)).getTime();
        const rhs = (b.scheduledAt ?? b.createdAt ?? new Date(0)).getTime();
        return rhs - lhs;
      });

      setAnnouncements(items);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
      setError('Unable to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnnouncements();
  }, [fetchAnnouncements]);

  const statusByDate = useMemo(() => {
    return announcements.map((item) => {
      const now = new Date();
      const scheduled = item.scheduledAt;
      if (scheduled && scheduled > now) {
        return 'Scheduled';
      }
      return 'Published';
    });
  }, [announcements]);

  const handleCreateAnnouncement = async (values: AnnouncementFormValues) => {
    if (!db) {
      setError('Firestore is not initialised. Announcement cannot be saved.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const scheduledAt = values.scheduledAt ? new Date(values.scheduledAt) : null;
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: values.title.trim(),
        body: values.body.trim(),
        audience: values.audience,
        scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : null,
        createdAt: serverTimestamp()
      });

      setAnnouncements((prev) => [
        {
          id: docRef.id,
          title: values.title.trim(),
          body: values.body.trim(),
          audience: values.audience,
          scheduledAt,
          createdAt: new Date()
        },
        ...prev
      ]);

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create announcement', err);
      setError('Unable to create announcement. Check your network or Firebase rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">
            Inform learners and partners about upcoming events, maintenance windows, and key wins.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void fetchAnnouncements()}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            New announcement
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Scheduled / Created</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading announcements...
                </td>
              </tr>
            )}

            {!loading && announcements.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No announcements found. Create your first update.
                </td>
              </tr>
            )}

            {!loading &&
              announcements.map((announcement, index) => {
                const scheduleOrCreated = announcement.scheduledAt ?? announcement.createdAt;
                return (
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{announcement.title}</div>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{announcement.body}</p>
                    </td>
                    <td className="px-4 py-4 capitalize text-gray-700">{announcement.audience}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {scheduleOrCreated ? scheduleOrCreated.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{statusByDate[index]}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <AnnouncementForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAnnouncement}
        loading={saving}
      />
    </div>
  );
};

export default Announcements;





