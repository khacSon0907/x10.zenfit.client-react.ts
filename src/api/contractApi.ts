import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  CreatePtContractRequest,
  UpdatePtContractRequest,
  PtContractResponse,
  PtContractFilterParams,
} from '../types/contract.types';

/**
 * ============================================================================
 * PT CONTRACT API SERVICE
 * Quản lý các endpoint Tạo mới, Cập nhật & Truy vấn Hợp đồng PT
 * Endpoint Backend: /api/pt-contracts
 * ============================================================================
 */
export const contractApi = {
  /**
   * 1. Tạo mới hợp đồng PT (hỗ trợ cả chọn khách cũ hoặc tạo học viên mới trực tiếp)
   * POST /api/pt-contracts
   */
  createPtContract: async (data: CreatePtContractRequest): Promise<PtContractResponse> => {
    const response = await axiosClient.post<ApiResponse<PtContractResponse>>(
      '/api/pt-contracts',
      data
    );
    return response.data.data;
  },

  /**
   * 2. Cập nhật hợp đồng PT (NEW)
   * PUT /api/pt-contracts/:id
   */
  updatePtContract: async (
    id: string,
    data: UpdatePtContractRequest
  ): Promise<PtContractResponse> => {
    const response = await axiosClient.put<ApiResponse<PtContractResponse>>(
      `/api/pt-contracts/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * 3. Lấy chi tiết hợp đồng PT theo ID
   * GET /api/pt-contracts/:id
   */
  getContractById: async (id: string): Promise<PtContractResponse> => {
    const response = await axiosClient.get<ApiResponse<PtContractResponse>>(
      `/api/pt-contracts/${id}`
    );
    return response.data.data;
  },

  /**
   * 4. Lấy danh sách hợp đồng theo trainerId của PT
   * GET /api/pt-contracts/trainer/:trainerId
   */
  getContractsByTrainerId: async (trainerId: string): Promise<PtContractResponse[]> => {
    const response = await axiosClient.get<ApiResponse<PtContractResponse[]>>(
      `/api/pt-contracts/trainer/${trainerId}`
    );
    return response.data.data ?? [];
  },

  /**
   * 5. Lấy danh sách hợp đồng PT kèm bộ lọc (trainerId, clientId, status, paymentStatus)
   * GET /api/pt-contracts
   */
  getAllContracts: async (
    filter?: PtContractFilterParams | string
  ): Promise<PtContractResponse[]> => {
    const params = typeof filter === 'string' ? { trainerId: filter } : filter;
    const response = await axiosClient.get<ApiResponse<PtContractResponse[]>>(
      '/api/pt-contracts',
      { params }
    );
    return response.data.data ?? [];
  },

  /**
   * 6. Xóa hợp đồng PT theo ID
   * DELETE /api/pt-contracts/:id
   */
  deleteContract: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/pt-contracts/${id}`);
  },
};

// Aliases theo phong cách RESTful API
export const ptContractApi = {
  create: contractApi.createPtContract,
  update: contractApi.updatePtContract,
  getById: contractApi.getContractById,
  getByTrainerId: contractApi.getContractsByTrainerId,
  getAll: contractApi.getAllContracts,
  delete: contractApi.deleteContract,
};

// Named exports tương thích ngược
export const createPtContract = contractApi.createPtContract;
export const updatePtContract = contractApi.updatePtContract;
export const getAllContracts = contractApi.getAllContracts;
export const getContractById = contractApi.getContractById;
export const getContractsByTrainerId = contractApi.getContractsByTrainerId;
export const deleteContract = contractApi.deleteContract;

export default contractApi;
