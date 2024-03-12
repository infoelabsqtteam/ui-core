import { Injectable } from '@angular/core';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { StorageService } from '../../storage/storage.service';
import { DataShareService } from '../../data-share/data-share.service';


@Injectable({
  providedIn: 'root'
})
export class AwsSecretManagerService {

  

  config = {
    credentials: {
      accessKeyId: 'AKIAUIGGVCG3LNWR6ZCC',
      secretAccessKey: '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',
    },
    region: 'ap-south-1'
}
  
  private client:any

  constructor(
    private storageService : StorageService,
    private dataShareService : DataShareService
  ) {    
     this.client = new SecretsManagerClient( this.config
    //   {
    //   region: 'ap-south-1',
    //   credentials: {
    //     accessKeyId: 'AKIAUIGGVCG3LNWR6ZCC',
    //     secretAccessKey: '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'
    //   }
    // }
    );
  }


  async getSecret(prod:boolean,key:string){

    let secret_name = '';
    prod ? secret_name = "prod/ui" :secret_name = "nonprod/ui";

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
    // console.log(secretValue);
    // console.log(secretObject);
    this.dataShareService.setServerHostName(secretValue);
    this.storageService.setHostNameDinamically(secretValue+"/rest/");
    return secretValue;
  }
  
}