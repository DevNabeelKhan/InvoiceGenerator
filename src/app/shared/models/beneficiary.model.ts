export interface Beneficiary {
    Id?: number | null;
    IBAN?: string | null;
    CurrencyId?: number | null;
    BeneficiaryName?: string | null;
    BeneficiaryAddress?: string | null;
    BankName?: string | null;
    Swift?: string | null;
    CountryId?: number | null;
    BankFeesTypeId?: number | null;
    IsActive?: boolean;
    TotalRecords?: number;
}
