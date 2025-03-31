import { localStorageManager } from "./storage/storageManager";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { FamilyTreeService } from "./services/nodeCreationServices";
import { nodeManagmentService } from "./services/nodeManagmentService";
import { FamilyTreeSuggestionService } from "./services/suggestionCreationService"

// Initialize the FamilyTree class
localStorageManager.setItem('familyTreeId', 1);
const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`
localStorageManager.setItem('bearerToken', bearerToken)
// localStorageManager.setItem('bearerToken', bearerToken)
export const drawer = new FamilyTreeDrawer();
let nodesArray;
let fetchedNodesArray: any = null; // To store the fetched data

// Automatically fetch the nodes when the script loads
(async () => {
    try {
        const familyTreeId = localStorageManager.getItem('familyTreeId');
        nodesArray = await nodeManagmentService.fetchNodesArrays(familyTreeId);
        if (nodesArray) {
            fetchedNodesArray = nodesArray;
            console.log("Fetched Array Data", nodesArray);
            drawer.fetchData(nodesArray, 6, true);
            // alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
})();


const CreateService = new FamilyTreeService()
const SuggestionService = new FamilyTreeSuggestionService()


const endpointServiceMap = {
        addNewParent: CreateService.addNewParent,
        addExistingParent: CreateService.addExistingParent,
        addChildOfOneParent: CreateService.addChildOfOneParent,
        addChildOfTwoParents: CreateService.addChildOfTwoParents,
        addNewPartner: CreateService.addNewPartner,
        addExistingPartner: CreateService.addExistingPartner,
        addNewPartnerAsParent: CreateService.addNewPartnerAsParent,
        addExistingPartnerAsParent: CreateService.addExistingPartnerAsParent,
        suggestNewParent: SuggestionService.suggestNewParent,
        suggestExistingParent: SuggestionService.suggestExistingParent,
        suggestChildOfOneParent: SuggestionService.suggestChildOfOneParent,
        suggestChildOfTwoParents: SuggestionService.suggestChildOfTwoParents,
        suggestNewPartner: SuggestionService.suggestNewPartner,
        suggestExistingPartner: SuggestionService.suggestExistingPartner,
        suggestNewPartnerAsParent: SuggestionService.suggestNewPartnerAsParent,
        suggestExistingPartnerAsParent: SuggestionService.suggestExistingPartnerAsParent,
        suggestDeleteNode: SuggestionService.suggestDeleteNode,
        suggestUpdateNode: SuggestionService.suggestUpdateNode,
};