import { CreateNewPrimaryFamilyNodeInterface } from "../create-new-primary-family-node.dto";

export interface SuggestNewParentInterface {
    reason: string,
    parentNodeData: CreateNewPrimaryFamilyNodeInterface;
}

export interface SuggestExistingParentInterface {
    reason: string,
    parentNodeId: number;
}