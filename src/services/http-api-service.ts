import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { AlertService } from "./alert.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HttpApiService {

    constructor(readonly httpService: HttpService, readonly alert: AlertService) { }

  
   async Login(body: any): Promise<any> {
        return await this.httpService.post<any>('Auth/login', body)
    }
    async ChangePassword(body: any): Promise<any> {
        return await this.httpService.post<any>('Auth/ChangePassword', body)
    }
    async GetOgTable()  {
        return await this.httpService.getAsync<any>('admin/GetOgTable')
    }
    async GetApplicationStatus()  {
        return await this.httpService.getAsync<any>('admin/GetApplicationStatus')
    }
    async GetAppFacilityByUser()  {
        return await this.httpService.getAsync<any>('admin/GetAppFacilityByUser')
    }
    async GetRecentUpdate(obj:any)  {
        return await this.httpService.getAsync<any>('admin/GetRecentUpdate',obj)
    }
    
    async InsertUpdateDocument(body:any): Promise<any> {
        const formData = new FormData(); 
        if (body.documentTypeId) formData.append('DocumentTypeId', body.documentTypeId);
        if (body.url) formData.append('Url', body.url);
        if (body.fileUpload) formData.append('FileUpload', body.fileUpload);
        if (body.facilityId) formData.append('FacilityId', body.facilityId);
        if (body.userBy) formData.append('UserBy', body.userBy);
        return await this.httpService.postFormData<any>('admin/InsertUpdateDocument',formData)
    }
    async InsertUpdateFacility(body:any): Promise<any> { 
        return await this.httpService.postFormData<any>('admin/InsertUpdateFacility',body)
    }
    async InsertUpdateApplication(body:any): Promise<any> { 
        return await this.httpService.post<any>('admin/InsertUpdateApplication',body)
    }
    async GetProfileFacility(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetProfileFacility',body);
    }
    async GetFacilities(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetFacilities',body);
    }
    async GetDoctors(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetDoctors');
    }
    async GetFacilityByUser(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetFacilityByUser',body);
    }
    async GetFacilityInfo(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetFacilityInfo',body);
    }
    async GetSmsDetail(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetSmsDetail',body);
    }    
    async GetContact(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetContact',body);
    }    

    async GetOwnNumberList(body:any): Promise<any> {  
        return await this.httpService.getAsync<any>('Admin/GetOwnNumberList',body); //owner
    }    
     async DeleteOwnNumber(body:any): Promise<any> {  
        return await this.httpService.getAsync<any>('Admin/DeleteNumber',body); //delete
    }    
       
    async GetApplicationByUser(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetApplicationByUser',body);
    }
    async GetDoctorDashboard(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetDoctorDashboard',body);
    }
    async GetDashboard(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetDashboard',body);
    }
    async GetDashboards(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetDashboards',body);
    }
    async GetDoctorUser(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetDoctorUser');
    }
    async DeleteApplication(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/DeleteApplication',body);
    }
    async DeleteRecentUpdate(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/DeleteRecentUpdate',body);
    }
    async ActiveRecentUpdate(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/ActiveRecentUpdate',body);
    }
    async GetInsurance(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetInsurance',body);
    }
    async InsertUpdateRecentUpdate(body:any): Promise<any> { 
        const formData = new FormData(); 
        if (body.id) formData.append('Id', body.id);
        if (body.title) formData.append('Title', body.title);
        if (body.image) formData.append('Image', body.image);
        if (body.description) formData.append('Description', body.description);
        if (body.fileUpload) formData.append('FileUpload', body.fileUpload);
        if (body.date) formData.append('Date', body.date);
        if (body.UserId) formData.append('UserId', body.UserId);
        if (body.sequence) formData.append('Sequence', body.sequence);
        if (body.userBy) formData.append('UserBy', body.userBy);
        return await this.httpService.postFormData<any>('admin/InsertUpdateRecentUpdate',formData)
    }
    async getAllUsers(body: any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetUsers', body)
    }
    async GetRole(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetRole');
    }
    async DeleteUser(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/DeleteUser',body);
    }
    async InsertUpdateUser(body: any): Promise<any> {
        const formData = new FormData();
      if(body.FullName) formData.append('FullName', body.FullName);
      if(body.RoleId)  formData.append('RoleId', body.RoleId);
      if (body.Id) formData.append('Id', body.Id); 
      if(body.Email)  formData.append('Email', body.Email);
      if(body.Password) formData.append('Password', body.Password);
      if(body.UserName)  formData.append('UserName', body.UserName);
        if (body.PictureUrl) formData.append('PictureUrl', body.PictureUrl);
        if (body.attachProfilePicture) formData.append('attachProfilePicture', body.attachProfilePicture);
        return await this.httpService.postFormData<any>('Admin/InsertUpdateUser', formData)
    }

    async ChangeSequence(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/ChangeSequence',body);
    }

    async InsertUpdateInsurance(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateInsurance',body);
    }
    
    async InsertUpdateNote(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateNote',body);
    }
    async ReportFile(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/ReportFile',body);
    }
    async Insert_Update_ProviderAccount(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdate',body);
    }
    
    async SendSms(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/SendSms',body);
    }
    
    async GetSendNumber(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetSendNumber',body);
    }
    
    async InsertUpdateUsersDetails(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateUsersDetails',body);
    }

    async DeleteInsurance(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/DeleteInsurance',body);
    }
    
    async GetUserName(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetUserName')
    }

    async GetNote(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetNote',body)
    }

    async GetUsersDetails(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetUsersDetails',body)
    }

    async deleteDynamicRow(body: any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/DeleteTableRow', body);
    }

     async GetSms(body:any): Promise<any>{
        return await this.httpService.getAsync<any>('Admin/GetSms',body)
    }
    
    async GetProviderSMS(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetProvider',body);
    }
    async GetUser_OG(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetUser_OG');
    }
    async getTemplates(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetTemplates_OG');
    }
   
    async GetProviderAccount(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetProviderAccount',body);
    }
    
    async GetUser(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetUser',body);
    }

    async GetProvider_OG(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetProvider_OG');
    }
    
    async InsertUpdateCampaignSms(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateCampaignSms',body);
    }
      async InsertUpdateOwnNumber(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateOwnNumber',body);
   }
   
   async InsertUpdateUsers(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateUsers',body);
   }
   
   async InsertUpdateBulkSms(body:any): Promise<any> {
       return await this.httpService.post<any>('Admin/InsertUpdateBulkSms',body);
    }
    
    async GetOwnNumber(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetOwnNumber');
    }
    
    async GetContactDetails(To: string, Text: string, PageNumber: number = 1, PageSize: number = 20) {
        try {
            let url = `Admin/GetContactDetails?To=${To}&Text=${Text}&PageNumber=${PageNumber}&PageSize=${PageSize}`;
            const response = await this.httpService.getAsync<any>(url);
            return response;
        } catch (error) {
            console.error('Error in GetContactDetails:', error);
            throw error;
        }
    }
    
    async SentSMSContactDetail(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/SentSMSContactDetail',body);
    }

    async GetContactGroup(body:any): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetContactGroup',body);
    }
    
    async InsertUpdateContactGroup(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateContactGroup',body);
    }
    
    async GetAllCampaigns(Text: string, PageNumber: number = 1, PageSize: number = 20) {
        try {
            let url = `Admin/GetAllCampaigns?Text=${Text}&PageNumber=${PageNumber}&PageSize=${PageSize}`;
            const response = await this.httpService.getAsync<any>(url);
            return response;
        } catch (error) {
            console.error('Error in GetAllCampaigns:', error);
            throw error;
        }
    }
    async InsertUpdateTemplate(body:any): Promise<any> {
        return await this.httpService.post<any>('Admin/InsertUpdateTemplate',body);
    }
    
    // async GetCampaignContactDetail(CampaignId: number, PageNumber: number = 1, PageSize: number = 20) {
        //     try {
            //         let url = `Admin/GetCampaignContactDetail?CampaignId=${CampaignId}&PageNumber=${PageNumber}&PageSize=${PageSize}`;
            //         const response = await this.httpService.getAsync<any>(url);
            //         return response;
            //     } catch (error) {
                //         console.error('Error in GetCampaignContactDetail:', error);
                //         throw error;
                //     }
                // }
                
                async GetCampaignContactDetail(body:any): Promise<any> {
                    return await this.httpService.getAsync<any>('Admin/GetCampaignContactDetail',body);
                }
                
                async deleteCampaign(id: number): Promise<any> {
                    return await this.httpService.getAsync<any>(`Admin/DeleteCampaign?id=${id}`);
                }
                
                async GetTemplate(body:any): Promise<any> {
                    return await this.httpService.getAsync<any>('Admin/GetTemplate',body);
                }
                  async GetCampaigns(searchTerm?: string): Promise<any> {
        return await this.httpService.getAsync<any>(`Admin/GetCampaigns?searchTerm=${searchTerm ? encodeURIComponent(searchTerm) : ''}`);
    }
    
    async GetProvider(): Promise<any> {
        return await this.httpService.getAsync<any>('Admin/GetProvider');
    }

            }