import { localStorageManager } from "../storage/storageManager";

async function updateData<T>(url: string, data: T, bearerToken: string): Promise<Response> {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

async function deleteNodeRequest<T>(url: string, bearerToken: string): Promise<Response> {
    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
        },
    });
}

export class NodeManagementService {
    constructor() {}

    async updateNode(familyTreeId: string, familyNodeId: string, data: any) {
        const updateUrl = `http://localhost:3000/api/family-tree/${familyTreeId}/nodes/${familyNodeId}`;
        try {
            const bearerToken = localStorageManager.getItem('bearerToken');
            if (!bearerToken) throw new Error('No bearer token found');

            const response = await updateData(updateUrl, data, bearerToken);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating node:', error);
            return { error: 'Failed to update node' };
        }
    }

    async deleteNode(familyTreeId: string, familyNodeId: string) {
        const deleteUri = `http://localhost:3000/api/family-tree/${familyTreeId}/node/${familyNodeId}`;
        try {
            const bearerToken = localStorageManager.getItem('bearerToken');
            if (!bearerToken) throw new Error('No bearer token found');

            const response = await deleteNodeRequest(deleteUri, bearerToken);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting node:', error);
            return { error: 'Failed to delete node' };
        }
    }

    async fetchNodesArrays(familyTreeId: string) {
        const fetchNodesUri = `http://localhost:3000/api/family-tree/${familyTreeId}/relationsHeavy`;
        try {
            const bearerToken = localStorageManager.getItem('bearerToken');
            if (!bearerToken) throw new Error('No bearer token found');

            const response = await fetch(fetchNodesUri, {
                method: 'GET',
                headers: {
                    'Authorization': bearerToken,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('Error fetching nodes array:', error);
            return { error: 'Failed to fetch data' };
        }
    }
}

export const nodeManagmentService = new NodeManagementService();
