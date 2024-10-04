import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ApiService } from '../api/api.service';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  private synth: SpeechSynthesis | undefined;
  private voices: SpeechSynthesisVoice[];
  private selectedLanguage: string;
  private isBrowser: boolean;

  constructor(
    private _snackBar: MatSnackBar,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
    this.voices = [];
    this.selectedLanguage = 'en-US'; // Default language

    // Load voices asynchronously
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }


  notify(className:string,message:string) {
    if(className !=null && message !=null){
      this._snackBar.open(message, 'Dismiss', {
        duration: 5000,
        panelClass: className,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition
      });
      // this.speak(message);
    }
  }

  markUsRead(data:any){
    if (data.notificationStatus === 'UNREAD') {
        data.notificationStatus = 'READ';
        const payload = {
            curTemp: 'user_notification_master',
            data: data
        };
        this.apiService.SaveFormData(payload);
    }
  }
  setLanguage(language: string): void {
    this.selectedLanguage = language;
  }
  private getVoiceByLanguage(language: string): SpeechSynthesisVoice | null {
    return this.voices.find(voice => voice.lang === language) || null;
  }
  private loadVoices(): void {
    if(this.synth) this.voices = this.synth.getVoices();
  }
  private getFemaleVoice(): SpeechSynthesisVoice | null {
    // You can improve this function to better identify female voices
    return this.voices.find((voice:any) => voice.name.includes('female') || voice.name.includes('Female') || voice.gender === 'female') || null;
  }
  speak(message: string): void {
    if (this.synth && this.synth.speaking) {
      console.error('speechSynthesis.speaking');
      return;
    }

    if (message !== '') {
      const utterThis = new SpeechSynthesisUtterance(message);
      const selectedVoice = this.getFemaleVoice();
      // const selectedVoice = this.getVoiceByLanguage(this.selectedLanguage);

      if (selectedVoice) {
        utterThis.voice = selectedVoice;
      }

      utterThis.onend = () => {
        console.log('SpeechSynthesisUtterance.onend');
      };

      utterThis.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
      };

      if(this.synth) this.synth.speak(utterThis);
    }
  }

}
