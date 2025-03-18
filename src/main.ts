import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { FamilyTreeService } from "./services/nodeCreationServices";
import { nodeManagmentService } from "./services/nodeManagmentService";
import { localStorageManager } from "./storage/storageManager";

// Initialize the FamilyTree class
localStorageManager.setItem('familyTreeId', 1);
const drawer = new FamilyTreeDrawer();
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
            drawer.fetchDataEditMode(nodesArray, 6, true);
            // alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
})();




const Service = new FamilyTreeService()


const endpointServiceMap = {
    addNewParent: Service.addNewParent,
    addExistingParent: Service.addExistingParent,
    addChildOfOneParent: Service.addChildOfOneParent,
    addChildOfTwoParents: Service.addChildOfTwoParents,
    addNewPartner: Service.addNewPartner,
    addExistingPartner: Service.addExistingPartner,
    addNewPartnerAsParent: Service.addNewPartnerAsParent,
    addExistingPartnerAsParent: Service.addExistingPartnerAsParent,
};


document.getElementById('familyTreeForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const endpoint = document.getElementById('postEndpoint')?.textContent;
    const data = Object.fromEntries(formData.entries());

    console.log("this is this", endpoint)
    if (endpointServiceMap[endpoint]) {
        try {
            console.log("Entry Data", data)

            const response = await endpointServiceMap[endpoint](data);
            console.log('Success:', response);
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
