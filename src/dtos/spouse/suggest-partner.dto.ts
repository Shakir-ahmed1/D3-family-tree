import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";
import { RelationshipType } from "../relationship-type.enum";

export interface SuggestNewPartnerInterface {
    reason: string,
    otherNodeData: CreateNewPrimaryFamilyNodeInterface;
    partnershipType: RelationshipType;
}

export interface SuggestExistingPartnerInterface {
    reason: string,
    otherNodeId: number;
    partnershipType: RelationshipType;
}

export interface SuggestNewPartnerAsParentInterface {
    reason: string,
    otherNodeData: CreateNewPrimaryFamilyNodeInterface;
    partnershipType: RelationshipType;
    childNodeId: number;

}

export interface SuggestExistingPartnerAsParentInterface {
    reason: string,
    otherNodeId: number;
    partnershipType: RelationshipType;
    childNodeId: number;

}