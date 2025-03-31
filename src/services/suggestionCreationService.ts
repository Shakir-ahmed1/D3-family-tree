import { SuggestChildOfOneParentInterface, SuggestChildOfTwoParentsInterface } from "../dtos/child/suggest-child.dto";
import { CreateNewPrimaryFamilyNodeInterface } from "../dtos/create-new-primary-family-node.dto";
import { SuggestExistingParentInterface, SuggestNewParentInterface } from "../dtos/parent/suggest-parent.dto";
import { SuggestExistingPartnerAsParentInterface, SuggestExistingPartnerInterface, SuggestNewPartnerAsParentInterface, SuggestNewPartnerInterface } from "../dtos/spouse/suggest-partner.dto";
import { SuggestDeleteNodeInteface, SuggestUpdateNodeInteface } from "../dtos/suggest.dto";
import { localStorageManager } from "../storage/storageManager";

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

function constructNodeCreator(allData): CreateNewPrimaryFamilyNodeInterface {
    const newNode: CreateNewPrimaryFamilyNodeInterface = {
        name: allData.name,
        address: allData.address,
        gender: allData.gender,
        nickName: allData.nickName,
        ownedById: allData.ownedById,
        phone: allData.phone,
        title: allData.title
    }
    if (allData.birthDate) { newNode.birthDate = allData.birthDate }
    if (allData.deathDate) { newNode.deathDate = allData.deathDate }
    return newNode;
}

export class FamilyTreeSuggestionService {
    constructor() {
    }

    async suggestNewParent(data) {
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/parent/SuggestNewParent`;
        const nodeData = constructNodeCreator(data)
        const customData: SuggestNewParentInterface = {
            reason: data.reason,
            parentNodeData: nodeData
        }
        return postData(url, customData);
    }

    async suggestExistingParent(data) {
        const customData: SuggestExistingParentInterface = {
            reason: data.reason,
            parentNodeId: parseInt(data.parentNodeId)
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/parent/SuggestExitingParent`;
        return postData(url, customData);
    }

    async suggestChildOfOneParent(data) {
        const customData: SuggestChildOfOneParentInterface = {
            reason: data.reason,
            childNodeData: constructNodeCreator(data)
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/child/SuggestChildOfOneParent`;
        return postData(url, customData);
    }

    async suggestChildOfTwoParents(data) {
        const customData: SuggestChildOfTwoParentsInterface = {
            reason: data.reason,
            childNodeData: constructNodeCreator(data),
            partnerNodeId: parseInt(data.parentNodeId),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/child/SuggestChildOfTwoParents`;
        return postData(url, customData);
    }

    async suggestNewPartner(data) {
        const customData: SuggestNewPartnerInterface = {
            reason: data.reason,
            otherNodeData: constructNodeCreator(data),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/spouse/SuggestNewPartner`;
        return postData(url, customData);
    }

    async suggestExistingPartner(data) {
        const customData: SuggestExistingPartnerInterface = {
            reason: data.reason,
            otherNodeId: parseInt(data.otherNodeId),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/spouse/SuggestExistingPartner`;
        return postData(url, customData);
    }

    async suggestNewPartnerAsParent(data) {
        const customData: SuggestNewPartnerAsParentInterface = {
            reason: data.reason,
            childNodeId: parseInt(data.childNodeId),
            otherNodeData: constructNodeCreator(data),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/spouse/SuggestNewPartnerAsParent`;
        return postData(url, customData);
    }

    async suggestExistingPartnerAsParent(data) {
        const customData: SuggestExistingPartnerAsParentInterface = {
            reason: data.reason,
            childNodeId: parseInt(data.childNodeId),
            otherNodeId: parseInt(data.otherNodeId),
            partnershipType: data.partnershipType,
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/suggestions/${data.familyNodeId}/spouse/SuggestExistingPartnerAsParent`;
        return postData(url, customData);
    }
    async suggestUpdateNode(familyTreeId: number, familyNodeId: number, data) {
        const customData: SuggestUpdateNodeInteface = constructNodeCreator(data)
        const url = `${API_PREFIX}/${familyTreeId}/nodes/${familyNodeId}/suggestions/updateNode`;

        return putData(url, customData);
    }
    async suggestDeleteNode(data) {
        const customData: SuggestDeleteNodeInteface = {
            reason: data.reason,
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/nodes/${data.familyNodeId}/suggestions/deleteNode`;

        return putData(url, customData);
    }
}
