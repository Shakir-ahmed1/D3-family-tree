import { CustomFlatData, DrawableNode, FamilyNode, Parent, temporaryData } from "./node.interface";

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
  getSingleParentedChildNodes(selfNode: FamilyNode) {
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
      let father: undefined | number, mother: undefined | number;
      if (selfNode.gender === 'MALE') {
        father = selfNode.id;
        mother = spouseNode?.id
      } else {
        mother = selfNode.id;
        father = spouseNode?.id;
      }

      foundChildren.map(item => {
        const customChild: temporaryData = {
          id: item.id,
          // gender: item.gender,
          father,
          mother,
          // spouses: this.getSpouses(selfNode),
          type: 'child',
        }
        const foundSpousesIds = this.getSpouses(item)

        const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
          const foundSpouse = this.getNode(sp)
          const result: temporaryData = {
            id: foundSpouse.id,
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
      let father: undefined | number, mother: undefined | number;
      if (parentHood) {
        if (selfNode.gender === 'MALE') {
          father = selfNode.id;
          mother = spouseNode?.id
        } else {
          mother = selfNode.id;
          father = spouseNode?.id;
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
          // gender: item.gender,
          father,
          mother,
          // spouses: this.getSpouses(selfNode),
          type: 'child',
        }
        const foundSpousesIds = this.getSpouses(item)

        const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
          const foundSpouse = this.getNode(sp)
          const result: temporaryData = {
            id: foundSpouse.id,
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
  customGetChildrenByParents(familyNode: temporaryData): DrawableNode {
    if (familyNode.type === 'spouse') {
      const currentChildren: temporaryData[] = this.getChildrenByParents(familyNode.target as number, familyNode.id)
      const customChildren = currentChildren.map(item => {
        const spDrawable = this.customGetChildrenByParents(item)
        return spDrawable;
      })
      const foundItem = this.getNode(familyNode.id)
      const customResponse: DrawableNode = {
        id: foundItem.id,
        uuid: crypto.randomUUID(),
        gender: foundItem.gender,
        name: foundItem.name,
        type: familyNode.type,
        children: customChildren,
        father: familyNode.father,
        mother: familyNode.mother,
        target: familyNode.target

      }
      return customResponse
    } else if (familyNode.type === 'child') {
      const currentChildren: temporaryData[] = this.getChildrenByParents(familyNode.id, undefined)
      const customChildren = currentChildren.map(item => {
        // 6
        // 2  2, 1
        const spDrawable = this.customGetChildrenByParents(item)
        return spDrawable;
      })
      const foundItem = this.getNode(familyNode.id)
      const customResponse: DrawableNode = {

        uuid: crypto.randomUUID(),
        id: foundItem.id,
        gender: foundItem.gender,
        name: foundItem.name,
        type: familyNode.type,
        children: customChildren,
        father: familyNode.father,
        mother: familyNode.mother,
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
    // const preDesc = this._customBuildDescendantsHiararchy(startNodeId)

    const allChildren: temporaryData[] = []
    const customChild: temporaryData = {
      id: familyNode.id,
      // spouses: this.getSpouses(selfNode),
      type: 'child',
    }
    const foundSpousesIds = this.getSpouses(familyNode)
    const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
      const foundSpouse = this.getNode(sp)

      const result: temporaryData = {
        id: foundSpouse.id,
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
      const spDrawable = this.customGetChildrenByParents(item)
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
  customBuildAncestorsHierarchy(startNodeId: number, other: number | undefined): DrawableNode {
    const foundNode = this.getNode(startNodeId)
    // Create a map of all nodes by ID
    const allParents = this.getParents(startNodeId).map(item => item.id)

    const operatedParents = allParents.map((item, index, arr) => {
      let other;
      if (index === 0 && arr.length === 2) {
        other = allParents[1]
      }
      if (index === 1 && arr.length === 2) {
        other = allParents[0]
      }
      return this.customBuildAncestorsHierarchy(item, other)
    })

    let father, mother;
    if (foundNode.parentRelationship) {
      const foundParentHood = this.getParentRelationship(foundNode.parentRelationship.id)
      if (foundParentHood.femaleNode) {
        mother = foundParentHood.femaleNode.id
      }
      if (foundParentHood.maleNode) {
        father = foundParentHood.maleNode.id
      }
    }
    const hrParent: DrawableNode = {
      id: startNodeId,
      uuid: crypto.randomUUID(),

      // parents: operatedParents,
      children: operatedParents,

      name: foundNode.name,
      gender: foundNode.gender,
      father,
      mother,
      // spouses?: ;
      type: 'child'
      // children?: []
    }
    if (other) hrParent.target = other;
    return hrParent
  }
}

export const ND = new NodeData()


// change node event.
// get the data for the new root node.
// identify which nodes from the previous drawing need to stay.
// // those who stayed get resized and repositioned. and those who are not needed fade out
// // those who are new get displayed (fade in)
