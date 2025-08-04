export interface SupplierCreateRequest {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
}

export interface SupplierUpdateRequest extends Partial<SupplierCreateRequest> {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
} 