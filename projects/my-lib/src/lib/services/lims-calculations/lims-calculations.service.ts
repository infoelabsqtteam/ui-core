import { ApiCallService } from './../api/api-call/api-call.service';
import { Injectable, QueryList } from '@angular/core';
import { FormBuilder, UntypedFormGroup, UntypedFormControl, FormArray, Validators } from '@angular/forms';
import { CommonFunctionService } from '../../services/common-utils/common-function.service';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';
import { NotificationService } from '../notify/notification.service';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class LimsCalculationsService {

  constructor(
    private commonFunctionService: CommonFunctionService,
    private coreFunctionService: CoreFunctionService,
    private notificationService: NotificationService,
    private storageService:StorageService,
    private apiCallService:ApiCallService
  ) { }


  calculateBalanceAmountEngLetter(tamplateFormValue:any, multiFormValue:any) {
    let list = tamplateFormValue['billingPlan'];
    let fees = +multiFormValue['totalFees'];
    let milestoneAchievedtotal = 0;
    let total = 0;
    if (list != null && list != undefined) {
      for (let i = 0; i < list.length; i++) {
        milestoneAchievedtotal += list[i]['feesOnMilestoneAchieved']
      }
    }
    total = milestoneAchievedtotal + tamplateFormValue['feesOnMilestoneAchieved'];
    let remaningAmount = fees - total;

    let obj = {
      balanceAmount: remaningAmount
    }
    return obj;
  }
  getTaWithCalculation(value:any) {
    let localTas = 0;
    let claimSheet = value.claimSheet;
    let priceInKm = claimSheet.priceInKm;
    let distanceInkm = claimSheet.distanceInKm;
    localTas = priceInKm * distanceInkm;
    let obj1 = {
      localTa: localTas
    }
    let obj = {
      claimSheet: obj1
    }
    return obj;
  }

  calculateTotalAmount(formValue:any) {
    let list = formValue['claimSheet'];
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      total += list[i]['totalForTheDay']
    }
    let obj = {
      totalAmountOfTravelCliam: total
    }
    return obj;
  }

  calculateTotalFair(value:any) {
    let totalFair = 0;
    let curValue:any = {};
    let checkClaimSheet = false;
    let calculateObject = {
      totalForTheDay : 0
    }
    if(value && value.claimSheet){
      curValue = value.claimSheet;
      checkClaimSheet = true;
    }else{
      curValue = value;
    }
    let localTa = curValue.localTa;
    let travelFair = curValue.travelFare;
    let dailyAllowance = curValue.dailyAllowance;
    let food = curValue.food;
    let hotel = curValue.hotel;
    let parking = curValue.parking;
    let toolCharge = curValue.tollCharge;
    let miscellaneous = curValue.miscellaneous;
    totalFair = (+travelFair) + (+localTa) + (+dailyAllowance) + (+food) + (+hotel) + (+parking) + (+toolCharge) + (+miscellaneous);

    calculateObject.totalForTheDay = totalFair;
    if(checkClaimSheet){
      return {
        claimSheet: calculateObject
      }
    }else{
      return calculateObject
    }
  }

  buggetForcastCalc(templateForm: any) {
    let templateValue = templateForm.getRawValue();
    let actualCurYr = templateValue.actual_current;
    let actualLastYr = templateValue.actuals;
    let budget = templateValue.this_year;
    let growthpers:any = {};
    let budgetpers:any = {};
    let value:any = [];
    let value1:any = [];
    Object.keys(actualCurYr).forEach(key => {
      let growthper = 0;
      let budgetper = 0;
      let actualCurYrMonth = actualCurYr[key];
      let actualLastYrMonth = actualLastYr[key];
      if (actualLastYrMonth != 0) {
        growthper = actualCurYrMonth / actualLastYrMonth;
      }

      let budgetcurYrMonth = budget[key];
      if (budgetcurYrMonth != 0) {
        budgetper = actualCurYrMonth / budgetcurYrMonth;
      }

      growthpers[key] = growthper;
      let obj = {
        field: key, value: growthpers[key]
      }
      value.push(obj)

      budgetpers[key] = budgetper;
      let obj1 = {
        field: key, value: budgetpers[key]
      }
      value1.push(obj1)
    })
    const fieldWithValueforgrowth = {
      field: 'growth_per', value: value
    }
    fieldWithValueforgrowth.value.forEach((element:any) => {
      (<UntypedFormGroup>templateForm.controls[fieldWithValueforgrowth.field]).controls[element.field].patchValue(element.value);
    })

    const fieldWithValueforBudget = {
      field: 'budget_per', value: value1
    }
    fieldWithValueforBudget.value.forEach((element:any) => {
      (<UntypedFormGroup>templateForm.controls[fieldWithValueforBudget.field]).controls[element.field].patchValue(element.value);
    })
  }

  calculateAutoEffRate(data:any) {
    data.forEach((element:any) => {
      element["per_sample_net_rate"] = element["no_of_samples"] * element["quotation_effective_rate"];
    });
    return data;
  }
  calculate_next_calibration_due_date(templateForm:any) {
    const objectValue = templateForm.getRawValue();
    let calibration_date = objectValue['calibration_date']
    let calibration_frequency = objectValue['calibration_frequency']
    if (calibration_date != null && calibration_date !== undefined && calibration_frequency != null && calibration_frequency !== undefined && calibration_date !== "" && calibration_frequency !== "") {
      let date = new Date();
      date.setDate(calibration_date.getDate() + calibration_frequency);
      templateForm.controls['next_date'].setValue(date);
    }
  }

  calculation_of_script_for_tds(object:any, field: any) {
    const staticModal = []
    staticModal.push(this.apiCallService.getPaylodWithCriteria('QTMP:CALCULATION_SCRIPT', field.onchange_call_back_field, field.onchange_api_params_criteria, object));
    staticModal[0]['data'] = object;
    return staticModal;
  }
  getDecimalAmount(value:any): any {
    let decimaldigitNo:number = this.storageService.getApplicationSetting().roundValueNoOfDigits;
    let decimalno:number = 2;
    if(decimaldigitNo != undefined && decimaldigitNo != null) {
      decimalno = decimaldigitNo;
    }
    if (typeof (value) == 'number' && value != undefined && value != null) {
      return Number(value.toFixed(decimalno));
    } else {
      return;
    }
  }
  convertCurrencyRate(amount:any,currencyRate:any){
    let convertedAmount =amount*currencyRate;
    return this.getDecimalAmount(convertedAmount);
  }
  legacyQuotationParameterCalculation(data:any, fieldName:any) {
    let quantity = 0;
    let discount_percent = 0;
    let cost_rate = 0;
    let net_amount:any = 0;
    let param_quantom = 0;
    let Base_quotation_rate = 0;
    let incoming_field = fieldName.field_name;

    let gross_amount:any = 0;
    let dis_amt:any = 0;
    switch (incoming_field) {
      case "claim_unit":
      case "claim_percent":
        this.calculate_pharma_claim_values(data);
        break;
      case "parameter_quantum":
        if (data.parameter_quantum) {
          data['quantum_rate'] = (+data.quotation_rate) * (+data.parameter_quantum);
          data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
          net_amount = +data.quotation_effective_rate
          if (data.discount_percent) {
            let discount = ((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
            data['discount_amount'] = discount;
            net_amount = (+data.quotation_effective_rate) - discount;
          }
          data['net_amount'] = net_amount
        }
        break;
      case "qty":
        if (data.qty) {
          if (data.branch && data.branch.name && data.branch.name === "Pune") {
            data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
          } else {
            data['quotation_effective_rate'] = (+data.qty) * (+data.offer_rate);
          }


          if (data.no_of_injection > 0) {
            // this.calculateParameterAmtOnInjection(data);
          }
          else {
            net_amount = +data.quotation_effective_rate
            if (data.discount_percent) {
              let discount = this.getDecimalAmount((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
              data['discount_amount'] = discount;
              net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - discount);
            }
            data['net_amount'] = net_amount
            data['total'] = +data.quotation_effective_rate;
            data['qty'] = data.qty
          }

        }
        break;
      case "discount_percent":
        if (!data.discount_percent) {
          data.discount_percent = 0;
        } if (data.no_of_injection > 0) {
          // this.calculateParameterAmtOnInjection(data);
        } else if (data.branch && data.branch.name && data.branch.name === "Pune") {
          data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
        } else {
          data['quotation_effective_rate'] = (+data.qty) * (+data.offer_rate);
        }
        net_amount = +data.quotation_effective_rate
        let discount = this.getDecimalAmount(((+data.quotation_effective_rate) * (+data.discount_percent)) / 100);
        data['discount_amount'] = discount;
        net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - discount);
        data['discount_percent'] = data.discount_percent;
        data['net_amount'] = net_amount
        data['total'] = +data.quotation_effective_rate;
        data['qty'] = data.qty;
        data['discount_percent'] = +data['discount_percent'];

        break;

      case "offer_rate":
        if (data.no_of_injection > 0) {
          if (data.offer_rate) {
            data["rate_per_injection"] = data.offer_rate;
          }

          // this.calculateParameterAmtOnInjection(data);
        } else {
          if (data.offer_rate) {
            gross_amount = this.getDecimalAmount(data.offer_rate * data.qty);
            if (data.discount_percent && data.discount_percent > 0) {
              dis_amt = this.getDecimalAmount((gross_amount * data.discount_percent) / 100);
            }
            net_amount = gross_amount - dis_amt;
          }
          data['net_amount'] = net_amount;
          data['discount_amount'] = dis_amt;
          data['total'] = gross_amount;
          data['quotation_effective_rate'] = gross_amount;
        }
        break;
      case "discount_amount":
        if ((data.discount_amount == 0) || (data.discount_amount)) {
          net_amount = (+data.quotation_effective_rate) - (+data.discount_amount);
          let discount_per = this.getDecimalAmount(((+data.discount_amount) * 100) / (+data.quotation_effective_rate));
          data['net_amount'] = net_amount;
          data['discount_percent'] = discount_per;
          data['discount_amount'] = +data['discount_amount'];
        }
        break;

    }
    if (data['qty'] > 0) {
      data['per_sample_net_rate'] = this.getDecimalAmount(data['net_amount'] / data['qty']);
    }
    let amountFields = [
      'quotation_effective_rate',
      'discount_amount',
      'discount_percent',
      'net_amount',
      'total',
      'per_sample_net_rate'
    ];
    amountFields.forEach(column => {
      data[column] = this.getDecimalAmount(data[column]);
    });
  }


  calculate_pharma_claim_values(new_element: any) {
    if (new_element.claim_dependent && !isNaN(new_element.claim_percent)) {
      if (!isNaN(+new_element.limit_from)) {
        if (this.coreFunctionService.isNotBlank(new_element.claim_percent)) {
          new_element.claim_limit_from = (+new_element.limit_from) * (new_element.claim_percent) / 100;
          if (new_element.claim_unit) {
            new_element.claim_limit_from = new_element.claim_limit_from + " " + new_element.claim_unit;
          }
        } else {
          new_element.claim_limit_from = new_element.limit_from;
        }
      }
      if (!isNaN(+new_element.limit_to)) {
        if (this.coreFunctionService.isNotBlank(new_element.claim_percent)) {
          new_element.claim_limit_to = (+new_element.limit_to) * (new_element.claim_percent) / 100;
          if (new_element.claim_unit) {
            new_element.claim_limit_to = new_element.claim_limit_to + " " + new_element.claim_unit;
          }
        } else {
          new_element.claim_limit_to = new_element.limit_to;
        }
      }
    }
  }

  calculatePharamaParameterAmount(data:any, offer_rate: number, quantity: number, field_name?:any) {
    let gross_amount:any = this.calculateParameterAmtOnInjection(data, data["rate_per_injection"], quantity)
    let effectiveTotal:any = this.calculateParameterAmtOnInjection(data, offer_rate, quantity)
    let dis_amt = gross_amount - effectiveTotal;
    switch (field_name) {
      case 'discount_amount':
        effectiveTotal = gross_amount - data['discount_amount'];
        dis_amt = data['discount_amount'];
        break;
      default:

    }
    let discount_percent = 0;
    if (gross_amount > 0) {
      discount_percent = (dis_amt / gross_amount) * 100;
    }
    else {
      discount_percent = 0;
    }
    this.populateParameterAmount(data, effectiveTotal, discount_percent, dis_amt, quantity, gross_amount)
  }


  calculateParameterAmtOnInjection(data:any, rate:any, quantity:any) {
    let totalInjection = data.no_of_injection;
    if (!this.coreFunctionService.isNotBlank(totalInjection)) {
      totalInjection = 0;
    }

    if (!this.coreFunctionService.isNotBlank(rate)) {
      rate = 0;
    }
    let rate_per_injection = rate;
    let totalAmount = this.getDecimalAmount(totalInjection * rate_per_injection);
    if (data.no_of_injection2 > 0) {
      let no_of_injection2 = data.no_of_injection2;
      if (quantity > 1 && no_of_injection2 > 0) {
        totalInjection = this.getDecimalAmount(totalInjection + (quantity - 1) * no_of_injection2);
        totalAmount = this.getDecimalAmount(totalInjection * rate_per_injection);
      }
    }
    else if (data.no_of_injection > 0 && data.no_of_injection2 <= 0) {
      let no_of_injection = data.no_of_injection;
      if (quantity > 1 && no_of_injection > 0) {
        totalInjection = this.getDecimalAmount(totalInjection + (quantity - 1) * no_of_injection);
        totalAmount = this.getDecimalAmount(totalInjection * rate_per_injection);
      }
    }
    else {
      totalAmount = this.getDecimalAmount(quantity * totalInjection * rate_per_injection);
    }
    // data["quotation_effective_rate"]= totalAmount;
    // data["total"] = totalAmount;
    // data["discount_amount"] = this.getDecimalAmount((data.total* data.discount_percent)/100);
    // data["net_amount"] = this.getDecimalAmount(data.total- data.discount_amount);
    data["total_injection"] = totalInjection;
    return totalAmount;
  }

  getDiscountPercentage(current_disount: number, discount_amount: number, gross_amount: number, quantity: number) {
    if (quantity > 0 && gross_amount > 0) {
      current_disount = discount_amount * 100 / gross_amount;
    }
    return current_disount;
  }

  calculateQuotationParameterAmountForAutomotiveLims(data:any, fieldName:any) {
    let quantity = 0;
    let discount_percent = 0;
    let cost_rate = 0;
    let net_amount:any = 0;
    let param_quantom = 0;
    let Base_quotation_rate = 0;
    let incoming_field = fieldName;

    let gross_amount = 0;
    let dis_amt = 0;
    switch (incoming_field) {
      case "parameter_quantum":
        let parameterQuantum = data.parameter_quantum;
        if (!this.coreFunctionService.isNotBlank(parameterQuantum)) {
          parameterQuantum = 0;
        }
        data['quantum_rate'] = (+data.quotation_rate) * (+parameterQuantum);
        data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
        net_amount = +data.quotation_effective_rate
        if (data.discount_percent) {
          let discount = ((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
          data['discount_amount'] = discount;
          net_amount = (+data.quotation_effective_rate) - discount;
        }
        data['net_amount'] = net_amount

        break;
      case "qty":
        let quantity = data.qty;
        if (!this.coreFunctionService.isNotBlank(quantity)) {
          quantity = 0;
        }

        data['quotation_effective_rate'] = (+quantity) * (+data.quantum_rate);
        if (data.discount_percent) {
          let discount = this.getDecimalAmount((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
          data['discount_amount'] = discount;
        }
        net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - data['discount_amount']);
        data['net_amount'] = net_amount
        data['total'] = +data.quotation_effective_rate;
        data['qty'] = data.qty

        break;
      case "discount_percent":
        let discount_per = data.discount_percent;
        if (!this.coreFunctionService.isNotBlank(discount_per)) {
          discount_per = 0;
        }
        data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
        net_amount = +data.quotation_effective_rate
        let discount = this.getDecimalAmount(((+data.quotation_effective_rate) * (+discount_per)) / 100);
        data['discount_amount'] = discount;
        net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - discount);
        data['net_amount'] = net_amount
        data['total'] = +data.quotation_effective_rate;
        data['qty'] = data.qty;
        data['discount_percent'] = +discount_per;

        break;

      case "discount_amount":
        let discount_amt = data.discount_amount;
        if (!this.coreFunctionService.isNotBlank(discount_amt)) {
          discount_amt = 0;
        }

        net_amount = (+data.quotation_effective_rate) - (+discount_amt);
        let discount_perc = this.getDecimalAmount(((+discount_amt) * 100) / (+data.quotation_effective_rate));
        data['net_amount'] = net_amount;
        data['discount_percent'] = discount_perc;
        data['discount_amount'] = +data['discount_amount'];

        break;
      default:

    }
    if (data['qty'] > 0) {
      data['per_sample_net_rate'] = this.getDecimalAmount(data['net_amount'] / data['qty']);
    } else {
      data['per_sample_net_rate'] = 0;
    }
    this.sanitizeParameterAmount(data);
  }

  sanitizeParameterAmount(data:any){
    let amountFields = [
      'quotation_effective_rate',
      'discount_amount',
      'discount_percent',
      'net_amount',
      'total',
      'per_sample_net_rate'
    ];
    amountFields.forEach(column => {
      data[column] =   this.getDecimalAmount(data[column]);
      if(typeof(data[column]) != 'number'){
        data[column]=0;
      }
    });
  }


  calculateQuotationParameterAmountForLims(data:any, fieldName:any) {
    let quantity = 0;
    let discount_percent:any = 0;
    let cost_rate = 0;
    let net_amount:any = 0;
    let discount_amount = 0;
    let param_quantom = 0;
    let Base_quotation_rate = 0;
    let incoming_field = fieldName;
    let sale_rate = data['sale_rate'];
    let gross_amount = 0;
    let effectiveTotal = 0;
    let dis_amt:any = 0;
    quantity = data.qty;
    if (!this.coreFunctionService.isNotBlank(quantity)) {
      quantity = 0;
    }
    gross_amount = quantity * sale_rate;

    switch (incoming_field) {

      case "qty":
        effectiveTotal = (+quantity) * (+data.offer_rate);
        if (data.no_of_injection > 0) {
          this.calculatePharamaParameterAmount(data, data.offer_rate, quantity);

        }
        else {
          dis_amt = gross_amount - effectiveTotal;
          if (gross_amount > 0) {
            discount_percent = this.getDecimalAmount(100 * dis_amt / gross_amount);
          } else {
            discount_percent = 0;
          }
          net_amount = effectiveTotal;
          this.populateParameterAmount(data, net_amount, discount_percent, dis_amt, quantity, gross_amount)

        }
        break;
      case "discount_percent":
        discount_percent = data.discount_percent;
        if (!this.coreFunctionService.isNotBlank(discount_percent)) {
          discount_percent = 0;
        }
        if (data.no_of_injection > 0) {
          let offeringRate = data.rate_per_injection * (1 - discount_percent / 100);
          this.calculatePharamaParameterAmount(data, offeringRate, quantity);
        } else {
          dis_amt = this.getDecimalAmount(((+gross_amount) * (+discount_percent)) / 100);
          net_amount = this.getDecimalAmount((+gross_amount) - dis_amt);
          this.populateParameterAmount(data, net_amount, discount_percent, dis_amt, quantity, gross_amount)
        }
        break;

      case "unit_price":
        discount_percent = data.discount_percent;
        if (!this.coreFunctionService.isNotBlank(discount_percent)) {
          discount_percent = 0;
        }
        if (data.no_of_injection > 0) {
          let offeringRate = data.rate_per_injection * (1 - discount_percent / 100);
          this.calculatePharamaParameterAmount(data, offeringRate, quantity);
        } else {
          dis_amt = this.getDecimalAmount(((+gross_amount) * (+discount_percent)) / 100);
          net_amount = this.getDecimalAmount((+gross_amount) - dis_amt);

          this.populateParameterAmount(data, net_amount, discount_percent, dis_amt, quantity, gross_amount)
        }
        break;

      case "offer_rate":
        let offer_rate = data.offer_rate;
        if (!this.coreFunctionService.isNotBlank(offer_rate)) {
          offer_rate = 0;
        }
        if (data.no_of_injection > 0) {

          this.calculatePharamaParameterAmount(data, offer_rate, quantity);

        } else {
          if (offer_rate) {
            effectiveTotal = quantity * offer_rate;
            dis_amt = gross_amount - effectiveTotal;
            if (gross_amount > 0) {
              discount_percent = this.getDecimalAmount(100 * dis_amt / gross_amount);
            } else {
              discount_percent = 0;
            }
            net_amount = gross_amount - dis_amt;
          }
          this.populateParameterAmount(data, net_amount, discount_percent, dis_amt, quantity, gross_amount);
          data["offer_rate"] = offer_rate;
        }
        break;
      case "discount_amount":
        dis_amt = data.discount_amount;
        if (!this.coreFunctionService.isNotBlank(dis_amt)) {
          dis_amt = 0;
        }
        if (data.no_of_injection > 0) {
          if (!this.coreFunctionService.isNotBlank(data['rate_per_injection'])) {
            data['rate_per_injection'] = 0;
          }
          let offeringRate = data['rate_per_injection'] - dis_amt;
          this.calculatePharamaParameterAmount(data, offeringRate, quantity, incoming_field);
        } else {
          effectiveTotal = gross_amount - dis_amt;
          net_amount = effectiveTotal;
          if (gross_amount > 0) {
            discount_percent = this.getDecimalAmount(((+dis_amt) * 100) / (+gross_amount));
          } else {
            discount_percent = 0;
          }
          this.populateParameterAmount(data, net_amount, discount_percent, dis_amt, quantity, gross_amount)
        }
        break;
    }
  }




  calculate_invoice_amount_row_wise(data:any, fieldName:any,currencyRate?:any) {
    let total = 0;
    let disc_per = 0;
    let disc_amt = 0;
    let final_amt = 0;
    let net_amount = 0;
    let surcharge = 0;
    if (this.coreFunctionService.isNotBlank(data.total)) {
      total = data.total;
    }
    if (this.coreFunctionService.isNotBlank(data.discount_amount)) {
      disc_amt = data.discount_amount;
    }
    if (this.coreFunctionService.isNotBlank(data.sampling_charge)) {
      surcharge = data.sampling_charge;
    }
    if (this.coreFunctionService.isNotBlank(data.discount_percent)) {
      disc_per = data.discount_percent;
    }


    let incoming_field = fieldName;
    switch (incoming_field) {
      case "total":
        disc_amt = disc_per * total / 100;
        net_amount = total - disc_amt;
        final_amt = surcharge + net_amount;
        // disc_per = (disc_amt/(data.total))*100;
        break;
      case "discount_percent":
        disc_amt = disc_per * total / 100;
        net_amount = total - disc_amt;
        final_amt = surcharge + net_amount;
        break;
      case "discount_amount":
        disc_per = (100 * disc_amt) / total;
        net_amount = total - disc_amt;
        final_amt = surcharge + net_amount;
        break;
      case "sampling_charge":
        disc_per = (100 * disc_amt) / total;
        net_amount = total - disc_amt;
        final_amt = surcharge + net_amount;
        break;
    }
    if(data.finalConvertedAmount && currencyRate &&currencyRate != "" ){
      data["finalConvertedAmount"] = this.convertCurrencyRate(final_amt,currencyRate)
    }
    data["discount_percent"] = disc_per;
    data["discount_amount"] = disc_amt;
    data["final_amount"] = final_amt;
    data["net_amount"] = net_amount;
  }


  calculateNetAmount(data:any, fieldName:any, grid_cell_function:any,currencyRate?:any) {
    switch (grid_cell_function) {
      case "calculateQuotationParameterAmountForAutomotiveLims":
        this.calculateQuotationParameterAmountForAutomotiveLims(data, fieldName["field_name"]);
        break

      case "calculateQuotationParameterAmountForLims":
        this.calculateQuotationParameterAmountForLims(data, fieldName["field_name"])
        break;
      case "calculateQuotationParameterAmountForLimsWithSubsequent":
        this.calculateQuotationParameterAmountForLimsWithSubsequent(data, fieldName["field_name"])
        break;

      case "calculate_pharma_claim_values":
        this.calculate_pharma_claim_values(data);
        break;

      case "calculate_invoice_amount_row_wise":
        this.calculate_invoice_amount_row_wise(data, fieldName["field_name"],currencyRate);
        break;

      default:
        this.legacyQuotationParameterCalculation(data, fieldName["field_name"]);
    }

  }



  calculateQquoteAmount(templateValue:any, field: any) {
    var total = 0;
    let discount_percent:any = 0;
    let net_amount = 0;
    let sampling_amount = 0;
    let final_amount = 0;
    let discount_amount = 0;
    let quotation_param_methods:any = [];
    let unit_price:any = 0;

    if (templateValue['quotation_param_methods'] != '' && templateValue['quotation_param_methods'].length > 0) {
      templateValue['quotation_param_methods'].forEach((element:any) => {
        total = total + element.quotation_effective_rate;
      });
    }

    if (templateValue['sampling_charge'] && templateValue['sampling_charge'] != null) {
      sampling_amount = templateValue['sampling_charge'];
    }
    if (total > 0) {
      if (templateValue[field.field_name] != '') {
        if (field.field_name === 'discount_percent') {
          discount_percent = templateValue[field.field_name];
          discount_amount = total * discount_percent / 100;
          net_amount = total - discount_amount;
          quotation_param_methods = [];
          templateValue['quotation_param_methods'].forEach((element:any) => {
            const new_element = { ...element };
            new_element.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateNetAmount(new_element, "qty", "");
            quotation_param_methods.push(new_element);
          })
          templateValue['quotation_param_methods'].setValue(quotation_param_methods);
          this.calculateQquoteAmount(templateValue, { field_name: "quotation_param_methods" });
        } else if (field.field_name === 'net_amount') {
          discount_percent = 0;
          net_amount = templateValue[field.field_name];
          discount_amount = total - net_amount;
          discount_percent = this.getDecimalAmount(100 * discount_amount / total);
          templateValue["discount_percent"] = discount_percent;
          let updatedData = this.quote_amount_via_discount_percent(templateValue["quotation_param_methods"], templateValue)
          updatedData[field.field_name] = net_amount
          return updatedData;
        } else if (field.field_name === 'quotation_param_methods') {
          let list = templateValue[field.field_name];
          list.forEach((element:any) => {
            const new_element = { ...element };
            discount_amount = discount_amount + element.discount_amount
            net_amount = net_amount + element.net_amount;
          });
          discount_percent = 100 * discount_amount / total;
        } else {
          total = templateValue['total'];
          discount_amount = templateValue['discount_amount'];
          net_amount = templateValue['net_amount'];
          discount_percent = templateValue['discount_percent'];

        }
        final_amount = net_amount + sampling_amount;
        unit_price = this.getDecimalAmount(net_amount / templateValue['qty']);
        quotation_param_methods = [];
        templateValue['quotation_param_methods'].forEach((element:any) => {
          const new_element = { ...element };
          new_element.discount_percent = this.getDecimalAmount(+element.discount_percent);
          new_element.net_amount = this.getDecimalAmount(+(element.quotation_effective_rate * (1 - element.discount_percent / 100)));
          new_element.discount_amount = this.getDecimalAmount(+(element.quotation_effective_rate * element.discount_percent / 100));
          if (new_element.qty > 0) {
            new_element.per_sample_net_rate = this.getDecimalAmount(+(new_element.net_amount / new_element.qty));
          }
          quotation_param_methods.push(new_element);
        });
        templateValue['total'] = total;
        templateValue['discount_amount'] = this.getDecimalAmount(discount_amount);
        templateValue['net_amount'] = this.getDecimalAmount(net_amount);
        templateValue['discount_percent'] = this.getDecimalAmount(discount_percent);
        templateValue['final_amount'] = this.getDecimalAmount(final_amount);
        templateValue['unit_price'] = unit_price;
        if (quotation_param_methods.length > 0) {
          templateValue['quotation_param_methods'] = quotation_param_methods;
        }

      }
    }
    return templateValue;

  }




  calculate_lims_invoice_with_manual_items(templateValue:any, lims_segment:any, calculate_on_field: any) {
    let calculateOnField = "";
    if (calculate_on_field == null || calculate_on_field == '') {
      calculateOnField = 'manualItemsList';
    } else {
      calculateOnField = calculate_on_field['field_name']
    }
    let surcharge = 0;
    let gross_amount = 0;
    let discount_percent = 0;
    let discount_amount = 0;
    let taxable_amount = 0;
    let net_amount = 0;

    if (this.coreFunctionService.isNotBlank(templateValue[calculateOnField]) && templateValue[calculateOnField].length > 0) {
      templateValue[calculateOnField].forEach((element:any) => {
        if (this.coreFunctionService.isNotBlank(element.sampleTotal)) {
          // gross_amount=gross_amount+element.gross_amount
          gross_amount = gross_amount + element.sampleTotal
        }
        if (this.coreFunctionService.isNotBlank(element.sampling_charge)) {
          // surcharge=surcharge+element.surcharge
          surcharge = surcharge + element.sampling_charge
        }
        if (this.coreFunctionService.isNotBlank(element.discount_amount)) {
          discount_amount = discount_amount + element.discount_amount
        }
        if (this.coreFunctionService.isNotBlank(element.net_amount)) {
          net_amount = net_amount + element.net_amount
        } else {
          net_amount = net_amount + element.sampleTotal
        }
        taxable_amount = net_amount + surcharge;
      });
    }
    templateValue = this.update_invoice_totatl(templateValue, gross_amount, discount_amount, discount_percent, net_amount, surcharge, taxable_amount);
    return templateValue;
  }
  calculate_lims_invoice_with_po_items(templateValue:any, lims_segment:any, calculate_on_field: any) {
    return this.calculate_lims_invoice(templateValue, lims_segment, 'po_items')
  }

  calculate_manual_row_item(templateValue:any, lims_segment:any, calculate_on_field: any) {
    var manualItemsList = templateValue['manualItemsList'];
    var qty = manualItemsList['sampleQty'];
    var cost = manualItemsList['sampleCost'];
    if (qty && cost) {
      manualItemsList['sampleTotal'] = qty * cost;
    } else {
      manualItemsList['sampleTotal'] = 0;
    }
    manualItemsList['discount_amount'] = 0;
    manualItemsList['net_amount'] = manualItemsList['sampleTotal'];
    templateValue['manualItemsList'] = manualItemsList;
    return templateValue;
  }


  calculate_po_row_item(templateValue:any, lims_segment:any, calculate_on_field: any) {
    var po_items = templateValue['po_items'];
    var qty = po_items['qty'];
    var cost = po_items['cost'];
    if (qty && cost) {
      po_items['total'] = qty * cost;
    } else {
      po_items['total'] = 0;
    }
    po_items['discount_amount'] = 0;
    po_items['net_amount'] = po_items['total'];
    templateValue['po_items'] = po_items;
    return templateValue;
  }

  credit_note_invoice_calculation(templateValue: any, lims_segment: any, calculate_on_field: any){
    let surcharge = 0;
    let gross_amount = 0;
    let discount_percent = 0;
    let discount_amount = 0;
    let taxable_amount = 0;
    let net_amount = 0;
    let parentObjectValue = templateValue[calculate_on_field.parent];
    if (this.coreFunctionService.isNotBlank(parentObjectValue)) {
      if (this.coreFunctionService.isNotBlank(parentObjectValue[calculate_on_field.field_name])){
          taxable_amount = parentObjectValue[calculate_on_field.field_name];
      }
    }
    templateValue = this.update_invoice_totatl(templateValue, gross_amount, discount_amount, discount_percent, net_amount, surcharge, taxable_amount);
    return templateValue;
  }

  calculate_lims_invoice(templateValue:any, lims_segment:any, calculate_on_field: any) {
    if (calculate_on_field == null || calculate_on_field == '') {
      calculate_on_field = 'items_list';
    }
    let surcharge = 0;
    let gross_amount = 0;
    let discount_percent = 0;
    let discount_amount = 0;
    let taxable_amount = 0;
    let net_amount = 0;

    if (this.coreFunctionService.isNotBlank(templateValue[calculate_on_field]) && templateValue[calculate_on_field].length > 0) {
      templateValue[calculate_on_field].forEach((element:any) => {
        if (this.coreFunctionService.isNotBlank(element.total)) {
          // gross_amount=gross_amount+element.gross_amount
          gross_amount = gross_amount + element.total
        }
        if (this.coreFunctionService.isNotBlank(element.sampling_charge)) {
          // surcharge=surcharge+element.surcharge
          surcharge = surcharge + element.sampling_charge
        }
        if (this.coreFunctionService.isNotBlank(element.discount_amount)) {
          discount_amount = discount_amount + element.discount_amount
        }
        if (this.coreFunctionService.isNotBlank(element.net_amount)) {
          net_amount = net_amount + element.net_amount
        } else {
          net_amount = net_amount + element.total
        }
        taxable_amount = net_amount + surcharge;
      });
    }
    templateValue = this.update_invoice_totatl(templateValue, gross_amount, discount_amount, discount_percent, net_amount, surcharge, taxable_amount);
    return templateValue;
  }

  calculate_lims_invoice_extra_amount(templateValue:any, lims_segment:any, calculate_on_field: any) {
    if (calculate_on_field == null || calculate_on_field == '') {
      calculate_on_field = 'items_list';
    }
    let surcharge = 0;
    let gross_amount = 0;
    let discount_percent = 0;
    let discount_amount = 0;
    let taxable_amount = 0;
    let net_amount = 0;
    let extraAmount = 0

    if (this.coreFunctionService.isNotBlank(templateValue[calculate_on_field]) && templateValue[calculate_on_field].length > 0) {
      templateValue[calculate_on_field].forEach((element:any) => {
        if (this.coreFunctionService.isNotBlank(element.total)) {
          // gross_amount=gross_amount+element.gross_amount
          gross_amount = gross_amount + element.total
        }
        if (this.coreFunctionService.isNotBlank(element.sampling_charge)) {
          // surcharge=surcharge+element.surcharge
          surcharge = surcharge + element.sampling_charge
        }
        if (this.coreFunctionService.isNotBlank(element.discount_amount)) {
          discount_amount = discount_amount + element.discount_amount
        }
        if (this.coreFunctionService.isNotBlank(element.net_amount)) {
          net_amount = net_amount + element.net_amount
        } else {
          net_amount = net_amount + element.total
        }


        if (element && element.extra_amount) {
          extraAmount = Number(extraAmount) + Number(element.extra_amount)
        }
        taxable_amount = net_amount + surcharge + extraAmount;
      });
    }
    templateValue = this.update_invoice_totatl_extra_amount(templateValue, gross_amount, discount_amount, discount_percent, net_amount, surcharge, extraAmount, taxable_amount);
    return templateValue;
  }

  getPercent(templateValue:any, parent:any, field:any) {
    const calculateValue:any = {};
    if (field && field.calSourceTarget && field.calSourceTarget.length >= 1) {
      let source = field.calSourceTarget[0].source;
      let target = field.calSourceTarget[0].target;
      let sourceValue = this.commonFunctionService.getObjectValue(source, templateValue);
      if (sourceValue && sourceValue != '') {
        if (typeof sourceValue == 'number') {
          let fileName = field.field_name;
          let percent: any;
          if (parent != '') {
            percent = templateValue[parent.field_name][fileName]
          } else {
            percent = templateValue[fileName]
          }
          if (typeof sourceValue == 'number' && percent && percent >= 1) {
            let percentValue = sourceValue * percent / 100;
            let targetFields = target.split('.');
            if (targetFields && targetFields.length == 2) {
              const parent = targetFields[0];
              const child = targetFields[1];
              calculateValue[parent] = {};
              calculateValue[parent][child] = percentValue
            } else {
              const child = targetFields[0];
              calculateValue[child] = percentValue
            }
          }
        } else {
          this.notificationService.notify('bg-danger', 'Source Value is not a number.')
        }
      } else {
        this.notificationService.notify('bg-danger', 'Source Field is Required.')
      }
    }

    return calculateValue;
  }


  calculate_quotation(templateValue:any, lims_segment:any, field: any) {
    var total = 0;
    let discount_percent = 0;
    let net_amount = 0;
    let sampling_amount = 0;
    let final_amount = 0;
    let discount_amount = 0;
    let quotation_param_methods = [];
    let unit_price:any = 0;
    let paramArray:any = [];
    let gross_amount = 0;
    let field_name = field.field_name;
    let qty = 0;
    let product_wise_pricing = templateValue['product_wise_pricing'];
    let current_disount = 0;
    if (this.coreFunctionService.isNotBlank(templateValue['discount_percent'])) {
      current_disount = templateValue['discount_percent'];
    }

    if (this.coreFunctionService.isNotBlank(templateValue.qty)) {
      qty = templateValue.qty;
    }

    if (templateValue['quotation_param_methods'] != '' && templateValue['quotation_param_methods'].length > 0) {
      templateValue['quotation_param_methods'].forEach((element:any) => {
        let data = { ...element };
        paramArray.push(data);
      });
    }



    if (templateValue['sampling_charge'] && templateValue['sampling_charge'] != null) {
      sampling_amount = templateValue['sampling_charge'];
    }
    // if(gross_amount>0){
    if (true) {
      switch (field_name) {
        case 'parameter_array':
          unit_price = 0;
          if (this.coreFunctionService.isNotBlank(templateValue.unit_price)) {
            unit_price = templateValue.unit_price;
          }
          if (product_wise_pricing) {
            net_amount = qty * unit_price;
            paramArray.forEach((data:any) => {
              this.calculateParameterLimsSegmentWise(lims_segment, data, "qty");
              gross_amount = gross_amount + data['total'];
            })
            discount_amount = gross_amount - net_amount;
            discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
            paramArray.forEach((data:any) => {
              data.discount_percent = this.getDecimalAmount(+discount_percent);
              this.calculateParameterLimsSegmentWise(lims_segment, data, "discount_percent");
            })

          } else {
            if (paramArray.length > 0) {
              discount_amount = 0;
              net_amount = 0;
              total = 0;
              gross_amount = 0;
              if (this.coreFunctionService.isNotBlank(templateValue.qty)) {
                qty = templateValue.qty;
              }
              paramArray.forEach((data:any) => {
                if (lims_segment == 'standard') {
                  data['qty'] = qty;
                  this.calculateParameterLimsSegmentWise(lims_segment, data, 'qty');
                }
                gross_amount = gross_amount + data['total'];
                net_amount = net_amount + data['net_amount'];
                discount_amount = discount_amount + data['discount_amount'];
              });
            }

          }
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          templateValue['discount_amount'] = discount_amount;
          templateValue['net_amount'] = net_amount;
          templateValue['discount_percent'] = discount_percent;
          break;

        case 'discount_percent':
          discount_percent = templateValue[field_name];
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, field_name);
            gross_amount = gross_amount + data['total'];
          })
          discount_amount = gross_amount * discount_percent / 100;
          net_amount = gross_amount - discount_amount;
          templateValue['discount_amount'] = discount_amount;
          templateValue['net_amount'] = net_amount;
          templateValue['discount_percent'] = discount_percent;
          break;

        case 'discount_amount':
          discount_amount = templateValue[field_name];
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, "discount_percent");
            gross_amount = gross_amount + data['total'];
          })
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          net_amount = gross_amount - discount_amount;
          templateValue['discount_amount'] = discount_amount;
          templateValue['net_amount'] = net_amount;
          templateValue['discount_percent'] = discount_percent;
          break;


        case 'net_amount':
          discount_percent = 0;
          net_amount = templateValue[field_name];
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, "qty");
            gross_amount = gross_amount + data['total'];
          })


          discount_amount = gross_amount - net_amount;
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, "discount_percent");
          })

          templateValue["discount_percent"] = discount_percent;
          templateValue["discount_amount"] = discount_amount;
          templateValue['net_amount'] = net_amount;
          break;

        case 'unit_price':
          unit_price = 0;
          if (this.coreFunctionService.isNotBlank(templateValue.unit_price)) {
            unit_price = templateValue.unit_price;
          }
          net_amount = qty * unit_price;


          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, "qty");
            gross_amount = gross_amount + data['total'];
          })
          discount_amount = gross_amount - net_amount;
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWise(lims_segment, data, "unit_price");
          })
          templateValue['discount_amount'] = discount_amount;
          templateValue['net_amount'] = net_amount;
          templateValue['discount_percent'] = discount_percent;
          break;

        default:
          discount_amount = 0;
          net_amount = 0;
          if (paramArray.length > 0) {
            paramArray.forEach((data:any) => {
              data['qty'] = qty;
              this.calculateParameterLimsSegmentWise(lims_segment, data, field_name);
              gross_amount = gross_amount + data['total'];
              net_amount = net_amount + data['net_amount'];
              discount_amount = discount_amount + data['discount_amount'];
            });
          }
          if (product_wise_pricing) {
            unit_price = templateValue["unit_price"];
            net_amount = unit_price * qty;
            discount_amount = gross_amount - net_amount;
            discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
            if (paramArray.length > 0) {
              paramArray.forEach((data:any) => {
                data['discount_percent'] = discount_percent;
                this.calculateParameterLimsSegmentWise(lims_segment, data, "unit_price");
              });
            }
          }
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          templateValue['discount_amount'] = discount_amount;
          templateValue['net_amount'] = net_amount;
          templateValue['discount_percent'] = discount_percent;

      }

    }

    final_amount = net_amount + sampling_amount;
    if (templateValue['qty'] > 0) {
      unit_price = this.getDecimalAmount(net_amount / templateValue['qty']);
    } else {
      unit_price = templateValue["unit_price"];
    }
    if(templateValue.currencyRate && templateValue.currencyRate != ""){
      templateValue['convertedAmount']=this.convertCurrencyRate(final_amount,templateValue.currencyRate);
    }
    templateValue['total'] = gross_amount;
    templateValue['discount_amount'] = this.getDecimalAmount(discount_amount);
    templateValue['net_amount'] = this.getDecimalAmount(net_amount);
    templateValue['discount_percent'] = this.getDecimalAmount(discount_percent);
    templateValue['final_amount'] = this.getDecimalAmount(final_amount);
    templateValue['unit_price'] = unit_price;
    if (paramArray.length > 0) {
      templateValue['quotation_param_methods'] = paramArray;
    }

    return templateValue;

  }

  calculate_quotation_for_lims(templateValue:any, lims_segment:any, field: any) {
    var total = 0;
    let discount_percent = 0;
    let net_amount = 0;
    let sampling_amount = 0;
    let final_amount = 0;
    let discount_amount = 0;
    let quotation_param_methods = [];
    let unit_price:any = 0;
    let paramArray:any = [];
    let gross_amount = 0;
    let field_name = field.field_name;
    let qty = 0;
    let product_wise_pricing = templateValue['product_wise_pricing'];
    let current_disount = 0;
    if (this.coreFunctionService.isNotBlank(templateValue['discount_percent'])) {
      current_disount = templateValue['discount_percent'];
    }

    if (this.coreFunctionService.isNotBlank(templateValue.qty)) {
      qty = templateValue.qty;
    }

    if (templateValue['quotation_param_methods'] != '' && templateValue['quotation_param_methods'].length > 0) {
      templateValue['quotation_param_methods'].forEach((element:any) => {
        let data = { ...element };
        paramArray.push(data);
      });
    }

    // if(gross_amount>0){
    if (true) {
      discount_amount = 0;
      net_amount = 0;
      if (paramArray.length > 0) {
        paramArray.forEach((data:any) => {
          data['qty'] = qty;
          this.calculateParameterLimsSegmentWise(lims_segment, data, field_name);
          gross_amount = gross_amount + data['total'];
          net_amount = net_amount + data['net_amount'];
          discount_amount = discount_amount + data['discount_amount'];
        });
      }
      if (product_wise_pricing) {
        unit_price = templateValue["unit_price"];
        net_amount = unit_price * qty;
        discount_amount = gross_amount - net_amount;
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
        if (paramArray.length > 0) {
          paramArray.forEach((data:any) => {
            data['discount_percent'] = discount_percent;
            this.calculateParameterLimsSegmentWise(lims_segment, data, "unit_price");
          });
        }
      }
    }
    templateValue['total'] = gross_amount;
    templateValue['discount_amount'] = this.getDecimalAmount(discount_amount);
    templateValue['net_amount'] = this.getDecimalAmount(net_amount);
    templateValue['discount_percent'] = this.getDecimalAmount(discount_percent);
    templateValue['unit_price'] = unit_price;
    return templateValue;

  }


  calculateParameterLimsSegmentWise(lims_segment: any, data: any, fieldName: string) {
    switch (lims_segment) {
      case 'standard':
        this.calculateQuotationParameterAmountForLims(data, fieldName)
        break;
      case 'automotive':
        this.calculateQuotationParameterAmountForAutomotiveLims(data, fieldName)
        break
    }

  }

  samplingAmountAddition(templateValue:any) {
    let net_amount = templateValue['net_amount'];
    let sampling_charge = templateValue['sampling_charge'];
    let totl = net_amount + sampling_charge;

    templateValue['final_amount'] = totl
    return templateValue;
  }

  quote_amount_via_discount_percent(listOfParm:any, templateValue:any) {
    let discount = templateValue.discount_percent;
    let quantity = templateValue.qty;
    let updatedParamsList:any = [];
    listOfParm.forEach((element:any) => {
      const data = JSON.parse(JSON.stringify(element));
      data['discount_percent'] = discount;
      data['qty'] = quantity;
      this.calculateNetAmount(data, "discount_percent", "");
      updatedParamsList.push(data);
    });
    templateValue["quotation_param_methods"] = updatedParamsList;
    let total = templateValue["total"];
    let discount_amount:any = this.getDecimalAmount(total * discount / 100);
    let net_amount = total - discount_amount;

    let final_amount = net_amount + templateValue["sampling_charge"];
    let unit_price = this.getDecimalAmount(net_amount / templateValue['qty']);

    templateValue['total'] = total;
    templateValue['discount_amount'] = discount_amount;
    templateValue['net_amount'] = net_amount;
    templateValue['final_amount'] = final_amount;
    templateValue['unit_price'] = unit_price;
    return templateValue;
  }

  calculateInvoiceTotalAmount(formValue:any, invoiceInfos:any) {
    let list = invoiceInfos;
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      total += list[i]['netpayableAmount']
    }
    let lumpSumAmount = formValue['lumpSumAmount']
    let advanceAmount = formValue['advanceAmount'];
    let toatallumsumOrAdvance = lumpSumAmount + advanceAmount;
    let totalFair = total - toatallumsumOrAdvance;
    let obj = {
      totalAmount: (total).toFixed(2),
      payAmount: (totalFair).toFixed(2)
    }
    return obj;
  }

  quote_amount_via_sample_no(templateValue:any, listOfParm:any) {
    let quantity = templateValue.qty;
    let discount = templateValue.discount_percent;
    let updatedParamsList:any = [];
    listOfParm.forEach((element: any) => {
      const data = JSON.parse(JSON.stringify(element));
      data['discount_percent'] = discount;
      data['qty'] = quantity;
      this.calculateNetAmount(data, "qty", "");
      updatedParamsList.push(data)
    });
    templateValue["quotation_param_methods"] = updatedParamsList;
    return this.calculateQquoteAmount(templateValue, { field_name: "quotation_param_methods" });
  }

  calculateInvoiceOrderAmount(templateForm: UntypedFormGroup, field: any) {
    var net_amount = 0;
    var discount_amount = 0;
    var igst_amount = 0;
    var sgst_amount = 0;
    var cgst_amount = 0;
    var netPayable = 0;
    var surcharge = 0;
    var sez_amount = 0;
    var total = 0;
    let templateValue = templateForm.getRawValue();
    if (templateValue['items_list'] != '' && templateValue['items_list'].length > 0) {
      templateValue['items_list'].forEach((element:any) => {
        net_amount = net_amount + element.net_amount;
        discount_amount = discount_amount + element.discount_amount;
        surcharge = surcharge + element.surcharge;
        total = total + element.total;
      });
      if (templateValue['tax_type'] != '' && templateValue['tax_type'] == "GST") {
        sgst_amount = (net_amount * templateValue['tax_percentage']) / 200;
        cgst_amount = sgst_amount;
      }
      else if (templateValue['tax_type'] != '' && templateValue['tax_type'] == "IGST") {
        igst_amount = (net_amount * templateValue['tax_percentage']) / 100;
      }
    }
    netPayable = net_amount + igst_amount + sgst_amount + cgst_amount + sez_amount;
    const fieldWithValue = {
      field: 'total_amount', value: [
        { field: 'taxable_amount', value: net_amount },
        { field: 'sgst_amount', value: sgst_amount },
        { field: 'cgst_amount', value: cgst_amount },
        { field: 'igst_amount', value: igst_amount },
        { field: 'net_payble', value: netPayable },
        { field: 'discount_amount', value: discount_amount },
      ]
    }
    return this.setValueInVieldsForChild(templateForm, fieldWithValue);
  }
  setValueInVieldsForChild(templateForm: UntypedFormGroup, field: any) {
    (<UntypedFormGroup>templateForm.controls['total_amount']).addControl('discount_amount', new UntypedFormControl(''))
    field.value.forEach((element:any) => {
      (<UntypedFormGroup>templateForm.controls[field.field]).controls[element.field].patchValue(element.value);
    });
    return templateForm;
  }
  calculateAdditionalCost(obj:any){
    let list = obj['additional_cost'];
    let sum = 0;
    let net_amt = obj['net_amount'];
    if(list != null && list.length > 0){
      list.forEach((element:any) => {
        sum += +(element.amount);
      });
    }
    let final_amt = sum+net_amt;
    obj['sampling_charge'] = sum;
    obj['final_amount'] = final_amt;
    if(obj.currencyRate && obj.currencyRate != ""){
      obj['convertedAmount']=this.convertCurrencyRate(final_amt,obj.currencyRate);
    }
   return obj;
  }

  update_invoice_totatl(templateValue:any,gross_amount:number,discount_amount:number,discount_percent:any,net_amount:number,surcharge:number,taxable_amount:number,field?:any){
    let	gst_amount	=0;
    let	cgst_amount	=0;
    let	sgst_amount	=0;
    let	igst_amount	=0;
    let	tax_amount	=0;
    let	sez_amount	=0;

    let	net_payble	=0;

    let	igst_percent	=0;
    let	gst_percent	=0;
    let	sez_percent	=0;
    let cgst_percent=0;
    let sgst_percent=0;
    let tax_percentage = 0;
    let tax_type = templateValue['tax_type'];

    if(this.coreFunctionService.isNotBlank(templateValue.tax_percentage)){
      tax_percentage = templateValue.tax_percentage;
    }

    if((tax_type==null || tax_type==undefined || tax_type=='NA') && tax_percentage==0)
    {
      net_payble = taxable_amount;
    }
    else
    {
      switch(tax_type){
        case "GST" :
         gst_amount = taxable_amount * tax_percentage/100;
         gst_percent=tax_percentage;
         cgst_percent = gst_percent/2;
         sgst_percent= gst_percent/2;
         cgst_amount = gst_amount/2;
         sgst_amount = gst_amount/2;
         net_payble = taxable_amount+gst_amount;
         tax_amount=gst_amount;
         igst_amount=0;
         igst_percent=0;

          break;
        case "IGST" :
          igst_amount = taxable_amount * tax_percentage/100;
          igst_percent=tax_percentage;
          net_payble = taxable_amount+igst_amount;
          tax_amount=igst_amount;
          break;
          default :

    }
    }
      if(gross_amount>0){
        discount_percent = this.getDecimalAmount(100*discount_amount/gross_amount);
      }
      let total:any ={};
      if(templateValue.currencyRate && templateValue.currencyRate != ""){
        total['convertedAmount']=this.convertCurrencyRate(net_payble,templateValue.currencyRate);
      }
      total['surcharge'] = this.getDecimalAmount(surcharge);
      total['igst_percent'] = this.getDecimalAmount(igst_percent);
      total['gst_percent'] = this.getDecimalAmount(gst_percent);
      total['cgst_percent'] = this.getDecimalAmount(cgst_percent);
      total['sgst_percent'] = this.getDecimalAmount(sgst_percent);

      total['sez_percent'] = this.getDecimalAmount(sez_percent);
      total['gross_amount'] = this.getDecimalAmount(gross_amount);
      total['discount_percent'] = this.getDecimalAmount(discount_percent);
      total['discount_amount'] = this.getDecimalAmount(discount_amount);
      total['taxable_amount'] = this.getDecimalAmount(taxable_amount);
      total['gst_amount'] = this.getDecimalAmount(gst_amount);
      total['cgst_amount'] = this.getDecimalAmount(cgst_amount);
      total['sgst_amount'] = this.getDecimalAmount(sgst_amount);
      total['igst_amount'] = this.getDecimalAmount(igst_amount);
      total['tax_amount'] = this.getDecimalAmount(tax_amount);
      total['sez_amount'] = this.getDecimalAmount(sez_amount);
      total['net_amount'] = this.getDecimalAmount(net_amount);
      total['net_payble'] = this.getDecimalAmount(net_payble);

      if(field != null && field.field_name != null && field != ""){
        delete total[field.field_name]
      }
      templateValue = {};
      templateValue['total_amount'] = total;
      return templateValue;

  }




  update_invoice_totatl_extra_amount(templateValue:any,gross_amount:number,discount_amount:number,discount_percent:any,net_amount:number,surcharge:number,extraAmount:number,taxable_amount:number,field?:any){
    let	gst_amount	=0;
    let	cgst_amount	=0;
    let	sgst_amount	=0;
    let	igst_amount	=0;
    let	tax_amount	=0;
    let	sez_amount	=0;

    let	net_payble	=0;

    let	igst_percent	=0;
    let	gst_percent	=0;
    let	sez_percent	=0;
    let cgst_percent=0;
    let sgst_percent=0;
    let tax_percentage = 0;
    let tax_type = templateValue['tax_type'];

    if(this.coreFunctionService.isNotBlank(templateValue.tax_percentage)){
      tax_percentage = templateValue.tax_percentage;
    }

    if((tax_type==null || tax_type==undefined || tax_type=='NA') && tax_percentage==0)
    {
      net_payble = taxable_amount;
    }
    else
    {
      switch(tax_type){
        case "GST" :
         gst_amount = taxable_amount * tax_percentage/100;
         gst_percent=tax_percentage;
         cgst_percent = gst_percent/2;
         sgst_percent= gst_percent/2;
         cgst_amount = gst_amount/2;
         sgst_amount = gst_amount/2;
         net_payble = taxable_amount+gst_amount;
         tax_amount=gst_amount;
         igst_amount=0;
         igst_percent=0;

          break;
        case "IGST" :
          igst_amount = taxable_amount * tax_percentage/100;
          igst_percent=tax_percentage;
          net_payble = taxable_amount+igst_amount;
          tax_amount=igst_amount;
          break;
          default :

    }
    }
      if(gross_amount>0){
        discount_percent = this.getDecimalAmount(100*discount_amount/gross_amount);
      }
      let total:any ={};
      if(templateValue.currencyRate && templateValue.currencyRate != ""){
        total['convertedAmount']=this.convertCurrencyRate(net_payble,templateValue.currencyRate);
      }
      total['surcharge'] = this.getDecimalAmount(surcharge);
      total['igst_percent'] = this.getDecimalAmount(igst_percent);
      total['gst_percent'] = this.getDecimalAmount(gst_percent);
      total['cgst_percent'] = this.getDecimalAmount(cgst_percent);
      total['sgst_percent'] = this.getDecimalAmount(sgst_percent);

      total['sez_percent'] = this.getDecimalAmount(sez_percent);
      total['gross_amount'] = this.getDecimalAmount(gross_amount);
      total['discount_percent'] = this.getDecimalAmount(discount_percent);
      total['discount_amount'] = this.getDecimalAmount(discount_amount);
      total['taxable_amount'] = this.getDecimalAmount(taxable_amount);
      total['gst_amount'] = this.getDecimalAmount(gst_amount);
      total['cgst_amount'] = this.getDecimalAmount(cgst_amount);
      total['sgst_amount'] = this.getDecimalAmount(sgst_amount);
      total['igst_amount'] = this.getDecimalAmount(igst_amount);
      total['tax_amount'] = this.getDecimalAmount(tax_amount);
      total['sez_amount'] = this.getDecimalAmount(sez_amount);
      total['net_amount'] = this.getDecimalAmount(net_amount);
      total['net_payble'] = this.getDecimalAmount(net_payble);
      total['extraAmount'] = this.getDecimalAmount(extraAmount);
      if(field != null && field.field_name != null && field != ""){
        delete total[field.field_name]
      }
      templateValue = {};
      templateValue['total_amount'] = total;
      return templateValue;

  }

  update_invoice_total_on_custom_field(templateValue:any,lims_segment: any, field: any){
    let total =templateValue['total_amount'];
    let	surcharge	=total['surcharge'];
    let	gross_amount	=total['gross_amount'];
    let	discount_percent	=total['discount_percent'];
    let	discount_amount=	total['discount_amount'];
    let	taxable_amount=	total['taxable_amount'];
    let	net_amount	=total['net_amount'];

 if(gross_amount){
  switch(field.field_name){
    case 'discount_percent':
          if(discount_percent!=0){
            discount_amount = gross_amount*discount_percent/100;
          }else{
          discount_amount = 0;
          }
    break;
    case 'surcharge':
    if(!surcharge){
       surcharge = 0;
    }
break;
    case 'discount_amount':
          if(discount_amount){
             discount_percent = discount_amount*100/gross_amount;
          }else{
            discount_percent=0;
          }
    break;
 }
}else{

  discount_percent=0;
  discount_amount=0;
}

  net_amount =gross_amount-discount_amount;
  taxable_amount = gross_amount-discount_amount+surcharge;
  templateValue = this.update_invoice_totatl(templateValue,gross_amount,discount_amount,discount_percent,net_amount,surcharge,taxable_amount,field);

  return templateValue;
 }



 populateParameterAmount(data:any,net_amount:number,discount_percent:number,discount_amount:number,quantity:number,gross_amount:number){
  data['net_amount'] = this.getDecimalAmount(net_amount);
  if(data['total_injection'] && data['total_injection'] > 0){
    data['per_sample_net_rate'] =   this.getDecimalAmount(data['net_amount'] / data['total_injection']);
    data["offer_rate"] = data["per_sample_net_rate"];
  }
  else if(data['qty']>0){
    data['per_sample_net_rate'] =   this.getDecimalAmount(data['net_amount'] / data['qty']);
    data["offer_rate"] = data["per_sample_net_rate"];
  }else{
    data['per_sample_net_rate'] =0;
  }

  data['discount_percent'] = this.getDecimalAmount(discount_percent);
  data['discount_amount'] = this.getDecimalAmount(+discount_amount);
  data['qty'] = quantity;
  data['total'] = this.getDecimalAmount(gross_amount);
  data['quotation_effective_rate'] =  this.getDecimalAmount(gross_amount);

}

