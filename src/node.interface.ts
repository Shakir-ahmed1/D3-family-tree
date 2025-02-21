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