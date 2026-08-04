export interface InvoiceProductLine {
    Id?: number | null;
    InvoiceId?: number | null;
    ProductId?: number | null;
    Description?: string | null;
    Unit?: string | null;
    Quantity?: number | null;
    Price?: number | null;
    DiscountPercentage?: number | null;
    DiscountAmount?: number | null;
    TaxRate?: number | null;
    TaxableAmount?: number | null;
    VATAmount?: number | null;
    LineTotal?: number | null;
    AccountId?: number | null;
    CostCenterId?: number | null;
    RevenueRecognitionId?: number | null;
    SortOrder?: number | null;

    // Related (read-only)
    ProductTitle?: string | null;
    ServiceCode?: string | null;
    AccountTitle?: string | null;
    CostCenterTitle?: string | null;
    RevenueRecognitionTitle?: string | null;
}

export interface InvoiceAttachment {
    Id?: number | null;
    InvoiceId?: number | null;
    FileName?: string | null;
    FilePath?: string | null;
    FileSize?: number | null;
    ContentType?: string | null;
}

export interface Invoice {
    Id?: number | null;
    InvoiceNumber?: string | null;
    UUID?: string | null;
    Reference?: string | null;
    PurchaseOrderNumber?: string | null;
    ProjectName?: string | null;
    ProjectId?: number | null;
    PricesIncludeTax?: boolean;
    CompanyId?: number | null;
    CustomerId?: number | null;
    CurrencyId?: number | null;
    ExchangeRate?: number | null;
    InvoiceDate?: string | null;
    DueDate?: string | null;
    Notes?: string | null;
    Status?: string | null;
    PaymentStatus?: string | null;
    Draft?: boolean;
    Approved?: boolean;
    Cancelled?: boolean;
    Sent?: boolean;
    Subtotal?: number | null;
    DiscountPercentage?: number | null;
    DiscountAmount?: number | null;
    TaxAmount?: number | null;
    GrandTotal?: number | null;
    RetentionPercentage?: number | null;
    RetentionAmount?: number | null;
    RoundOffAmount?: number | null;
    GeneratedQRCode?: string | null;
    QRCodeImagePath?: string | null;
    PDFPath?: string | null;

    // Related (read-only, populated by GetInvoice)
    CustomerName?: string | null;
    CustomerArabicName?: string | null;
    CustomerVATNumber?: string | null;
    CustomerAddress?: string | null;
    CustomerArabicAddress?: string | null;
    CustomerEmail?: string | null;
    CustomerPhone?: string | null;
    CustomerCity?: string | null;

    CompanyName?: string | null;
    CompanyArabicName?: string | null;
    CompanyVATNumber?: string | null;
    CompanyAddress?: string | null;
    CompanyArabicAddress?: string | null;
    CompanyBankName?: string | null;
    BankAccountNumber?: string | null;
    IBAN?: string | null;
    SwiftCode?: string | null;
    AccountCurrency?: string | null;
    BeneficiaryName?: string | null;
    LogoPath?: string | null;
    StampPath?: string | null;

    CurrencyCode?: string | null;
    CurrencySymbol?: string | null;

    Products?: InvoiceProductLine[];
    Attachments?: InvoiceAttachment[];

    IsActive?: boolean;
    TotalRecords?: number;
}

export interface Currency {
    Id?: number | null;
    Code?: string | null;
    Title?: string | null;
    Symbol?: string | null;
    ExchangeRate?: number | null;
    IsActive?: boolean;
}

export interface Project {
    Id?: number | null;
    Title?: string | null;
    IsActive?: boolean;
}

export interface ProjectDocument {
    Id?: number | null;
    ProjectId?: number | null;
    DocumentTitle?: string | null;
    Url?: string | null;
}

export interface Company {
    Id?: number | null;
    Title?: string | null;
    ArabicName?: string | null;
    Address?: string | null;
    ArabicAddress?: string | null;
    Email?: string | null;
    Phone?: string | null;
    Website?: string | null;
    VATNumber?: string | null;
    LogoUrl?: string | null;
    LogoPath?: string | null;
    StampPath?: string | null;
    BankName?: string | null;
    BankAccountNumber?: string | null;
    IBAN?: string | null;
    SwiftCode?: string | null;
    AccountCurrency?: string | null;
    BeneficiaryName?: string | null;
    Country?: string | null;
    City?: string | null;
    IsActive?: boolean;
}
