import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  Timestamp
} from '../../../lib/firebaseMock';
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import useRoleManager, { type UserRole } from '../../../hooks/useRoleManager';
import UserList from '../../../components/admin/users/UserList';
import UserDetailDrawer from '../../../components/admin/users/UserDetailDrawer';
import type { AdminUserRecord } from '../../../components/admin/users/types';

type BannerState = { message: string | null; error: string | null };

const defaultBanner: BannerState = { message: null, error: null };

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toDate = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const normaliseRole = (role: unknown, fallback: UserRole): UserRole => {
  if (typeof role !== 'string') {
    return fallback;
  }
  const safe = role.trim().toLowerCase();
  if (safe === 'admin' || safe === 'moderator' || safe === 'learner') {
    return safe;
  }
  return fallback;
};

const mapUserDoc = (
  docSnapshot: QueryDocumentSnapshot<DocumentData>,
  roles: readonly UserRole[]
): AdminUserRecord => {
  const data = docSnapshot.data() as Record<string, unknown>;
  const primaryRole = (roles.includes(data.role as UserRole) ? data.role : 'learner') as UserRole;

  return {
    id: docSnapshot.id,
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    role: normaliseRole(primaryRole, 'learner'),
    goalsCompleted: toNumber(data.goalsCompleted, 0),
    opportunitiesExplored: toNumber(data.opportunitiesExplored, 0),
    lastActive: toDate(data.lastActive),
    joinedAt: toDate(data.joinedAt),
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    location: typeof data.location === 'string' ? data.location : undefined,
    aiInteractions: toNumber(data.aiInteractions ?? data.aiChats, 0),
    goalCompletionRate: typeof data.goalCompletionRate === 'number' ? data.goalCompletionRate : undefined,
    engagementScore: typeof data.engagementScore === 'number' ? data.engagementScore : undefined
  };
};

const UsersPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const roleManager = useRoleManager();
  const { roles } = roleManager;
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [banner, setBanner] = useState<BannerState>(defaultBanner);
  const bannerTimeoutRef = useRef<number | undefined>(undefined);

  const handleBanner = useCallback((next: BannerState) => {
    setBanner(next);
    if (bannerTimeoutRef.current) {
      window.clearTimeout(bannerTimeoutRef.current);
    }
    if (next.message || next.error) {
      bannerTimeoutRef.current = window.setTimeout(() => {
        setBanner(defaultBanner);
        bannerTimeoutRef.current = undefined;
      }, 4500);
    }
  }, []);

  const upsertUsers = useCallback(
    (nextUsers: AdminUserRecord[]) => {
      setUsers(nextUsers);
      if (selectedUser) {
        const updated = nextUsers.find((user) => user.id === selectedUser.id);
        if (updated) {
          setSelectedUser(updated);
        }
      }
    },
    [selectedUser]
  );

  const fetchUsers = useCallback(async () => {
    if (!db) {
      setFetchError('Firestore is not initialised. Unable to load users.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const nextUsers = snapshot.docs.map((docSnapshot) => mapUserDoc(docSnapshot, roles));
      upsertUsers(nextUsers);
    } catch (error) {
      console.error('Failed to load user management list', error);
      setFetchError(error instanceof Error ? error.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [roles, upsertUsers]);

  useEffect(() => {
    if (!db) {
      setFetchError('Firestore is not initialised. Unable to load users.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    const collectionRef = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const nextUsers = snapshot.docs.map((docSnapshot) => mapUserDoc(docSnapshot, roles));
        upsertUsers(nextUsers);
        setLoading(false);
      },
      (error) => {
        console.error('User list subscription error', error);
        setFetchError('Realtime updates failed. Please refresh users manually.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roles, upsertUsers]);

  useEffect(
    () => () => {
      if (bannerTimeoutRef.current) {
        window.clearTimeout(bannerTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (roleManager.message) {
      handleBanner({ message: roleManager.message, error: null });
      roleManager.resetFeedback();
    } else if (roleManager.error) {
      handleBanner({ message: null, error: roleManager.error });
      roleManager.resetFeedback();
    }
  }, [handleBanner, roleManager]);

  const handleSelectUser = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleChangeRole = async (userId: string, role: UserRole) => {
    try {
      await roleManager.setUserRole(userId, role);
      setUsers((previous) =>
        previous.map((user) => (user.id === userId ? { ...user, role } : user))
      );
    } catch (error) {
      handleBanner({
        message: null,
        error: error instanceof Error ? error.message : 'Unable to update role. Try again.'
      });
    }
  };

  const handleSuspend = (user: AdminUserRecord) => {
    handleBanner({
      message: null,
      error: `Suspension workflow pending implementation for ${user.email}.`
    });
  };

  const handleDelete = (user: AdminUserRecord) => {
    handleBanner({
      message: null,
      error: `Deletion workflow pending implementation for ${user.email}.`
    });
  };

  const handleDeactivate = (user: AdminUserRecord) => {
    handleBanner({
      message: `Deactivate user placeholder triggered for ${user.email}.`,
      error: null
    });
  };

  const handleResetPassword = (user: AdminUserRecord) => {
    handleBanner({
      message: `Reset password placeholder triggered for ${user.email}.`,
      error: null
    });
  };

  const compositeBanner = useMemo<BannerState>(() => {
    if (banner.error) {
      return { message: null, error: banner.error };
    }
    if (banner.message) {
      return { message: banner.message, error: null };
    }
    return defaultBanner;
  }, [banner]);

  if (adminLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-600">
        Verifying admin access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-center text-sm text-red-700">
        Admin privileges are required to manage users. Contact the Edutu team to request access.
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <UserList
        users={users}
        loading={loading}
        error={fetchError}
        onRefresh={fetchUsers}
        onSelectUser={handleSelectUser}
        onChangeRole={handleChangeRole}
        roleOptions={roles}
        roleUpdating={roleManager.loading}
        updatingUserId={roleManager.activeUserId}
        onSuspendUser={handleSuspend}
        onDeleteUser={handleDelete}
        feedback={compositeBanner}
      />

      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseDrawer}
          />
          <UserDetailDrawer
            open={drawerOpen}
            user={selectedUser}
            onClose={handleCloseDrawer}
            onChangeRole={handleChangeRole}
            roleOptions={roles}
            roleUpdating={roleManager.loading}
            updatingUserId={roleManager.activeUserId}
            onDeactivate={handleDeactivate}
            onResetPassword={handleResetPassword}
            feedback={compositeBanner}
          />
        </>
      )}
    </div>
  );
};

export default UsersPage;
