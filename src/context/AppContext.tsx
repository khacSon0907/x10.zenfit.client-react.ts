import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  MOCK_CLIENTS,
  MOCK_TODAY_SESSIONS,
  INITIAL_PT_PLAN,
  MOCK_ADMIN_PTS,
  MOCK_AUDIT_LOGS,
  type Client,
  type WorkoutSession,
  type PTPlan,
  type AdminPTUser,
  type AuditLog,
} from '../mock/mockData';
import { toast } from 'sonner';

import { useAuth } from './AuthContext';

export type UserRole = 'ROLE_PT' | 'ROLE_ADMIN' | null;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ROLE_PT' | 'ROLE_ADMIN';
  avatar?: string;
  title?: string;
}

interface AppContextType {
  role: UserRole;
  user: AppUser | null;
  clients: Client[];
  todaySessions: WorkoutSession[];
  ptPlan: PTPlan;
  adminPTs: AdminPTUser[];
  auditLogs: AuditLog[];
  loginAsPT: () => void;
  loginAsAdmin: () => void;
  logoutApp: () => Promise<void> | void;
  checkInSession: (sessionId: string) => void;
  checkOutSession: (sessionId: string) => void;
  cancelSession: (sessionId: string, reason?: string) => void;
  markAbsentSession: (sessionId: string) => void;
  addClient: (clientData: Omit<Client, 'id' | 'joinedDate'>) => boolean;
  updateClientStatus: (clientId: string, status: Client['status']) => void;
  updateRenewalStatus: (clientId: string, renewalStatus: Client['renewalStatus']) => void;
  updateTrialStatus: (clientId: string, trialStatus: Client['trialStatus']) => void;
  toggleAdminPTStatus: (ptId: string) => void;
  extendPTPlan: (ptId: string, days: number, reason: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, logout: authLogout } = useAuth();

