import { localStorageManager } from "./storage/storageManager";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { nodeManagmentService } from "./services/nodeManagmentService";
import { CustomFlatData } from "./node.interface";
import { DataManager } from "./dataManager";

// Initialize the FamilyTree class
// USER 1
// const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`

// USER 2
const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMiIsImlhdCI6MTczOTUzNzQwNSwiZXhwIjoxODM5NjIzODA1fQ.VHkjd4KTeFg37uZIWdnXygJdma0aBt7fj9UiTVgaVzU`


localStorageManager.setItem('bearerToken', bearerToken)

const familyTreeId = 1
export const ND = new DataManager(familyTreeId);
export const drawer = new FamilyTreeDrawer(familyTreeId);


// Automatically fetch the nodes when the script loads
(async () => {
    try {
        let nodesArray: CustomFlatData = await nodeManagmentService.fetchNodesArrays(familyTreeId);
        if (nodesArray) {
            const founderNode = nodesArray.familyNodes.find(item => item.isFounder);
            if (founderNode) {
                drawer.fetchData(nodesArray, founderNode.id as number, true);
            } else {
                throw new Error('Founder Node Not Found')
            }
            // alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
})();



const sizeManagerForm = document.getElementById("sizeManager") as HTMLFormElement;

if (sizeManagerForm) {
    sizeManagerForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        const sizeInput = document.getElementById("size") as HTMLInputElement;

        const size = parseInt(sizeInput.value, 10);

        // Call the updateSVGSize method:
        if (drawer) { // ensure drawer is defined
            drawer.updateSVGSize(size);
        } else {
            console.error("drawer is undefined");
        }
    });
} else {
    console.error("Size manager form not found.");
}

