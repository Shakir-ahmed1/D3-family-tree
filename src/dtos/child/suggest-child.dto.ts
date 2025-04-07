import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";
import { RelationshipType } from "../relationship-type.enum";

export interface SuggestChildOfOneParentInterface {
    reason: string,
    childNodeData: CreateNewPrimaryFamilyNodeInterface
}

export interface SuggestChildOfTwoParentsInterface {
    reason: string,
    partnerNodeId: number;
    childNodeData: CreateNewPrimaryFamilyNodeInterface;
    partnershipType: RelationshipType;
}