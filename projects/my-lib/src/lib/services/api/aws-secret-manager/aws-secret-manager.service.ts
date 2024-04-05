import { Injectable } from '@angular/core';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { StorageService } from '../../storage/storage.service';
import { DataShareService } from '../../data-share/data-share.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { Common } from '../../../shared/enums/common.enum';
import { ApiCallService } from '../api-call/api-call.service';
import { EnvService } from '../../env/env.service';
import { NotificationService } from '../../notify/notification.service';


@Injectable({
  providedIn: 'root'
})
export class AwsSecretManagerService {

  private awsClient:any

  constructor(
    private storageService : StorageService,
    private dataShareService : DataShareService,
    private encryptionService : EncryptionService,
    private apiCallService : ApiCallService,
    private envService : EnvService,
    private notificationService: NotificationService
  ) {    
      this.awsClient = new SecretsManagerClient({
          region: this.encryptionService.decryptRequest(Common.AWS_REGION),
          credentials: {
          accessKeyId: this.encryptionService.decryptRequest(Common.AWS_ACCESSKEYID),
          secretAccessKey: this.encryptionService.decryptRequest(Common.AWS_SECRETKEY),
        }
      });
  }


 async getServerAndAppSetting (){
    let hostname:any ="";
    if(this.storageService.checkPlatForm() == 'mobile'){
      hostname = this.storageService.getClientName();
    }else{
      hostname = this.envService.getHostName('hostname');
    }
    if(hostname == 'localhost'){
      hostname = this.storageService.getClientCodeEnviorment().serverhost;
    }else{
      hostname =await this.getServerHostFromAwsSecretManager(hostname);
    }
    if(hostname && hostname!=''){
      this.storageService.setHostNameDinamically(hostname+"/rest/");
      this.dataShareService.shareServerHostName(hostname);
      this.apiCallService.getApplicationAllSettings();
    } else{
      this.notificationService.notify("bg-danger","Please contact to Admin");
    }
   }


  async getServerHostFromAwsSecretManager (key: string) {
    let secret_name = 'prod/ui';
    let secretValue
    await this.awsClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    ).then(
      (response:any) => {
        const secretString = response.SecretString;
        const secretObject = JSON.parse(secretString);
        secretValue = secretObject[key];
      },
      (error:Error) => {
        console.log(error);
      }
    );
    return secretValue;
  }
  
}