import { ND, NodeData } from "./dataManager";
import { actionTypes } from "./node.interface";
import { nodeManagmentService } from "./services/nodeManagmentService";

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
    setActionTypeLabel(actionType: actionTypes, node, currentNodeId) {

        console.log(actionType, node, currentNodeId)
        const dynamicFields = document.getElementById('dynamicFields');
        document.getElementById('familyNodeId').value = currentNodeId;

        dynamicFields.innerHTML = '';
        const endpointFieldMapNew = {
            addParent: {
                new: {
                    endpoint: 'addNewParent',
                    label: { MALE: "Add New Father", FEMALE: "Add New Mother" },
                    fields: ['partnerNodeData']
                },
                existing: {
                    endpoint: 'addExistingParent',
                    label: { MALE: "Add Exiting Father", FEMALE: "Add Exiting Mother" },
                    fields: ['partnershipType', 'partnerNodeId']
                },
            },
            addChildOfTwoParents: {
                new: {
                    endpoint: 'addChildOfTwoParents',
                    label: { MALE: "Add Son of Two Parents", FEMALE: "Add Daughter of Two Parents" },
                    fields: ['partnerNodeId', 'partnershipType', 'childNodeData']
                }
            },
            addChildOfOneParent: {
                new: {
                    endpoint: 'addChildOfOneParent',
                    label: { MALE: "Add Son of One Parent", FEMALE: "Add Daughter of One Parent" },
                    fields: ['childNodeData']
                }
            },
            addPartner: {
                new: {
                    endpoint: 'addNewPartner',
                    label: { MALE: "Add New Partner", FEMALE: "Add New Partner" },
                    fields: ['partnershipType', 'partnerNodeData']
                },
                existing: {
                    endpoint: 'addExistingPartner',
                    label: { MALE: "Add Existing Partner", FEMALE: "Add Existing Partner" },
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
                opt.textContent = actionOptions[option].label[node.data.gender];
                select.appendChild(opt);
            });

            select.addEventListener('change', () => {
                const label = endpointFieldMapNew[actionType][select.value].label[node.data.gender];
                document.getElementById('endpointLabel').textContent = label;
                document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType][select.value].endpoint;
                generateFields(select.value)
            });
            dynamicFields.appendChild(select);
            const label = endpointFieldMapNew[actionType]['existing'].label[node.data.gender];
            document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType]['existing'].endpoint;
            document.getElementById('endpointLabel').textContent = label;

            generateFields('existing'); // Default selection
        } else {
            const option = actionOptions.new ? 'new' : 'existing';
            const label = endpointFieldMapNew[actionType][option].label[node.data.gender];
            document.getElementById('endpointLabel').textContent = label;
            document.getElementById('postEndpoint').textContent = endpointFieldMapNew[actionType][option].endpoint;

            generateFields(option);
        }

        function generateFields(option) {
            const fields = actionOptions[option].fields;
            dynamicFields.querySelectorAll('.dynamic-input').forEach(el => el.remove());

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
    infoDisplayer(nodeData, rootNodeId) {

        const dynamicFields = document.getElementById('dynamicFields');
        document.getElementById('familyNodeId').value = rootNodeId;

        dynamicFields.innerHTML = '';
        // console.log("current Fetched Data", nodeData)
        const createViewMode = (data) => {
            dynamicFields.innerHTML = '';
            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate', 'ownedById'].forEach((key) => {
                const field = document.createElement('p');
                field.innerHTML = `<strong>${key}:</strong> ${data[key] || 'N/A'}`;
                field.className = 'dynamic-input';
                dynamicFields.appendChild(field);
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', createEditMode);
            dynamicFields.appendChild(editButton);
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
            saveButton.addEventListener('click', async () => {
                const updatedData = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key].value) {
                        updatedData[key] = formData[key].value;
                    }
                });
                console.log("node data", updatedData)
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

        createViewMode(nodeData);
    }

    displayNodeDetails() {
        this.showTab('details')
        const modeButton = document.getElementById('modeType')
        modeButton.textContent = 'view'
        return document.getElementById('modeType')?.textContent
    }
}

