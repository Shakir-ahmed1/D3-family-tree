import { timeFormatLocale } from "d3";
import { drawer, ND } from "./main";
import { actionTypes, FamilyNode, FamilyTreeMembers, genericActionTypes, SuggestableActions, SuggestEdits } from "./node.interface";
import { nodeCreationService } from "./services/nodeCreationServices";
import { nodeManagmentService } from "./services/nodeManagmentService";
import { FamilyTreeSuggestionService, suggestionCreationService } from "./services/suggestionCreationService";
import { suggestionService } from "./services/suggestionService";
import { userService } from "./services/user.service";
import { localStorageManager } from "./storage/storageManager";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";


function memberDisplayer(title, member) {

    const suggestionContainer = document.createElement('div');
    suggestionContainer.style.border = '1px black solid';
    suggestionContainer.style.marginBottom = '5px';

    const suggestingMember = createUserProfileElement(member);
    const field = document.createElement('p');
    field.textContent = title + ': '
    suggestionContainer.appendChild(field);
    suggestionContainer.appendChild(suggestingMember)
    return suggestionContainer
}



function otherNodeDetails(familyNode: FamilyNode) {
    const wrapper = document.createElement('div');

    // Create the title and toggle button container
    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';
    titleWrapper.style.cursor = 'pointer';
    titleWrapper.style.width = '100%';

    const title = document.createElement('p');
    title.textContent = 'Other details';
    title.style.fontSize = '20px';
    title.style.margin = '0';
    title.style.flexShrink = '0';

    const line = document.createElement('hr');
    line.style.flexGrow = '1';
    line.style.marginLeft = '10px';

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(line);
    wrapper.appendChild(titleWrapper);

    // Content container (initially hidden)
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'none';
    contentWrapper.style.marginLeft = '30px';

    function memberFormer(title: string, member: any) {
        const membersContainer = document.createElement('div');
        membersContainer.style.border = 'gray 1px solid';
        membersContainer.style.display = 'flex';
        membersContainer.style.alignItems = 'center';
        membersContainer.style.paddingLeft = '10px';

        const creatorsTitle = document.createElement('p');
        creatorsTitle.textContent = title + ':';
        creatorsTitle.style.marginRight = '20px';

        membersContainer.appendChild(creatorsTitle);

        const memberElement = createUserProfileElement(member);
        membersContainer.appendChild(memberElement);

        return membersContainer;
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }

    function createInfoRow(label: string, value: string) {
        const infoRow = document.createElement('div');
        infoRow.style.display = 'flex';
        infoRow.style.alignItems = 'center';

        const labelElement = document.createElement('p');
        labelElement.textContent = `${label}:`;
        labelElement.style.marginRight = '10px';
        labelElement.style.fontWeight = 'bold';

        const valueElement = document.createElement('p');
        valueElement.textContent = value;

        infoRow.appendChild(labelElement);
        infoRow.appendChild(valueElement);

        return infoRow;
    }

    if (familyNode.ownedBy) {
        contentWrapper.appendChild(memberFormer('Owned by', familyNode.ownedBy));
    }
    if (familyNode.createdBy) {
        contentWrapper.appendChild(memberFormer('Created by', familyNode.createdBy));
    }
    if (familyNode.suggestedBy) {
        contentWrapper.appendChild(memberFormer('Suggested by', familyNode.suggestedBy));
    }

    if (familyNode.createdAt) {
        contentWrapper.appendChild(createInfoRow('Created at', formatDate(familyNode.createdAt)));
    }
    if (familyNode.updatedAt) {
        contentWrapper.appendChild(createInfoRow('Updated at', formatDate(familyNode.updatedAt)));
    }

    wrapper.appendChild(contentWrapper);

    // Toggle functionality
    titleWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        contentWrapper.style.display = contentWrapper.style.display === 'none' ? 'block' : 'none';
    });

    return wrapper;
}



// Colors for background selection
const backgroundColors = ["#1E1E1E", "#2C3E50", "#34495E", "#8E44AD", "#C0392B", "#16A085", "#D35400", "#2980B9"]


// Function to generate a temporary profile picture
function generateTemporaryProfilePicture(userName) {
    const firstLetter = userName.charAt(0).toUpperCase();
    const colorIndex = userName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 8;
    const bgColor1 = backgroundColors[colorIndex];
    const bgColor2 = backgroundColors[(colorIndex + 3) % 8]; // Second color for gradient

    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, bgColor1);
        gradient.addColorStop(1, bgColor2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(firstLetter, canvas.width / 2, canvas.height / 2);
    }

    return canvas.toDataURL();
}

