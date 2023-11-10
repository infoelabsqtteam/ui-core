import { CheckIfService } from './../check-if/check-if.service';
import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { CommonFunctionService } from '../common-utils/common-function.service';
import {TodoItemNode} from './interface';

@Injectable({
  providedIn: 'root'
})
export class TreeComponentService {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor(
    private commonfunctionService:CommonFunctionService,
    private checkIfService:CheckIfService
  ) {
  }
  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: {[key: string]: any}, level: number,keys:any): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key,i) => {
      const value = obj[key];
      const pId:any = value['reference']['_id'];
      const node = new TodoItemNode();
      node.item = key;
      node.reference = value['reference'];
      node._id = pId;
      if(value['pId']){
        node.pId = value['pId'];
      }
      if(level == 0){
        let index = i+1;
        node.pIndex = ''+index;
      }else{
        node.pIndex = value.pIndex;
      }


      if (value != null) {
        let nextKey = keys[level];
        let next = value[nextKey];
        if(next == null){
          nextKey = keys[level + 1];
          next = value[nextKey];
        }
        if (next && typeof next === 'object') {
          Object.keys(next).forEach((childKey,i) => {
            next[childKey].pIndex = node.pIndex+'.'+(i+1);
            next[childKey].pId = pId;
          });
          node.children = this.buildFileTree(next, level + 1,keys);
        } else {
          node.item = key;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  convertParentNodeToChildNodeList(list:any,fields:any){
    let parentGroup:any = [];
    let childList:any = [];
    let previousIndex:number = -1;
    let resultList:any = [];
    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      const pIndex = node.pIndex;
      if(pIndex && pIndex != ''){
        const indexlist = pIndex.split('.');
        if(indexlist && indexlist.length == 3){
          if(previousIndex != -1){
            if(previousIndex == indexlist.length){
              if(parentGroup.length == 3){
                parentGroup.splice((parentGroup.length-1),1);
              }
              childList.push(node);
            }else{
              if(parentGroup.length > 0 && childList.length > 0){
                this.addChildParentList(parentGroup,childList,fields,resultList);
                childList = [];
                parentGroup.splice((parentGroup.length-1),1);
                parentGroup.push(node);
                previousIndex = indexlist.length;
              }
            }
          }else{
            parentGroup.push(node);
            childList.push(node);
          }
          previousIndex = indexlist.length;
        }else if(indexlist && indexlist.length == 4){
          if(previousIndex == 3){
            childList = [];
            childList.push(node);
          }else{
            childList.push(node);
          }
          previousIndex = indexlist.length;
        }else if(indexlist && indexlist.length == 2){
          if(parentGroup.length > 0 && childList.length > 0){
            this.addChildParentList(parentGroup,childList,fields,resultList);
            childList = [];
            const firstParent = [];
            firstParent.push(parentGroup[0]);
            parentGroup = [];
            parentGroup.push(firstParent[0]);
            parentGroup.push(node);
          }else{
            parentGroup.push(node);
          }
          previousIndex = -1;
        }else{
          if(childList.length > 0){
            this.addChildParentList(parentGroup,childList,fields,resultList);
            childList = [];
          }
          parentGroup = [];
          parentGroup.push(node);
          previousIndex = -1;
        }
        if(list.length == i+1){
          if(parentGroup.length > 0 && childList.length > 0){
            this.addChildParentList(parentGroup,childList,fields,resultList);
            childList = [];
            parentGroup = [];
          }
        }
      }

    }
    return resultList;
  }
  addChildParentList(parentList:any,ChildList:any,fields:any,result:any){
    ChildList.forEach((child:any) => {
      let obj:any = {};
      if(parentList.length == 2){
        fields.forEach((field:any,i:number) => {
          if(i == 2){
            obj[field.field_name] = null;
          }else if(i == 3){
            obj[field.field_name] = child.reference;
          }else{
            obj[field.field_name] = parentList[i].reference;
          }
        });
      }else if(parentList.length == 3){
        fields.forEach((field:any,i:number) => {
          if(i == 3){
            obj[field.field_name] = child.reference;
          }else{
            obj[field.field_name] = parentList[i].reference;
          }
        });
      }
      result.push(obj);
    });
    // if(list && fields && list.length == fields.length){
    //   checkSubMenu = false;
    // }
    // let object = {};
    // for (let i = 0; i < list.length; i++) {
    //   const element = list[i];
    //   let field = fields[i];
    //   let fieldName = field.field_name;
    //   if(i == 2){
    //     if(list && list.length == 3){

    //     }
    //   }else{
    //     object[fieldName] = element.reference;
    //   }
    //   if(list && list.length == (i+1)){
    //     result.push(object);
    //   }
    // }
  }

  //this function for get selected node tree
  getSelectedNodeWithParent(allNodes:any,selectedNodes:any,keys:any){
    let selectedNodesWithParent:any = [];
    if(allNodes && allNodes.length > 0 && selectedNodes && selectedNodes.length > 0){
      selectedNodes.forEach((selectNode:any) => {
        if(selectNode){
          if((keys.includes(selectNode.type) || selectNode.level == 0)&& selectNode.expandable){
            selectNode.allSelected = true;
          }else{
            selectNode.allSelected = false;
          }
          selectNode.select = true;
          let groupList:any = [];
          let check = this.checkIfService.checkDataAlreadyAddedInListOrNot({"field_name":'_id'},selectNode._id,groupList);
          if(!check.status){
            groupList.push(selectNode);
          }
          this.findChildToParentNode(allNodes,selectNode,groupList,selectedNodesWithParent);
        }
      });
    }
    return selectedNodesWithParent;
  }

  findChildToParentNode(allNodes:any,selectNode:any,groupList:any,selectedNodesWithParent:any){
    if(selectNode && selectNode.pId){
      let parentIndex = this.commonfunctionService.getIndexInArrayById(allNodes,selectNode.pId,'reference._id');
      if(parentIndex != -1){
        let parentNode = allNodes[parentIndex];
        let check = this.checkIfService.checkDataAlreadyAddedInListOrNot({"field_name":'_id'},parentNode._id,groupList);
        if(!check.status){
          groupList.push(parentNode);
        }
        this.findChildToParentNode(allNodes,parentNode,groupList,selectedNodesWithParent);
      }
    }else{
      let check = this.checkIfService.checkDataAlreadyAddedInListOrNot({"field_name":'_id'},selectNode._id,groupList);
      if(!check.status){
        groupList.push(selectNode);
      }
    }
    return this.modifyParentChild(selectedNodesWithParent,groupList);
  }
  modifyParentChild(selectedNodesWithParent:any,groupList:any){
    let sortedData = groupList.sort((a:any,b:any) =>  a.level - b.level);
    if(sortedData && sortedData.length > 0){
      sortedData.forEach((data:any) => {
        let check = this.checkIfService.checkDataAlreadyAddedInListOrNot({"field_name":'_id'},data._id,selectedNodesWithParent);
        if(check.status){
          let existDataIndex = this.commonfunctionService.getIndexInArrayById(selectedNodesWithParent,data._id);
          let object = selectedNodesWithParent[existDataIndex];
          if(object.pIndex != data.pIndex){
            check.status = false;
          }
        }
        if(!check.status){
          selectedNodesWithParent.push(data);
        }
      });
    }
    return selectedNodesWithParent;
  }
  modifySelectedDataWithParentId(selectedData:any){
    let modifyList=selectedData.sort((a:any,b:any) => a.pIndex.localeCompare(b.pIndex, undefined, { numeric:true }));
    //arr.sort( (a, b) => a.localeCompare(b, undefined, { numeric:true }) );
    return  modifyList;
  }

  //this function for get selected node tree

  //This function for convet list to tree map
  convertTreeToList(list:any,result:any) {
    if(list && list.length > 0){
      list.forEach((child:any) => {
        let childrenList = [];
        if(child && child.children && child.children != null){
          childrenList = JSON.parse(JSON.stringify(child.children));
        }
        delete child.children;
        result.push(child);
        if(childrenList && childrenList.length > 0){
          this.convertTreeToList(childrenList,result);
        }
      });
    }
    return result;
  }
  applyRelationships = (data:any) => {
    let levelStack:any = [], lastNode:any = null;
    return data.map((curr:any, index:number) => {
      const node = { ...curr, id: index + 1 };
      if (levelStack.length === 0) {
        levelStack.push({ level: node.level, parent: 0 });
      } else {
        const last = levelStack[levelStack.length - 1];
        if (node.level > last.level) {
          levelStack.push({ level: node.level, parent: lastNode.id });
        } else if (node.level < last.level) {
          const
            levelDiff = last.level - node.level - 1,
            lastIndex = levelStack.length - 1;
          levelStack.splice(lastIndex - levelDiff, lastIndex);
        }
      }
      node.parentId = levelStack[levelStack.length - 1].parent;
      lastNode = node;
      return node;
    });
  };

  listToTree = (arr = []) => {
     let indexMap = new Map();
     arr.forEach((node:any, index:number) => {
        indexMap.set(node.id, index)
        node.children = [];
     });
     return arr.reduce((res:any, node:any, index:number, all:any) => {
        if (node.parentId === 0) return [...res, node];
        all[indexMap.get(node.parentId)].children.push(node);
        return res;
     }, []);
  };

  treeToObject = (tree:any = [], result:any = {}) => {
    tree.forEach((child:any) => {
        let modifyObj:any = {};
        modifyObj['reference'] = child.reference;
        if(child.allSelected){
          modifyObj['reference']['allSelected'] = child.allSelected;
        }
        if(child.select){
          modifyObj['reference']['select'] = child.select;
        }
        if(child.level == 0){
          result[child.item] = modifyObj;
        }else if(child.expandable){
          if(!result[child.type]) result[child.type] = {}
          result[child.type][child.item] = modifyObj;
        }else{
          if(!result[child.type]) result[child.type] = {}
          result[child.type][child.item] = modifyObj;
        }
        if(child.children && child.children.length > 0){
          this.treeToObject(child.children, child.level == 0 ? result[child.item] : result[child.type][child.item]);
        }
    });
    return result;
  };
  buildTreeObject(arr = []) {
    let relationShip = this.applyRelationships(arr);
    let list = this.listToTree(relationShip);
    let tree = this.treeToObject(list);
    return tree;
  }
  //This function for convet list to tree map

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
  updateTreeViewData(responce:any,field:any,treeViewData:any){
    let result = {
      treeViewData:treeViewData
    }
    const fieldName = field.field_name;
    let keys = [];
    let fields = [];
    if(field && field.treeViewKeys){
      keys = field.treeViewKeys;
    }
    if(field && field.fields && field.fields.length > 0){
      fields = field.fields;
    }
    const treeData = this.buildFileTree(responce,0,keys);
    //console.log(treeData);
    let selectedNodeList = this.convertTreeToList(JSON.parse(JSON.stringify(treeData)),[]);
    let childList = [];
    if(fields && fields.length > 0){
      childList = this.convertParentNodeToChildNodeList(selectedNodeList,fields);
    }
    //console.log(selectedNodeList);
    //console.log(childList);
    //this.dataSource[fieldName].data = treeData;
    result.treeViewData[fieldName] = childList;
    return result;
  }

}
