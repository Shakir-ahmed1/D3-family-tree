import { ND, NodeData } from "./dataManager";
import { drawer } from "./main";
import { actionTypes, genericActionTypes } from "./node.interface";
import { FamilyTreeService } from "./services/nodeCreationServices";
import { nodeManagmentService } from "./services/nodeManagmentService";
import { FamilyTreeSuggestionService } from "./services/suggestionCreationService";
import { SuggestionService, suggestionService } from "./services/suggestionService";
import { localStorageManager } from "./storage/storageManager";

export class HtmlElementsManager {
    constructor() {
        this.initTabs();
    }

    initTabs() {
        document.getElementById('detailsTab').addEventListener('click', () => this.showTab('details'));
        document.getElementById('imagesTab').addEventListener('click', () => this.showTab('images'));
        document.getElementById('notesTab').addEventListener('click', () => this.showTab('notes'));
    }
    showTab(tab) {
        ['details', 'images', 'notes'].forEach(id => {
            document.getElementById(`${id}Content`).classList.add('hidden');
            document.getElementById(`${id}Tab`).classList.remove('active');
        });
        document.getElementById(`${tab}Content`).classList.remove('hidden');
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    // async suggestionHandler() {

    //     const SuggestionService = new FamilyTreeSuggestionService()
    //     const endpointServiceMap = {
    //         suggestNewParent: SuggestionService.suggestNewParent,
    //         suggestExistingParent: SuggestionService.suggestExistingParent,
    //         suggestChildOfOneParent: SuggestionService.suggestChildOfOneParent,
    //         suggestChildOfTwoParents: SuggestionService.suggestChildOfTwoParents,
    //         suggestNewPartner: SuggestionService.suggestNewPartner,
    //         suggestExistingPartner: SuggestionService.suggestExistingPartner,
    //         suggestNewPartnerAsParent: SuggestionService.suggestNewPartnerAsParent,
    //         suggestExistingPartnerAsParent: SuggestionService.suggestExistingPartnerAsParent,
    //         suggestDeleteNode: SuggestionService.suggestDeleteNode,
    //         suggestUpdateNode: SuggestionService.suggestUpdateNode,
    //     };

    //     const formData = new FormData(this);
    //     const endpoint = document.getElementById('postEndpoint')?.textContent;
    //     const data = Object.fromEntries(formData.entries());

    //     console.log("this is this", endpoint)
    //     if (endpointServiceMap[endpoint]) {
    //         try {
    //             console.log("Entry Data", data)

    //             const response = await endpointServiceMap[endpoint](data);

    //             const familyTreeId = localStorageManager.getItem('familyTreeId');
    //             nodesArray = await nodeManagmentService.fetchNodesArrays(familyTreeId);
    //             if (nodesArray) {
    //                 console.log("Fetched Array Data", data);
    //                 drawer.fetchData(nodesArray, parseInt(data.familyNodeId), true);
    //                 // alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
    //             }
    //             console.log('Success:', response);
    //         } catch (error) {
    //             console.error('Error:', error);
    //         }

    //     }
    // }

    setActionTypeLabel(actionType: actionTypes, node, currentNodeId) {
        let memberPriviledge = ND.memberPriviledge(1, currentNodeId);
        const currentMembmerMode = memberPriviledge === 'create' ? 'create' : 'suggest';
        // 'suggest'; // 'create' or 'suggest
        const dynamicFields = document.getElementById('dynamicFields');
        document.getElementById('familyNodeId').value = currentNodeId;

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
                    fields: ['partnershipType', 'partnerNodeId']
                },
            },
            addChildOfTwoParents: {
                new: {
                    endpoint: { create: 'addChildOfTwoParents', suggest: 'suggestChildOfTwoParents' },
                    label: { create: { MALE: "Add Son of Two Parents", FEMALE: "Add Daughter of Two Parents" }, suggest: { MALE: "Suggest Son of Two Parents", FEMALE: "Suggest Daughter of Two Parents" } },
                    fields: ['partnerNodeId', 'partnershipType', 'childNodeData']
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
                    fields: ['partnershipType', 'partnerNodeId']
                },
            },
        };

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
                document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType][select.value].endpoint[currentMembmerMode];
                generateFields(select.value)
            });
            dynamicFields.appendChild(select);
            const label = endpointFieldMapNew[actionType]['existing'].label[currentMembmerMode][node.data.gender];
            document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType]['existing'].endpoint[currentMembmerMode];
            document.getElementById('endpointLabel').textContent = label;

            generateFields('existing'); // Default selection
        } else {
            const option = actionOptions.new ? 'new' : 'existing';
            const label = endpointFieldMapNew[actionType][option].label[currentMembmerMode][node.data.gender];
            document.getElementById('endpointLabel').textContent = label;
            document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType][option].endpoint[currentMembmerMode];

            generateFields(option);
        }
        const CreateService = new FamilyTreeService()
        const saveButton = document.createElement('button')
        saveButton.textContent = 'Save Info'
        saveButton.className = 'edit-save'
        saveButton.addEventListener('click', async function (e) {
            const endpointServiceMap = {
                addNewParent: CreateService.addNewParent,
                addExistingParent: CreateService.addExistingParent,
                addChildOfOneParent: CreateService.addChildOfOneParent,
                addChildOfTwoParents: CreateService.addChildOfTwoParents,
                addNewPartner: CreateService.addNewPartner,
                addExistingPartner: CreateService.addExistingPartner,
                addNewPartnerAsParent: CreateService.addNewPartnerAsParent,
                addExistingPartnerAsParent: CreateService.addExistingPartnerAsParent,
            };
            e.preventDefault();
            const familyTreeForm = document.getElementById('familyTreeForm')
            const formData = new FormData(familyTreeForm);
            const endpoint = document.getElementById('postEndpoint')?.textContent;
            const data = Object.fromEntries(formData.entries());

            console.log("this is this", endpoint)
            if (endpointServiceMap[endpoint]) {
                try {
                    console.log("Entry Data", data)

                    const response = await endpointServiceMap[endpoint](data);

                    const familyTreeId = localStorageManager.getItem('familyTreeId');
                    const nodesArray = await nodeManagmentService.fetchNodesArrays(familyTreeId);
                    if (nodesArray) {
                        console.log("Fetched Array Data", data);
                        drawer.fetchData(nodesArray, parseInt(data.familyNodeId), true);
                    }
                    console.log('Success:', response);
                } catch (error) {
                    console.error('Error:', error);
                }

            }

            const updatedData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key].value) {
                    updatedData[key] = formData[key].value;
                }
            });
            const familyNodeId = localStorageManager.getItem('familyNodeId')
            const familyTreeId = localStorageManager.getItem('familyTreeId')
            const updatedNode = await nodeManagmentService.updateNode(familyTreeId, familyNodeId, updatedData)
            createViewMode(updatedNode);
        });
        dynamicFields.appendChild(saveButton)

        function generateFields(option) {
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

                    ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate', 'ownedById'].forEach(name => {
                        const input = document.createElement('input');
                        input.type = name.includes('Date') ? 'date' : name === 'ownedById' ? 'number' : 'text';
                        input.id = name;
                        input.name = name;
                        input.placeholder = name.replace(/([A-Z])/g, ' $1').trim();
                        input.required = true;
                        input.className = 'dynamic-input';
                        input.required = false
                        if (name === 'gender') {
                            input.value = node.data.gender
                        }
                        dynamicFields.appendChild(input);
                    });
                } else if (field.endsWith('Id')) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = field;
                    input.placeholder = field;
                    input.required = true;
                    input.className = 'dynamic-input';
                    if (actionType === 'addChildOfTwoParents' && field === 'partnerNodeId') {
                        const partnerId = node.data.motherId === currentNodeId ? node.data.fatherId : node.data.motherId
                        input.value = partnerId;
                        const p = document.createElement('p');
                        const partnerNode = ND.getNode(partnerId)
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
        }
    }
    displaySuggestionInfo(suggestionBody) {
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
                const field = document.createElement('p');
                field.innerHTML = `<strong>Suggested By:</strong> ${data['suggestedBy'].user.name || 'N/A'}`;
                field.className = 'dynamic-input';
                dynamicFields.appendChild(field);
            }

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'dynamic-input';



            acceptButton.addEventListener('click', async () => {
                const updatedNode = await suggestionService.acceptOrRejectSuggestion(suggestionBody.familyTree.id, suggestionBody.id, 'accepted')
            });

            dynamicFields.appendChild(acceptButton);
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'dynamic-input';
            dynamicFields.appendChild(rejectButton);
            rejectButton.addEventListener('click', async () => {
                const updatedNode = await suggestionService.acceptOrRejectSuggestion(suggestionBody.familyTree.id, suggestionBody.id, 'rejected')
            });
        };
        reviewSuggestionViewMode(nodeData)
    }

    infoDisplayer(nodeData, rootNodeId) {
        const familyTreeId = localStorageManager.getItem('familyTreeId')
        const memberPriviledge = ND.memberPriviledge(familyTreeId, rootNodeId)

        const dynamicFields = document.getElementById('dynamicFields');
        document.getElementById('familyNodeId').value = rootNodeId;

        dynamicFields.innerHTML = '';
        const createViewMode = (data) => {
            dynamicFields.innerHTML = '';
            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate', 'ownedById'].forEach((key) => {
                const field = document.createElement('p');
                field.innerHTML = `<strong>${key}:</strong> ${data[key] || 'N/A'}`;
                field.className = 'dynamic-input';
                dynamicFields.appendChild(field);
            });
            if (memberPriviledge === 'create' || memberPriviledge === 'update') {
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'dynamic-input';
                editButton.addEventListener('click', createEditMode);
                dynamicFields.appendChild(editButton);
                const deleteAllowed = ND.isAllowedAction(nodeData.id, genericActionTypes.DeleteNode);
                console.log("Delete Allowed", deleteAllowed)
                if (deleteAllowed) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete-button';
                    deleteButton.addEventListener('click', deleteMode);
                    dynamicFields.appendChild(deleteButton);
                }
            } else if (memberPriviledge === 'suggest') {
                const editButton = document.createElement('button');
                editButton.textContent = 'Suggest Edit';
                editButton.className = 'dynamic-input';
                editButton.addEventListener('click', createSuggestionMode);
                dynamicFields.appendChild(editButton);
            }
        };

        const createEditMode = () => {
            dynamicFields.innerHTML = '';
            const formData = {};

            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate', 'ownedById'].forEach((key) => {
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
                    if (formData[key].value) {
                        updatedData[key] = formData[key].value;
                    }
                });
                const updatedNode = await nodeManagmentService.updateNode(nodeData.familyTree.id, nodeData.id, updatedData)
                nodeData = updatedNode;
                createViewMode(nodeData);
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'dynamic-input';
            cancelButton.addEventListener('click', () => { createViewMode(nodeData) });

            dynamicFields.appendChild(saveButton);
            dynamicFields.appendChild(cancelButton);
        };
        const deleteMode = () => {
            dynamicFields.innerHTML = '';
            const deleteMessage = document.createElement('p');
            deleteMessage.innerHTML = `Are you sure you want to delete <b>${nodeData.name}</b>?`;
            deleteMessage.className = 'delete-message';


            const deleteButtonYes = document.createElement('button');
            deleteButtonYes.textContent = 'Yes';
            deleteButtonYes.className = 'delete-button';
            deleteButtonYes.addEventListener('click', async () => {
                const deleteNode = await nodeManagmentService.deleteNode(nodeData.familyTree.id, nodeData.id)
                // Return to the previous old node
            });
            const deleteButtonNo = document.createElement('button');
            deleteButtonNo.textContent = 'No';
            deleteButtonNo.className = 'dynamic-input';
            deleteButtonNo.addEventListener('click', async () => {
                createViewMode(nodeData);
            });

            dynamicFields.appendChild(deleteMessage);
            dynamicFields.appendChild(deleteButtonYes);
            dynamicFields.appendChild(deleteButtonNo);
        };
        const suggestDeleteMode = () => {
            dynamicFields.innerHTML = '';
            const formData = {};

            const reason = 'reason'
            const input = document.createElement('input');
            input.type = 'text';
            input.id = reason;
            input.name = reason;
            input.placeholder = reason.replace(/([A-Z])/g, ' $1').trim();
            input.className = 'dynamic-input';
            input.required = false

            const SuggestDeleteButton = document.createElement('button')
            SuggestDeleteButton.textContent = 'Suggest Delete';
            SuggestDeleteButton.className = 'delete-button';
            SuggestDeleteButton.addEventListener('click', async () => {
                const suggestionService = new FamilyTreeSuggestionService()
                const deleteNode = await suggestionService.suggestDeleteNode(nodeData.familyTree.id, nodeData.id)
                // Return to the previous old node



            });
            const deleteButtonNo = document.createElement('button');
            deleteButtonNo.textContent = 'No';
            deleteButtonNo.className = 'dynamic-input';
            deleteButtonNo.addEventListener('click', async () => {
                createViewMode(nodeData);
            });

            dynamicFields.appendChild(deleteMessage);
            dynamicFields.appendChild(SuggestDeleteButton);
            dynamicFields.appendChild(deleteButtonNo);
        };

        const createSuggestionMode = () => {
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

            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate', 'ownedById'].forEach((key) => {
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
                const suggestionService = new FamilyTreeSuggestionService();
                const suggestedData = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key].value) {
                        console.log("Form Values", formData[key].value)
                        suggestedData[key] = formData[key].value;
                    }
                });
                const familyNodeId = localStorageManager.getItem('familyNodeId')
                const familyTreeId = localStorageManager.getItem('familyTreeId')
                console.log("suggested Data", suggestedData)
                const updatedNode = await suggestionService.suggestUpdateNode(familyTreeId, familyNodeId,suggestedData)
                createViewMode(nodeData);
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'dynamic-input';
            cancelButton.addEventListener('click', () => { createViewMode(nodeData) });

            dynamicFields.appendChild(saveButton);
            dynamicFields.appendChild(cancelButton);
        };

        createViewMode(nodeData);
    }

    displayNodeDetails() {
        this.showTab('details')
        const modeButton = document.getElementById('modeType')
        modeButton.textContent = 'view'
        return document.getElementById('modeType')?.textContent
    }
}