  // Quản lý vai trò (mặc định lấy từ localStorage hoặc khởi tạo 'ROLE_PT' nếu đã login)
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('zenfit_role');
    return (saved as UserRole) || 'ROLE_PT';
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    const savedRole = localStorage.getItem('zenfit_role') || 'ROLE_PT';
    if (savedRole === 'ROLE_ADMIN') {
      return {
        id: 'admin-01',
        name: 'Trần Quản Trị',
        email: 'admin@zenfit.vn',
        role: 'ROLE_ADMIN',
        title: 'Quản trị viên hệ thống',
      };
    }
    return {
      id: 'pt-01',
      name: 'Hoàng Anh Quân',
      email: 'pt.quan@zenfit.vn',
      role: 'ROLE_PT',
      title: 'Personal Trainer Freelance',
    };
  });

  // Đồng bộ thông tin người dùng từ Backend Authentication vào AppContext
  const authUserId = authUser?.id;
  useEffect(() => {
    if (authUser) {
      const isAdmin = authUser.roles?.includes('ROLE_ADMIN');
      const targetRole = isAdmin ? 'ROLE_ADMIN' : 'ROLE_PT';
      setRole((prev) => (prev !== targetRole ? targetRole : prev));
      setUser((prev) => {
        if (prev?.id === authUser.id && prev?.name === (authUser.name || authUser.username)) {
          return prev;
        }
        return {
          id: authUser.id,
          name: authUser.name || authUser.username,
          email: authUser.email,
          role: targetRole,
          title: isAdmin ? 'Quản trị viên hệ thống' : 'Personal Trainer Freelance',
        };
      });
    }
  }, [authUser, authUserId]);

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('zenfit_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });

  const [todaySessions, setTodaySessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('zenfit_sessions');
    return saved ? JSON.parse(saved) : MOCK_TODAY_SESSIONS;
  });

  const [ptPlan, setPtPlan] = useState<PTPlan>(INITIAL_PT_PLAN);
  const [adminPTs, setAdminPTs] = useState<AdminPTUser[]>(MOCK_ADMIN_PTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Lưu state vào localStorage khi có thay đổi
  useEffect(() => {
    if (role) {
      localStorage.setItem('zenfit_role', role);
    } else {
      localStorage.removeItem('zenfit_role');
    }
  }, [role]);

  useEffect(() => {
    localStorage.setItem('zenfit_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('zenfit_sessions', JSON.stringify(todaySessions));
  }, [todaySessions]);

  const loginAsPT = () => {
    setRole('ROLE_PT');
    setUser({
      id: 'pt-01',
      name: 'Hoàng Anh Quân',
      email: 'pt.quan@zenfit.vn',
      role: 'ROLE_PT',
      title: 'Personal Trainer Freelance',
    });
    toast.success('Đăng nhập thành công với vai trò Huấn Luyện Viên (PT)');
  };

  const loginAsAdmin = () => {
    setRole('ROLE_ADMIN');
    setUser({
      id: 'admin-01',
      name: 'Trần Quản Trị',
      email: 'admin@zenfit.vn',
      role: 'ROLE_ADMIN',
      title: 'Quản trị viên hệ thống',
    });
    toast.success('Đăng nhập thành công với vai trò Quản Trị Viên (Admin)');
  };

  const logoutApp = async () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('zenfit_role');
    try {
      await authLogout();
    } catch {
      window.location.href = '/login';
    }
    toast.info('Đã đăng xuất khỏi hệ thống');
  };

  // CHECK-IN BUỔI TẬP
  const checkInSession = (sessionId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setTodaySessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'in_progress',
            checkInTime: timeStr,
          };
        }
        return s;
      })
    );
    toast.success(`Check-in thành công lúc ${timeStr}! Buổi tập đang diễn ra.`);
  };

  // CHECK-OUT BUỔI TẬP (HỆ THỐNG TỰ TRỪ SỐ BUỔI TRONG GÓI CỦA KHÁCH)
  const checkOutSession = (sessionId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const targetSession = todaySessions.find((s) => s.id === sessionId);
    if (!targetSession) return;

    // 1. Cập nhật trạng thái buổi tập thành completed
    setTodaySessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'completed',
            checkOutTime: timeStr,
            packageRemainingSessions: Math.max(0, s.packageRemainingSessions - 1),
          };
        }
        return s;
      })
    );

    // 2. Trừ trực tiếp 1 buổi vào gói tập của khách hàng tương ứng
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === targetSession.clientId && c.currentPackage) {
          const newRemaining = Math.max(0, c.currentPackage.remainingSessions - 1);
          const newCompleted = c.currentPackage.completedSessions + 1;
          const isExpiring = newRemaining <= 3 && newRemaining > 0;
          const isDone = newRemaining === 0;

          return {
            ...c,
            currentPackage: {
              ...c.currentPackage,
              remainingSessions: newRemaining,
              completedSessions: newCompleted,
              status: isDone ? 'completed' : isExpiring ? 'expiring_soon' : c.currentPackage.status,
            },
          };
        }
        return c;
      })
    );

    toast.success(
      `Check-out hoàn tất lúc ${timeStr}! Đã trừ 1 buổi tập vào gói của khách hàng ${targetSession.clientName}.`
    );
  };

  // HỦY BUỔI TẬP
  const cancelSession = (sessionId: string, reason?: string) => {
    setTodaySessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'cancelled',
            notes: reason ? `[Hủy]: ${reason}` : s.notes,
          };
        }
        return s;
      })
    );
    toast.info('Đã ghi nhận hủy buổi tập.');
  };

  // VẮNG MẶT
  const markAbsentSession = (sessionId: string) => {
    setTodaySessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'absent',
            notes: s.notes ? `${s.notes} (Khách vắng mặt)` : 'Khách vắng mặt không báo trước',
          };
        }
        return s;
      })
    );
    toast.warning('Đã đánh dấu khách vắng mặt.');
  };

  // THÊM KHÁCH HÀNG (CÓ CHẶN HẠN MỨC GÓI)
  const addClient = (clientData: Omit<Client, 'id' | 'joinedDate'>): boolean => {
    // Kiểm tra hạn mức học viên
    const activeClientsCount = clients.filter(
      (c) => c.status === 'active' || c.status === 'trial' || c.status === 'lead'
    ).length;

    if (activeClientsCount >= ptPlan.maxClients) {
      toast.error(
        `Bạn đã đạt hạn mức tối đa (${ptPlan.maxClients} học viên) của gói ${ptPlan.tier}. Vui lòng nâng cấp gói để thêm khách mới!`
      );
      return false;
    }

    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setClients((prev) => [newClient, ...prev]);
    setPtPlan((prev) => ({
      ...prev,
      currentClients: prev.currentClients + 1,
    }));

    toast.success(`Đã thêm học viên ${newClient.fullName} thành công!`);
    return true;
  };

  const updateClientStatus = (clientId: string, status: Client['status']) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status } : c))
    );
    toast.success('Cập nhật trạng thái học viên thành công.');
  };

  const updateRenewalStatus = (clientId: string, renewalStatus: Client['renewalStatus']) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, renewalStatus } : c))
    );
    toast.success('Đã cập nhật trạng thái gia hạn.');
  };

  const updateTrialStatus = (clientId: string, trialStatus: Client['trialStatus']) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, trialStatus } : c))
    );
    toast.success('Đã cập nhật trạng thái buổi tập thử (Trial).');
  };

  const toggleAdminPTStatus = (ptId: string) => {
    setAdminPTs((prev) =>
      prev.map((p) => {
        if (p.id === ptId) {
          const nextStatus = p.status === 'locked' ? 'active' : 'locked';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    toast.success('Đã thay đổi trạng thái tài khoản PT.');
  };

  const extendPTPlan = (ptId: string, days: number, reason: string) => {
    setAdminPTs((prev) =>
      prev.map((p) => {
        if (p.id === ptId) {
          return {
            ...p,
            status: 'active',
          };
        }
        return p;
      })
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: user?.email || 'admin@zenfit.vn',
      action: `Gia hạn / tặng ${days} ngày`,
      target: `PT ID: ${ptId}`,
      details: `Lý do: ${reason}`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    toast.success(`Đã gia hạn thành công ${days} ngày cho PT!`);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        clients,
        todaySessions,
        ptPlan,
        adminPTs,
        auditLogs,
        loginAsPT,
        loginAsAdmin,
        logoutApp,
        checkInSession,
        checkOutSession,
        cancelSession,
        markAbsentSession,
        addClient,
        updateClientStatus,
        updateRenewalStatus,
        updateTrialStatus,
        toggleAdminPTStatus,
        extendPTPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
