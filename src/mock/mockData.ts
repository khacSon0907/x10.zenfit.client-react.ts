export interface ClientPackage {
  id: string;
  name: string;
  totalSessions: number;
  remainingSessions: number;
  completedSessions: number;
  price: number;
  paidAmount: number;
  debtAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring_soon' | 'completed' | 'on_hold';
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  birthDate?: string;
  gender: 'male' | 'female' | 'other';
  job?: string;
  injuriesHistory?: string;
  goal: string;
  preferredTimeSlot: string;
  consentGiven: boolean;
  status: 'lead' | 'trial' | 'active' | 'paused' | 'ended';
  attendanceLevel: 'regular' | 'moderate' | 'irregular' | 'risk_churn';
  currentPackage?: ClientPackage;
  joinedDate: string;
  notes?: string;
  trialStatus?: 'pending_reminder' | 'reminded' | 'considering' | 'converted' | 'rejected';
  renewalStatus?: 'not_reminded' | 'reminded' | 'considering' | 'renewed' | 'rejected';
  expectedRenewalRevenue?: number;
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  timeSlot: string; // e.g. "07:00 - 08:00"
  date: string; // YYYY-MM-DD
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'absent';
  packageRemainingSessions: number;
  packageTotalSessions: number;
  packageId?: string;
  packageName?: string;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface PTPlan {
  id: string;
  name: string;
  tier: 'Free' | 'Plus' | 'Pro';
  maxClients: number;
  currentClients: number;
  monthlyFee: number;
  gracePeriodDays: number;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

export interface AdminPTUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  planName: 'Free' | 'Plus' | 'Pro';
  activeClientsCount: number;
  registeredDate: string;
  expiresDate: string;
  lastLogin: string;
  status: 'active' | 'locked' | 'expiring';
}

export const INITIAL_PT_PLAN: PTPlan = {
  id: 'plan-free',
  name: 'Gói Trải Nghiệm',
  tier: 'Free',
  maxClients: 5,
  currentClients: 4,
  monthlyFee: 0,
  gracePeriodDays: 7,
  expiresAt: '2026-12-31',
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    fullName: 'Nguyễn Minh Tuấn',
    phone: '0912345678',
    gender: 'male',
    birthDate: '1995-04-12',
    job: 'Kỹ sư phần mềm',
    injuriesHistory: 'Đau thắt lưng L4-L5 nhẹ khi ngồi lâu',
    goal: 'Giảm 5kg mỡ bụng & cải thiện tư thế gù',
    preferredTimeSlot: '18:00 - 19:00',
    consentGiven: true,
    status: 'active',
    attendanceLevel: 'regular',
    joinedDate: '2026-08-01',
    currentPackage: {
      id: 'pkg-1',
      name: 'Gói Tăng cơ Giảm mỡ 24 buổi',
      totalSessions: 24,
      completedSessions: 22,
      remainingSessions: 2, // Sắp hết buổi!
      price: 9600000,
      paidAmount: 9600000,
      debtAmount: 0,
      startDate: '2026-08-05',
      endDate: '2026-10-25',
      status: 'expiring_soon',
    },
    renewalStatus: 'reminded',
    expectedRenewalRevenue: 9600000,
  },
  {
    id: 'c2',
    fullName: 'Trần Thị Mai Phương',
    phone: '0987654321',
    gender: 'female',
    birthDate: '1998-09-20',
    job: 'Ngân hàng',
    injuriesHistory: 'Cổ tay trái hơi yếu sau chấn thương cầu lông',
    goal: 'Săn chắc cơ thể, tăng vòng 3',
    preferredTimeSlot: '07:00 - 08:00',
    consentGiven: true,
    status: 'active',
    attendanceLevel: 'moderate',
    joinedDate: '2026-09-01',
    currentPackage: {
      id: 'pkg-2',
      name: 'Gói Định hình vóc dáng 12 buổi',
      totalSessions: 12,
      completedSessions: 7,
      remainingSessions: 5,
      price: 5400000,
      paidAmount: 4000000,
      debtAmount: 1400000, // Có công nợ
      startDate: '2026-09-05',
      endDate: '2026-11-05',
      status: 'active',
    },
    renewalStatus: 'not_reminded',
    expectedRenewalRevenue: 5400000,
  },
  {
    id: 'c3',
    fullName: 'Lê Hoàng Long',
    phone: '0903112233',
    gender: 'male',
    birthDate: '1990-11-15',
    job: 'Kinh doanh tự do',
    injuriesHistory: 'Khớp gối phải kêu lạo xạo khi squat sâu',
    goal: 'Tăng thể lực & giảm stress',
    preferredTimeSlot: '19:30 - 20:30',
    consentGiven: true,
    status: 'active',
    attendanceLevel: 'irregular', // Không đều đặn
    joinedDate: '2026-08-15',
    currentPackage: {
      id: 'pkg-3',
      name: 'Gói Cá nhân 36 buổi',
      totalSessions: 36,
      completedSessions: 11,
      remainingSessions: 25,
      price: 13500000,
      paidAmount: 13500000,
      debtAmount: 0,
      startDate: '2026-08-20',
      endDate: '2027-01-20',
      status: 'active',
    },
    renewalStatus: 'not_reminded',
  },
  {
    id: 'c4',
    fullName: 'Đặng Thảo Vy',
    phone: '0938445566',
    gender: 'female',
    birthDate: '2001-02-28',
    job: 'Sáng tạo nội dung',
    injuriesHistory: 'Không có',
    goal: 'Giảm cân cấp tốc cho sự kiện',
    preferredTimeSlot: '08:30 - 09:30',
    consentGiven: true,
    status: 'active',
    attendanceLevel: 'risk_churn', // Nguy cơ bỏ
    joinedDate: '2026-09-10',
    currentPackage: {
      id: 'pkg-4',
      name: 'Gói Cơ bản 12 buổi',
      totalSessions: 12,
      completedSessions: 3,
      remainingSessions: 9,
      price: 5000000,
      paidAmount: 2500000,
      debtAmount: 2500000,
      startDate: '2026-09-12',
      endDate: '2026-11-12',
      status: 'active',
    },
    renewalStatus: 'not_reminded',
  },
  {
    id: 'c5',
    fullName: 'Phạm Thanh Bình',
    phone: '0971223344',
    gender: 'male',
    birthDate: '1988-06-18',
    job: 'Giám đốc Marketing',
    injuriesHistory: 'Cổ vai gáy căng cứng',
    goal: 'Cải thiện sức bền, tập thử',
    preferredTimeSlot: '17:00 - 18:00',
    consentGiven: true,
    status: 'trial', // Đã trial chưa mua
    attendanceLevel: 'moderate',
    joinedDate: '2026-10-08',
    trialStatus: 'pending_reminder',
    expectedRenewalRevenue: 8000000,
  },
  {
    id: 'c6',
    fullName: 'Hoàng Mỹ Duyên',
    phone: '0945998877',
    gender: 'female',
    birthDate: '1997-12-05',
    job: 'Thiết kế đồ họa',
    injuriesHistory: 'Thoái hóa đốt sống cổ nhẹ',
    goal: 'Săn chắc cơ bụng và giảm đau mỏi',
    preferredTimeSlot: '12:00 - 13:00',
    consentGiven: true,
    status: 'lead',
    attendanceLevel: 'moderate',
    joinedDate: '2026-10-12',
  },
  {
    id: 'c7',
    fullName: 'Vũ Đức Nam',
    phone: '0918776655',
    gender: 'male',
    birthDate: '1993-07-22',
    job: 'Bất động sản',
    injuriesHistory: 'Bong gân cổ chân cũ',
    goal: 'Tăng cơ ngực và xô',
    preferredTimeSlot: '06:00 - 07:00',
    consentGiven: true,
    status: 'paused', // Tạm nghỉ
    attendanceLevel: 'irregular',
    joinedDate: '2026-07-10',
    currentPackage: {
      id: 'pkg-7',
      name: 'Gói Tăng cơ 24 buổi',
      totalSessions: 24,
      completedSessions: 18,
      remainingSessions: 6,
      price: 9600000,
      paidAmount: 9600000,
      debtAmount: 0,
      startDate: '2026-07-15',
      endDate: '2026-10-15',
      status: 'on_hold',
    },
  },
  {
    id: 'c8',
    fullName: 'Bùi Ngọc Lan',
    phone: '0966332211',
    gender: 'female',
    birthDate: '1994-03-30',
    job: 'Kế toán',
    injuriesHistory: 'Không có',
    goal: 'Duy trì vóc dáng',
    preferredTimeSlot: '18:00 - 19:00',
    consentGiven: true,
    status: 'ended', // Đã kết thúc
    attendanceLevel: 'regular',
    joinedDate: '2026-05-01',
    currentPackage: {
      id: 'pkg-8',
      name: 'Gói Tiêu chuẩn 24 buổi',
      totalSessions: 24,
      completedSessions: 24,
      remainingSessions: 0,
      price: 9000000,
      paidAmount: 9000000,
      debtAmount: 0,
      startDate: '2026-05-05',
      endDate: '2026-08-05',
      status: 'completed',
    },
    renewalStatus: 'rejected',
  },
];

