import { ND } from "./dataManager";
import { CreateNewPrimaryFamilyNodeInterface } from "./dtos/create-new-primary-family-node.dto";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { requestActions } from './relations-structure'
import { FamilyTreeService } from "./services";


const drawer = new FamilyTreeDrawer();
let nodesArray;


let fetchedNodesArray: any = null; // To store the fetched data
// Function to fetch NODESARRAY from the provided API
async function fetchNodesArray(apiUrl: string, bearerToken: string) {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
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

// Function to clear the container
function clearContainer(containerId: string) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = ''; // Clear the container's content
    }
}

const apiForm = document.getElementById('apiForm') as HTMLFormElement;
apiForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get API URL and Bearer Token values
    const apiUrl = (document.getElementById('apiUrl') as HTMLInputElement).value;
    const bearerToken = (document.getElementById('bearerToken') as HTMLInputElement).value;

    // Fetch the nodes array
    nodesArray = await fetchNodesArray(apiUrl, bearerToken);

    // Store the fetched data globally
    if (nodesArray) {
        fetchedNodesArray = nodesArray;
        console.log("fetched Array Data", nodesArray)
        drawer.fetchDataEditMode(nodesArray, 6, true)
        alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
    }
});

// Event listener for the Self Node ID form
const viewChangeForm = document.getElementById('viewChangeForm') as HTMLFormElement;
viewChangeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!fetchedNodesArray) {
        alert('Please fetch data from the API first.');
        return;
    }

    // Get Self Node ID value
    const selfNodeIdInput = (document.getElementById('selfNodeId') as HTMLInputElement).value;
    const selfNodeId = parseInt(selfNodeIdInput, 6);

    if (isNaN(selfNodeId)) {
        alert('Please enter a valid Self Node ID (number).');
        return;
    }
    drawer.fetchDataEditMode(nodesArray, selfNodeId, false)

});

// Function to populate the request body field based on selected action
function populateRequestBody(actionTitle: string) {
    const action = requestActions.find((item) => item.actionTitle === actionTitle);
    if (action) {
        const requestBodyField = document.getElementById('requestBody') as HTMLTextAreaElement;
        requestBodyField.value = action.requestBody.trim();
    }
}
// Function to make a POST request
async function makePostRequest(uri: string, requestBody: any) {
    try {
        const response = await fetch(`http://localhost:3000${uri}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('POST Response:', responseData);
        alert('Node added successfully.');
    } catch (error) {
        console.error('Error making POST request:', error);
        alert('Failed to add the node. Check console for details.');
    }
}

// Event listener for the action selection dropdown
const actionSelect = document.getElementById('actionSelect') as HTMLSelectElement;
actionSelect.addEventListener('change', (event) => {
    const selectedAction = (event.target as HTMLSelectElement).value;
    populateRequestBody(selectedAction);
});

// Event listener for the form submission
const addNodeForm = document.getElementById('addNodeForm') as HTMLFormElement;
addNodeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectedAction = (document.getElementById('actionSelect') as HTMLSelectElement).value;
    const action = requestActions.find((item) => item.actionTitle === selectedAction);

    if (!action) {
        alert('Invalid action selected.');
        return;
    }

    const requestBodyField = document.getElementById('requestBody') as HTMLTextAreaElement;
    let requestBody;
    try {
        requestBody = JSON.parse(requestBodyField.value);
    } catch (error) {
        alert('Invalid JSON in request body.');
        return;
    }

    const familyTreeId = 1; // Replace with your dynamic familyTreeId if needed
    const uri = action.uri.replace('},{familyTreeId}', familyTreeId.toString());

    await makePostRequest(uri, requestBody);
});










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

const endpointFieldMap = {
    addExistingParent: ['otherNodeId'],
    addChildOfTwoParents: ['partnerNodeId', 'partnershipType'],
    addNewPartner: ['partnershipType'],
    addExistingPartner: ['otherNodeId', 'partnershipType'],
    addNewPartnerAsParent: ['partnershipType', 'childNodeId'],
    addExistingPartnerAsParent: ['otherNodeId', 'partnershipType', 'childNodeId'],
};

// document.getElementById('endpoint').addEventListener('change', function () {
//     const dynamicFields = document.getElementById('dynamicFields');
//     dynamicFields.innerHTML = '';

//     const fields = endpointFieldMap[selected] || [];
//     fields.forEach(field => {
//         const input = document.createElement('input');
//         input.type = 'text';
//         input.name = field;
//         input.placeholder = field;
//         input.required = true;
//         dynamicFields.appendChild(input);
//     });

// });
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