function createUserProfileElement(familyTreeMember) {
    if (!familyTreeMember || !familyTreeMember.user) {
        console.error("Invalid familyTreeMember object");
        return null;
    }

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "10px";
    container.style.padding = '10px 2px'

    // Create name element
    const nameElement = document.createElement("span");
    nameElement.textContent = familyTreeMember.user.name;
    nameElement.style.fontSize = "16px";
    nameElement.style.fontWeight = "bold";

    // Create profile picture element
    const profilePic = document.createElement("img");
    profilePic.alt = `${familyTreeMember.user.name}'s profile picture`;
    profilePic.style.width = "40px"; // 5x relative size
    profilePic.style.height = "40px";
    profilePic.style.borderRadius = "50%";
    profilePic.style.objectFit = "cover";
    // profilePic.src = generateTemporaryProfilePicture(familyTreeMember.user.name);

    // Fetch profile picture from UserService
    userService.getUserProfilePicture(familyTreeMember.user.id)
        .then(response => {
            if (!response.ok) {
                throw new Error("No profile picture available");
            }
            return response.blob();
        })
        .then(blob => {
            profilePic.src = URL.createObjectURL(blob);
        })
        .catch(() => {
            // Generate temporary profile picture if the user has no profile picture
            profilePic.src = generateTemporaryProfilePicture(familyTreeMember.user.name);
        });

    // Append elements in order
    container.appendChild(profilePic);
    container.appendChild(nameElement);

    return container;
}


function contributorDetailElement(title: string, contributors: FamilyTreeMembers[]) {
    const wrapper = document.createElement('div')
    const creatorsTitle = document.createElement('p')
    creatorsTitle.textContent = title
    wrapper.appendChild(creatorsTitle)
    contributors.map(item => {
        const creator = createUserProfileElement(item)
        wrapper.appendChild(creator)
    })
    return wrapper

}
function contributorsElementGenerator(contributors) {
    const contributionWrapper = document.createElement('div');

    // Create the title and toggle button container
    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';
    titleWrapper.style.cursor = 'pointer';
    titleWrapper.style.width = '100%';

    const title = document.createElement('p');
    title.textContent = 'Allowed contributors';
    title.style.fontSize = '20px';
    title.style.margin = '0';
    title.style.flexShrink = '0'; // Ensures the text stays on the left

    // const toggleButton = document.createElement('button');
    // toggleButton.textContent = '[+]';
    // toggleButton.style.border = 'none';
    // toggleButton.style.background = 'none';
    // toggleButton.style.cursor = 'pointer';
    // toggleButton.style.fontSize = '18px';

    const line = document.createElement('hr');
    line.style.flexGrow = '1';
    line.style.marginLeft = '10px';

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(line);
    // titleWrapper.appendChild(toggleButton);
    contributionWrapper.appendChild(titleWrapper);

    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'none'; // Initially hidden
    contentWrapper.style.marginLeft = '30px'

    if (contributors) {
        contentWrapper.appendChild(contributorDetailElement('creators', contributors.creators));
        contentWrapper.appendChild(document.createElement('hr'));
        contentWrapper.appendChild(contributorDetailElement('updators', contributors.updators));
        contentWrapper.appendChild(document.createElement('hr'));
        contentWrapper.appendChild(contributorDetailElement('suggestors', contributors.suggestors));
    }

    contributionWrapper.appendChild(contentWrapper);

    // Toggle functionality
    contributionWrapper.addEventListener('click', (e) => {
        e.preventDefault()
        if (contentWrapper.style.display === 'none') {
            contentWrapper.style.display = 'block';
            // toggleButton.textContent = '[-]';
        } else {
            contentWrapper.style.display = 'none';
            // toggleButton.textContent = '[+]';
        }
    });

    return contributionWrapper;
}

function createDropdown(nodes: { id: string, name: string }[], identifier, message, zeroMessage): HTMLSelectElement {
    // Create a select element
    if (nodes.length === 0) {
        const select = document.createElement("select");

        // Create and append the default option
        select.id = identifier
        select.name = identifier
        select.className = 'dynamic-input'
        const defaultOption = document.createElement("option");
        defaultOption.textContent = zeroMessage;
        defaultOption.value = "";
        select.appendChild(defaultOption);
        select.disabled = true;


        const saveButton = document.getElementById('allowed-save');
        console.log('save butttttttttttttttttttt', saveButton)
        saveButton.disabled = true
        saveButton.style.backgroundColor = '#AAAAAA'

        return select
    }
    const select = document.createElement("select");

    // Create and append the default option
    select.id = identifier
    select.name = identifier
    select.className = 'dynamic-input'
    const defaultOption = document.createElement("option");
    defaultOption.textContent = message;
    defaultOption.value = "";
    select.appendChild(defaultOption);

    // Create and append options for each node
    nodes.forEach(node => {
        const option = document.createElement("option");
        option.value = `${node.id}`;
        option.textContent = node.name;
        select.appendChild(option);
    });

    // Add an event listener to capture selection
    select.addEventListener("change", () => {
        if (select.value) {
            console.log("Selected Node ID:", select.value);
        }
    });

    return select;
}

// Example usage


