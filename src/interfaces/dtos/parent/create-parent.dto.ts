import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";

export interface CreateNewParentInterface {
    parentNodeData: CreateNewPrimaryFamilyNodeInterface;
}

export interface CreateExistingParentInterface {
    parentNodeId: number;
}