export const MOCK_TODAY_SESSIONS: WorkoutSession[] = [
  {
    id: 's1',
    clientId: 'c2',
    clientName: 'Trần Thị Mai Phương',
    clientPhone: '0987654321',
    timeSlot: '07:00 - 08:00',
    date: '2026-10-14',
    status: 'completed',
    packageRemainingSessions: 5,
    packageTotalSessions: 12,
    packageName: 'Gói Định hình vóc dáng 12 buổi',
    checkInTime: '06:58',
    checkOutTime: '08:02',
    notes: 'Tập trung nhóm cơ mông, đùi sau. Form bài RDL rất tốt.',
  },
  {
    id: 's2',
    clientId: 'c4',
    clientName: 'Đặng Thảo Vy',
    clientPhone: '0938445566',
    timeSlot: '08:30 - 09:30',
    date: '2026-10-14',
    status: 'absent',
    packageRemainingSessions: 9,
    packageTotalSessions: 12,
    packageName: 'Gói Cơ bản 12 buổi',
    notes: 'Khách nhắn bận họp đột xuất không đến.',
  },
  {
    id: 's3',
    clientId: 'c1',
    clientName: 'Nguyễn Minh Tuấn',
    clientPhone: '0912345678',
    timeSlot: '18:00 - 19:00',
    date: '2026-10-14',
    status: 'upcoming',
    packageRemainingSessions: 2, // Gói còn 2 buổi
    packageTotalSessions: 24,
    packageName: 'Gói Tăng cơ Giảm mỡ 24 buổi',
    notes: 'Buổi áp chót, chuẩn bị trao đổi kế hoạch gia hạn.',
  },
  {
    id: 's4',
    clientId: 'c3',
    clientName: 'Lê Hoàng Long',
    clientPhone: '0903112233',
    timeSlot: '19:30 - 20:30',
    date: '2026-10-14',
    status: 'upcoming',
    packageRemainingSessions: 25,
    packageTotalSessions: 36,
    packageName: 'Gói Cá nhân 36 buổi',
    notes: 'Tập nhóm cơ lưng - tay trước. Chú ý khớp gối khởi động kỹ.',
  },
];