setValueInVields(templateForm: UntypedFormGroup, field: any) {
  field.forEach((element: any) => {
    if(templateForm.controls[element.field]!==undefined){
      if(typeof(element.value) == 'string'){
        templateForm.controls[element.field].setValue(element.value);
      }
      else{
        templateForm.controls[element.field].setValue(this.getDecimalAmount(element.value));
      }
    }
  });
  return templateForm;
}

create_professional_email(templateForm: UntypedFormGroup){
  let templateValue = templateForm.getRawValue();
  let name = templateValue.name;
  let prof_email = "";
  let strt = name.substring(0, 2);
  let last = name.slice(-2);
  prof_email = strt+last+"@gmail.com";
  const fieldWithValue = [
    { field: 'prof_email', value: prof_email },
  ]

  this.setValueInVields(templateForm, fieldWithValue);
}
autopopulateFields(templateForm:any){
  let templateValue = templateForm.getRawValue();
  let product = templateValue.product.name;
  const fieldWithValue = [
    { field: 'sample_name', value: product },
  ]

  this.setValueInVields(templateForm, fieldWithValue);
}


/**
 * start point for subsequet calculation for quotation
 */

populateParameterAmountWithSubsequent(data:any,net_amount:number,discount_percent:number,discount_amount:number,quantity:number,gross_amount:number,subsequent_discount_amount?:number,subsequent_discount_percent?:number){
  data['net_amount'] = this.getDecimalAmount(net_amount);
 if(data['qty']>0){
    data['per_sample_net_rate'] =   this.getDecimalAmount(data['net_amount'] / data['qty']);
  }else{
    data['per_sample_net_rate'] =0;
  }

  data['discount_percent'] = this.getDecimalAmount(discount_percent);
  data['discount_amount'] = this.getDecimalAmount(+discount_amount);
  if(subsequent_discount_amount || subsequent_discount_amount == 0){
    data["subsequent_discount_amount"] = this.getDecimalAmount(subsequent_discount_amount);
  }
  if(subsequent_discount_percent || subsequent_discount_percent == 0){
    data["subsequent_discount_percent"] = this.getDecimalAmount(subsequent_discount_percent);
  }
  data['qty'] = this.getDecimalAmount(quantity);
  data['total'] = this.getDecimalAmount(gross_amount);
  data['quotation_effective_rate'] =  this.getDecimalAmount(gross_amount);
  data['offer_rate'] =  this.getDecimalAmount(data['offer_rate']);
  data['subsequent_offer_rate'] =  this.getDecimalAmount(data['subsequent_offer_rate']);
}

