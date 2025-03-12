import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";
import { RelationshipType } from "../relationship-type.enum";

export interface CreateChildOfOneParentInterface {
    childNodeData: CreateNewPrimaryFamilyNodeInterface
}

export interface CreateChildOfTwoParentsInterface {
    partnerNodeId: number;
    childNodeData: CreateNewPrimaryFamilyNodeInterface;
    partnershipType: RelationshipType;
}