export class HtmlElementsManager {
    private treeDrawer
    private familyTreeId: number;
    private rootNodeId: number;
    public nodeManager;
    private relationType = [
        { id: 'UNKNOWN', name: 'UNKNOWN' },
        { id: 'EX', name: 'EX' },
        { id: 'FRIEND', name: 'FRIEND' },
        { id: 'MAIN', name: 'MAIN' },
    ]
    constructor(familyTreeId: number, rootNodeId: number, drawer) {
        // disable any click events for the pop up

        this.treeDrawer = drawer
        this.rootNodeId = rootNodeId
        this.familyTreeId = familyTreeId;
        this.nodeManager = ND
        this.initTabs();

        const modeButton = document.getElementById('modeType')
        modeButton.addEventListener('click', (event) => {
            this.treeDrawer.toggleModes()
        });
    }
    setModeType(text) {
        const modeButton = document.getElementById('modeType')
        modeButton.textContent = text
    }

    initTabs() {
        document.getElementById('detailsTab').addEventListener('click', () => this.showTab('details'));
        document.getElementById('imagesTab').addEventListener('click', () => this.showTab('images'));
        document.getElementById('notesTab').addEventListener('click', () => this.showTab('notes'));

        if (this.nodeManager?.data?.canContribute) {
            const editTab = document.createElement('div');
            editTab.className = 'tab';
            editTab.id = 'editSuggestionsTab';
            editTab.textContent = 'Edit Suggestions';
            editTab.addEventListener('click', () => this.showTab('editSuggestions'));

            // Insert after notesTab for consistent order
            const notesTab = document.getElementById('notesTab');
            notesTab.parentNode.insertBefore(editTab, notesTab.nextSibling);
        }
    }


