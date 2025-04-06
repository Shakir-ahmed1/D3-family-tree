import { localStorageManager } from "../storage/storageManager";

async function getRequest<T>(url: string, bearerToken: string): Promise<Response> {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': bearerToken,
        },
    });
}

export class SuggestionService {


    async acceptOrRejectSuggestion(familyTreeId, suggestionId, action) {
        const acceptOrRejectUrl = `http://localhost:3000/api/family-tree/${familyTreeId}/suggest-edit/${suggestionId}/${action}`

        try {
            const
                response = await getRequest(acceptOrRejectUrl, localStorageManager.getItem('bearerToken'))
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to parform action:', error);
            return null;
        }

    }

    async cancelSuggestion(familyTreeId, suggestionId) {
        const cancelUrl = `http://localhost:3000/api/family-tree/${familyTreeId}/suggest-edit/${suggestionId}/suggestion/cancel`

        try {
            const
                response = await getRequest(cancelUrl, localStorageManager.getItem('bearerToken'))
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to parform action:', error);
            return null;
        }

    }
}

export const suggestionService = new SuggestionService();
