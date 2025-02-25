import * as d3 from 'd3';
import { CustomFlatData, DrawableNode, FamilyNode, HrDataChild, HrDataParent, Parent, temporaryData } from "./node.interface";

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
  getNode(id: number): FamilyNode {
    const foundNode = this.data.familyNodes.find(item => id === item.id)
    if (!foundNode) throw Error(`node with id ${id} was not found`)
    return foundNode;
  }

  getParentRelationship(id: number): Parent {
    const foundParentship = this.data.parents.find(item => id === item.id)
    if (!foundParentship) throw Error(`parentship with id ${id} was not found`)
    return foundParentship;
  }
  getSpouseRelationship(familyNode: FamilyNode): Parent[] {
    return this.data.parents.filter(item => {
      if (familyNode.gender === "MALE" && item.maleNode) {
        return item.maleNode.id === familyNode.id
      } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
        return item.femaleNode.id === familyNode.id
      }
    })
  }
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
    return result

  }


  // returns all children and thier spouses as temporary storage
  getChildrenByParents(selfNodeId: number, spouseNodeId: number | undefined): temporaryData[] {
    const selfNode = this.getNode(selfNodeId)
    let spouseNode;
    if (spouseNodeId) {
      spouseNode = this.getNode(spouseNodeId)
    } else {
      spouseNode = undefined;
    }
    let parentHood
    if (!spouseNodeId) {
      parentHood = this.data.parents.find(item => {
        if (selfNode.gender === "MALE" && item.maleNode?.id === selfNode.id && !item.femaleNode) {
          return true
        } else if (selfNode.gender === "FEMALE" && item.femaleNode?.id === selfNode.id && !item.femaleNode) {
          return true
        } else {
          return false
        }
      })

    } else {
      parentHood = this.data.parents.find(item => {
        if (selfNode.gender === "MALE" && item.maleNode && item.maleNode.id === selfNode.id && item.femaleNode && spouseNode && item.femaleNode.id === spouseNode?.id) {
          return true
        } else if (selfNode.gender === "FEMALE" && item.femaleNode && item.femaleNode.id === selfNode.id && item.maleNode && spouseNode && item.maleNode.id === spouseNode?.id) {
          return true
        }
      })
    }
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
      allChildren.push(customChild)
      const foundSpousesIds = this.getSpouses(item)

      const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
        const foundSpouse = this.getNode(sp)
        const result: temporaryData = {
          id: foundSpouse.id,
          // name: foundSpouse.name,
          // gender: foundSpouse.gender,
          type: 'spouse',
          target: item.id,
        }
        return result
      })

      allChildren.push(...foundSpouses)
    })
    return allChildren;

  }

  // traverses to find all descendants
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

  customGetSpouses(familyNode: FamilyNode): DrawableNode[] {
    const foundParentHood = this.data.parents.filter(item => {
      if (familyNode.gender === "MALE" && item.maleNode) {
        return item.maleNode.id === familyNode.id
      } else if (familyNode.gender === "FEMALE" && item.femaleNode) {
        return item.femaleNode.id === familyNode.id
      }
    })
    const spouses = foundParentHood.map(item => {
      if (familyNode.gender === "MALE" && item.femaleNode) {
        return this.getNode(item.femaleNode.id)
      } else if (familyNode.gender === "FEMALE" && item.maleNode) {
        return this.getNode(item.maleNode.id)
      }
    }).filter(item => item)
    const newSpouses: DrawableNode[] = []
    for (let s of spouses) {
      if (s) {
        const newSpouse: DrawableNode = {
          id: s.id,
          name: s.name,
          gender: s.gender,
          type: 'spouse',
          target: familyNode.id,
          children: [],
        }
        newSpouses.push(newSpouse)
      }
    }

    return newSpouses;
  }
  
  getChildren(id: number): number[] {
    const foundNode = this.getNode(id)
    const foundSpouseRelations = this.getSpouseRelationship(foundNode)
    const foundSpouseRelationsIds = foundSpouseRelations.map(item => item.id)
    const foundChildren = this.data.familyNodes.filter(item => {
      if (item.parentRelationship && foundSpouseRelationsIds.includes(item.parentRelationship.id)) {
        return true
      } else {
        return false
      }
    })
    return foundChildren.map(item => item.id)

  }


  getParents(startNodeId: number): FamilyNode[] {
    const foundNode = this.getNode(startNodeId);
    const parents = []
    if (foundNode.parentRelationship) {
      const foundParentship = this.getParentRelationship(foundNode.parentRelationship.id)
      if (foundParentship.femaleNode) {
        const mother = this.getNode(foundParentship.femaleNode.id)
        parents.push(mother)
      }
      if (foundParentship.maleNode) {
        const father = this.getNode(foundParentship.maleNode.id)
        parents.push(father)
      }
    }
    return parents;
  }


  customBuildDescendantsHiararchy(startNodeId: number): DrawableNode {
    const familyNode = this.getNode(startNodeId)
    // const preDesc = this._customBuildDescendantsHiararchy(startNodeId)
    const tempNodes: temporaryData = {
      id: familyNode.id,
      type: 'child',
    }

    const allChildren: temporaryData[] = []
    const customChild: temporaryData = {
      id: familyNode.id,
      // spouses: this.getSpouses(selfNode),
      type: 'child',
    }
    allChildren.push(customChild)
    const foundSpousesIds = this.getSpouses(familyNode)
    const foundSpouses: temporaryData[] = foundSpousesIds.map(sp => {
      const foundSpouse = this.getNode(sp)

      const result: temporaryData = {
        id: foundSpouse.id,
        // name: foundSpouse.name,
        // gender: foundSpouse.gender,
        type: 'spouse',
        target: familyNode.id,
      }
      return result
    })

    allChildren.push(...foundSpouses)


    const customChildren = allChildren.map(item => {
      const spDrawable = this.customGetChildrenByParents(item)
      return spDrawable;
    })

    const spouses = this.customGetSpouses(familyNode)
    const resultedChildren: DrawableNode = {
      id: 0,
      name: 'root',
      gender: 'MALE',
      type: 'root',
      children: customChildren
    }
    return resultedChildren;
  }


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



// Now pass it to d3.hierarchy()
// const treeDataz = buildAncestorsHierarchy(flatData, 4);



// change node event.
// get the data for the new root node.
// identify which nodes from the previous drawing need to stay.
// // those who stayed get resized and repositioned. and those who are not needed fade out
// // those who are new get displayed (fade in)
