import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private http: HttpClient) { }

  /**
   * Translates text from English to Arabic using the free Google Translate
   * public endpoint (no API key required). Returns an empty string on failure
   * so callers can safely ignore translation errors without breaking the form.
   */
  async translateToArabic(text: string | null | undefined): Promise<string> {
    if (!text || !text.trim()) return '';

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
      const response: any = await firstValueFrom(this.http.get(url));
      if (Array.isArray(response) && Array.isArray(response[0])) {
        return response[0].map((chunk: any) => chunk[0]).join('');
      }
      return '';
    } catch (err) {
      console.warn('Auto-translate failed, please enter Arabic text manually.', err);
      return '';
    }
  }
}
