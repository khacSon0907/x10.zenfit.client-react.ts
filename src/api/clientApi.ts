import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  ClientResponse,
  ClientStatus,
  CreateClientRequest,
  ExperienceLevel,
  FitnessGoal,
  Gender,
} from '../types/client.types';

// Re-export toàn bộ kiểu dữ liệu phục vụ các module khác sử dụng trực tiếp từ clientApi
export type {
  ClientResponse,
  ClientStatus,
  CreateClientRequest,
  ExperienceLevel,
  FitnessGoal,
  Gender,
};

/**
 * ============================================================================
 * CLIENT API SERVICE
 * Quản lý các endpoint CRUD Hồ sơ Khách hàng / Học viên
 * ============================================================================
 */
export const clientApi = {
  /**
   * Tạo mới hồ sơ khách hàng
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
   * Lấy danh sách tất cả khách hàng (có thể lọc theo PT được gán)
   * GET /api/clients
   * 
   * @param trainerId ID của PT nếu cần lọc theo huấn luyện viên
   * @returns Danh sách hồ sơ khách hàng
   */
  getAllClients: async (trainerId?: string): Promise<ClientResponse[]> => {
    const response = await axiosClient.get<ApiResponse<ClientResponse[]>>('/api/clients', {
      params: trainerId ? { trainerId } : undefined,
    });
    return response.data.data;
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
    data: Partial<CreateClientRequest>
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
export const getAllClients = clientApi.getAllClients;
export const getClientById = clientApi.getClientById;
export const updateClient = clientApi.updateClient;
export const deleteClient = clientApi.deleteClient;

export default clientApi;
