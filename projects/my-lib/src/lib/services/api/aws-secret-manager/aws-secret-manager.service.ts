import { Injectable } from '@angular/core';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { StorageService } from '../../storage/storage.service';
import { DataShareService } from '../../data-share/data-share.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { Common } from '../../../shared/enums/common.enum';
import { ApiCallService } from '../api-call/api-call.service';
import { EnvService } from '../../env/env.service';


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
    private envService : EnvService
  ) {    
      this.awsClient = new SecretsManagerClient({
          region: this.encryptionService.decryptRequest(Common.AWS_REGION),
          credentials: {
          accessKeyId: this.encryptionService.decryptRequest(Common.AWS_ACCESSKEYID),
          secretAccessKey: this.encryptionService.decryptRequest(Common.AWS_SECRETKEY),
        }
      });
  }


  getServerAndAppSetting (){
    let hostname:any ="";
    if(this.storageService.checkPlatForm() == 'mobile'){
      hostname = this.storageService.getClientName();
    }else{
      hostname = this.envService.getHostName('hostname');
    }
    if(hostname == 'localhost'){
      hostname = this.storageService.getClientCodeEnviorment().serverhost;
      this.storageService.setHostNameDinamically(hostname+"/rest/");
      this.dataShareService.shareServerHostName(hostname);
      this.apiCallService.getApplicationAllSettings();
    }else{
      this.getServerHostFromAwsSecretManager(hostname);
    }
   }


  getServerHostFromAwsSecretManager (key: string) {
    let secret_name = 'prod/ui';
    
    this.awsClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    ).then(
      (response:any) => {
        const secretString = response.SecretString;
        const secretObject = JSON.parse(secretString);
        const secretValue = secretObject[key];
        this.storageService.setHostNameDinamically(secretValue+"/rest/");
        this.dataShareService.shareServerHostName(secretValue);
        this.apiCallService.getApplicationAllSettings();
      },
      (error:Error) => {
        console.log(error);
      }
    );
  }
  
}