calculateQuotationParameterAmountForLimsWithSubsequent(data:any, fieldName:any) {
    let quantity = 0;
    let discount_percent:any = 0;
    let net_amount:any = 0;
    let incoming_field = fieldName;
    let sale_rate = data['sale_rate'];
    let gross_amount = 0;
    let effectiveTotal = 0;
    let dis_amt:any = 0;
    let subsequent_discount_amount:any=0;
    let subsequent_discount_percent:any=0;
    let totalDiscountAmount:any=0;
    let slabRatesArray:any = [];
    let pricingType = data.pricingType != undefined && data.pricingType != '' ? data.pricingType : '';
    quantity = data.qty;
    if (!this.coreFunctionService.isNotBlank(quantity)) {
      quantity = 0;
    }
    if(quantity > 0){
      if(data.no_of_injection2 && data.no_of_injection2 > 0 && quantity > 1){
        gross_amount = ((quantity - 1) * data.no_of_injection2) + sale_rate;
      }else{
        gross_amount = quantity * sale_rate;
      }
    }

    switch (incoming_field) {

      case "qty":
        if(pricingType == 'Parameter Wise Rate'){
          if(sale_rate && sale_rate > 0){
            gross_amount = quantity * sale_rate;
            effectiveTotal = quantity * data.offer_rate;
          }
          dis_amt = gross_amount - effectiveTotal;
          if (gross_amount > 0) {
            discount_percent = this.getDecimalAmount(100 * dis_amt / gross_amount);
          } else {
            discount_percent = 0;
          }
        }else if(pricingType == 'Column Wise Rate'){
          if(quantity > 1){
            gross_amount = ((quantity - 1) * data.no_of_injection2) + sale_rate;
            effectiveTotal = ((quantity - 1) * data.subsequent_offer_rate) + data.offer_rate;
            dis_amt = sale_rate - data.offer_rate;
          }else{
            gross_amount = quantity * sale_rate;
            effectiveTotal = quantity * data.offer_rate;
            dis_amt = gross_amount - effectiveTotal;
          }
          if (sale_rate > 0) {
            discount_percent = this.getDecimalAmount(100 * dis_amt / sale_rate);
          } else {
            discount_percent = 0;
            dis_amt = 0;
          }
          let subseqGrossAmount = 0;
          let subseqEffectiveAmount = 0;
          if(quantity > 1){
            subseqGrossAmount = ((quantity - 1) * data.no_of_injection2);
            subseqEffectiveAmount = ((quantity - 1) * data.subsequent_offer_rate);
          }else{
            subseqGrossAmount = (quantity * data.no_of_injection2);
            subseqEffectiveAmount = (quantity * data.subsequent_offer_rate);
          }        
          if(subseqGrossAmount > 0){
            subsequent_discount_amount = subseqGrossAmount - subseqEffectiveAmount;
            subsequent_discount_percent = this.getDecimalAmount(100 * subsequent_discount_amount / subseqGrossAmount);
          }else{
            subsequent_discount_amount = 0;
            subsequent_discount_percent = 0;
          }
        }else if(pricingType == 'Slab Wise Rate'){
          sale_rate = this.getSlabWiseSaleRate(data);
          if(sale_rate && sale_rate > 0){
            gross_amount = quantity * sale_rate;
            effectiveTotal = quantity * data.offer_rate;
          }
          dis_amt = gross_amount - effectiveTotal;
          if (gross_amount > 0) {
            discount_percent = this.getDecimalAmount(100 * dis_amt / gross_amount);
          } else {
            discount_percent = 0;
          }
        }
        net_amount = effectiveTotal;
        this.populateParameterAmountWithSubsequent(data, net_amount, discount_percent, dis_amt, quantity, gross_amount,subsequent_discount_amount,subsequent_discount_percent)
        break;

      case "discount_percent":
      case "subsequent_discount_percent":

        if(pricingType == 'Parameter Wise Rate'){
          if(sale_rate && sale_rate > 0){
            gross_amount = quantity * sale_rate;
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = quantity * sale_rate;
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
          }else{
            discount_percent = 0;
            dis_amt = 0;
          }
        }else if(pricingType == 'Column Wise Rate'){
          if(sale_rate && sale_rate > 0){
            if(quantity > 1){
              gross_amount = ((quantity - 1) * data.no_of_injection2) + sale_rate;
            }else{
              gross_amount = quantity * sale_rate;
            }
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = 0;
            if(quantity > 1){
              effectiveGrossAmount = sale_rate;
            }else{
              effectiveGrossAmount = data.sale_rate * quantity;
            }
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            if(quantity > 1){
              data['offer_rate'] = (effectiveGrossAmount - dis_amt);
            }else{
              data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
            }
          }else{
            discount_percent = 0;
            dis_amt = 0;
          }
          subsequent_discount_percent = data.subsequent_discount_percent;
          if (!this.coreFunctionService.isNotBlank(subsequent_discount_percent)) {
            subsequent_discount_percent = 0;
          }
          let subsequentGrossAmount = 0;
          if(quantity > 1){
            subsequentGrossAmount = data.no_of_injection2 * (quantity - 1);
          }else{
            subsequentGrossAmount = data.no_of_injection2;
          }
          subsequent_discount_amount = this.getDecimalAmount(((+subsequentGrossAmount) * (+subsequent_discount_percent)) / 100);
          if(quantity > 1){
            data['subsequent_offer_rate'] = (subsequentGrossAmount - subsequent_discount_amount) / (quantity-1);
          }else{
            data['subsequent_offer_rate'] = (subsequentGrossAmount - subsequent_discount_amount);
          }
        }else if(pricingType == 'Slab Wise Rate'){
          sale_rate = this.getSlabWiseSaleRate(data);
          if(sale_rate && sale_rate > 0){
            gross_amount = quantity * sale_rate;
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = quantity * sale_rate;
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
          }else{
            discount_percent = 0;
            dis_amt = 0;
          }
        }
        if(quantity > 1){
          totalDiscountAmount = subsequent_discount_amount + dis_amt;
        }else{
          totalDiscountAmount = dis_amt;
        }
        net_amount = this.getDecimalAmount((+gross_amount) - totalDiscountAmount);
        this.populateParameterAmountWithSubsequent(data, net_amount, discount_percent, dis_amt, quantity, gross_amount,subsequent_discount_amount,subsequent_discount_percent);
        break;

      case "unit_price":
        if(pricingType == 'Parameter Wise Rate'){
          if(data.sale_rate && data.sale_rate > 0){
            gross_amount = quantity * sale_rate;
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = data.sale_rate * quantity;
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            let offerRate = data.sale_rate - (dis_amt / quantity);
            data['offer_rate'] = offerRate;
          }else{
            dis_amt = 0;
            discount_percent = 0;
            data['offer_rate'] = 0;
          }
        }else if(pricingType == 'Column Wise Rate'){
          if(data.sale_rate && data.sale_rate > 0){
            if(quantity > 1){
              gross_amount = ((quantity - 1) * data.no_of_injection2) + sale_rate;
            }else{
              gross_amount = quantity * sale_rate;
            }
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = 0;
            if(quantity > 1){
              effectiveGrossAmount = data.sale_rate;
            }else{
              effectiveGrossAmount = data.sale_rate * quantity;
            }
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            let offerRate = data.sale_rate - dis_amt;
            data['offer_rate'] = offerRate;
          }else{
            dis_amt = 0;
            discount_percent = 0;
            data['offer_rate'] = 0;
          }          
          subsequent_discount_percent = data.subsequent_discount_percent;
          if (!this.coreFunctionService.isNotBlank(subsequent_discount_percent)) {
            subsequent_discount_percent = 0;
          }
          let subsequentGrossAmount = 0;
          if(quantity > 1){
            subsequentGrossAmount = data.no_of_injection2 * (quantity - 1);
          }else{
            subsequentGrossAmount = data.no_of_injection2;
          }
          subsequent_discount_amount = this.getDecimalAmount(((+subsequentGrossAmount) * (+subsequent_discount_percent)) / 100);
          let offerRate = 0;
          if(quantity > 1){
            offerRate = data.no_of_injection2 - (subsequent_discount_amount / (quantity - 1));
          }else{
            offerRate = data.no_of_injection2 - subsequent_discount_amount;
          }
          data['subsequent_offer_rate'] = offerRate;          
        }else if(pricingType == 'Slab Wise Rate'){
          sale_rate = this.getSlabWiseSaleRate(data);
          if(data.sale_rate && data.sale_rate > 0){
            gross_amount = quantity * sale_rate;
            discount_percent = data.discount_percent;
            if (!this.coreFunctionService.isNotBlank(discount_percent)) {
              discount_percent = 0;
            }
            let effectiveGrossAmount = data.sale_rate * quantity;
            dis_amt = this.getDecimalAmount(((+effectiveGrossAmount) * (+discount_percent)) / 100);
            let offerRate = data.sale_rate - (dis_amt / quantity);
            data['offer_rate'] = offerRate;
          }else{
            dis_amt = 0;
            discount_percent = 0;
            data['offer_rate'] = 0;
          }
        }
        if(quantity > 1){
          totalDiscountAmount = dis_amt + subsequent_discount_amount;
        }else{
          totalDiscountAmount = dis_amt;
        }
        net_amount = this.getDecimalAmount((+gross_amount) - totalDiscountAmount);
        this.populateParameterAmountWithSubsequent(data, net_amount, discount_percent, dis_amt, quantity, gross_amount,subsequent_discount_amount,subsequent_discount_percent);
        break;

      case "offer_rate":
      case "subsequent_offer_rate":
        let offer_rate = 0;
        if(incoming_field == "subsequent_offer_rate"){
          offer_rate = this.getDecimalAmount(data.subsequent_offer_rate);
        }else{
          offer_rate = this.getDecimalAmount(data.offer_rate);
        }
        if (!this.coreFunctionService.isNotBlank(offer_rate)) {
          offer_rate = 0;
        }
        if (offer_rate) {
          if(pricingType == 'Parameter Wise Rate'){
            let effectiveGrossAmount = 0;
            if(sale_rate && sale_rate > 0){
              effectiveTotal = data.offer_rate * quantity;
              effectiveGrossAmount = sale_rate * quantity;
              dis_amt = effectiveGrossAmount - (data.offer_rate * quantity);
            }else{
              data["offer_rate"] = 0;
            }
            if (effectiveGrossAmount > 0) {
              discount_percent = this.getDecimalAmount(100 * dis_amt / effectiveGrossAmount);
            } else {
              discount_percent = 0;
            }
          }else if(pricingType == 'Column Wise Rate'){
            if(quantity > 1){
              effectiveTotal = ((quantity - 1) * data.subsequent_offer_rate) + data.offer_rate;
            }else{
              effectiveTotal = data.offer_rate * quantity;
            }
            let effectiveGrossAmount = 0;
            if(sale_rate && sale_rate > 0){
              effectiveGrossAmount = sale_rate;
              dis_amt = effectiveGrossAmount - data.offer_rate;
            }else{
              data["offer_rate"] = 0;
            }
            if (effectiveGrossAmount > 0) {
              discount_percent = this.getDecimalAmount(100 * dis_amt / effectiveGrossAmount);
            } else {
              discount_percent = 0;
            }
            let subsequentGrossAmount = 0;
            if(data.no_of_injection2 && data.no_of_injection2 > 0){
              if(quantity > 1){
                subsequentGrossAmount = this.getDecimalAmount(gross_amount - effectiveGrossAmount);
                subsequent_discount_amount = subsequentGrossAmount - ( effectiveTotal - data.offer_rate);
              }else{
                subsequentGrossAmount = data.no_of_injection2;
                subsequent_discount_amount = this.getDecimalAmount(subsequentGrossAmount - data.subsequent_offer_rate);
              }
            }else{
              data["subsequent_offer_rate"] = 0;
            }
            if(subsequentGrossAmount > 0){
              subsequent_discount_percent = this.getDecimalAmount(100 * subsequent_discount_amount / subsequentGrossAmount);
            }else{
              subsequent_discount_percent = 0;
            }
          }else if(pricingType == 'Slab Wise Rate'){
            sale_rate = this.getSlabWiseSaleRate(data);
            let effectiveGrossAmount = 0;
            if(sale_rate && sale_rate > 0){
              effectiveTotal = data.offer_rate * quantity;
              effectiveGrossAmount = sale_rate * quantity;
              dis_amt = effectiveGrossAmount - (data.offer_rate * quantity);
            }else{
              data["offer_rate"] = 0;
            }
            if (effectiveGrossAmount > 0) {
              discount_percent = this.getDecimalAmount(100 * dis_amt / effectiveGrossAmount);
            } else {
              discount_percent = 0;
            }
          }
          net_amount = gross_amount - (gross_amount - effectiveTotal);
          this.populateParameterAmountWithSubsequent(data, net_amount, discount_percent, dis_amt, quantity, gross_amount,subsequent_discount_amount,subsequent_discount_percent);
        }else{
          if(incoming_field == "subsequent_offer_rate"){
            data["subsequent_offer_rate"] = offer_rate;
          }else{
            data["offer_rate"] = offer_rate;
          }
        }
        break;

      case "discount_amount":
      case "subsequent_discount_amount":
        if(incoming_field == 'discount_amount'){
          if(pricingType == 'Parameter Wise Rate'){
            if(sale_rate && sale_rate > 0){
              dis_amt = data.discount_amount;
              if (!this.coreFunctionService.isNotBlank(dis_amt)) {
                dis_amt = 0;
              }
              let effectiveGrossAmount = quantity * sale_rate;
              discount_percent = this.getDecimalAmount(((+dis_amt) * 100) / (+effectiveGrossAmount));
              data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }else{
              discount_percent = 0;
              dis_amt = 0;
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }
          }else if(pricingType == 'Column Wise Rate'){
            if(sale_rate && sale_rate > 0){
              dis_amt = data.discount_amount;
              if (!this.coreFunctionService.isNotBlank(dis_amt)) {
                dis_amt = 0;
              }
              let effectiveGrossAmount = 0;
              if(quantity > 1){
                effectiveGrossAmount = sale_rate;
              }else{
                effectiveGrossAmount = quantity * sale_rate;
              }
              discount_percent = this.getDecimalAmount(((+dis_amt) * 100) / (+effectiveGrossAmount));
              if(quantity > 1){
                data['offer_rate'] = (effectiveGrossAmount - dis_amt);
              }else{
                data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
              }
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }else{
              discount_percent = 0;
              dis_amt = 0;
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }
          }else if(pricingType == 'Slab Wise Rate'){
            sale_rate = this.getSlabWiseSaleRate(data);
            if(sale_rate && sale_rate > 0){
              dis_amt = data.discount_amount;
              if (!this.coreFunctionService.isNotBlank(dis_amt)) {
                dis_amt = 0;
              }
              let effectiveGrossAmount = quantity * sale_rate;
              discount_percent = this.getDecimalAmount(((+dis_amt) * 100) / (+effectiveGrossAmount));
              data['offer_rate'] = (effectiveGrossAmount - dis_amt) / quantity;
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }else{
              discount_percent = 0;
              dis_amt = 0;
              subsequent_discount_amount = data.subsequent_discount_amount;
              subsequent_discount_percent = data.subsequent_discount_percent;
            }
          }
        }else{
          if(pricingType == 'Column Wise Rate'){
            if(data.no_of_injection2 && data.no_of_injection2 > 0){
              subsequent_discount_amount = this.getDecimalAmount(data.subsequent_discount_amount);
              if (!this.coreFunctionService.isNotBlank(subsequent_discount_amount)) {
                subsequent_discount_amount = 0;
              }
              let subsequentGrossAmount = 0;
              if(quantity > 1){
                subsequentGrossAmount = data.no_of_injection2 * (quantity -1);
              }else{
                subsequentGrossAmount = data.no_of_injection2;
              }
              subsequent_discount_percent = this.getDecimalAmount(((+subsequent_discount_amount) * 100) / (+subsequentGrossAmount));
              if(quantity > 1){
                data['subsequent_offer_rate'] = (subsequentGrossAmount - subsequent_discount_amount) / (quantity -1);
              }else{
                data['subsequent_offer_rate'] = (subsequentGrossAmount - subsequent_discount_amount);
              }
              discount_percent = data.discount_percent;
              dis_amt = data.discount_amount;
            }else{
              subsequent_discount_amount = 0;
              subsequent_discount_percent = 0;
              discount_percent = data.discount_percent;
              dis_amt = data.discount_amount;
            }
          }
        }
        if(quantity > 1){
          totalDiscountAmount = subsequent_discount_amount + dis_amt;
        }else{
          totalDiscountAmount = dis_amt;
        }
        net_amount = this.getDecimalAmount((+gross_amount) - totalDiscountAmount);
        this.populateParameterAmountWithSubsequent(data, net_amount, discount_percent, dis_amt, quantity, gross_amount,subsequent_discount_amount,subsequent_discount_percent);
        break;
    }
}

