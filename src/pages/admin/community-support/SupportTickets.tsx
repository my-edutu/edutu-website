import React, { useCallback, useEffect, useState } from 'react';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc
} from '../../../lib/firebaseMock';
import TicketModal, { SupportTicket, TicketMessage } from '../../../components/admin/community/TicketModal';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapMessages = (rawMessages: unknown): TicketMessage[] => {
    if (!Array.isArray(rawMessages)) {
      return [];
    }
    return rawMessages
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const safeEntry = entry as Record<string, unknown>;
        return {
          sender: typeof safeEntry.sender === 'string' ? safeEntry.sender : 'user',
          message: typeof safeEntry.message === 'string' ? safeEntry.message : '',
          createdAt:
            safeEntry.createdAt instanceof Timestamp
              ? safeEntry.createdAt.toDate()
              : typeof safeEntry.createdAt === 'string'
                ? new Date(safeEntry.createdAt)
                : undefined
        };
      })
      .filter((entry): entry is TicketMessage => Boolean(entry && entry.message));
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Using mock implementation for now
      console.log('Fetching support tickets (using mock implementation)');
      const snapshot = await getDocs(collection(null as any, 'support_tickets'));
      const items: SupportTicket[] = snapshot.docs.map((ticketDoc) => {
        const data = ticketDoc.data() as Record<string, unknown>;
        return {
          id: ticketDoc.id,
          userEmail: typeof data.userEmail === 'string' ? data.userEmail : 'unknown@user',
          subject: typeof data.subject === 'string' ? data.subject : 'No subject',
          category: typeof data.category === 'string' ? data.category : undefined,
          status: data.status === 'resolved' ? 'resolved' : 'open',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
          messages: mapMessages(data.messages)
        };
      });

      items.sort((a, b) => {
        const left = (a.createdAt ?? new Date(0)).getTime();
        const right = (b.createdAt ?? new Date(0)).getTime();
        return right - left;
      });

      setTickets(items);
    } catch (err) {
      console.error('Unable to load support tickets', err);
      setError('Unable to load support tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
  };

  const handleReply = async (message: string) => {
    if (!selectedTicket) {
      return;
    }
    if (!db) {
      setError('Firestore not initialised. Reply cannot be saved.');
      return;
    }

    setActionLoading(true);
    try {
      const docRef = doc(db, 'support_tickets', selectedTicket.id);
      const replyPayload = {
        sender: 'admin',
        message,
        createdAt: serverTimestamp()
      };

      await updateDoc(docRef, {
        messages: arrayUnion(replyPayload),
        updatedAt: serverTimestamp()
      });

      const mappedReply: TicketMessage = {
        sender: 'admin',
        message,
        createdAt: new Date()
      };

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, messages: [...ticket.messages, mappedReply] }
            : ticket
        )
      );
      setSelectedTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, mappedReply] } : prev
      );
    } catch (err) {
      console.error('Unable to send reply', err);
      setError('Reply could not be sent. Check your Firebase rules or network connection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedTicket) {
      return;
    }
    if (!db) {
      setError('Firestore not initialised. Ticket cannot be updated.');
      return;
    }

    setActionLoading(true);
    try {
      const docRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(docRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp()
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id ? { ...ticket, status: 'resolved' } : ticket
        )
      );
      setSelectedTicket((prev) => (prev ? { ...prev, status: 'resolved' } : prev));
    } catch (err) {
      console.error('Unable to mark ticket as resolved', err);
      setError('Ticket status could not be updated. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Support tickets</h1>
          <p className="text-sm text-gray-500">
            Respond to learner issues quickly. Track open threads and close the loop when resolved.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchTickets()}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading support tickets...
                </td>
              </tr>
            )}
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No tickets at the moment. Great job keeping the queue clean!
                </td>
              </tr>
            )}
            {!loading &&
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="cursor-pointer transition hover:bg-gray-50"
                  onClick={() => handleOpenTicket(ticket)}
                >
                  <td className="px-4 py-4 font-medium text-gray-900">{ticket.userEmail}</td>
                  <td className="px-4 py-4 text-gray-700">{ticket.subject}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{ticket.category || 'General'}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {ticket.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {ticket.createdAt ? ticket.createdAt.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <TicketModal
        isOpen={Boolean(selectedTicket)}
        ticket={selectedTicket}
        onClose={handleCloseModal}
        onReply={handleReply}
        onMarkResolved={handleMarkResolved}
        loading={actionLoading}
      />
    </div>
  );
};

export default SupportTickets;

