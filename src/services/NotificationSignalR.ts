import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './local-storage.service'; 
import { environment } from '../../environments/environtment';

@Injectable({ providedIn: 'root' })
export class SignalrService {
    private messageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public messages$ = this.messageSubject.asObservable();
    audioPlayer: HTMLAudioElement = new Audio('assets/bell.wav');

    public User: any = {};

    constructor(private Store: StorageService
    ) {
        this.User = this.Store.getItem("User");

    }

    playNotificationSound(): void {
        this.audioPlayer.play().catch((error) => {
        });
      }
    hubConnection: any = signalR.HubConnection;

    startConnection = () => { 
        this.hubConnection.conn
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl.replace("/api", "")}/signalRNotificationHub`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })    .withAutomaticReconnect([0, 2000, 10000]) 
            .build();

        this.hubConnection
            .start()
            .then(() => {
                
            })
            .catch((err: any) =>  err);
        this.ReceiveNotification();
    }
    ReceiveNotification() {
        if (this.User.userTypeId != 1) {
            this.hubConnection.on("All", (someText: any) => {
                this.messageSubject.next(someText);
                this.playNotificationSound();
            })
            if (this.User?.userTypeId == 3) {
                this.hubConnection.on("All Students", (someText: any) => {
                    this.messageSubject.next(someText);
                    this.playNotificationSound();
                });
                this.hubConnection.on(this.User.email, (someText: any) => {
                    this.messageSubject.next(someText);
                    this.playNotificationSound();
                });
                this.hubConnection.on("Batches", (someText: any) => {
                    this.messageSubject.next(someText);
                    this.playNotificationSound();
                });
            }
            if (this.User?.userTypeId == 2) {
                this.hubConnection.on("All Faculties", (someText: any) => {
                    this.messageSubject.next(someText);
                    this.playNotificationSound();
                })
                this.hubConnection.on(this.User.email, (someText: any) => {
                    this.messageSubject.next(someText);
                    this.playNotificationSound();
                })
            }
        }
    }
}