import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonFunctionService } from '../common-utils/common-function.service';

@Injectable({
  providedIn: 'root'
})
export class CheckIfService {

  constructor(
    private commonFunctionService:CommonFunctionService
  ) { }
  checkIsDisable(parent:any,chield:any,updateMode:boolean,formValue:any,templateForm:FormGroup){
    let responce = {
      tobedesabled:'',
      templateForm:templateForm
    }
    if(parent == ''){
      responce.tobedesabled = this.commonFunctionService.isDisable(chield,updateMode,formValue)
      if(responce.tobedesabled){
        if(!responce.templateForm.controls[chield.field_name].disabled){
          responce.templateForm.controls[chield.field_name].disable()
        }
      }else{
        if(responce.templateForm.controls[chield.field_name].disabled){
          responce.templateForm.controls[chield.field_name].enable()
        }
      }
    }else{
      responce.tobedesabled = this.commonFunctionService.isDisable(chield,updateMode,formValue)
      if(responce.tobedesabled){
        (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].disable()
      }else{
        (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].enable()
      }
    }
    return responce;
  }
  checkIsMendetory(parent:any,chield:any,formValue:any,templateForm:FormGroup){
    let responce = {
      tobedesabled:'',
      templateForm:templateForm
    }
    if(parent == ''){
      responce.tobedesabled = this.commonFunctionService.isMendetory(chield,formValue)
      if(responce.tobedesabled){
        if(responce.templateForm.controls[chield.field_name].status == 'VALID'){
          responce.templateForm.controls[chield.field_name].setValidators([Validators.required]);
          responce.templateForm.controls[chield.field_name].updateValueAndValidity();
        }
      }else{
        if(responce.templateForm.controls[chield.field_name].status == 'INVALID'){
          responce.templateForm.controls[chield.field_name].clearValidators();
          responce.templateForm.controls[chield.field_name].updateValueAndValidity();
        }
      }
    }else{
      responce.tobedesabled = this.commonFunctionService.isMendetory(chield,formValue)
      if(responce.tobedesabled){
        if((<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].status == 'VALID'){
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].setValidators([Validators.required]);
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].updateValueAndValidity();
        }
      }else{
        if((<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].status == 'INVALID'){
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].clearValidators();
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].updateValueAndValidity();
        }
      }
    }
    return responce;
  }

}
