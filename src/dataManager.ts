import { Gender } from "./dtos/gender.enum";
import { actionTypes, Contributor, CustomFlatData, DrawableNode, FamilyNode, genericActionTypes, Parent, SuggestableActions, SuggestEdits, temporaryData } from "./node.interface";
import { localStorageManager } from "./storage/storageManager";
localStorageManager
function assignId(key: 'doubled-son' | 'doubled-daughter' | 'father' | 'mother' | 'spouse' | 'singled-daughter' | 'singled-son', offset?: number) {
  const valueMapper = {
    'doubled-son': -100000,
    'doubled-daughter': -200000,
    'father': -1,
    'mother': -2,
    'spouse': -3,
    'singled-daughter': -4,
    'singled-son': -5,
  }
  if (['father', 'mother', 'singled-daughter', 'singled-son', 'spouse'].includes(key)) {
    return valueMapper[key]
  } else if (['doubled-son', 'doubled-daughter'].includes(key) && offset) {
    return valueMapper[key] - offset
  } else {
    throw new Error('Assigning id invalid' + key)
  }
}

export class DataManager {
  data: CustomFlatData;
  familyTreeId = 0;
  setData(fetchedNodesArray: any) {
    this.data = fetchedNodesArray
  }
  constructor(familyTreeId: number) {
    this.familyTreeId = familyTreeId;
    this.data = {
      familyNodes: [],
      parents: [],
      allowedActions: [],
      canContribute: false,
      contributors: [],
      suggestions: [],
      myInfo: undefined
    }
  }
  suggestionActionMapper = {
    addChildOfOneParent: "addChildOfOneParent",
    addChildOfTwoParents: "addChildOfTwoParents",
    addExistingParent: "addParent",
    addNewParent: "addParent",
    addNewPartner: 'addPartner',
    addExistingPartner: "addPartner",
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
  getSuggestion(id: number): SuggestEdits {
    const foundSuggestions = this.data.suggestions.find(item => id === item.id)
    if (!foundSuggestions) throw Error(`node with id ${id} was not found`)
    return foundSuggestions;
  }
  getNodeSuggestions(id: number): SuggestEdits[] {
    const foundSuggestions = this.data.suggestions.filter(item => id === item.selfNode.id)
    if (!foundSuggestions) throw Error(`node with id ${id} was not found`)
    return foundSuggestions;
  }
  getContributionByNodeId(id: number): Contributor {
    const foundContribution = this.data.contributors.find(item => {
      return id === item.id
    })
    if (!foundContribution) throw Error(`node with id ${id} was not found`)
    return foundContribution;

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
        target: familyNode.target,
        mode: 'node',
        catag: 'desc',

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
        target: familyNode.target,
        catag: 'desc',
        mode: 'node',


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
      children: customChildren,
      catag: 'desc',
      mode: 'node'
    }
    return resultedChildren;
  }