export const MOCK_ADMIN_PTS: AdminPTUser[] = [
  {
    id: 'pt-1',
    fullName: 'Hoàng Anh Quân (PT Demo)',
    email: 'pt@zenfit.vn',
    phone: '0909123456',
    planName: 'Free',
    activeClientsCount: 4,
    registeredDate: '2026-06-01',
    expiresDate: '2026-12-31',
    lastLogin: 'Hôm nay, 14:30',
    status: 'active',
  },
  {
    id: 'pt-2',
    fullName: 'Đặng Hải Đăng',
    email: 'haidang.pt@gmail.com',
    phone: '0912888999',
    planName: 'Plus',
    activeClientsCount: 22,
    registeredDate: '2026-03-15',
    expiresDate: '2026-10-20',
    lastLogin: 'Hôm qua, 21:15',
    status: 'expiring',
  },
  {
    id: 'pt-3',
    fullName: 'Nguyễn Bích Ngọc',
    email: 'bichngoc.fitness@gmail.com',
    phone: '0978333222',
    planName: 'Pro',
    activeClientsCount: 46,
    registeredDate: '2026-01-10',
    expiresDate: '2027-01-10',
    lastLogin: '3 ngày trước',
    status: 'active',
  },
  {
    id: 'pt-4',
    fullName: 'Lê Quốc Việt',
    email: 'vietquoc.pt@gmail.com',
    phone: '0933555777',
    planName: 'Free',
    activeClientsCount: 5,
    registeredDate: '2026-08-01',
    expiresDate: '2026-09-30',
    lastLogin: '10 ngày trước',
    status: 'locked',
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-14 10:15:20',
    actor: 'admin@zenfit.vn',
    action: 'Gia hạn gói thuê bao',
    target: 'PT Đặng Hải Đăng (Plus)',
    details: 'Gia hạn thêm 30 ngày qua thanh toán chuyển khoản VCB #8849',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-13 16:40:05',
    actor: 'admin@zenfit.vn',
    action: 'Khóa tài khoản',
    target: 'PT Lê Quốc Việt',
    details: 'Quá hạn thanh toán gói hơn 14 ngày (hết hạn ân hạn 7 ngày)',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-12 09:00:12',
    actor: 'admin@zenfit.vn',
    action: 'Tặng ngày sử dụng',
    target: 'PT Nguyễn Bích Ngọc (Pro)',
    details: 'Tặng 7 ngày bù thời gian bảo trì máy chủ kỹ thuật',
  },
];
