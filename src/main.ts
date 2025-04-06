import { localStorageManager } from "./storage/storageManager";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { DataManager } from "./dataManager";

// Initialize the FamilyTree class
// USER 1
const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`

// USER 2
// const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMiIsImlhdCI6MTczOTUzNzQwNSwiZXhwIjoxODM5NjIzODA1fQ.VHkjd4KTeFg37uZIWdnXygJdma0aBt7fj9UiTVgaVzU`

// user 3
// const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMyIsImlhdCI6MTczOTU0MDE5OCwiZXhwIjoxODM5NjI2NTk4fQ.QD7mCMTLSKXawnPkjbEiQFGiy_FCXiyCWuh1Eg5zz0c'

localStorageManager.setItem('bearerToken', bearerToken)

const familyTreeId = 2
export const ND = new DataManager(familyTreeId);
export const drawer = new FamilyTreeDrawer(familyTreeId, 'treeContainer', 1000, 1000, false);


// function displayPopUp(familyTreeId, familyNodeId) {
//     const drawerPopUp = new FamilyTreeDrawer(familyTreeId, 'treePopUp', 500, 500, true, familyNodeId);
//     const svgContainer = document.getElementById('treePopUp')
//     svgContainer.style.pointerEvents = 'none'
// }
// displayPopUp(1, 1)
// // Automatically fetch the nodes when the script loads




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

