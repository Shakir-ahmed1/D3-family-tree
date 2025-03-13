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
export interface CustomFlatData {
    familyNodes: FamilyNode[];
    parents: Parent[];
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
}
export interface DrawableNode {
    catag: 'ance' | 'desc' | 'editDesc' | 'editAnce' | undefined;
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
    type: 'spouse' | 'child' | 'root' | 'net';
    children?: DrawableNode[]
    source?: string;
    mode: 'edit' | 'node',
    actionType?: genericActionTypes;
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
