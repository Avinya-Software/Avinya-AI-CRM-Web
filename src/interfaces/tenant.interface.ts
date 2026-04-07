export interface Tenant {
    tenantId: string;
    companyName: string;
    industryType?: string;
    companyEmail: string;
    companyPhone?: string;
    address?: string;
    isApproved: boolean;
    isActive: boolean;
    createdAt: string;
    approvedAt?: string;
    approvedBySuperAdminId?: string;
}