    showTab(tab) {
        // Get all existing tabs dynamically
        const allTabElements = document.querySelectorAll('.tab');

        allTabElements.forEach(tabEl => {
            const id = tabEl.id.replace('Tab', ''); // Extract 'details', 'images', etc.
            const content = document.getElementById(`${id}Content`);
            if (content) {
                content.classList.add('hidden');
            }
            tabEl.classList.remove('active');
        });

        // Show the selected tab and its content
        const selectedContent = document.getElementById(`${tab}Content`);
        const selectedTab = document.getElementById(`${tab}Tab`);


        if (selectedContent) selectedContent.classList.remove('hidden');
        if (selectedTab) selectedTab.classList.add('active');

        if (tab === 'editSuggestions') {
            this.displaySuggestionUpdateEdits(this.rootNodeId)
        }
    }
    reviewUpdateSuggestionBody(suggestionObject: SuggestEdits) {
        const rootNodeId = this.rootNodeId
        const rootNodeData = this.nodeManager.getNode(rootNodeId)
        const suggestionContainer = document.createElement('div');
        suggestionContainer.style.border = '1px black solid';
        suggestionContainer.style.marginBottom = '5px';

        const suggestingMember = createUserProfileElement(suggestionObject.suggestedBy);
        suggestionContainer.appendChild(suggestingMember)
        const field = document.createElement('p');
        field.innerHTML = `<strong>Reason:</strong> ${suggestionObject.reason || 'N/A'}`;
        field.className = 'dynamic-input';
        suggestionContainer.appendChild(field);
        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            if (suggestionObject.suggestedNode1[key]) {

                const field = document.createElement('p');
                const existingValue = `<span class="old-data">${rootNodeData[key] || ''}</span>`
                field.innerHTML = `<strong>${key}:</strong>${rootNodeData[key] ? existingValue : ''}<span class="new-data">${suggestionObject.suggestedNode1[key] || 'N/A'}</span>`;
                field.className = 'dynamic-input';
                suggestionContainer.appendChild(field);
            }
        });

        if (this.nodeManager.canUpdate(rootNodeId)) {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'buttonPrimary';

            acceptButton.addEventListener('click', async (e) => {
                e.preventDefault()

                const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted')
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId)

                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()
            });

            suggestionContainer.appendChild(acceptButton);
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'buttonSecondary';
            suggestionContainer.appendChild(rejectButton);
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault()
                const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected')
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId)
                // this.createViewMode(rootNode, memberPriviledge)
                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()

            });

        }
        const isSuggestor = suggestionObject.suggestedBy.id === this.nodeManager.data.myInfo?.id
        console.log("is Suggestor", isSuggestor, suggestionObject.suggestedBy.id, this.nodeManager.data.myInfo?.id)
        if (isSuggestor) {

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'buttonPrimary';
            suggestionContainer.appendChild(cancelButton);
            cancelButton.addEventListener('click', async (e) => {
                e.preventDefault()
                const updatedNode = await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id)

                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId)
                // this.createViewMode(rootNode, memberPriviledge)
                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()

            });
        }

        return suggestionContainer
    }
    reviewDeletionSuggestionBody(suggestionObject: SuggestEdits) {
        const rootNodeId = this.rootNodeId
        const rootNodeData = this.nodeManager.getNode(rootNodeId)
        const suggestionContainer = document.createElement('div');
        suggestionContainer.style.border = '1px black solid';
        suggestionContainer.style.marginBottom = '5px';

        const suggestingMember = createUserProfileElement(suggestionObject.suggestedBy);
        suggestionContainer.appendChild(suggestingMember)
        const field = document.createElement('p');
        field.innerHTML = `<strong>Reason:</strong> ${suggestionObject.reason || 'N/A'}`;
        field.className = 'dynamic-input';
        suggestionContainer.appendChild(field);

        const message = document.createElement('p');
        message.innerHTML = `Delete <strong style="color: red;">${rootNodeData.name}?</strong>`;
        message.className = 'dynamic-input';
        suggestionContainer.appendChild(message);

        if (this.nodeManager.canCreate(rootNodeId)) {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'buttonPrimary';

            acceptButton.addEventListener('click', async (e) => {
                e.preventDefault()

                const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted')
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                const previousNodeId = this.treeDrawer.popRootHistory(this.rootNodeId)
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, previousNodeId, true);
                    this.treeDrawer.toggleModes(previousNodeId, 'view')
                }

                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()
            });

            suggestionContainer.appendChild(acceptButton);
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'buttonSecondary';
            suggestionContainer.appendChild(rejectButton);
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault()
                const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected')
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId)
                // this.createViewMode(rootNode, memberPriviledge)
                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()

            });

        }
        const isSuggestor = suggestionObject.suggestedBy.id === this.nodeManager.data.myInfo?.id
        console.log("is Suggestor", isSuggestor, suggestionObject.suggestedBy.id, this.nodeManager.data.myInfo?.id)
        if (isSuggestor) {

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'buttonPrimary';
            suggestionContainer.appendChild(cancelButton);
            cancelButton.addEventListener('click', async (e) => {
                e.preventDefault()
                const updatedNode = await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id)

                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId)
                // this.createViewMode(rootNode, memberPriviledge)
                this.displaySuggestionUpdateEdits(rootNodeId)
                this.treeDrawer.updateNodesNameText()

            });
        }

        return suggestionContainer
    }
    displaySuggestionUpdateEdits(familyNodeId) {
        const pendingSuggestionsDisplayer = document.getElementById('pendingUpdateSuggestions');
        pendingSuggestionsDisplayer.innerHTML = '';
        const nodesSuggestions = this.nodeManager.getNodeSuggestions(familyNodeId).filter(item => item.suggestedAction === SuggestableActions.UpdateNode || item.suggestedAction === SuggestableActions.DeleteNode)
        if (nodesSuggestions.length === 0) {
            const message = document.createElement('p')
            message.textContent = 'No pending suggestions';
            message.style.textAlign = 'center'
            pendingSuggestionsDisplayer?.appendChild(message)
        } else {

            nodesSuggestions.map(item => {
                if (item.suggestedAction === SuggestableActions.UpdateNode) {
                    const suggestionBody = this.reviewUpdateSuggestionBody(item)
                    pendingSuggestionsDisplayer.appendChild(suggestionBody)
                }
                else if (item.suggestedAction === SuggestableActions.DeleteNode) {
                    const suggestionBody = this.reviewDeletionSuggestionBody(item)
                    pendingSuggestionsDisplayer.appendChild(suggestionBody)
                }
            })
        }

    }


    setActionTypeLabel(actionType: actionTypes, node, currentNodeId) {
        this.rootNodeId = currentNodeId;
        let memberPriviledge = this.nodeManager.memberPriviledge(1, currentNodeId);
        const currentMembmerMode = (memberPriviledge === 'create' || memberPriviledge === 'only-create') ? 'create' : 'suggest';
        // 'suggest'; // 'create' or 'suggest
        const dynamicFields = document.getElementById('dynamicFields');

        dynamicFields.innerHTML = '';
        const endpointFieldMapNew = {
            addParent: {
                new: {
                    endpoint: { create: 'addNewParent', suggest: 'suggestNewParent' },
                    label: { create: { MALE: "Add New Father", FEMALE: "Add New Mother" }, suggest: { MALE: "Suggest New Father", FEMALE: "Suggest New Mother" } },
                    fields: ['partnerNodeData']
                },
                existing: {
                    endpoint: { create: 'addExistingParent', suggest: 'suggestExistingParent' },
                    label: { create: { MALE: "Add Exiting Father", FEMALE: "Add Exiting Mother" }, suggest: { MALE: "Suggest Exiting Father", FEMALE: "Suggest Exiting Mother" } },
                    fields: ['partnershipType', 'targetNodeId']
                },
            },
            addChildOfTwoParents: {
                new: {
                    endpoint: { create: 'addChildOfTwoParents', suggest: 'suggestChildOfTwoParents' },
                    label: { create: { MALE: "Add Son of Two Parents", FEMALE: "Add Daughter of Two Parents" }, suggest: { MALE: "Suggest Son of Two Parents", FEMALE: "Suggest Daughter of Two Parents" } },
                    fields: ['targetNodeId', 'childNodeData']
                }
            },
            addChildOfOneParent: {
                new: {
                    endpoint: { create: 'addChildOfOneParent', suggest: 'suggestChildOfOneParent' },
                    label: { create: { MALE: "Add Son of One Parent", FEMALE: "Add Daughter of One Parent" }, suggest: { MALE: "Suggest Son of One Parent", FEMALE: "Suggest Daughter of One Parent" } },
                    fields: ['childNodeData']
                }
            },
            addPartner: {
                new: {
                    endpoint: { create: 'addNewPartner', suggest: 'suggestNewPartner' },
                    label: { create: { MALE: "Add New Partner", FEMALE: "Add New Partner" }, suggest: { MALE: "Suggest New Partner", FEMALE: "Suggest New Partner" } },
                    fields: ['partnershipType', 'partnerNodeData']
                },
                existing: {
                    endpoint: { create: 'addExistingPartner', suggest: 'suggestExistingPartner' },
                    label: { create: { MALE: "Add Existing Partner", FEMALE: "Add Existing Partner" }, suggest: { MALE: "Suggest Existing Partner", FEMALE: "Suggest Existing Partner" } },
                    fields: ['partnershipType', 'targetNodeId']
                },
            },
        };
        const generateFields = (option) => {
            const fields = actionOptions[option].fields;
            dynamicFields.querySelectorAll('.dynamic-input').forEach(el => el.remove());

            if (currentMembmerMode === 'suggest') {
                const name = 'reason'
                const input = document.createElement('input');
                input.type = 'text';
                input.id = name;
                input.name = name;
                input.placeholder = name.replace(/([A-Z])/g, ' $1').trim();
                input.required = true;
                input.className = 'dynamic-input';
                input.required = false
                dynamicFields.appendChild(input);
            }
            fields.forEach(field => {
                if (field.includes('Data')) {
                    const h2 = document.createElement('h2');
                    h2.textContent = field;
                    h2.className = 'dynamic-input';
                    dynamicFields.appendChild(h2);

                    ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach(name => {
                        const input = document.createElement('input');
                        input.type = name.includes('Date') ? 'date' : 'text';
                        input.id = name;
                        input.name = name;
                        input.placeholder = name.replace(/([A-Z])/g, ' $1').trim();
                        input.required = true;
                        input.className = 'dynamic-input';
                        input.required = false
                        if (name === 'gender') {
                            input.value = node.data.gender
                        }
                        if (name === 'name' || name === 'gender') {
                            input.required = true
                        }
                        dynamicFields.appendChild(input);
                    });
                }




                else if (field === 'targetNodeId' && actionType !== actionTypes.addChildOfTwoParents) {
                    console.log("HYYYYYY");

                    nodeManagmentService.fetchMarriableNodes(this.familyTreeId, this.rootNodeId)
                        .then(item => {

                            const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing Node', 'Couldn\'t find a possible pair');

                            const referenceElement = document.getElementById('actionOptionSelect');

                            if (referenceElement && referenceElement.parentNode === dynamicFields) {
                                // Insert dropdown after referenceElement
                                if (referenceElement.nextSibling) {
                                    dynamicFields.insertBefore(dropdown, referenceElement.nextSibling);
                                } else {
                                    // If it's the last child, just append
                                    dynamicFields.appendChild(dropdown);
                                }
                            } else {
                                console.warn("referenceElement not found or not a child of dynamicFields");
                                dynamicFields.appendChild(dropdown); // Fallback
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching marriable nodes:", error);
                        });
                }

                // else if (field === 'targetNodeId' && actionType === actionTypes.addExistingPartner) {
                //     console.log("HYYYYYY");

                //     nodeManagmentService.fetchMarriableNodes(this.familyTreeId, this.rootNodeId)
                //         .then(item => {
                //             const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing Node');

                //             const referenceElement = document.getElementById('actionOptionSelect');

                //             if (referenceElement && referenceElement.parentNode === dynamicFields) {
                //                 // Insert dropdown after referenceElement
                //                 if (referenceElement.nextSibling) {
                //                     dynamicFields.insertBefore(dropdown, referenceElement.nextSibling);
                //                 } else {
                //                     // If it's the last child, just append
                //                     dynamicFields.appendChild(dropdown);
                //                 }
                //             } else {
                //                 console.warn("referenceElement not found or not a child of dynamicFields");
                //                 dynamicFields.appendChild(dropdown); // Fallback
                //             }
                //         })
                //         .catch(error => {
                //             console.error("Error fetching marriable nodes:", error);
                //         });
                // }












                else if (field === 'partnershipType') {
                    dynamicFields.appendChild(createDropdown(this.relationType, 'partnershipType', 'select relationship Status'))
                }
                else if (field.endsWith('Id')) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = field;
                    input.placeholder = field;
                    input.required = true;
                    input.className = 'dynamic-input';
                    if (actionType === 'addChildOfTwoParents' && field === 'targetNodeId') {
                        const partnerId = node.data.motherId === currentNodeId ? node.data.fatherId : node.data.motherId
                        input.value = partnerId;
                        const p = document.createElement('p');
                        const partnerNode = this.nodeManager.getNode(partnerId)
                        p.textContent = `Partner: ${partnerNode.name}`
                        dynamicFields?.appendChild(p)
                    }
                    dynamicFields.appendChild(input);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.name = field;
                    input.placeholder = field;
                    input.required = true;
                    input.className = 'dynamic-input';
                    dynamicFields.appendChild(input);
                }
            });


            const saveButton = document.createElement('button')
            saveButton.textContent = 'Save'
            saveButton.id = 'allowed-save'
            saveButton.className = 'dynamic-input'
            saveButton.addEventListener('click', async (e) => {
                const endpointServiceMap = {
                    addNewParent: nodeCreationService.addNewParent,
                    addExistingParent: nodeCreationService.addExistingParent,
                    addChildOfOneParent: nodeCreationService.addChildOfOneParent,
                    addChildOfTwoParents: nodeCreationService.addChildOfTwoParents,
                    addNewPartner: nodeCreationService.addNewPartner,
                    addExistingPartner: nodeCreationService.addExistingPartner,
                    suggestNewParent: suggestionCreationService.suggestNewParent,
                    suggestExistingParent: suggestionCreationService.suggestExistingParent,
                    suggestChildOfOneParent: suggestionCreationService.suggestChildOfOneParent,
                    suggestChildOfTwoParents: suggestionCreationService.suggestChildOfTwoParents,
                    suggestNewPartner: suggestionCreationService.suggestNewPartner,
                    suggestExistingPartner: suggestionCreationService.suggestExistingPartner,
                    suggestDeleteNode: suggestionCreationService.suggestDeleteNode,
                    suggestUpdateNode: suggestionCreationService.suggestUpdateNode,
                }; e.preventDefault();
                const familyTreeForm = document.getElementById('familyTreeForm')
                const formData = new FormData(familyTreeForm);
                const endpoint = localStorageManager.getItem('postEndpoint');
                const data = Object.fromEntries(formData.entries());
                if (endpointServiceMap[endpoint]) {
                    try {

                        const response = await endpointServiceMap[endpoint](this.familyTreeId, this.rootNodeId, data);

                        const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                        if (nodesArray) {
                            this.treeDrawer.fetchData(nodesArray, this.rootNodeId, true);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }

                }

                // const updatedData = {};
                // Object.keys(formData).forEach(key => {
                //     if (formData[key].value) {
                //         updatedData[key] = formData[key].value;
                //     }
                // });
                const currentData = await this.nodeManager.getNode(currentNodeId)
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, currentNodeId)
                this.createViewMode(currentData, memberPriviledge);
            });
            dynamicFields.appendChild(saveButton)
        }

        const actionOptions = endpointFieldMapNew[actionType];

        if (!actionOptions) return;

        // Create dropdown for selecting between 'new' and 'existing' if both exist
        if (actionOptions.new && actionOptions.existing) {
            const select = document.createElement('select');
            select.id = 'actionOptionSelect';

            ['existing', 'new'].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = actionOptions[option].label[currentMembmerMode][node.data.gender];
                select.appendChild(opt);
            });

            select.addEventListener('change', () => {
                const label = endpointFieldMapNew[actionType][select.value].label[currentMembmerMode][node.data.gender];
                document.getElementById('endpointLabel').textContent = label;
                localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionType][select.value].endpoint[currentMembmerMode])
                generateFields(select.value)
            });
            dynamicFields.appendChild(select);
            const label = endpointFieldMapNew[actionType]['existing'].label[currentMembmerMode][node.data.gender];
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionType]['existing'].endpoint[currentMembmerMode])

            document.getElementById('endpointLabel').textContent = label;

            generateFields('existing'); // Default selection
        } else {
            const option = actionOptions.new ? 'new' : 'existing';
            const label = endpointFieldMapNew[actionType][option].label[currentMembmerMode][node.data.gender];
            document.getElementById('endpointLabel').textContent = label;
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionType][option].endpoint[currentMembmerMode])


            generateFields(option);
        }



    }
    displaySuggestionInfo(suggestionBody, rootNodeId: number) {
        this.rootNodeId = rootNodeId;
        const dynamicFields = document.getElementById('dynamicFields');
        let nodeData;
        if (["ChildOfOneParent", "ChildOfTwoParents"].includes(suggestionBody.suggestedAction)) {
            nodeData = suggestionBody.suggestedNode2
        }
        // } else if ([ "addExistingParent", "addNewParent",'addNewPartner',"addExistingPartner"].includes(suggestionBody.suggestedAction)){
        else {
            nodeData = suggestionBody.suggestedNode1
        }

        const reviewSuggestionViewMode = (data) => {
            dynamicFields.innerHTML = '';

            const reason = document.createElement('p');
            reason.innerHTML = `<strong>Reason:</strong> ${suggestionBody['reason'] || 'N/A'}`;
            reason.className = 'dynamic-input';
            dynamicFields.appendChild(reason);


            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
                const field = document.createElement('p');
                field.innerHTML = `<strong>${key}:</strong> ${data[key] || 'N/A'}`;
                field.className = 'dynamic-input';
                dynamicFields.appendChild(field);
            });
            if (data['suggestedBy']) {
                const suggetorContainer = document.createElement('div')
                suggetorContainer.style.border = '1px black solid'
                const field = document.createElement('p');
                field.innerHTML = `<strong>Suggested By:</strong>`;
                field.className = 'dynamic-input';
                const suggestor = createUserProfileElement(data.suggestedBy)
                suggetorContainer.appendChild(field);
                suggetorContainer.appendChild(suggestor)
                dynamicFields.appendChild(suggetorContainer)
            }
            if (this.nodeManager.canCreate(rootNodeId)) {
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.className = 'dynamic-input';



                acceptButton.addEventListener('click', async (e) => {
                    e.preventDefault()

                    const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'accepted')
                    const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)
                    const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                    if (nodesArray) {
                        this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                    }
                    const rootNode = this.nodeManager.getNode(rootNodeId)
                    this.createViewMode(rootNode, memberPriviledge)
                });

                dynamicFields.appendChild(acceptButton);
                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.className = 'dynamic-input';
                dynamicFields.appendChild(rejectButton);
                rejectButton.addEventListener('click', async (e) => {
                    e.preventDefault()
                    const updatedNode = await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'rejected')
                    const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                    const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                    if (nodesArray) {
                        this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                    }
                    const rootNode = this.nodeManager.getNode(rootNodeId)
                    this.createViewMode(rootNode, memberPriviledge)

                });
                const rootNode = this.nodeManager.getNode(rootNodeId)
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)
            }
        };

        reviewSuggestionViewMode(nodeData)
    }

    createViewMode(data, memberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        dynamicFields.innerHTML = '';
        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const field = document.createElement('p');
            field.innerHTML = `<strong>${key}:</strong> ${data[key] || 'N/A'}`;
            field.className = 'dynamic-input';
            dynamicFields.appendChild(field);
        });
        if (memberPriviledge === 'create' || memberPriviledge === 'update') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => {
                this.treeDrawer.toggleModes(data.id, 'edit')
                this.createEditMode(data, memberPriviledge)
            });
            dynamicFields.appendChild(editButton);
            const details = otherNodeDetails(this.nodeManager.getNode(data.id))
            dynamicFields.appendChild(details)
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id))
            dynamicFields.appendChild(contributors);
            const deleteAllowed = this.nodeManager.isAllowedAction(data.id, genericActionTypes.DeleteNode);
            // const deleteAllowed = this.nodeManager.isAllowedAction(nodeData.id, genericActionTypes.DeleteNode);
            console.log("Delete Allowed", deleteAllowed)
            const canSuggest = this.nodeManager.canContribute()
            const canUpdate = this.nodeManager.canUpdate(data.id)

            if (deleteAllowed) {
                if (canSuggest) {
                    const deleteButton = document.createElement('button');
                    if (canUpdate) {
                        deleteButton.textContent = 'Delete';
                        deleteButton.addEventListener('click', () => {
                            this.treeDrawer.toggleModes(data.id, 'edit')
                            this.deleteMode(data, memberPriviledge)
                        });
                    } else {
                        deleteButton.textContent = 'Suggest Deletion';
                        deleteButton.addEventListener('click', () => {
                            this.treeDrawer.toggleModes(data.id, 'edit')
                            this.suggestDeleteMode(data, memberPriviledge)
                        });
                    }
                    deleteButton.className = 'delete-button';
                    dynamicFields.appendChild(deleteButton);
                }
            }
        } else if (memberPriviledge === 'suggest' || memberPriviledge === 'only-create') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Suggest Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => { this.createSuggestionMode(data, memberPriviledge) });
            dynamicFields.appendChild(editButton);
            const deleteAllowed = this.nodeManager.isAllowedAction(data.id, genericActionTypes.DeleteNode);
            console.log("Delete Allowed Suggest", deleteAllowed)
            if (deleteAllowed) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Suggest Deletion';
                deleteButton.className = 'delete-button';

                deleteButton.addEventListener('click', () => {
                    this.treeDrawer.toggleModes(data.id, 'edit')
                    this.suggestDeleteMode(data, memberPriviledge)
                });
                dynamicFields.appendChild(deleteButton)
            }
            const details = otherNodeDetails(this.nodeManager.getNode(data.id))
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id))
            dynamicFields.appendChild(contributors);
            dynamicFields.appendChild(details)

        }
    };

    createEditMode(nodeData, memberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        dynamicFields.innerHTML = '';
        const formData = {};

        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = (key.includes('Date')) ? 'date' : (key.includes('Id')) ? 'number' : 'text';
            input.name = key;
            input.placeholder = key;
            input.value = nodeData[key] || '';
            input.className = 'dynamic-input';
            dynamicFields.appendChild(input);
            formData[key] = input;
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'dynamic-input';
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const updatedData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key].value && formData[key] !== nodeData[key]) {
                    updatedData[key] = formData[key].value;
                }
            });
            await nodeManagmentService.updateNode(this.familyTreeId, nodeData.id, updatedData)

            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }
            const updatedNode = this.nodeManager.getNode(nodeData.id)
            this.createViewMode(updatedNode, memberPriviledge);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'dynamic-input';
        cancelButton.addEventListener('click', () => { this.createViewMode(nodeData, memberPriviledge) });

        dynamicFields.appendChild(saveButton);
        dynamicFields.appendChild(cancelButton);
    };

    deleteMode(nodeData, memberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        dynamicFields.innerHTML = '';
        const deleteMessage = document.createElement('p');
        deleteMessage.innerHTML = `Are you sure you want to delete <b>${nodeData.name}</b>?`;
        deleteMessage.className = 'delete-message';


        const deleteButtonYes = document.createElement('button');
        deleteButtonYes.textContent = 'Yes';
        deleteButtonYes.className = 'delete-button';
        deleteButtonYes.addEventListener('click', async (e) => {
            e.preventDefault()
            const deleteNode = await nodeManagmentService.deleteNode(this.familyTreeId, nodeData.id)
            const previousNodeId = this.treeDrawer.popRootHistory(nodeData.id)

            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, previousNodeId, true);
            }
            // Return to the previous old node
        });
        const deleteButtonNo = document.createElement('button');
        deleteButtonNo.textContent = 'No';
        deleteButtonNo.className = 'dynamic-input';
        deleteButtonNo.addEventListener('click', async () => {
            this.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields.appendChild(deleteMessage);
        dynamicFields.appendChild(deleteButtonYes);
        dynamicFields.appendChild(deleteButtonNo);
    };
    suggestDeleteMode(nodeData, memberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        dynamicFields.innerHTML = '';
        const familyTreeForm = document.getElementById('familyTreeForm')
        const formData = new FormData(familyTreeForm);

        const reason = 'reason'
        const input = document.createElement('input');
        input.type = 'text';
        input.id = reason;
        input.name = reason;
        input.placeholder = reason.replace(/([A-Z])/g, ' $1').trim();
        input.className = 'dynamic-input';
        input.required = false
        formData[reason] = input
        dynamicFields?.append(input)
        const SuggestDeleteButton = document.createElement('button')
        SuggestDeleteButton.textContent = 'Suggest Delete';
        SuggestDeleteButton.className = 'delete-button';
        SuggestDeleteButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const deletionBody = {};
            Object.keys(formData).forEach(key => {
                if (formData[key].value) {
                    deletionBody[key] = formData[key].value;
                }
            });


            const deleteNode = await suggestionCreationService.suggestDeleteNode(this.familyTreeId, nodeData.id, deletionBody)

            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }

            this.createViewMode(nodeData, memberPriviledge)


        });
        const deleteButtonNo = document.createElement('button');
        deleteButtonNo.textContent = 'No';
        deleteButtonNo.className = 'dynamic-input';
        deleteButtonNo.addEventListener('click', async () => {
            this.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields.appendChild(SuggestDeleteButton);
        dynamicFields.appendChild(deleteButtonNo);
    };

    createSuggestionMode(nodeData, memberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        dynamicFields.innerHTML = '';

        const formData = {};
        const name = 'reason'
        const input = document.createElement('input');
        input.type = 'text';
        input.id = name;
        input.name = name;
        input.placeholder = name.replace(/([A-Z])/g, ' $1').trim();
        input.className = 'dynamic-input';
        input.required = false
        dynamicFields.appendChild(input);

        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = (key.includes('Date')) ? 'date' : (key.includes('Id')) ? 'number' : 'text';
            input.name = key;
            input.placeholder = key;
            input.value = nodeData[key] || '';
            input.className = 'dynamic-input';
            dynamicFields.appendChild(input);
            formData[key] = input;
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Suggestion';
        saveButton.className = 'dynamic-input';
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const familyTreeForm = document.getElementById('familyTreeForm')
            const formData = new FormData(familyTreeForm);
            const data = Object.fromEntries(formData.entries());
            const filteredData = {}
            Object.keys(data).map(item => {
                if (data[item] !== nodeData[item]) {
                    filteredData[item] = data[item]
                }
            })

            const suggestedData = await suggestionCreationService.suggestUpdateNode(this.familyTreeId, nodeData.id, filteredData)

            const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, nodeData.id)
            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }
            const rootNode = this.nodeManager.getNode(nodeData.id)

            this.createViewMode(rootNode, memberPriviledge);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'dynamic-input';
        cancelButton.addEventListener('click', () => { this.createViewMode(nodeData, memberPriviledge) });

        dynamicFields.appendChild(saveButton);
        dynamicFields.appendChild(cancelButton);
    };
    infoDisplayer(nodeData, rootNodeId) {
        this.rootNodeId = rootNodeId
        const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

        const dynamicFields = document.getElementById('dynamicFields');

        dynamicFields.innerHTML = '';





        this.createViewMode(nodeData, memberPriviledge);
    }

    displayNodeDetails() {
        this.showTab('details')
        this.setModeType('view')
        return 'view'
    }
}

