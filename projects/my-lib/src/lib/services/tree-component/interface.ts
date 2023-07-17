/**
 * Node for to-do item
 */
 export class TodoItemNode {
    "children": TodoItemNode[];
    "item": string;
    "reference":any;
    "pId":string;
    "pIndex":string;
    "_id":string;
    "action":any;
  }
  
  /** Flat to-do item node with expandable and level information */
  export class TodoItemFlatNode {  
    "item": string;
    "level": number;
    "expandable": boolean;
    "reference":any;
    "type":string;
    "pId":string;
    "pIndex":string;
    "_id":string;
    "action":any;
  }
