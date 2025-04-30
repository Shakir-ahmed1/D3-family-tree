import { CreateChildOfOneParentInterface, CreateChildOfTwoParentsInterface } from "../interfaces/dtos/child/create-child.dto";
import { CreateExistingParentInterface, CreateNewParentInterface } from "../interfaces/dtos/parent/create-parent.dto";
import { RelationshipType } from "../interfaces/dtos/relationship-type.enum";
import { CreateExistingPartnerInterface, CreateNewPartnerInterface } from "../interfaces/dtos/spouse/create-partner.dto";
import { formDataEntries } from "../interfaces/node.interface";
import { constructNodeCreator } from "../utils/utils";
import { localStorageManager } from "./storage-manager";


// Base API URL
const API_PREFIX = 'http://localhost:3000/api/family-tree';

// Helper function for POST requests
async function postData<T>(url: string, data: T, bearerToken: string): Promise<Response> {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
class FamilyTreeService {
    constructor() {
    }
    async addNewParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/parent/NewParent`;
        const nodeData = constructNodeCreator(data)
        const customData: CreateNewParentInterface = {
            parentNodeData: nodeData
        }
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

    async addExistingParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: CreateExistingParentInterface = {
            parentNodeId: parseInt(data['targetIdNodeId'] as string)
        }
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/parent/ExitingParent`;
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

    async addChildOfOneParent(familyTreeId: number, familyNodeId: number, data: formDataEntries) {

        const customData: CreateChildOfOneParentInterface = {
            childNodeData: constructNodeCreator(data)
        }
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/child/ChildOfOneParent`;
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

    async addChildOfTwoParents(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: CreateChildOfTwoParentsInterface = {
            childNodeData: constructNodeCreator(data),
            partnerNodeId: parseInt(data['targetIdNodeId'] as string),
        }
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/child/ChildOfTwoParents`;
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

    async addNewPartner(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: CreateNewPartnerInterface = {
            otherNodeData: constructNodeCreator(data),
            partnershipType: data["partnershipType"] as RelationshipType
        }
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/spouse/NewPartner`;
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

    async addExistingPartner(familyTreeId: number, familyNodeId: number, data: formDataEntries) {
        const customData: CreateExistingPartnerInterface = {
            otherNodeId: parseInt(data['targetIdNodeId'] as string),
            partnershipType: data["partnershipType"] as RelationshipType
        }
        const url = `${API_PREFIX}/${familyTreeId}/relations/${familyNodeId}/spouse/ExistingPartner`;
        return postData(url, customData, localStorageManager.getItem('bearerToken'));
    }

}

export const nodeCreationService = new FamilyTreeService()