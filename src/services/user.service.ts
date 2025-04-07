import { localStorageManager } from "../storage/storageManager";

export class UserService {
    constructor() {

    }
    getUserProfilePicture(userId) {
        const url = `http://localhost:3000/api/user/${userId}/profilePicture`
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': localStorageManager.getItem('bearerToken'),
            },
        });    }
}

export const userService = new UserService();