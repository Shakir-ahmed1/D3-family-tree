import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";
import { RelationshipType } from "../relationship-type.enum";

export interface CreateNewPartnerInterface {
    otherNodeData: CreateNewPrimaryFamilyNodeInterface;
    partnershipType: RelationshipType;
}

export interface CreateExistingPartnerInterface {
    otherNodeId: number;
    partnershipType: RelationshipType;
}