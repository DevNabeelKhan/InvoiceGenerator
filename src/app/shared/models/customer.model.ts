export interface Customer {
    Id?: number | null;
    CustomerName?: string | null;
    CountryId?: number | null;
    TaxRegistrationNumber?: string | null;
    City?: string | null;
    StreetAddress?: string | null;
    BuildingNumber?: string | null;
    District?: string | null;
    AddressAdditionalNumber?: string | null;
    PostalCode?: string | null;
    InvoicingCode?: string | null;
    InvoicingEmail?: string | null;
    InvoicingPhone?: string | null;
    InvoicingRelationShipId?: number | null;
    PaymentTermId?: number | null;
    ContactTypeID?: number | null;
    ContactTypeNumber?: string | null;
    SellingRevenueAccountId?: number | null;
    SellingRevenueCostCenterId?: number | null;
    SellingRevenueTaxRateId?: number | null;
    IsActive?: boolean;
    TotalRecords?: number;
}
