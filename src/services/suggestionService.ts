import { localStorageManager } from "../storage/storageManager";

async function acceptOrReject<T>(url: string, bearerToken: string): Promise<Response> {
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
                response = await acceptOrReject(acceptOrRejectUrl, localStorageManager.getItem('bearerToken'))
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result =  await response.json();
            console.log(`Suggestion ${action} successfully`, result)
            return result;
        } catch (error) {
            console.error('Failed to parform action:', error);
            return null;
        }

    } 
}

export const suggestionService = new SuggestionService();