private getSlabWiseSaleRate(data: any) {
  let sale_rate:any = 0;
  if (data.slabRateParamCount > 0 && data.slabRates.length > 0) {
    data.slabRates.forEach((slabRate: any) => {
      if (slabRate != '' && slabRate.from >= data.slabRateParamCount && slabRate.to <= data.slabRateParamCount) {
        sale_rate = slabRate.rate;
      }
    });
  }
  return sale_rate;
}

calculateQuotationParameterAmountForAutomotiveLimsWithSubsequent(data:any, fieldName:any) {
    let quantity = 0;
    let discount_percent = 0;
    let cost_rate = 0;
    let net_amount:any = 0;
    let param_quantom = 0;
    let Base_quotation_rate = 0;
    let incoming_field = fieldName;

    let gross_amount = 0;
    let dis_amt = 0;
    switch (incoming_field) {
      case "parameter_quantum":
        let parameterQuantum = data.parameter_quantum;
        if (!this.coreFunctionService.isNotBlank(parameterQuantum)) {
          parameterQuantum = 0;
        }
        data['quantum_rate'] = (+data.quotation_rate) * (+parameterQuantum);
        data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
        net_amount = +data.quotation_effective_rate
        if (data.discount_percent) {
          let discount = ((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
          data['discount_amount'] = discount;
          net_amount = (+data.quotation_effective_rate) - discount;
        }
        data['net_amount'] = net_amount

        break;
      case "qty":
        let quantity = data.qty;
        if (!this.coreFunctionService.isNotBlank(quantity)) {
          quantity = 0;
        }

        data['quotation_effective_rate'] = (+quantity) * (+data.quantum_rate);
        if (data.discount_percent) {
          let discount = this.getDecimalAmount((+data.quotation_effective_rate) * (+data.discount_percent)) / 100;
          data['discount_amount'] = discount;
        }
        net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - data['discount_amount']);
        data['net_amount'] = net_amount
        data['total'] = +data.quotation_effective_rate;
        data['qty'] = data.qty

        break;
      case "discount_percent":
        let discount_per = data.discount_percent;
        if (!this.coreFunctionService.isNotBlank(discount_per)) {
          discount_per = 0;
        }
        data['quotation_effective_rate'] = (+data.qty) * (+data.quantum_rate);
        net_amount = +data.quotation_effective_rate
        let discount = this.getDecimalAmount(((+data.quotation_effective_rate) * (+discount_per)) / 100);
        data['discount_amount'] = discount;
        net_amount = this.getDecimalAmount((+data.quotation_effective_rate) - discount);
        data['net_amount'] = net_amount
        data['total'] = +data.quotation_effective_rate;
        data['qty'] = data.qty;
        data['discount_percent'] = +discount_per;

        break;

      case "discount_amount":
        let discount_amt = data.discount_amount;
        if (!this.coreFunctionService.isNotBlank(discount_amt)) {
          discount_amt = 0;
        }

        net_amount = (+data.quotation_effective_rate) - (+discount_amt);
        let discount_perc = this.getDecimalAmount(((+discount_amt) * 100) / (+data.quotation_effective_rate));
        data['net_amount'] = net_amount;
        data['discount_percent'] = discount_perc;
        data['discount_amount'] = +data['discount_amount'];

        break;
      default:

    }
    if (data['qty'] > 0) {
      data['per_sample_net_rate'] = this.getDecimalAmount(data['net_amount'] / data['qty']);
    } else {
      data['per_sample_net_rate'] = 0;
    }
    this.sanitizeParameterAmount(data);
  }
calculateParameterLimsSegmentWiseForSubsequent(lims_segment: any, data: any, fieldName: string) {
  switch (lims_segment) {
    case 'standard':
      this.calculateQuotationParameterAmountForLimsWithSubsequent(data, fieldName)
      break;
    case 'automotive':
      this.calculateQuotationParameterAmountForAutomotiveLimsWithSubsequent(data, fieldName)
      break
  }

}

calculate_quotation_with_subsequent(templateValue:any, lims_segment:any, field: any) {
  var total = 0;
  let discount_percent = 0;
  let net_amount = 0;
  let sampling_amount = 0;
  let final_amount = 0;
  let discount_amount = 0;
  let quotation_param_methods = [];
  let unit_price:any = 0;
  let paramArray:any = [];
  let gross_amount = 0;
  let field_name = field.field_name;
  let qty = 0;
  let product_wise_pricing = templateValue['product_wise_pricing'];
  let current_disount = 0;
  if (this.coreFunctionService.isNotBlank(templateValue['discount_percent'])) {
    current_disount = templateValue['discount_percent'];
  }

  if (this.coreFunctionService.isNotBlank(templateValue.qty)) {
    qty = templateValue.qty;
  }

  if (templateValue['quotation_param_methods'] != '' && templateValue['quotation_param_methods'].length > 0) {
    let slabRateParamCount:number=0;
    templateValue['quotation_param_methods'].forEach((element:any) => {
      if(element.pricingType != undefined && element.pricingType != ''){
        if(element.pricingType == 'Slab Wise Rate'){
          slabRateParamCount++;
          element.slabRateParamCount = slabRateParamCount;
        }else{
          element.slabRateParamCount = 0;
        }      
        let data = { ...element };
        paramArray.push(data);
      }  
    });
    //For Slab Wise Rate
    let parameterIndex:number=0;
    paramArray.forEach((data:any) => {
      if(data.pricingType == 'Slab Wise Rate'){
        if(parameterIndex == 0){
          data.slabRateParamCount = slabRateParamCount;
          parameterIndex++;
        }else{
          data.slabRateParamCount = 0;
        }
      }
    });
  }
  if (templateValue['sampling_charge'] && templateValue['sampling_charge'] != null) {
    sampling_amount = templateValue['sampling_charge'];
  }
  // if(gross_amount>0){
  if (paramArray.length > 0) {
    switch (field_name) {
      case 'parameter_array':
        unit_price = 0;
        if (this.coreFunctionService.isNotBlank(templateValue.unit_price)) {
          unit_price = templateValue.unit_price;
        }
        if (product_wise_pricing) {
          net_amount = qty * unit_price;
          paramArray.forEach((data:any) => {
            this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "qty");
            gross_amount = gross_amount + data['total'];
          })
          discount_amount = gross_amount - net_amount;
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          paramArray.forEach((data:any) => {
            data.discount_percent = this.getDecimalAmount(+discount_percent);
            this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "discount_percent");
          })

        } else {
          if (paramArray.length > 0) {
            discount_amount = 0;
            net_amount = 0;
            total = 0;
            gross_amount = 0;
            if (this.coreFunctionService.isNotBlank(templateValue.qty)) {
              qty = templateValue.qty;
            }
            paramArray.forEach((data:any) => {
              if (lims_segment == 'standard') {
                data['qty'] = qty;
                this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, 'qty');
              }
              gross_amount = gross_amount + data['total'];
              net_amount = net_amount + data['net_amount'];
              discount_amount = discount_amount + data['discount_amount'];
            });
          }

        }
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
        templateValue['discount_amount'] = discount_amount;
        templateValue['net_amount'] = net_amount;
        templateValue['discount_percent'] = discount_percent;
        break;

      case 'discount_percent':
        discount_percent = templateValue[field_name];
        paramArray.forEach((data:any) => {
          data.discount_percent = this.getDecimalAmount(+discount_percent);
          data.subsequent_discount_percent = this.getDecimalAmount(+discount_percent);
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, field_name);
          gross_amount = gross_amount + data['total'];
        })
        discount_amount = gross_amount * discount_percent / 100;
        net_amount = gross_amount - discount_amount;
        templateValue['discount_amount'] = discount_amount;
        templateValue['net_amount'] = net_amount;
        templateValue['unit_price'] = net_amount / templateValue['qty'];
        break;

      case 'discount_amount':
        discount_amount = templateValue[field_name];
        paramArray.forEach((data:any) => {
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "qty");
          gross_amount = gross_amount + data['total'];
        })
        net_amount = gross_amount - discount_amount;
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty);
        paramArray.forEach((data:any) => {
          data.discount_percent = this.getDecimalAmount(+discount_percent);
          data.subsequent_discount_percent = this.getDecimalAmount(+discount_percent);
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "discount_percent");
        })

        templateValue['unit_price'] = net_amount / templateValue['qty'];
        templateValue['net_amount'] = net_amount;
        templateValue['discount_percent'] = discount_percent;
        break;


      case 'net_amount':
        discount_percent = 0;
        net_amount = templateValue[field_name];
        paramArray.forEach((data:any) => {
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "qty");
          gross_amount = gross_amount + data['total'];
        })


        discount_amount = gross_amount - net_amount;
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
        paramArray.forEach((data:any) => {
          data.discount_percent = this.getDecimalAmount(+discount_percent);
          data.subsequent_discount_percent = this.getDecimalAmount(+discount_percent);
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "discount_percent");
        })

        templateValue["discount_percent"] = discount_percent;
        templateValue["discount_amount"] = discount_amount;
        templateValue['unit_price'] = net_amount / templateValue['qty'];
        break;

      case 'unit_price':
        unit_price = 0;
        if (this.coreFunctionService.isNotBlank(templateValue.unit_price)) {
          unit_price = this.getDecimalAmount(templateValue.unit_price);
        }
        net_amount = qty * unit_price;

        paramArray.forEach((data:any) => {
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "qty");
          gross_amount = gross_amount + data['total'];
        })
        discount_amount = gross_amount - net_amount;
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
        paramArray.forEach((data:any) => {
          if(data.sale_rate && data.sale_rate > 0){
            data.discount_percent = this.getDecimalAmount(+discount_percent);
          }else{
            data.discount_percent = 0;
          }
          if(data.no_of_injection2 && data.no_of_injection2 > 0){
            data.subsequent_discount_percent = this.getDecimalAmount(+discount_percent);
          }else{
            data.subsequent_discount_percent = 0;
          }
          this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "unit_price");
        })
        templateValue['discount_amount'] = discount_amount;
        templateValue['net_amount'] = net_amount;
        templateValue['discount_percent'] = discount_percent;
        break;

      default:
        discount_amount = 0;
        net_amount = 0;
        if (paramArray.length > 0) {
          paramArray.forEach((data:any) => {
            data['qty'] = this.getDecimalAmount(qty);
            this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, field_name);
            gross_amount = gross_amount + data['total'];
            net_amount = net_amount + data['net_amount'];
            if(data['qty'] > 1){
              discount_amount = discount_amount + data['discount_amount'] + data['subsequent_discount_amount'];
            }else{
              discount_amount = discount_amount + data['discount_amount'];
            }
          });
        }
        if (product_wise_pricing) {
          unit_price = templateValue["unit_price"];
          net_amount = unit_price * qty;
          discount_amount = gross_amount - net_amount;
          discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
          if (paramArray.length > 0) {
            paramArray.forEach((data:any) => {
              data['discount_percent'] = discount_percent;
              data['subsequent_discount_percent'] = discount_percent;
              this.calculateParameterLimsSegmentWiseForSubsequent(lims_segment, data, "unit_price");
            });
          }
        }
        discount_percent = this.getDiscountPercentage(current_disount, discount_amount, gross_amount, qty)
        templateValue['discount_amount'] = discount_amount;
        templateValue['net_amount'] = net_amount;
        templateValue['discount_percent'] = discount_percent;

    }
    final_amount = net_amount + sampling_amount;
    if (templateValue['qty'] > 0) {
      unit_price = this.getDecimalAmount(net_amount / templateValue['qty']);
    } else {
      unit_price = templateValue["unit_price"];
    }

    templateValue['total'] = this.getDecimalAmount(gross_amount);
    templateValue['discount_amount'] = this.getDecimalAmount(discount_amount);
    templateValue['net_amount'] = this.getDecimalAmount(net_amount);
    templateValue['discount_percent'] = this.getDecimalAmount(discount_percent);
    templateValue['final_amount'] = this.getDecimalAmount(final_amount);
    templateValue['unit_price'] = this.getDecimalAmount(unit_price);
    if (paramArray.length > 0) {
      templateValue['quotation_param_methods'] = paramArray;
    }

  }

  

  return templateValue;

}

/**
 * End point for subsequet calculation for quotation
 */


}