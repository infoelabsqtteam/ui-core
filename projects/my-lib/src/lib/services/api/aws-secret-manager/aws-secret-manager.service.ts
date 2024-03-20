import { Injectable } from '@angular/core';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { StorageService } from '../../storage/storage.service';
import { DataShareService } from '../../data-share/data-share.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { Common } from '../../../shared/enums/common.enum';


@Injectable({
  providedIn: 'root'
})
export class AwsSecretManagerService {

  private client:any

  constructor(
    private storageService : StorageService,
    private dataShareService : DataShareService,
    private encryptionService : EncryptionService
  ) {    
      this.client = new SecretsManagerClient({
          region: this.encryptionService.decryptRequest(Common.AWS_REGION),
          credentials: {
          accessKeyId: this.encryptionService.decryptRequest(Common.AWS_ACCESSKEYID),
          secretAccessKey: this.encryptionService.decryptRequest(Common.AWS_SECRETKEY),
        }
      });
  }


  async getSecret(key:string){

    let secret_name = 'prod/ui';

    let response;
    try {
      response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT",
        })
        );
    } catch (error) {
        console.log(error);
    }
        
    const secretString = response.SecretString;
    const secretObject = JSON.parse(secretString);
    const secretValue = secretObject[key];
    this.dataShareService.setServerHostName(secretValue);
    this.storageService.setHostNameDinamically(secretValue+"/rest/");
    return secretValue;
  }
  
}