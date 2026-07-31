import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

// Simple AES-256-CBC helper used to encrypt/decrypt the configuration TableName
// before it travels over the network. Key/IV must stay in sync with
// DataAccessLayer.Shared.EncryptionHelper on the API side.
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private readonly key = CryptoJS.enc.Utf8.parse('InvoiceGenerator@2025-AesKey!!!!');
  private readonly iv = CryptoJS.enc.Utf8.parse('InvoiceGenIV2025');

  encrypt(plainText: string | null | undefined): string {
    if (!plainText) return '';
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plainText), this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  decrypt(cipherText: string | null | undefined): string {
    if (!cipherText) return '';
    const decrypted = CryptoJS.AES.decrypt(cipherText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