  /**
   * Traverses the nodes to find all it's ancestors
   * @param startNodeId the starting node for traversal
   * @param other the spouse of startNode
   * @returns returns all ancestors of the node as a hierarchial data
   */
  customBuildAncestorsHierarchy(startNodeId: number, other: number | undefined, caller?: string): DrawableNode {
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
      type: 'child',
      catag: 'ance',
      mode: 'node'
    }
    if (other) hrParent.target = other;
    return hrParent
  }



  customBuildParent(startNodeId: number): DrawableNode {
    const foundNode = this.getNode(startNodeId)
    let mother: DrawableNode | undefined, father: DrawableNode | undefined;
    let foundParentHood: Parent | undefined;
    if (foundNode?.parentRelationship?.id) {
      foundParentHood = this.getParentRelationship(foundNode.parentRelationship.id)
    }
    if (foundParentHood?.femaleNode) {
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
        mode: 'node'
      }
    } else {
      mother = {
        id: assignId('mother'),
        uuid: 'mother',
        children: [],
        name: 'Add Mother',
        gender: 'FEMALE',
        source: `${startNodeId}`,
        type: 'child',
        catag: 'editAnce',
        mode: 'edit',
        actionType: genericActionTypes.addParent,
        isAllowed: this.isAllowedAction(startNodeId, genericActionTypes.addParent),
        hasPending: this.hasNoPendingSuggestion(startNodeId, genericActionTypes.addParent)

      }
    }
    if (foundParentHood?.maleNode) {
      const foundFather = this.getNode(foundParentHood.maleNode.id)

      father = {
        id: foundFather.id,
        uuid: `${foundFather.id}`,
        children: [],
        name: foundFather.name,
        gender: foundFather.gender,
        type: 'child',
        catag: 'editAnce',
        mode: 'node'
      }
    } else {

      father = {
        id: assignId('father'),
        uuid: 'father',
        children: [],
        name: 'Add Father',
        gender: 'MALE',
        source: `${startNodeId}`,
        type: 'child',
        catag: 'editAnce',
        mode: 'edit',
        actionType: genericActionTypes.addParent,
        isAllowed: this.isAllowedAction(startNodeId, genericActionTypes.addParent),
        hasPending: this.hasNoPendingSuggestion(startNodeId, genericActionTypes.addParent)
      }
    }
    const suggestedParents = this.prepareSuggestedParents(startNodeId)
    const displayableParents = []
    if (suggestedParents.fatherNodes) {
      displayableParents.push(...suggestedParents.fatherNodes)
    }
    if (father) {
      if (mother) father.target = mother.id;
      displayableParents.push(father)
    }
    if (mother) {
      if (father) mother.target = father.id
      displayableParents.push(mother)
    }
    if (suggestedParents.motherNodes) {
      displayableParents.push(...suggestedParents.motherNodes)
    }
    const parents: DrawableNode = {
      id: startNodeId,
      uuid: `${startNodeId}`,
      children: displayableParents,
      name: foundNode.name,
      gender: foundNode.gender,
      father: father?.uuid,
      mother: mother?.uuid,
      type: 'child',
      catag: 'editAnce',
      mode: 'node'
    }
    return parents;
  }
  getParentHoodBySpouses(selfNode: FamilyNode, otherNode: FamilyNode): Parent | undefined {
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
    return this.data.parents.find(item => {
      if (maleNode?.id === item.maleNode?.id && femaleNode.id === item.femaleNode?.id) return true
      else return false
    })
  }
  canCreate(familyNodeId: number): boolean {
    const foundContribution = this.getContributionByNodeId(familyNodeId)
    const myMemberId = this.data.myInfo?.id
    const result = foundContribution.creators.find(item => item.id === myMemberId)
    return result ? true : false;
  }
  canUpdate(familyNodeId: number): boolean {
    const foundContribution = this.getContributionByNodeId(familyNodeId)
    const myMemberId = this.data.myInfo?.id
    const result = foundContribution.updators.find(item => item.id === myMemberId)
    return result ? true : false;
  }
  canSuggest(familyNodeId: number): boolean {
    const foundContribution = this.getContributionByNodeId(familyNodeId)
    const myMemberId = this.data.myInfo?.id
    const result = foundContribution.suggestors.find(item => item.id === myMemberId)
    return result ? true : false;
  }
  canContribute(): boolean {
    return this.data.canContribute
  }
  testContribution(familyNodeId: number) {
    console.log(`
      canUpdate: ${this.canUpdate(familyNodeId)},
      canCreate: ${this.canUpdate(familyNodeId)},
      canSuggest: ${this.canUpdate(familyNodeId)},
      canContribute: ${this.canContribute()},
      `)
  }
  memberPriviledge(familyTreeId: number, familyNodeId: number): 'view' | 'suggest' | 'create' | 'update' | 'only-create' {
    const canContribute = this.canContribute()
    if (!canContribute) return 'view'
    const canCreate = this.canCreate(familyNodeId)
    const canUpdate = this.canUpdate(familyNodeId)
    if (canCreate && !canUpdate) return 'only-create';
    if (canCreate) return 'create';
    if (canUpdate) return 'update'
    const canSuggest = this.canSuggest(familyNodeId)
    if (canSuggest) return 'suggest'
    return 'view'
  }
  hasNoPendingSuggestion(familyNodeId: number, suggestableAction: genericActionTypes): boolean {

    const mapper = {
      ChildOfOneParent: genericActionTypes.addChildOfOneParent,
      ChildOfTwoParents: genericActionTypes.addChildOfTwoParents,

      ExistingParent: genericActionTypes.addParent,
      NewParent: genericActionTypes.addParent,

      NewPartner: genericActionTypes.addPartner,
      ExistingPartner: genericActionTypes.addPartner,
      NewPartnerAsParent: genericActionTypes.addPartnerAsParent,
      ExistingPartnerAsParent: genericActionTypes.addPartnerAsParent,
      DeleteNode: genericActionTypes.DeleteNode,
      UpdateNode: genericActionTypes.UpdateNode,
    }
    const foundPending = this.data.allowedActions.find(item => item.id === familyNodeId)?.pendingSuggestions
    if (!foundPending) return true
    const result = foundPending.find(item => {
      return mapper[item as keyof typeof mapper] === suggestableAction;
    }) ? false : true
    return result
  }
  isAllowedAction(familyNodeId: number, suggestableAction: genericActionTypes, checkPending?: true): boolean {

    const mapper = {
      ChildOfOneParent: genericActionTypes.addChildOfOneParent,
      ChildOfTwoParents: genericActionTypes.addChildOfTwoParents,

      ExistingParent: genericActionTypes.addParent,
      NewParent: genericActionTypes.addParent,

      NewPartner: genericActionTypes.addPartner,
      ExistingPartner: genericActionTypes.addPartner,
      NewPartnerAsParent: genericActionTypes.addPartnerAsParent,
      ExistingPartnerAsParent: genericActionTypes.addPartnerAsParent,
      DeleteNode: genericActionTypes.DeleteNode,
      UpdateNode: genericActionTypes.UpdateNode,
    }
    const foundPending = this.data.allowedActions.find(item => item.id === familyNodeId)?.relations

    if (!foundPending) return false
    const result = foundPending.find(item => {
      return mapper[item as keyof typeof mapper] === suggestableAction;
    }) ? true : false
    return result


  }
  simpleGetChildren(selfNode: FamilyNode, spouseIds: number[]): DrawableNode[] {
    const allSpouseAsParents: DrawableNode[] = []
    spouseIds.map(item => {
      const spouseNode = this.getNode(item)
      const foundParentHood = this.getParentHoodBySpouses(selfNode, spouseNode)
      const foundChildren = this.data.familyNodes.filter(item => item?.parentRelationship?.id === foundParentHood?.id)

      let motherNode, fatherNode;
      if (selfNode.gender === "FEMALE") {
        motherNode = selfNode;
        fatherNode = spouseNode
      } else {
        fatherNode = selfNode;
        motherNode = spouseNode
      }
      const DrawableChildren = foundChildren.map(item => {
        // const foundParentHood = this.getParentRelationship(item.parentRelationship.id)
        const customResponse: DrawableNode = {
          id: item.id,
          uuid: `child-${item.id}`,
          gender: item.gender,
          name: item.name,
          type: 'child',
          children: [],
          father: `${fatherNode.id}`,
          mother: `${motherNode.id}`,
          fatherId: fatherNode.id,
          motherId: motherNode.id,
          catag: 'editDesc',
          mode: 'node',
        }
        return customResponse
      })
      const suggestedDoubledChildren = this.prepareSuggestedDoubledChildren(selfNode.id, item)
      const addDaughter: DrawableNode = {
        id: assignId('doubled-daughter', spouseNode.id),
        uuid: `daughter-${fatherNode.id}-${motherNode.id}`,
        gender: 'FEMALE',
        name: 'Add Daughter',
        type: 'child',
        children: [],
        father: `${fatherNode.id}`,
        mother: `${motherNode.id}`,
        fatherId: fatherNode.id,
        motherId: motherNode.id,
        catag: 'editDesc',
        mode: 'edit',
        actionType: genericActionTypes.addChildOfTwoParents,
        isAllowed: this.isAllowedAction(selfNode.id, genericActionTypes),
        hasPending: this.hasNoPendingSuggestion(selfNode.id, genericActionTypes.addChildOfTwoParents)

      }
      const addSon: DrawableNode = {
        id: assignId('doubled-son', spouseNode.id),
        uuid: `son-${fatherNode.id}-${motherNode.id}`,
        gender: 'MALE',
        name: 'Add Son',
        type: 'child',
        children: [],
        father: `${fatherNode.id}`,
        mother: `${motherNode.id}`,
        fatherId: fatherNode.id,
        motherId: motherNode.id,
        catag: 'editDesc',
        mode: 'edit',
        actionType: genericActionTypes.addChildOfTwoParents,
        isAllowed: this.isAllowedAction(selfNode.id, genericActionTypes),
        hasPending: this.hasNoPendingSuggestion(selfNode.id, genericActionTypes.addChildOfTwoParents)


      }
      DrawableChildren.push(...suggestedDoubledChildren.sonNodes, addSon, addDaughter, ...suggestedDoubledChildren.daughterNodes)
      const currentSpouse: DrawableNode = {
        id: spouseNode.id,
        uuid: `${spouseNode.id}`,
        gender: spouseNode.gender,
        name: spouseNode.name,
        type: 'spouse',
        target: selfNode.id,
        children: DrawableChildren,
        catag: 'editDesc',
        mode: 'node'
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
      id: assignId('singled-daughter'),
      uuid: `daughter-${foundNode.id}`,
      gender: 'FEMALE',
      name: 'Add Daughter',
      type: 'child',
      children: [],
      father: fatherNode ? `${fatherNode.id}` : undefined,
      mother: motherNode ? `${motherNode.id}` : undefined,
      fatherId: fatherNode ? fatherNode.id : undefined,
      motherId: motherNode ? motherNode.id : undefined,
      mode: 'edit',
      actionType: genericActionTypes.addChildOfOneParent,
      isAllowed: this.isAllowedAction(foundNode.id, genericActionTypes),
      hasPending: this.hasNoPendingSuggestion(foundNode.id, genericActionTypes.addChildOfOneParent),
      catag: 'editDesc',

    }
    const addSon: DrawableNode = {
      id: assignId('singled-son'),
      uuid: `son-${foundNode.id}`,
      gender: 'MALE',
      name: 'Add Son',
      type: 'child',
      children: [],
      father: fatherNode ? `${fatherNode.id}` : undefined,
      mother: motherNode ? `${motherNode.id}` : undefined,
      fatherId: fatherNode ? fatherNode.id : undefined,
      motherId: motherNode ? motherNode.id : undefined,
      mode: 'edit',
      actionType: genericActionTypes.addChildOfOneParent,
      isAllowed: this.isAllowedAction(foundNode.id, genericActionTypes),
      hasPending: this.hasNoPendingSuggestion(foundNode.id, genericActionTypes.addChildOfOneParent),
      catag: 'editDesc',
    }
    return [addSon, addDaughter]
  }
  customBuildChildren(startNodeId: number): DrawableNode {
    const foundNode = this.getNode(startNodeId)
    const singledChildren = this.getSingleParentedChildNodes(foundNode)
    const drawableSingledChildren = singledChildren.map(item => {
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
          catag: 'editDesc',
          mode: 'node'
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
          catag: 'editDesc',
          mode: 'node',
        }
        return singledChild;
      }
    })

    const singledAddableChildren = this.temporarySingledChildren(foundNode)
    const foundSpouseIds = this.getSpouses(foundNode)
    const foundDoubleParentedChildren = this.simpleGetChildren(foundNode, foundSpouseIds)
    const suggestedSingledChildren = this.prepareSuggestedSingledChildren(startNodeId)

    const selfDrawable: DrawableNode = {
      id: foundNode.id,
      uuid: `${foundNode.id}`,
      gender: foundNode.gender,
      name: foundNode.name,
      type: 'child',
      children: [...suggestedSingledChildren.sonNodes, ...drawableSingledChildren, ...singledAddableChildren, ...suggestedSingledChildren.daughterNodes],
      catag: 'editDesc',
      mode: 'node'
    }
    const foundSuggestedPartner = this.prepareSuggestedPartners(startNodeId);
    const spouseDrawableTemporary: DrawableNode = {
      id: assignId('spouse'),
      uuid: `spouse-${foundNode.id}`,
      name: 'Add Spouse',
      type: 'spouse',
      gender: foundNode.gender === 'MALE' ? 'FEMALE' : 'MALE',
      target: startNodeId,
      mode: 'edit',
      catag: 'editDesc',
      children: [],
      actionType: genericActionTypes.addPartner,
      isAllowed: this.isAllowedAction(startNodeId, genericActionTypes.addPartner),
      hasPending: this.hasNoPendingSuggestion(startNodeId, genericActionTypes.addPartner)
    }
    const customChildren = [];
    // const customChildren = []
    if (foundNode.gender === 'MALE') {
      customChildren.push(selfDrawable, ...foundDoubleParentedChildren, spouseDrawableTemporary, ...foundSuggestedPartner.femaleNodes)
    } else {
      customChildren.push(...foundSuggestedPartner.maleNodes, spouseDrawableTemporary, ...foundDoubleParentedChildren, selfDrawable)
    }
    const resultedChildren: DrawableNode = {
      id: 0,
      uuid: '0',
      name: 'root',
      gender: 'MALE',
      type: 'root',
      catag: 'editDesc',
      mode: 'node',
      children: customChildren
    }
    return resultedChildren;
  }


  suggestionData(familyNodeId: number, suggestedAction: SuggestableActions): SuggestEdits[] {
    const nodesSuggestions: SuggestEdits[] = this.data.suggestions.filter(item => {
      return item.selfNode?.id === familyNodeId && item.suggestedAction === suggestedAction;
    })
    return nodesSuggestions
  }
  prepareSuggestedParents(familyNodeId: number): { motherNodes: DrawableNode[]; fatherNodes: DrawableNode[]; } {
    const parentDrawableNodes: {
      motherNodes: DrawableNode[],
      fatherNodes: DrawableNode[]
    } = {
      motherNodes: [],
      fatherNodes: [],
    }
    const suggestedNewParents = this.suggestionData(familyNodeId, SuggestableActions.NewParent)
    const suggestedExistingParents = this.suggestionData(familyNodeId, SuggestableActions.ExistingParent)


    suggestedExistingParents.map(item => {
      const newParent: DrawableNode = {
        id: item.suggestedNode1.id,
        gender: item.suggestedNode1.gender,
        catag: 'suggestAnce',
        mode: 'edit',
        name: item.suggestedNode1.name,
        type: 'suggest',
        suggestionId: item.id,
        uuid: `${item.suggestedNode1.id}`,
        actionType: genericActionTypes.addParent,
        source: `${familyNodeId}`
      }
      if (newParent.gender === Gender.FEMALE) {
        parentDrawableNodes.motherNodes.push(newParent)
      } else {
        parentDrawableNodes.fatherNodes.push(newParent)
      }
    })

    suggestedNewParents.map(item => {
      const newParent: DrawableNode = {
        id: item.suggestedNode1.id,
        gender: item.suggestedNode1.gender,
        catag: 'suggestAnce',
        mode: 'edit',
        name: item.suggestedNode1.name,
        type: 'suggest',
        suggestionId: item.id,
        uuid: `${item.suggestedNode1.id}`,
        actionType: genericActionTypes.addParent,
        source: `${familyNodeId}`
      }
      if (newParent.gender === Gender.FEMALE) {
        parentDrawableNodes.motherNodes.push(newParent)
      } else {
        parentDrawableNodes.fatherNodes.push(newParent)
      }
    })
    return parentDrawableNodes
  }

  prepareSuggestedSingledChildren(familyNodeId: number): { daughterNodes: DrawableNode[]; sonNodes: DrawableNode[]; } {
    const parentDrawableNodes: {
      daughterNodes: DrawableNode[],
      sonNodes: DrawableNode[],
    } = {
      daughterNodes: [],
      sonNodes: [],
    }
    const suggestedSingledChildren = this.suggestionData(familyNodeId, SuggestableActions.ChildOfOneParent)
    suggestedSingledChildren.map(item => {
      const newChild: DrawableNode = {
        id: item.suggestedNode2.id,
        gender: item.suggestedNode2.gender,
        catag: 'suggestDesc',
        mode: 'edit',
        name: item.suggestedNode2.name,
        type: 'suggest',
        suggestionId: item.id,
        uuid: `${item.suggestedNode2.id}`,
        actionType: genericActionTypes.addChildOfOneParent,
        source: `${familyNodeId}`
      }
      if (newChild.gender === Gender.FEMALE) {
        parentDrawableNodes.daughterNodes.push(newChild)
      } else {
        parentDrawableNodes.sonNodes.push(newChild)
      }
    })
    return parentDrawableNodes
  }
  prepareSuggestedDoubledChildren(familyNodeId: number, partnerId: number): { daughterNodes: DrawableNode[]; sonNodes: DrawableNode[]; } {
    const parentDrawableNodes: {
      daughterNodes: DrawableNode[],
      sonNodes: DrawableNode[],
    } = {
      daughterNodes: [],
      sonNodes: [],
    }
    const suggestedDoubledChildren = this.suggestionData(familyNodeId, SuggestableActions.ChildOfTwoParents).filter(item => item.suggestedNode1?.id === partnerId)

    suggestedDoubledChildren.map(item => {
      const newChild: DrawableNode = {
        id: item.suggestedNode2.id,
        gender: item.suggestedNode2.gender,
        catag: 'suggestDesc',
        mode: 'edit',
        name: item.suggestedNode2.name,
        type: 'suggest',
        suggestionId: item.id,
        uuid: `${item.suggestedNode2.id}`,
        actionType: genericActionTypes.addChildOfTwoParents,
        source: `${partnerId}`
      }
      if (newChild.gender === Gender.FEMALE) {
        parentDrawableNodes.daughterNodes.push(newChild)
      } else {
        parentDrawableNodes.sonNodes.push(newChild)
      }
    })
    return parentDrawableNodes
  }
  prepareSuggestedPartners(familyNodeId: number): { maleNodes: DrawableNode[]; femaleNodes: DrawableNode[]; } {
    const parentDrawableNodes: {
      maleNodes: DrawableNode[],
      femaleNodes: DrawableNode[],
    } = {
      maleNodes: [],
      femaleNodes: [],
    }
    const suggestedNewPartner = this.suggestionData(familyNodeId, SuggestableActions.NewPartner)
    const suggestedExistingPartner = this.suggestionData(familyNodeId, SuggestableActions.ExistingPartner)


    suggestedNewPartner.map(item => {
      const newChild: DrawableNode = {
        id: item.suggestedNode1.id,
        gender: item.suggestedNode1.gender,
        catag: 'suggestDesc',
        mode: 'edit',
        name: item.suggestedNode1.name,
        type: 'suggest',
        suggestionId: item.id,
        uuid: `${item.suggestedNode1.id}`,
        actionType: genericActionTypes.addPartner,
        source: `${familyNodeId}`
      }
      if (newChild.gender === Gender.FEMALE) {
        parentDrawableNodes.femaleNodes.push(newChild)
      } else {
        parentDrawableNodes.maleNodes.push(newChild)
      }
    })
    return parentDrawableNodes
  }


}

