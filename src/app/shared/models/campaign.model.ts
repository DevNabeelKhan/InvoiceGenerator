// Main Campaign model
export interface Campaign {
  Id: number;
  CampaignName: string;
  ContactGroupID: number;
  CampaignType: number;
  TotalContact: number;
  IsAutoReply: boolean;
  ProviderId: number;
  Agent: string;
  BrandName: string;
  CustomerBrand: string;
  Is3cx: boolean;
  ParalegalName: string;
  CreatedDate: Date;
  ModifiedDate?: Date;
  IsActive?: boolean;
  IsCompleted?: boolean;
  
  // Related data (populated when needed)
  ContactGroup?: ContactGroup;
  Provider?: Provider;
  Templates?: CampaignTemplate[];
  Keywords?: CampaignKeyword[];
  OwnReplies?: OwnReply[];
  Contacts?: Contact[];
}

// Contact Group model
export interface ContactGroup {
  Id: number;
  GroupName: string;
  CreatedDate: Date;
}

// Contact model
export interface Contact {
  Id: number;
  CustomerName: string;
  PhoneNumber: string;
  SerialNumber: string;
  CustomerBrand: string;
  CreatedDate: Date;
}

// Provider model
export interface Provider {
  Id: number;
  Name: string;
  ApiKey?: string;
  IsActive: boolean;
}

// Campaign Template model
export interface CampaignTemplate {
  Id: number;
  TemplateId: number;
  CampaignId: number;
  Quota: number;
  Template?: Template;
}

// Template model
export interface Template {
  Id: number;
  Title: string;
  Message: string;
  TemplateType: number; // 1 = Main, 2 = Auto Reply, 3 = 3CX
  IsActive: boolean;
}

// Campaign Keyword model
export interface CampaignKeyword {
  Id: number;
  CampaignId: number;
  Keyword: string;
  TemplateId: number;
  Template?: Template;
}

// Own Reply model (3CX)
export interface OwnReply {
  Id: number;
  CampaignId: number;
  OwnNumberId: number;
  TemplateId: number;
  OwnNumber?: OwnNumber;
  Template?: Template;
}

// Own Number model
export interface OwnNumber {
  Id: number;
  Number: string;
  IsActive: boolean;
}

// Request models for API calls
export interface CampaignCreateRequest {
  ContactJson: string;
  CampaignTemplateJson: string;
  OwnReplyJson?: string;
  KeywordJson?: string;
  GroupName: string;
  CampaignName: string;
  Agent: string;
  BrandName: string;
  ParalegalName: string;
  CustomerBrand: string;
  ProviderId: number;
  CampaignType: number;
  IsAutoReply: boolean;
  Is3cxReply: boolean;
}

export interface CampaignUpdateRequest {
  Id: number;
  ContactJson: string;
  CampaignTemplateJson: string;
  OwnReplyJson?: string;
  KeywordJson?: string;
  GroupName: string;
  CampaignName: string;
  Agent: string;
  BrandName: string;
  ParalegalName: string;
  CustomerBrand: string;
  ProviderId: number;
  CampaignType: number;
  IsAutoReply: boolean;
  Is3cxReply: boolean;
}

// Form models for Angular Reactive Forms
export interface CampaignFormData {
  campaignName: string;
  agent: string;
  paralegalName: string;
  brandName: string;
  customerBrand: string;
  providerId: number;
  groupName: string;
  isAutoReply: boolean;
  is3cxReply: boolean;
  templates: TemplateFormData[];
  keywordReplies: KeywordReplyFormData[];
  templates3cx: Template3cxFormData[];
}

export interface TemplateFormData {
  TemplateId: number;
  Quota: number;
}

export interface KeywordReplyFormData {
  Keyword: string;
  TemplateId: number;
}

export interface Template3cxFormData {
  OwnNumberId: number;
  TemplateId: number;
}

// Contact upload model
export interface ContactUpload {
  Name: string;
  Number: string;
  SerialNumber: string;
  CustomerBrand: string;
}

export interface AllCampaignsModel {
  Id?: number;
  CampaignName?: string;
  GroupName?: string;
  CampaignType?: number;
  TotalContact?: number;
  IsAutoReply?: boolean;
  Is3cx?: boolean;
  ProviderId?: number;
  Agent?: string;
  BrandName?: string;
  // CustomerBrand?: string;
  ParalegalName?: string;
  IsActive?: boolean;
  IsCompleted?: boolean;
  TotalRecords?: number;
}