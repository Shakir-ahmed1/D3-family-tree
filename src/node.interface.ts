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
export interface DrawableNode {
    id: number,
    name: string;
    gender: string;
    father?: number;
    mother?: number;
    target?: number;
    spouses?: number[];
    type: 'spouse' | 'child' | 'root';
    children?: DrawableNode[]
}
export interface temporaryData {
    id: number;
    type: 'spouse' | 'child';
    target?: number;
    father?: number;
    mother?: number;
}
