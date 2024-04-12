import {OperatorKey, OperatorType} from "../../shared/enums/operator_type.enum";


export class Operator {
  fullName: string;
  shortName: string;
  name:string;
  types: OperatorType[];

  constructor(fullName: string, shortName: string,name:string,types: OperatorType[]) {
    this.fullName = fullName;
    this.shortName = shortName;
    this.name = name;
    this.types = types;
  }

  static readonly EQUAL = new Operator("Equal", "eq","EQUAL",[OperatorType.STRING,OperatorType.DATE,OperatorType.NUMBER]);
  static readonly CONTAINS = new Operator("Contains", "cnts","CONTAINS",[OperatorType.STRING,OperatorType.DATE,OperatorType.NUMBER]);
  static readonly NOT_EQUAL = new Operator("Not Equal", "neq","NOT_EQUAL",[OperatorType.STRING,OperatorType.DATE,OperatorType.NUMBER]);
  static readonly IN = new Operator("In", "in","IN",[OperatorType.STRING,OperatorType.DATE,OperatorType.NUMBER]);
  static readonly LESS_THAN = new Operator("Less Than", "lt","LESS_THAN",[OperatorType.DATE,OperatorType.NUMBER]);
  static readonly RANGE_BORDER_LESS_THAN_INCLUSIVE = new Operator("Less Than Equal", "lte","LESS_THAN",[OperatorType.DATE,OperatorType.NUMBER]);
  static readonly GREATER_THAN = new Operator("Greater Than", "gt","GREATER_THAN",[OperatorType.DATE,OperatorType.NUMBER]);
  static readonly RANGE_BORDER_GREATER_THAN_INCLUSIVE = new Operator("Greater Than Equal", "gte","RANGE_BORDER_GREATER_THAN_INCLUSIVE",[OperatorType.DATE,OperatorType.NUMBER]);
  static readonly NOT_CONTAINS_IGNORE_CASE = new Operator("Not Contains Ignore Case", "ncntsic","NOT_CONTAINS_IGNORE_CASE",[OperatorType.STRING,OperatorType.DATE]);
  static readonly ENDS_WITH = new Operator("Ends With", "edw","ENDS_WITH",[OperatorType.STRING]);
  static readonly ENDS_WITH_IGNORE_CASE = new Operator("Ends With Ignore Case", "edwic","ENDS_WITH_IGNORE_CASE",[OperatorType.STRING]);
  static readonly STARTS_WITH = new Operator("Starts With", "stw","STARTS_WITH",[OperatorType.STRING]);
  static readonly STARTS_WITH_IGNORE_CASE = new Operator("Starts With Ignore Case", "stwic","STARTS_WITH_IGNORE_CASE",[OperatorType.STRING]);
  static readonly NOT_CONTAINS = new Operator("Not Contains", "ncnts","NOT_CONTAINS",[OperatorType.STRING]);
  static readonly CONTAINS_IGNORE_CASE = new Operator("Contains Ignore Case", "cntsic","CONTAINS_IGNORE_CASE",[OperatorType.STRING]);




  static getAllFullNames(): string[] {
    return Object.values(Operator).filter(value => value instanceof Operator).map(operator => operator.fullName);
  }

  static getAllShortNames(): string[] {
    return Object.values(Operator).filter(value => value instanceof Operator).map(operator => operator.shortName);
  }
  static getAllNames(): string[] {
    return Object.values(Operator).filter(value => value instanceof Operator).map(operator => operator.name);
  }

  // static getEnumMap(): Map<string, string> {
  //   const enumMap = new Map<string, string>();
  //   Object.values(Operator)
  //     .filter(value => value instanceof Operator)
  //     .forEach(operator => enumMap.set(operator.fullName, operator.shortName));
  //   return enumMap;
  // }
  // static getByType(type: OperatorType): Operator[] {
  //   return Object.values(Operator)
  //     .filter((value) => value instanceof Operator && value.types.includes(type));
  // }

  // {"cntsic":"Contains Ignore Case",}

  // {"CONTAINS_IGNORE_CASE":"Contains Ignore Case"}

  static getOperators(type: OperatorType,name:string): Map<string, string> {
    // const enumMap = new Map<string, string>();
    const enumMap:any = {};
    Object.values(Operator)
      .filter(value => value instanceof Operator && (type === null || value.types.includes(type)))
      .forEach(operator => {
        let key = operator[name];
        enumMap[key] = operator.fullName
      });
    return enumMap;
  }
}
