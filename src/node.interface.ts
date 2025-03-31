export interface FamilyNode {
    id: number;
    generatedName: string;
    name: string;
    title: string;
    phone: string;
    address: string;
    gender: 'MALE' | 'FEMALE';
    nickName: string;
    birthDate: Date;
    deathDate: Date;
    createdAt: Date;
    updatedAt: Date;
    isSecondary: boolean;
    isFounder: boolean;
    parentRelationship: Parent;
}
export interface HrDataChild {
    id: number,
    children: HrDataChild[]
}
export interface HrDataParent {
    id: number,
    parents: HrDataParent[]
}
export interface Parent {
    id: number,
    femaleNode: FamilyNode,
    maleNode: FamilyNode;
}
export interface AllowedAction {
    id: number,
    pendingSuggestions: string[],
    relations: string[],
}
export interface CustomFlatData {
    familyNodes: FamilyNode[];
    parents: Parent[];
    contributors: Contributor[],
    suggestions: SuggestEdits[],
    allowedActions: AllowedAction[],
    canContribute: boolean,
    myInfo: FamilyTreeMembers | undefined
}
export interface Contributor {
    id: number,
    creators: FamilyTreeMembers[],
    suggestors: FamilyTreeMembers[],
    updators: FamilyTreeMembers[],
}
export interface FamilyTree {
    id: 1,
    name: string,
    description: string,
    isPrivate: false,
    createdAt: string,
    updatedAt: string,
}

export interface UserInfo {
    createdAt: string
    email: string,
    id: number,
    name: string,
    phone: string,
    profilePicUrl: string,
    updatedAt: string,
}

export interface FamilyTreeMembers {
    id: number;
    role: MemberRole;
    addedAt: Date;
    addedBy: FamilyTreeMembers;
    user: UserInfo;
}

export interface Relations {
    spouses: number[],
    children: number[],
    father?: number;
    mother?: number;
}
export interface CustomStructure {
    id: number;
    name: string;
    gender: string;
    // imageUrl: string;
    rels: Relations;
}
export enum actionTypes {
    addChildOfOneParent = "addChildOfOneParent",
    addChildOfTwoParents = "addChildOfTwoParents",
    addExistingParent = "addExistingParent",
    addNewParent = "addNewParent",
    addNewPartner = 'addNewPartner',
    addExistingPartner = "addExistingPartner",
    addNewPartnerAsParent = "addNewPartnerAsParent",
    addExistingPartnerAsParent = 'addExistingPartnerAsParent',
}

export enum genericActionTypes {
    addChildOfOneParent = "addChildOfOneParent",
    addChildOfTwoParents = "addChildOfTwoParents",
    addParent = "addParent",
    addPartner = 'addPartner',
    addPartnerAsParent = "addPartnerAsParent",
    DeleteNode = "DeleteNode",
    UpdateNode = 'UpdateNode',

}
export interface DrawableNode {
    catag: 'ance' | 'desc' | 'editDesc' | 'editAnce' | 'suggestAnce' | 'suggestDesc' | undefined;
    id: number,
    uuid: string,
    name: string;
    gender: string;
    father?: string;
    mother?: string;
    fatherId?: number;
    motherId?: number;
    target?: number;
    spouses?: number[];
    type: 'spouse' | 'child' | 'root' | 'net' | 'suggest';
    children?: DrawableNode[]
    source?: string;
    mode: 'edit' | 'node',
    actionType?: genericActionTypes;
    isLegal?: boolean;
    suggestionId?: number;
}
export interface temporaryData {
    id: number;
    uuid: string;
    type: 'spouse' | 'child';
    target?: number;
    father?: string;
    mother?: string;
    fatherId?: number;
    motherId?: number;
    source?: string

}


export enum SuggestEditStatus {
    PENDING = "PENDING",
    REJECTED = "REJECTED",
    ACCEPTED = "ACCEPTED",
    CANCELED = "CANCELED",
}

export interface SuggestEdits {
    id: number;
    reason: string;
    suggestedBy: FamilyTreeMembers;
    reviewedBy: FamilyTreeMembers;
    selfNode: FamilyNode;
    suggestedNode1: FamilyNode;
    suggestedNode2: FamilyNode;
    suggestedParentRelationship: Parent;
    status: SuggestEditStatus;
    suggestedAction: SuggestableActions;
    createdAt: Date;
    updatedAt: Date;
    familyTree: FamilyTree,
}


export enum SuggestableActions {
    ChildOfOneParent = "ChildOfOneParent",
    ChildOfTwoParents = "ChildOfTwoParents",

    ExistingParent = "ExistingParent",
    NewParent = "NewParent",

    NewPartner = 'NewPartner',
    ExistingPartner = "ExistingPartner",
    NewPartnerAsParent = "NewPartnerAsParent",
    ExistingPartnerAsParent = 'ExistingPartnerAsParent',

    DeleteNode = "DeleteNode",
    UpdateNode = 'UpdateNode'
}

export enum MemberRole {
    ADMIN = 'ADMIN',
    CONTRIBUTER = 'CONTRIBUTER',
    VIEWER = 'VIEWER',
}

