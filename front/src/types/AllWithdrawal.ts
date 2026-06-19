export interface AllWithdrawal {
    id: number;
    idWithdrawal: number;
    withdrawalDate: string;
    itemId: number;
    itemName: string;
    itemType: string;
    itemSector: string;
    itemSize: string | null;
    itemEan: string | null;
    quantity: number;
    employeeName: string;
    employeeId: number;
    employeeRole: string;
    employeeCompany: string;
    employeeDepartment: string;
    tipoMovimento?: string; 
}