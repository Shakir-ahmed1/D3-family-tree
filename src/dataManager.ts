import { actionTypes, CustomFlatData, DrawableNode, FamilyNode, Parent, temporaryData } from "./node.interface";

let id = -1;
let callBackCounter = 0;
function assignId() {
  id = id - 1
  return id;
}

export class NodeData {
  setData(fetchedNodesArray: any) {
    this.data = fetchedNodesArray
  }
  constructor() {
  }

  private data: CustomFlatData = {
    familyNodes: [],
    parents: []
  }

  /**
   * returns the node with the given id if found
   * @param id nodes id
   * @returns the found node
   */
  getNode(id: number): FamilyNode {
    const foundNode = this.data.familyNodes.find(item => id === item.id)
    if (!foundNode) throw Error(`node with id ${id} was not found`)
    return foundNode;
  }
  /**
   * returns the parentRealtionship with the given id if found
   * @param id parentRelationship id
   * @returns 
   */
  getParentRelationship(id: number): Parent {
    const foundParentship = this.data.parents.find(item => id === item.id)
    if (!foundParentship) throw Error(`parentship with id ${id} was not found`)
    return foundParentship;
  }


  /**
   * given node it returns all spouse ids of the node
   * @param familyNode the node searching for it's spouse
   * @returns list of spouse ids
   */
  getSpouses(familyNode: FamilyNode): number[] {
    const foundParentHood = this.data.parents.filter(item => {
      if (familyNode.gender === "MALE" && item.maleNode) {
        return item.maleNode.id === familyNode.id
      } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
        return item.femaleNode.id === familyNode.id
      }
    })
    const result = foundParentHood.map(item => {
      if (familyNode.gender === "MALE" && item.femaleNode) {
        return item.femaleNode.id
      } else if (familyNode.gender === "FEMALE" && item.maleNode) {
        return item.maleNode.id
      }
    }).filter((item): item is number => item !== undefined)
    // console.log('FoundSpouses ' + familyNode.id, result)
    return result

  }

  /**
   * given the single parent node it returns all his children that doesn't have the other parent
   * @param selfNode a single parent that might have children
   * @returns list of child nodes
   */
  getSingleParentedChildNodes(selfNode: FamilyNode): FamilyNode[] {
    const parentHoods = this.data.parents.filter(item => {
      if (selfNode.gender === "MALE" && item.maleNode?.id === selfNode.id && !item.femaleNode) {
        return true
      } else if (selfNode.gender === "FEMALE" && item.femaleNode?.id === selfNode.id && !item.maleNode) {
        return true
      } else {
        return false
      }
    }).map(item => item.id)
    const foundChildren = this.data.familyNodes.filter(item => {

      if (parentHoods.includes(item.parentRelationship?.id)) {
        return true
      } else {
        return false
      }
    })
    return foundChildren
  }

  /**
   * Returns all the children and their spouses as a children of the selfNode and spouseNode(if available) and arrange them by relevance
   * @param selfNodeId the node in question
   * @param spouseNodeId his spouse if he has
   * @returns returns all children and thier spouses as temporary storage
   */
  getChildrenByParents(selfNodeId: number, spouseNodeId: number | undefined): temporaryData[] {
    const selfNode = this.getNode(selfNodeId)
    let spouseNode;
    if (spouseNodeId) {
      spouseNode = this.getNode(spouseNodeId)
    } else {
      spouseNode = undefined;
    }
    if (!spouseNodeId) { // With no spouse
      const foundChildren = this.getSingleParentedChildNodes(selfNode)
      const allChildren: temporaryData[] = []
      let father: undefined | string, mother: undefined | string;
      let fatherId: undefined | number, motherId: undefined | number;
      if (selfNode.gender === 'MALE') {
        fatherId = selfNode.id;
        father = `${selfNode.id}`;
      } else {
        motherId = selfNode.id;
        mother = `${selfNode.id}`;
      }

      foundChildren.map(item => {
        const customChild: temporaryData = {
          id: item.id,
          uuid: `${item.id}`,
          father,
          mother,
          fatherId,
          motherId,
          type: 'child',
        }
        const foundSpousesIds = this.getSpouses(item)

        const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
          const foundSpouse = this.getNode(sp)
          const result: temporaryData = {
            id: foundSpouse.id,
            uuid: `${item.id}+${foundSpouse.id}`,
            type: 'spouse',
            target: item.id,
          }
          return result
        })

        if (item.gender === "MALE") {
          allChildren.push(customChild)
          allChildren.push(...foundSpouses)
        } else {
          allChildren.push(...foundSpouses)
          allChildren.push(customChild)

        }
      })
      return allChildren;
    } else {    // With spouse
      const parentHood = this.data.parents.find(item => {
        if (selfNode.gender === "MALE" && item.maleNode && item.maleNode.id === selfNode.id && item.femaleNode && spouseNode && item.femaleNode.id === spouseNode?.id) {
          return true
        } else if (selfNode.gender === "FEMALE" && item.femaleNode && item.femaleNode.id === selfNode.id && item.maleNode && spouseNode && item.maleNode.id === spouseNode?.id) {
          return true
        }
      })
      const allChildren: temporaryData[] = []
      let father: undefined | string, mother: undefined | string;
      let fatherId: undefined | number, motherId: undefined | number;
      if (parentHood) {
        if (selfNode.gender === 'MALE') {
          father = `${selfNode.id}`;
          mother = `${selfNode.id}+${spouseNode?.id}`
          fatherId = selfNode.id
          motherId = spouseNode?.id
        } else {
          mother = `${selfNode.id}`;
          father = `${selfNode.id}+${spouseNode?.id}`
          motherId = selfNode.id
          fatherId = spouseNode?.id
        }
      }
      const foundChildren = this.data.familyNodes.filter(item => {

        if (parentHood && item.parentRelationship?.id === parentHood?.id) {
          return true
        } else {
          return false
        }
      })
      foundChildren.map(item => {
        const customChild: temporaryData = {
          id: item.id,
          uuid: `${item.id}`,
          father,
          mother,
          fatherId,
          motherId,
          type: 'child',
        }
        const foundSpousesIds = this.getSpouses(item)

        const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
          const foundSpouse = this.getNode(sp)
          const result: temporaryData = {
            id: foundSpouse.id,
            uuid: `${item.id}+${foundSpouse.id}`,
            type: 'spouse',
            target: item.id,
          }
          return result
        })

        if (item.gender === "MALE") {
          allChildren.push(customChild)
          allChildren.push(...foundSpouses)
        } else {
          allChildren.push(...foundSpouses)
          allChildren.push(customChild)

        }
      })
      return allChildren;
    }

  }

  /**
   * traverses to find all descendants to build a hierarchial Data
   * @param familyNode the node being traversed to get descendants (is a "temporaryData")
   * @returns  a hierarchy data "DrawableNode"
   */
  customGetChildrenByParents(familyNode: temporaryData, customId: string): DrawableNode {
    if (familyNode.type === 'spouse') {
      const currentChildren: temporaryData[] = this.getChildrenByParents(familyNode.target as number, familyNode.id)
      const customChildren = currentChildren.map(item => {
        const customIdentifier = `${customId}+${item.id}`
        const spDrawable = this.customGetChildrenByParents(item, customIdentifier)
        return spDrawable;
      })
      const foundItem = this.getNode(familyNode.id)
      let mot, fat;
      if (foundItem.gender === 'MALE') {
        let temp = customId.split('+')
        temp.pop()
        fat = temp.join('+')
        temp.pop()
        mot = temp.join('+') + `+${familyNode.target}`
      } else {
        let temp = customId.split('+')
        temp.pop()
        mot = temp.join('+')
        temp.pop()
        fat = temp.join('+') + `+${familyNode.target}`
      }
      const customResponse: DrawableNode = {
        id: foundItem.id,
        uuid: customId,
        gender: foundItem.gender,
        name: foundItem.name,
        type: familyNode.type,
        children: customChildren,
        father: fat,
        mother: mot,
        fatherId: familyNode.fatherId,
        motherId: familyNode.motherId,
        target: familyNode.target
      }
      return customResponse
    } else if (familyNode.type === 'child') {
      const currentChildren: temporaryData[] = this.getChildrenByParents(familyNode.id, undefined)
      const customChildren = currentChildren.map(item => {
        // 6
        // 2  2, 1
        const customIdentifier = `${customId}+${item.id}`
        const spDrawable = this.customGetChildrenByParents(item, customIdentifier)
        return spDrawable;
      })
      const foundItem = this.getNode(familyNode.id)
      let mot, fat;
      if (foundItem.gender === 'MALE') {
        let temp = customId.split('+')
        temp.pop()
        fat = temp.join('+')
      } else {
        let temp = customId.split('+')
        temp.pop()
        mot = temp.join('+')
      }
      const customResponse: DrawableNode = {
        uuid: customId,
        id: foundItem.id,
        gender: foundItem.gender,
        name: foundItem.name,
        type: familyNode.type,
        children: customChildren,
        fatherId: familyNode.fatherId,
        motherId: familyNode.motherId,
        father: fat,
        mother: mot,
        target: familyNode.target

      }
      return customResponse

    } else {
      throw new Error('temporaryData can\'t have value called' + familyNode.type)
    }

  }

  /**
   * gets the parent nodes of the given node
   * @param startNodeId the starting node id 
   * @returns both/one parents of the give starting node as a list
   */
  getParents(startNodeId: number): FamilyNode[] {
    const foundNode = this.getNode(startNodeId);
    const parents = []
    if (foundNode.parentRelationship) {
      const foundParentship = this.getParentRelationship(foundNode.parentRelationship.id)
      if (foundParentship.maleNode) {
        const father = this.getNode(foundParentship.maleNode.id)
        parents.push(father)
      }
      if (foundParentship.femaleNode) {
        const mother = this.getNode(foundParentship.femaleNode.id)
        parents.push(mother)
      }
    }
    return parents;
  }

  /**
   * traverses the nodes to find all it's descendants
   * @param startNodeId the starting node for traversal
   * @returns returns all descendants of the node as a hierarchial data
   */
  customBuildDescendantsHiararchy(startNodeId: number): DrawableNode {
    const familyNode = this.getNode(startNodeId)

    const allChildren: temporaryData[] = []
    const customChild: temporaryData = {
      id: familyNode.id,
      uuid: `+${familyNode.id}`,
      type: 'child',
    }
    const foundSpousesIds = this.getSpouses(familyNode)
    const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
      const foundSpouse = this.getNode(sp)

      const result: temporaryData = {
        id: foundSpouse.id,
        uuid: `+${foundSpouse.id}`,
        type: 'spouse',
        target: familyNode.id,
      }
      return result
    })
    if (familyNode.gender === "MALE") {
      allChildren.push(customChild)
      allChildren.push(...foundSpouses)
    } else {
      allChildren.push(...foundSpouses)
      allChildren.push(customChild)

    }


    const customChildren = allChildren.map(item => {
      const spDrawable = this.customGetChildrenByParents(item, item.uuid)
      return spDrawable;
    })

    const resultedChildren: DrawableNode = {
      id: 0,
      uuid: '0',
      name: 'root',
      gender: 'MALE',
      type: 'root',
      children: customChildren
    }
    return resultedChildren;
  }

  /**
   * Traverses the nodes to find all it's ancestors
   * @param startNodeId the starting node for traversal
   * @param other the spouse of startNode
   * @returns returns all ancestors of the node as a hierarchial data
   */
  customBuildAncestorsHierarchy(startNodeId: number, other: number | undefined, caller: string): DrawableNode {
    const foundNode = this.getNode(startNodeId)
    // Create a map of all nodes by ID
    const allParents = this.getParents(startNodeId).map(item => item.id)
    const customCaller = `${caller ? caller : ''}*${startNodeId}`

    const operatedParents = allParents.map((item, index, arr) => {
      let other;
      if (index === 0 && arr.length === 2) {
        other = allParents[1]
      }
      if (index === 1 && arr.length === 2) {
        other = allParents[0]
      }
      console.log("call back count", callBackCounter, item)
      callBackCounter += 1;
      return this.customBuildAncestorsHierarchy(item, other, customCaller)
    })

    let father, mother;
    let fatherId, motherId;
    if (foundNode.parentRelationship) {
      const foundParentHood = this.getParentRelationship(foundNode.parentRelationship.id)
      if (foundParentHood.femaleNode) {
        mother = `${customCaller}*${foundParentHood.femaleNode.id}`
        motherId = foundParentHood.femaleNode.id
      }
      if (foundParentHood.maleNode) {
        father = `${customCaller}*${foundParentHood.maleNode.id}`
        fatherId = foundParentHood.maleNode.id
      }
    }
    const hrParent: DrawableNode = {
      id: startNodeId,
      uuid: customCaller,

      // parents: operatedParents,
      children: operatedParents,

      name: foundNode.name,
      gender: foundNode.gender,
      father,
      mother,
      fatherId,
      motherId,
      type: 'child'
    }
    if (other) hrParent.target = other;
    return hrParent
  }



  customBuildParent(startNodeId: number) {
    const foundNode = this.getNode(startNodeId)
    let mother: DrawableNode, father: DrawableNode;
    if (foundNode.parentRelationship) {
      const foundParentHood = this.getParentRelationship(foundNode.parentRelationship.id)
      if (foundParentHood.femaleNode) {
        const foundMother = this.getNode(foundParentHood.femaleNode.id)
        mother = {
          id: foundMother.id,
          uuid: `${foundMother.id}`,
          // parents: operatedParents,
          children: [],
          name: foundMother.name,
          gender: foundMother.gender,
          type: 'child',
          catag: 'editAnce',
        }
      }
      if (foundParentHood.maleNode) {
        const foundFather = this.getNode(foundParentHood.maleNode.id)

        father = {
          id: foundFather.id,
          uuid: `${foundFather.id}`,
          children: [],
          name: foundFather.name,
          gender: foundFather.gender,
          type: 'child',
          catag: 'editAnce'
        }
      }
    }
    if (!father) {
      father = {
        id: assignId(),
        uuid: 'father',
        children: [],
        name: 'Add Father',
        gender: 'MALE',
        source: `${startNodeId}`,
        type: 'child',
        catag: 'editAnce',
        mode: 'edit',
        actionType: actionTypes.addNewParent
      }
    }
    if (!mother) {
      mother = {
        id: assignId(),
        uuid: 'mother',
        children: [],
        name: 'Add Mother',
        gender: 'FEMALE',
        source: `${startNodeId}`,
        type: 'child',
        catag: 'editAnce',
        mode: 'edit',
        actionType: actionTypes.addNewParent
      }
    }
    const displayableParents = []
    if (father) {
      if (mother) father.target = mother.id;
      displayableParents.push(father)
    } 
    if (mother) {
      if (father) mother.target = father.id
      displayableParents.push(mother)
    }
    console.log("mother father", mother, father)
    const parents: DrawableNode = {
      id: startNodeId,
      uuid: `${startNodeId}`,
      children: displayableParents,
      name: foundNode.name,
      gender: foundNode.gender,
      father:father.uuid,
      mother:mother.uuid,
      type: 'child'
    }
    return parents;
  }
  getParentHoodBySpouses(selfNode: FamilyNode, otherNode: FamilyNode) {
    if (selfNode.gender === otherNode.gender) {
      throw new Error("Same gender can't be spouse")
    }
    let femaleNode, maleNode;
    if (selfNode.gender === "FEMALE") {
      femaleNode = selfNode;
      maleNode = otherNode
    } else {
      maleNode = selfNode;
      femaleNode = otherNode
    }
    return this.data.parents.find(item=> {
      if (maleNode?.id === item.maleNode?.id && femaleNode.id === item.femaleNode?.id) return true
      else return false
    })
  }
  simpleGetChildren(selfNode: FamilyNode, spouseIds: number[]) {
    const allSpouseAsParents = []
    spouseIds.map(item=> {
      const spouseNode = this.getNode(item)
      const foundParentHood = this.getParentHoodBySpouses(selfNode, spouseNode)
      const foundChildren = this.data.familyNodes.filter(item=>item?.parentRelationship?.id === foundParentHood?.id)

      let motherNode, fatherNode;
      if (selfNode.gender === "FEMALE") {
        motherNode = selfNode;
        fatherNode = spouseNode
      } else {
        fatherNode = selfNode;
        motherNode = spouseNode
      }
      console.log("parents ", motherNode, fatherNode)
      const DrawableChildren = foundChildren.map(item=> {
        // const foundParentHood = this.getParentRelationship(item.parentRelationship.id)
        const customResponse: DrawableNode = {
          id: item.id,
          uuid: `child-${item.id}`,
          gender: item.gender,
          name: item.name,
          type: 'child',
          children: [],
          father: `${fatherNode.id}`,
          mother:`${motherNode.id}`,
          fatherId: fatherNode.id,
          motherId: motherNode.id,
        }
        return customResponse
      })
      const addDaughter: DrawableNode = {
        id: assignId(),
        uuid: `daughter-${fatherNode.id}-${motherNode.id}`,
        gender: 'FEMALE',
        name: 'Add Daughter',
        type: 'child',
        children: [],
        father: `${fatherNode.id}`,
        mother: `${motherNode.id}`,
        fatherId: fatherNode.id,
        motherId: motherNode.id,
        mode: 'edit',
        actionType: actionTypes.addChildOfTwoParents
      }
      const addSon: DrawableNode = {
        id: assignId(),
        uuid: `son-${fatherNode.id}-${motherNode.id}`,
        gender: 'MALE',
        name: 'Add Son',
        type: 'child',
        children: [],
        father: `${fatherNode.id}`,
        mother: `${motherNode.id}`,
        fatherId: fatherNode.id,
        motherId: motherNode.id,
        mode: 'edit',
        actionType: actionTypes.addChildOfTwoParents

      }
      DrawableChildren.push(addSon,addDaughter)
      const currentSpouse: DrawableNode = {
        id: spouseNode.id,
        uuid:`${spouseNode.id}`,
        gender: spouseNode.gender,
        name: spouseNode.name,
        type: 'spouse',
        target: selfNode.id,
        children: DrawableChildren,
      }
      allSpouseAsParents.push(currentSpouse)
    })

    return allSpouseAsParents;
  }
  temporarySingledChildren(foundNode: FamilyNode): DrawableNode[] {
    let motherNode, fatherNode;
    if (foundNode.gender === 'FEMALE') {
      motherNode = foundNode;
    } else {
      fatherNode = foundNode
    }
    const addDaughter: DrawableNode = {
      id: assignId(),
      uuid: `daughter-${foundNode.id}`,
      gender: 'FEMALE',
      name: 'Add Daughter',
      type: 'child',
      children: [],
      father: fatherNode ?`${fatherNode.id}`: undefined,
      mother: motherNode ?`${motherNode.id}`: undefined,
      fatherId: fatherNode? fatherNode.id: undefined,
      motherId: motherNode? motherNode.id: undefined,
      mode: 'edit',
      actionType: actionTypes.addChildOfOneParent

    }
    const addSon: DrawableNode = {
      id: assignId(),
      uuid: `son-${foundNode.id}`,
      gender: 'MALE',
      name: 'Add Son',
      type: 'child',
      children: [],
      father: fatherNode ?`${fatherNode.id}`: undefined,
      mother: motherNode ?`${motherNode.id}`: undefined,
      fatherId: fatherNode? fatherNode.id: undefined,
      motherId: motherNode? motherNode.id: undefined,
      mode: 'edit',
      actionType: actionTypes.addChildOfOneParent
    }
    return [addSon, addDaughter]
  }
  customBuildChildren(startNodeId: number) {
    const foundNode = this.getNode(startNodeId)
    const singledChildren = this.getSingleParentedChildNodes(foundNode)
    const drawableSingledChildren = singledChildren.map(item=> {
      if (foundNode.gender === "MALE") {
        const singledChild: DrawableNode = {
          id: item.id,
          uuid: `${item.id}`,
          gender: item.gender,
          name: item.name,
          type: 'child',
          children: [],
          father: `${foundNode.id}`,
          fatherId: foundNode.id,
        }
        return singledChild;
      } else {
        const singledChild: DrawableNode = {
          id: item.id,
          uuid: `${item.id}`,
          gender: item.gender,
          name: item.name,
          type: 'child',
          children: [],
          mother: `${foundNode.id}`,
          motherId: foundNode.id,
        }
        return singledChild;
      }
    })

    const singledAddableChildren = this.temporarySingledChildren(foundNode)
    const foundSpouseIds = this.getSpouses(foundNode)
    const foundDoubleParentedChildren = this.simpleGetChildren(foundNode, foundSpouseIds)

    const selfDrawable: DrawableNode = {
      id: foundNode.id,
      uuid: `${foundNode.id}`,
      gender: foundNode.gender,
      name: foundNode.name,
      type: 'child',
      children: [...singledAddableChildren, ...drawableSingledChildren],
      // father: fatherNode ?`${fatherNode.id}`: undefined,
      // mother: motherNode ?`${motherNode.id}`: undefined,
      // fatherId: fatherNode? fatherNode.id: undefined,
      // motherId: motherNode? motherNode.id: undefined,
    }
    const spouseDrawableTemporary: DrawableNode = {
      id: assignId(),
      uuid: `spouse-${foundNode.id}`,
      name: 'Add Spouse',
      type: 'spouse',
      target: startNodeId,
      mode: 'edit',
      children: [],
      actionType: actionTypes.addNewPartner,
    }
    const customChildren = []
    if (foundNode.gender === 'MALE') {
      spouseDrawableTemporary.gender = 'FEMALE'
      customChildren.push(selfDrawable,...foundDoubleParentedChildren, spouseDrawableTemporary)
    } else {
      spouseDrawableTemporary.gender = 'MALE'
      customChildren.push(spouseDrawableTemporary,...foundDoubleParentedChildren, selfDrawable)
    }
    const resultedChildren: DrawableNode = {
      id: 0,
      uuid: '0',
      name: 'root',
      gender: 'MALE',
      type: 'root',
      children: customChildren
    }
    return resultedChildren;
  }



}

export const ND = new NodeData()


// change node event.
// get the data for the new root node.
// identify which nodes from the previous drawing need to stay.
// // those who stayed get resized and repositioned. and those who are not needed fade out
// // those who are new get displayed (fade in)
