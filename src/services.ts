import { CreateChildOfOneParentInterface, CreateChildOfTwoParentsInterface } from "./dtos/child/create-child.dto";
import { CreateNewPrimaryFamilyNodeInterface } from "./dtos/create-new-primary-family-node.dto";
import { CreateExistingParentInterface, CreateNewParentInterface } from "./dtos/parent/create-parent.dto";
import { CreateExistingPartnerAsParentInterface, CreateExistingPartnerInterface, CreateNewPartnerAsParentInterface, CreateNewPartnerInterface } from "./dtos/spouse/create-partner.dto";


// Base API URL
const API_PREFIX = 'http://localhost:3000/api/family-tree';

// Helper function for POST requests
async function postData<T>(url: string, data: T): Promise<Response> {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`,
            'Content-Type': 'application/json',

        },
        body: JSON.stringify(data),
    });
}
function constructNodeCreator(allData): CreateNewPrimaryFamilyNodeInterface {
    const newNode: CreateNewPrimaryFamilyNodeInterface = {
        name: allData.name,
        address: allData.address,
        birthDate: allData.birthDate,
        deathDate: allData.deathDate,
        gender: allData.gender,
        nickName: allData.nickName,
        ownedById: allData.ownedById,
        phone: allData.phone,
        title: allData.title
    }
    return newNode;
}

export class FamilyTreeService {
    async addNewParent(data) {
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/parent/NewParent`;
        const nodeData = constructNodeCreator(data)
        const customData: CreateNewParentInterface = {
            parentNodeData: data
        }
        return postData(url, customData);
    }

    async addExistingParent(data) {
        const customData: CreateExistingParentInterface = {
            parentNodeId: data.parentNodeId
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/parent/ExitingParent`;
        return postData(url, customData);
    }

    async addChildOfOneParent(data) {

        const customData: CreateChildOfOneParentInterface = {
            childNodeData: constructNodeCreator(data)
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/child/ChildOfOneParent`;
        return postData(url, customData);
    }

    async addChildOfTwoParents(data) {
        const customData: CreateChildOfTwoParentsInterface = {
            childNodeData: constructNodeCreator(data),
            partnerNodeId: data.parentNodeId,
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/child/ChildOfTwoParents`;
        return postData(url, customData);
    }

    async addNewPartner(data) {
        const customData: CreateNewPartnerInterface = {
            otherNodeData: constructNodeCreator(data),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/spouse/NewPartner`;
        return postData(url, customData);
    }

    async addExistingPartner(data) {
        const customData: CreateExistingPartnerInterface = {
            otherNodeId: data.otherNodeId,
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/spouse/ExistingPartner`;
        return postData(url, customData);
    }

    async addNewPartnerAsParent(data) {
        const customData: CreateNewPartnerAsParentInterface = {
            childNodeId: data.childNodeId,
            otherNodeData: constructNodeCreator(data),
            partnershipType: data.partnershipType
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/spouse/NewPartnerAsParent`;
        return postData(url, customData);
    }

    async addExistingPartnerAsParent(data) {
        const customData: CreateExistingPartnerAsParentInterface = {
            childNodeId: data.childNodeId,
            otherNodeId: data.otherNodeId,
            partnershipType: data.partnershipType,
        }
        const url = `${API_PREFIX}/${data.familyTreeId}/relations/${data.familyNodeId}/spouse/ExistingPartnerAsParent`;
        return postData(url, customData);
    }
}
