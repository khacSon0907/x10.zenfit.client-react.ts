import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  User,
  Phone,
  Mail,
  Target,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import type {
  ClientResponse,
  ClientStatus,
  FitnessGoal,
  CreateClientRequest,
} from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
} from '../../types/client.types';

export default function ClientsPage() {
  const {
    clients,
    isLoadingClients,
    clientsError,
    fetchClients,
    updateClient,
    deleteClient,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientStatus>('ALL');
  const [goalFilter, setGoalFilter] = useState<'ALL' | FitnessGoal>('ALL');

  // Modal chỉnh sửa
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateClientRequest>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal xoá
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tự động tải lại dữ liệu khi trang mount nếu danh sách rỗng
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Bộ lọc khách hàng
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Lọc theo trạng thái
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }
      // Lọc theo mục tiêu
      if (goalFilter !== 'ALL' && c.fitnessGoal !== goalFilter) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = c.fullName?.toLowerCase().includes(query);
        const matchPhone = c.phone?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        const matchNotes = c.notes?.toLowerCase().includes(query);
        const matchAddress = c.address?.toLowerCase().includes(query);
        return matchName || matchPhone || matchEmail || matchNotes || matchAddress;
      }
      return true;
    });
  }, [clients, statusFilter, goalFilter, searchQuery]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'ACTIVE').length;
    const frozen = clients.filter((c) => c.status === 'FROZEN').length;
    const inactive = clients.filter((c) => c.status === 'INACTIVE').length;
    const expired = clients.filter((c) => c.status === 'EXPIRED').length;
    return { total, active, frozen, inactive, expired };
  }, [clients]);

  // Xử lý mở modal chỉnh sửa
  const handleOpenEdit = (client: ClientResponse) => {
    setEditingClient(client);
    setEditForm({
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      gender: client.gender || 'MALE',
      dateOfBirth: client.dateOfBirth || '',
      address: client.address || '',
      status: client.status || 'ACTIVE',
      height: client.height,
      initialWeight: client.initialWeight,
      targetWeight: client.targetWeight,
      fitnessGoal: client.fitnessGoal || 'LOSE_FAT',
      experienceLevel: client.experienceLevel || 'BEGINNER',
      medicalConditions: client.medicalConditions || '',
      injuries: client.injuries || '',
      emergencyContactName: client.emergencyContactName || '',
      emergencyContactPhone: client.emergencyContactPhone || '',
      notes: client.notes || '',
    });
  };

  // Xử lý submit chỉnh sửa
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!editForm.fullName?.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    if (!editForm.phone?.trim()) {
      toast.error('Số điện thoại không được để trống');
      return;
    }

    setIsUpdating(true);
    try {
      const success = await updateClient(editingClient.id, editForm);
      if (success) {
        setEditingClient(null);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý xoá khách hàng
  const handleConfirmDelete = async () => {
    if (!deletingClientId) return;
    setIsDeleting(true);
    try {
      const success = await deleteClient(deletingClientId);
      if (success) {
        setDeletingClientId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER & NÚT THAO TÁC
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Danh sách Khách hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý hồ sơ học viên, chỉ số thể chất ban đầu và thông tin mục tiêu từ Backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Refresh */}
          <button
            type="button"
            onClick={() => fetchClients()}
            disabled={isLoadingClients}
            title="Làm mới danh sách từ Backend"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingClients ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Nút Thêm mới khách hàng & Hợp đồng PT */}
          <Link
            to="/pt/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm khách hàng mới</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          THỐNG KÊ NHANH
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tổng học viên</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Đang tập (ACTIVE)</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Bảo lưu (FROZEN)</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.frozen}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Tạm ngưng / Hết hạn</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.inactive + stats.expired}</p>
        </div>
      </div>

      {/* ========================================================
          BỘ LỌC & TÌM KIẾM
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, số điện thoại, email, địa chỉ..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Lọc theo Mục tiêu */}
          <div className="w-full md:w-56">
            <select
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value as 'ALL' | FitnessGoal)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Mọi mục tiêu thể hình</option>
              {(Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[]).map((goal) => (
                <option key={goal} value={goal}>
                  {FITNESS_GOAL_LABELS[goal]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs Lọc Trạng Thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 shrink-0">
            Trạng thái:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tất cả ({clients.length})
          </button>
          {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => {
            const count = clients.filter((c) => c.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {CLIENT_STATUS_LABELS[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          THÔNG BÁO LỖI NẾU KHÔNG GỌI ĐƯỢC API
         ======================================================== */}
      {clientsError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{clientsError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchClients()}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ========================================================
          DANH SÁCH KHÁCH HÀNG
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] shadow-xs overflow-hidden">
        {isLoadingClients && clients.length === 0 ? (
          // Skeleton loading
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang tải danh sách khách hàng từ máy chủ Backend...
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          // Empty State
          <div className="p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {clients.length === 0
                  ? 'Chưa có hồ sơ khách hàng nào trong hệ thống'
                  : 'Không tìm thấy khách hàng phù hợp bộ lọc'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {clients.length === 0
                  ? 'Hãy thêm mới hồ sơ học viên đầu tiên để bắt đầu theo dõi sức khoẻ và lịch tập.'
                  : 'Thử thay đổi từ khoá tìm kiếm hoặc đặt lại các bộ lọc trạng thái.'}
              </p>
            </div>
            {clients.length === 0 && (
              <Link
                to="/pt/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm học viên mới ngay</span>
              </Link>
            )}
          </div>
        ) : (
          // List Clients Table / Cards
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredClients.map((client) => {
              const statusMeta = client.status
                ? CLIENT_STATUS_LABELS[client.status]
                : { label: 'Đang tập', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };

              return (
                <div
                  key={client.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {client.fullName
                            ? client.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .slice(-2)
                                .join('')
                                .toUpperCase()
                            : 'KH'}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/pt/clients/${client.id}`}
                          className="font-semibold text-slate-900 dark:text-white text-sm truncate hover:text-emerald-500 transition-colors"
                        >
                          {client.fullName}
                        </Link>
                        {client.gender && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {GENDER_LABELS[client.gender] || client.gender}
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <a
                          href={`tel:${client.phone}`}
                          className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </a>

                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="hidden sm:flex items-center gap-1 hover:text-emerald-600 transition-colors truncate max-w-xs"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </a>
                        )}

                        {client.fitnessGoal && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Target className="h-3 w-3" />
                            <span>{FITNESS_GOAL_LABELS[client.fitnessGoal] || client.fitnessGoal}</span>
                          </span>
                        )}
                      </div>

                      {/* Additional Metrics */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap pt-0.5">
                        {client.height && <span>Cao: {client.height} cm</span>}
                        {client.initialWeight && <span>Nặng: {client.initialWeight} kg</span>}
                        {client.targetWeight && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Mục tiêu: {client.targetWeight} kg
                          </span>
                        )}
                        {client.joinedDate && <span>Tham gia: {client.joinedDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Link
                      to={`/pt/clients/${client.id}`}
                      title="Xem chi tiết hồ sơ"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(client)}
                      title="Chỉnh sửa thông tin"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingClientId(client.id)}
                      title="Xoá hồ sơ khách hàng"
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>



      {/* ========================================================
          MODAL CHỈNH SỬA KHÁCH HÀNG
         ======================================================== */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#0f1d32]/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="h-4 w-4 text-emerald-500" />
                <span>Cập nhật Hồ sơ Khách hàng</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Trạng thái</label>
                  <select
                    value={editForm.status || 'ACTIVE'}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as ClientStatus }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  >
                    {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {CLIENT_STATUS_LABELS[st].label} ({st})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mục tiêu thể hình</label>
                  <select
                    value={editForm.fitnessGoal || 'LOSE_FAT'}
                    onChange={(e) => setEditForm((p) => ({ ...p, fitnessGoal: e.target.value as FitnessGoal }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  >
                    {(Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[]).map((goal) => (
                      <option key={goal} value={goal}>
                        {FITNESS_GOAL_LABELS[goal]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Cân nặng mục tiêu (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.targetWeight ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        targetWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ghi chú của PT</label>
                  <textarea
                    rows={3}
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL XÁC NHẬN XOÁ KHÁCH HÀNG
         ======================================================== */}
      {deletingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác nhận xoá khách hàng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hành động này sẽ xoá hoàn toàn hồ sơ khỏi cơ sở dữ liệu ZenFit.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingClientId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang xoá...</span>
                  </>
                ) : (
                  <span>Xoá vĩnh viễn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
