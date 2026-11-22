import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  ClientResponse,
  ClientStatus,
  CreateClientRequest,
  UpdateClientRequest,
  CreatePtContractRequest,
  ContractStatus,
  ExperienceLevel,
  FitnessGoal,
  Gender,
} from '../types/client.types';

// Re-export toàn bộ kiểu dữ liệu phục vụ các module khác sử dụng trực tiếp từ clientApi
export type {
  ClientResponse,
  ClientStatus,
  CreateClientRequest,
  UpdateClientRequest,
  CreatePtContractRequest,
  ContractStatus,
  ExperienceLevel,
  FitnessGoal,
  Gender,
};

/**
 * ============================================================================
 * CLIENT API SERVICE
 * Quản lý các endpoint CRUD & Tìm kiếm Hồ sơ Khách hàng / Học viên
 * ============================================================================
 */
export const clientApi = {
  /**
   * Tạo mới hồ sơ khách hàng độc lập
   * POST /api/clients
   * 
   * @param data Payload thông tin khách hàng (CreateClientRequest)
   * @returns Dữ liệu khách hàng vừa tạo (ClientResponse)
   */
  createClient: async (data: CreateClientRequest): Promise<ClientResponse> => {
    const response = await axiosClient.post<ApiResponse<ClientResponse>>('/api/clients', data);
    return response.data.data;
  },

  /**
   * Tìm kiếm khách hàng theo từ khoá (Họ tên hoặc Số điện thoại)
   * Phục vụ tính năng Search debounce tự động khi tạo Hợp đồng PT
   * GET /api/clients/search?keyword=...
   * 
   * @param keyword Từ khoá tìm kiếm
   * @param trainerId ID của PT nếu cần lọc theo huấn luyện viên
   * @returns Danh sách khách hàng phù hợp
   */
  searchClients: async (keyword: string, trainerId?: string): Promise<ClientResponse[]> => {
    if (!keyword.trim()) return [];
    const params: Record<string, string> = { keyword: keyword.trim() };
    if (trainerId) {
      params.trainerId = trainerId;
    }
    const response = await axiosClient.get<ApiResponse<ClientResponse[]>>('/api/clients/search', {
      params,
    });
    return response.data.data ?? [];
  },

  /**
   * Lấy danh sách tất cả khách hàng (bắt buộc cách ly theo PT được gán)
   * GET /api/clients
   * 
   * @param trainerId ID của PT nếu cần lọc theo huấn luyện viên
   * @returns Danh sách hồ sơ khách hàng
   */
  getAllClients: async (trainerId?: string): Promise<ClientResponse[]> => {
    const params: Record<string, string> = {};
    if (trainerId) {
      params.trainerId = trainerId;
    }
    const response = await axiosClient.get<ApiResponse<ClientResponse[]>>('/api/clients', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data.data ?? [];
  },

  /**
   * Lấy chi tiết hồ sơ khách hàng theo ID
   * GET /api/clients/:id
   * 
   * @param id Mã định danh khách hàng
   * @returns Chi tiết khách hàng
   */
  getClientById: async (id: string): Promise<ClientResponse> => {
    const response = await axiosClient.get<ApiResponse<ClientResponse>>(`/api/clients/${id}`);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin hồ sơ khách hàng
   * PUT /api/clients/:id
   * 
   * @param id Mã định danh khách hàng
   * @param data Dữ liệu cập nhật
   * @returns Hồ sơ khách hàng sau khi cập nhật
   */
  updateClient: async (
    id: string,
    data: UpdateClientRequest | Partial<CreateClientRequest>
  ): Promise<ClientResponse> => {
    const response = await axiosClient.put<ApiResponse<ClientResponse>>(
      `/api/clients/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Xoá hồ sơ khách hàng
   * DELETE /api/clients/:id
   * 
   * @param id Mã định danh khách hàng
   */
  deleteClient: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/clients/${id}`);
  },
};

export const createClient = clientApi.createClient;
export const searchClients = clientApi.searchClients;
export const getAllClients = clientApi.getAllClients;
export const getClientById = clientApi.getClientById;
export const updateClient = clientApi.updateClient;
export const deleteClient = clientApi.deleteClient;

export default clientApi;
