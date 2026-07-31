export interface ConfigurationItem {
    Id?: number | null;
    Title?: string | null;
    IsActive?: boolean;
    TotalRecords?: number;
}

export interface ConfigurationTypeInfo {
    slug: string;
    tableName: string;
    title: string;
    singular: string;
    icon: string;
}

// Central registry of all generic lookup/configuration tables.
// One list + one modal component (see admin/configuration) drive every
// screen below, matched by the `slug` route param.
export const CONFIGURATION_TYPES: ConfigurationTypeInfo[] = [
    { slug: 'account-type', tableName: 'AccountType', title: 'Account Types', singular: 'Account Type', icon: 'fa-solid fa-book' },
    { slug: 'bank-fees-type', tableName: 'BankFeesType', title: 'Bank Fees Types', singular: 'Bank Fees Type', icon: 'fa-solid fa-money-check-dollar' },
    { slug: 'cash-flow-type', tableName: 'CashFlowType', title: 'Cash Flow Types', singular: 'Cash Flow Type', icon: 'fa-solid fa-arrow-right-arrow-left' },
    { slug: 'contact-type', tableName: 'ContactType', title: 'Contact Types', singular: 'Contact Type', icon: 'fa-solid fa-address-book' },
    { slug: 'cost-center', tableName: 'CostCenter', title: 'Cost Centers', singular: 'Cost Center', icon: 'fa-solid fa-building' },
    { slug: 'industry', tableName: 'Industry', title: 'Industries', singular: 'Industry', icon: 'fa-solid fa-industry' },
    { slug: 'invoicing-relationship', tableName: 'InvoicingRelationShip', title: 'Invoicing Relationships', singular: 'Invoicing Relationship', icon: 'fa-solid fa-handshake' },
    { slug: 'payment-term', tableName: 'PaymentTerm', title: 'Payment Terms', singular: 'Payment Term', icon: 'fa-solid fa-calendar-days' },
    { slug: 'revenue-tax-rate-type', tableName: 'RevenueTaxRateType', title: 'Revenue Tax Rate Types', singular: 'Revenue Tax Rate Type', icon: 'fa-solid fa-percent' },
    { slug: 'role', tableName: 'Role', title: 'Roles', singular: 'Role', icon: 'fa-solid fa-user-shield' },
    { slug: 'unit-of-measure', tableName: 'UnitOfMeasure', title: 'Unit Of Measures', singular: 'Unit Of Measure', icon: 'fa-solid fa-ruler' },
    { slug: 'product-status', tableName: 'ProductStatus', title: 'Product Statuses', singular: 'Product Status', icon: 'fa-solid fa-tags' },
];

export function getConfigurationTypeBySlug(slug: string | null): ConfigurationTypeInfo | undefined {
    return CONFIGURATION_TYPES.find(t => t.slug === slug);
}
