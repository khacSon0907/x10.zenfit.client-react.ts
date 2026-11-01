import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  CreatePtContractRequest,
  PtContractResponse,
} from '../types/client.types';

/**
 * ============================================================================
 * PT CONTRACT API SERVICE
 * Quản lý các endpoint Tạo mới & Truy vấn Hợp đồng PT (Huấn luyện viên cá nhân)
 * Endpoint Backend: /api/pt-contracts
 * ============================================================================
 */
export const contractApi = {
  /**
   * Tạo mới hợp đồng PT (hỗ trợ cả chọn khách cũ hoặc tạo học viên mới trực tiếp)
   * POST /api/pt-contracts
   * 
   * @param data Payload thông tin hợp đồng & khách hàng (CreatePtContractRequest)
   * @returns Dữ liệu hợp đồng vừa tạo
   */
  createPtContract: async (data: CreatePtContractRequest): Promise<PtContractResponse> => {
    const response = await axiosClient.post<ApiResponse<PtContractResponse>>(
      '/api/pt-contracts',
      data
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách hợp đồng PT (có thể lọc theo trainerId)
   * GET /api/pt-contracts
   * 
   * @param trainerId ID của huấn luyện viên nếu cần lọc
   */
  getAllContracts: async (trainerId?: string): Promise<PtContractResponse[]> => {
    const response = await axiosClient.get<ApiResponse<PtContractResponse[]>>(
      '/api/pt-contracts',
      {
        params: trainerId ? { trainerId } : undefined,
      }
    );
    return response.data.data ?? [];
  },

  /**
   * Lấy chi tiết hợp đồng PT theo ID
   * GET /api/pt-contracts/:id
   * 
   * @param id Mã hợp đồng
   */
  getContractById: async (id: string): Promise<PtContractResponse> => {
    const response = await axiosClient.get<ApiResponse<PtContractResponse>>(
      `/api/pt-contracts/${id}`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách hợp đồng theo trainerId của PT
   * GET /api/pt-contracts/trainer/:trainerId
   * 
   * @param trainerId ID của huấn luyện viên PT
   */
  getContractsByTrainerId: async (trainerId: string): Promise<PtContractResponse[]> => {
    const response = await axiosClient.get<ApiResponse<PtContractResponse[]>>(
      `/api/pt-contracts/trainer/${trainerId}`
    );
    return response.data.data ?? [];
  },

  /**
   * Xóa hợp đồng PT theo ID
   * DELETE /api/pt-contracts/:id
   * 
   * @param id Mã hợp đồng
   */
  deleteContract: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/pt-contracts/${id}`);
  },
};

export const createPtContract = contractApi.createPtContract;
export const getAllContracts = contractApi.getAllContracts;
export const getContractById = contractApi.getContractById;
export const getContractsByTrainerId = contractApi.getContractsByTrainerId;
export const deleteContract = contractApi.deleteContract;
                                                                                                                              
export default contractApi;
