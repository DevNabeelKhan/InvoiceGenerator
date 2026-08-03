export interface Product {
    Id?: number | null;
    Title?: string | null;
    ProductStatusId?: number | null;
    UnitOfMeasureId?: number | null;
    ServiceCode?: string | null;
    ServiceDescription?: string | null;
    SellingPrice?: number | null;
    RevenueAccountID?: number | null;
    RevenueTaxRateId?: number | null;
    RevenueTaxRatePercentage?: number | null;
    PurchaseCost?: number | null;
    ExpenseAccountId?: number | null;
    PurchaseTaxRateId?: number | null;
    IsActive?: boolean;
    TotalRecords?: number;
}
