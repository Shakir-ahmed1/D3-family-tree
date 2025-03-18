async function updateData<T>(url: string, data: T, bearerToken): Promise<Response> {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',

        },
        body: JSON.stringify(data),
    });
}
async function deleteNode<T>(url: string, bearerToken): Promise<Response> {
    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
        },
    });
}

export class NodeManagementService {
    private bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`
    constructor() {

    }


    async updateNode(familyTreeId, familyNodeId, data) {
        const updateUrl = `http://localhost:3000/api/family-tree/${familyTreeId}/nodes/${familyNodeId}`
        try {
            const
                response = await updateData(updateUrl, data, this.bearerToken)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result =  await response.json();
            console.log('updating node data successfull', result)
            return result;
        } catch (error) {
            console.error('Error fetching nodes array:', error);
            alert('Failed to fetch data. Check console for details.');
            return null;
        }

    }
    async deleteNode(familyTreeId, familyNodeId) {
        const deleteUri = `http://localhost:3000/api/family-tree/${familyTreeId}/node/${familyNodeId}`
        try {
            const
                response = await deleteNode(deleteUri, this.bearerToken)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            console.log('deleting node data successfull', result)
            return result;
        } catch (error) {
            console.error('Error fetching nodes array:', error);
            alert('Failed to fetch data. Check console for details.');
            return null;
        }

    }

    async fetchNodesArrays(familyTreeId) {
        const fetchNodesUri = `http://localhost:3000/api/family-tree/${familyTreeId}/relationsHeavy`
        try {
            const response = await fetch(fetchNodesUri, {
                method: 'GET',
                headers: {
                    'Authorization': this.bearerToken,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching nodes array:', error);
            alert('Failed to fetch data. Check console for details.');
            return null;
        }
    }
    
}

export const nodeManagmentService = new NodeManagementService();