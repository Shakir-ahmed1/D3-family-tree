import { SuggestChildOfOneParentInterface, SuggestChildOfTwoParentsInterface } from "../interfaces/dtos/child/suggest-child.dto";
import { SuggestExistingParentInterface, SuggestNewParentInterface } from "../interfaces/dtos/parent/suggest-parent.dto";
import { RelationshipType } from "../interfaces/dtos/relationship-type.enum";
import { SuggestExistingPartnerInterface, SuggestNewPartnerInterface } from "../interfaces/dtos/spouse/suggest-partner.dto";
import { SuggestDeleteNodeInteface, SuggestUpdateNodeInteface } from "../interfaces/dtos/suggest.dto";
import { formDataEntries } from "../interfaces/node.interface";
import { constructNodeCreator } from "../utils/utils";
import { localStorageManager } from "./storage-manager";

// Base API URL
const API_PREFIX = 'http://localhost:3000/api/family-tree';

// Helper function for POST requests
async function postData<T>(url: string, data: T): Promise<Response> {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': localStorageManager.getItem('bearerToken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

async function putData<T>(url: string, data: T): Promise<Response> {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': localStorageManager.getItem('bearerToken'),
            'Content-Type': 'application/json',

        },
        body: JSON.stringify(data),
    });
}



export class FamilyTreeSuggestionService {
    constructor() {
    }

    async suggestNewParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/parent/SuggestNewParent`;
        const nodeData = constructNodeCreator(data)
        const customData: SuggestNewParentInterface = {
            reason: data["reason"] as string,
            parentNodeData: nodeData
        }
        return postData(url, customData);
    }

    async suggestExistingParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestExistingParentInterface = {
            reason: data["reason"] as string,
            parentNodeId: parseInt(data["targetNodeId"] as string)
        }
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/parent/SuggestExistingParent`;
        return postData(url, customData);
    }

    async suggestChildOfOneParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestChildOfOneParentInterface = {
            reason: data["reason"] as string,
            childNodeData: constructNodeCreator(data)
        }
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/child/SuggestChildOfOneParent`;
        return postData(url, customData);
    }

    async suggestChildOfTwoParents(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestChildOfTwoParentsInterface = {
            reason: data["reason"] as string,
            childNodeData: constructNodeCreator(data),
            partnerNodeId: parseInt(data["targetNodeId"] as string),
            partnershipType: data["partnershipType"] as RelationshipType
        }
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/child/SuggestChildOfTwoParents`;
        return postData(url, customData);
    }

    async suggestNewPartner(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestNewPartnerInterface = {
            reason: data["reason"] as string,
            otherNodeData: constructNodeCreator(data),
            partnershipType: data["partnershipType"] as RelationshipType
        }
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/spouse/SuggestNewPartner`;
        return postData(url, customData);
    }

    async suggestExistingPartner(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestExistingPartnerInterface = {
            reason: data["reason"] as string,
            otherNodeId: parseInt(data["targetNodeId"] as string),
            partnershipType: data["partnershipType"] as RelationshipType
        }
        const url = `${API_PREFIX}/${familyTreeId}/suggestions/${familyNodeId}/spouse/SuggestExistingPartner`;
        return postData(url, customData);
    }

    async suggestUpdateNode(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestUpdateNodeInteface = {
            ...constructNodeCreator(data),
        }
        const url = `${API_PREFIX}/${familyTreeId}/nodes/${familyNodeId}/suggestions/updateNode`;

        return putData(url, customData);
    }
    async suggestDeleteNode(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: SuggestDeleteNodeInteface = {
            reason: data["reason"] as string,
        }
        const url = `${API_PREFIX}/${familyTreeId}/nodes/${familyNodeId}/suggestions/deleteNode`;

        return putData(url, customData);
    }
}
export const suggestionCreationService = new FamilyTreeSuggestionService()