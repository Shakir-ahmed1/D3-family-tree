import { Contributor, DrawableNode, FamilyNode, genericActionTypes, MemberPriviledge, SuggestableActions, SuggestEdits } from "./interfaces/node.interface";
import { nodeCreationService } from "./services/node-creation-services";
import { nodeManagmentService } from "./services/node-managment-service";
import { suggestionCreationService } from "./services/suggestion-creation-service";
import { suggestionService } from "./services/suggestion-service";
import { localStorageManager } from "./services/storage-manager";
import { FamilyTreeDrawer } from "./FamilyTreeDrawer";
import { contributorsElementGenerator, createDropdown, createUserProfileElement, hoverEffect, otherNodeDetails } from "./utils/utils";
import { DataManager } from "./services/data-manager";



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
    constructor(ND: DataManager, familyTreeId: number, rootNodeId: number, drawer: FamilyTreeDrawer) {
        // disable any click events for the pop up

        this.treeDrawer = drawer
        this.rootNodeId = rootNodeId
        this.familyTreeId = familyTreeId;
        this.nodeManager = ND
        this.initTabs();

        const modeButton = document.getElementById('modeType')
        modeButton?.addEventListener('click', (_event) => {
            this.treeDrawer.toggleModes()
        });
    }
    setModeType(text: string) {
        const modeButton = document.getElementById('modeType')
        if (modeButton) modeButton.textContent = text
    }

    initTabs() {
        document.getElementById('detailsTab')?.addEventListener('click', () => this.showTab('details'));
        document.getElementById('imagesTab')?.addEventListener('click', () => this.showTab('images'));
        document.getElementById('notesTab')?.addEventListener('click', () => this.showTab('notes'));

        if (this.nodeManager?.data?.canContribute) {
            const editTab = document.createElement('div');
            editTab.className = 'tab';
            editTab.id = 'editSuggestionsTab';
            editTab.textContent = 'Edit Suggestions';
            editTab.addEventListener('click', () => this.showTab('editSuggestions'));

            // Insert after notesTab for consistent order
            const notesTab = document.getElementById('notesTab');
            notesTab?.parentNode?.insertBefore(editTab, notesTab.nextSibling);
        }
    }


    showTab(tab: string) {
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
        suggestionContainer.appendChild(suggestingMember as HTMLDivElement)
        const field = document.createElement('p');
        field.innerHTML = `<strong>Reason:</strong> ${suggestionObject.reason || 'N/A'}`;
        field.className = 'dynamic-input';
        suggestionContainer.appendChild(field);
        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            // Assert key as keyof FamilyNode (assuming FamilyNode is the type)
            const nodeKey = key as keyof typeof suggestionObject.suggestedNode1;
            const rootNodeKey = key as keyof typeof rootNodeData;

            if (suggestionObject.suggestedNode1[nodeKey]) {
                const field = document.createElement('p');
                const existingValue = `<span class="old-data">${rootNodeData[rootNodeKey] || ''}</span>`;
                field.innerHTML = `<strong>${key}:</strong>${rootNodeData[rootNodeKey] ? existingValue : ''}<span class="new-data">${suggestionObject.suggestedNode1[nodeKey] || 'N/A'}</span>`;
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

                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted')
                this.refreshAfterSuggestion(rootNodeId)
            });

            suggestionContainer.appendChild(acceptButton);
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'buttonSecondary';
            suggestionContainer.appendChild(rejectButton);
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault()
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected')

                this.refreshAfterSuggestion(rootNodeId)

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
                await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id)

                this.refreshAfterSuggestion(rootNodeId)

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
        suggestionContainer.appendChild(suggestingMember as HTMLDivElement)
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

                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted')
                // const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                const previousNodeId = this.treeDrawer.popRootHistory(this.rootNodeId)
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, previousNodeId as number, true);
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
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected')
                // const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                this.refreshAfterSuggestion(rootNodeId)

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
                await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id)

                this.refreshAfterSuggestion(rootNodeId)

            });
        }

        return suggestionContainer
    }
    async refreshAfterSuggestion(rootNodeId: number) {
        const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
        if (nodesArray) {
            this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
        }
        this.displaySuggestionUpdateEdits(rootNodeId)
        this.treeDrawer.updateNodesNameText()
    }
    displaySuggestionUpdateEdits(familyNodeId: number) {
        const pendingSuggestionsDisplayer = document.getElementById('pendingUpdateSuggestions');
        if (pendingSuggestionsDisplayer) pendingSuggestionsDisplayer.innerHTML = '';
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
                    pendingSuggestionsDisplayer?.appendChild(suggestionBody)
                }
                else if (item.suggestedAction === SuggestableActions.DeleteNode) {
                    const suggestionBody = this.reviewDeletionSuggestionBody(item)
                    pendingSuggestionsDisplayer?.appendChild(suggestionBody)
                }
            })
        }

    }


    setActionTypeLabel(actionType: genericActionTypes, node: d3.HierarchyNode<DrawableNode>, currentNodeId: number) {
        this.rootNodeId = currentNodeId;
        let memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, currentNodeId);
        const currentMembmerMode = (memberPriviledge === 'create' || memberPriviledge === 'only-create') ? 'create' : 'suggest';
        // 'suggest'; // 'create' or 'suggest
        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';
        if (this.nodeManager) {
            const hoverEffectTest = hoverEffect(this.treeDrawer.createPopUp, this.rootNodeId)
            dynamicFields?.appendChild(hoverEffectTest);
        }



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
                },
                existing: null
            },
            addChildOfOneParent: {
                new: {
                    endpoint: { create: 'addChildOfOneParent', suggest: 'suggestChildOfOneParent' },
                    label: { create: { MALE: "Add Son of One Parent", FEMALE: "Add Daughter of One Parent" }, suggest: { MALE: "Suggest Son of One Parent", FEMALE: "Suggest Daughter of One Parent" } },
                    fields: ['childNodeData']
                },
                existing: null
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
        const generateFields = (option: 'new' | 'existing') => {
            const fields = actionOptions[option]?.fields;
            dynamicFields?.querySelectorAll('.dynamic-input').forEach(el => el.remove());

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
                dynamicFields?.appendChild(input);
            }
            fields?.forEach((field: string | null) => {
                if (field?.includes('Data')) {
                    const h2 = document.createElement('h2');
                    h2.textContent = field;
                    h2.className = 'dynamic-input';
                    dynamicFields?.appendChild(h2);

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
                        dynamicFields?.appendChild(input);
                    });
                }


                else if (field === 'targetNodeId' && actionType === genericActionTypes.addParent) {

                    nodeManagmentService.fetchAllowedParents(this.familyTreeId, this.rootNodeId, node.data.gender)
                        .then(item => {

                            const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing parent Node', 'Couldn\'t find a possible parent');

                            const referenceElement = document.getElementById('actionOptionSelect');

                            if (referenceElement && referenceElement.parentNode === dynamicFields) {
                                // Insert dropdown after referenceElement
                                if (referenceElement.nextSibling) {
                                    dynamicFields?.insertBefore(dropdown, referenceElement.nextSibling);
                                } else {
                                    // If it's the last child, just append
                                    dynamicFields?.appendChild(dropdown);
                                }
                            } else {
                                console.warn("referenceElement not found or not a child of dynamicFields");
                                dynamicFields?.appendChild(dropdown); // Fallback
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching marriable nodes:", error);
                        });
                }



                else if (field === 'targetNodeId' && actionType === genericActionTypes.addPartner) {
                    console.log("HYYYYYY");

                    nodeManagmentService.fetchMarriableNodes(this.familyTreeId, this.rootNodeId)
                        .then(item => {

                            const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing Node', 'Couldn\'t find a possible pair');

                            const referenceElement = document.getElementById('actionOptionSelect');

                            if (referenceElement && referenceElement.parentNode === dynamicFields) {
                                // Insert dropdown after referenceElement
                                if (referenceElement.nextSibling) {
                                    dynamicFields?.insertBefore(dropdown, referenceElement.nextSibling);
                                } else {
                                    // If it's the last child, just append
                                    dynamicFields?.appendChild(dropdown);
                                }
                            } else {
                                console.warn("referenceElement not found or not a child of dynamicFields");
                                dynamicFields?.appendChild(dropdown); // Fallback
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching marriable nodes:", error);
                        });
                }












                else if (field === 'partnershipType') {
                    dynamicFields?.appendChild(createDropdown(this.relationType, 'partnershipType', 'select relationship Status', 'Unknow Error Occured'))
                }
                else if (field?.endsWith('Id')) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = field;
                    input.placeholder = field;
                    input.required = true;
                    input.className = 'dynamic-input';
                    if (actionType === 'addChildOfTwoParents' && field === 'targetNodeId') {
                        const partnerId = node.data.motherId === currentNodeId ? node.data.fatherId : node.data.motherId

                        if (input) input.value = `${partnerId}`;
                        const p = document.createElement('p');
                        const partnerNode = this.nodeManager.getNode(partnerId as number)
                        p.textContent = `Partner: ${partnerNode.name}`
                        dynamicFields?.appendChild(p)
                    }
                    dynamicFields?.appendChild(input);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.name = field as string;
                    input.placeholder = field as string;
                    input.required = true;
                    input.className = 'dynamic-input';
                    dynamicFields?.appendChild(input);
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
                };
                type EndpointKey = keyof typeof endpointServiceMap;

                e.preventDefault();
                const familyTreeForm = document.getElementById('familyTreeForm')
                const formData = new FormData(familyTreeForm as HTMLFormElement);
                const endpoint = localStorageManager.getItem('postEndpoint') as EndpointKey | null; // Cast to potential key type or null
// @ts-ignore
                const data: { [key: string]: string } = Object.fromEntries(formData.entries());



                if (endpoint && endpoint in endpointServiceMap) { // Check if endpoint is not null and a valid key
                    try {
                        const serviceFunction = endpointServiceMap[endpoint]; // Access safely
                        await serviceFunction(this.familyTreeId, this.rootNodeId, data);

                        const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                        if (nodesArray) {
                            this.treeDrawer.fetchData(nodesArray, this.rootNodeId, true);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }

                }

                const currentData = await this.nodeManager.getNode(currentNodeId)
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, currentNodeId)
                this.createViewMode(currentData, memberPriviledge);
            });
            dynamicFields?.appendChild(saveButton)
        }

        // const actionOptions = endpointFieldMapNew[actionType];
        const actionOptions = endpointFieldMapNew[actionType as keyof typeof endpointFieldMapNew];
        type ValidSelectValue = "new" | "existing";
        const actionKeys = actionType as keyof typeof endpointFieldMapNew


        if (!actionOptions) return;

        // Create dropdown for selecting between 'new' and 'existing' if both exist
        if (actionOptions.existing && actionOptions.new) {
            const select = document.createElement('select');
            select.id = 'actionOptionSelect';

            ['existing', 'new'].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = actionOptions[option as keyof typeof actionOptions].label[currentMembmerMode][node.data.gender];
                select.appendChild(opt);
            });

            select.addEventListener('change', () => {

                // Then cast:
                const label = endpointFieldMapNew[actionKeys]?.[select.value as ValidSelectValue]?.label?.[currentMembmerMode]?.[node.data.gender];
                const endpointLabel = document.getElementById('endpointLabel')
                if (endpointLabel) endpointLabel.textContent = label ?? null;
                localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys]?.[select.value as ValidSelectValue]?.endpoint[currentMembmerMode])
                generateFields(select.value as 'new' | 'existing')
            });
            dynamicFields?.appendChild(select);
            const label = endpointFieldMapNew[actionKeys]?.['existing' as ValidSelectValue]?.label[currentMembmerMode][node.data.gender];
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys]['existing' as ValidSelectValue]?.endpoint[currentMembmerMode])

            const endpointLabel = document.getElementById('endpointLabel')
            if (endpointLabel) endpointLabel.textContent = label ?? null;

            generateFields('existing'); // Default selection
        } else {
            const option = (actionOptions.new ? 'new' : 'existing') as 'new' | 'existing';
            const label = endpointFieldMapNew[actionKeys][option]?.label[currentMembmerMode][node.data.gender];
            const endpointLabel = document.getElementById('endpointLabel')
            if (endpointLabel) endpointLabel.textContent = label ?? null;
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys][option]?.endpoint[currentMembmerMode])


            generateFields(option);
        }

    }
    displaySuggestionInfo(suggestionBody: SuggestEdits, rootNodeId: number) {
        this.rootNodeId = rootNodeId;
        const dynamicFields = document.getElementById('dynamicFields');
        let nodeData;
        if (["ChildOfOneParent", "ChildOfTwoParents"].includes(suggestionBody.suggestedAction)) {
            nodeData = suggestionBody.suggestedNode2
        }
        else {
            nodeData = suggestionBody.suggestedNode1
        }

        const reviewSuggestionViewMode = (data: FamilyNode) => {
            if (dynamicFields) dynamicFields.innerHTML = '';

            const reason = document.createElement('p');
            reason.innerHTML = `<strong>Reason:</strong> ${suggestionBody['reason'] || 'N/A'}`;
            reason.className = 'dynamic-input';
            dynamicFields?.appendChild(reason);


            ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
                const field = document.createElement('p');
                field.innerHTML = `<strong>${key}:</strong> ${data[key as keyof FamilyNode] || 'N/A'}`;
                field.className = 'dynamic-input';
                dynamicFields?.appendChild(field);
            });
            if (data['suggestedBy']) {
                const suggetorContainer = document.createElement('div')
                suggetorContainer.style.border = '1px black solid'
                const field = document.createElement('p');
                field.innerHTML = `<strong>Suggested By:</strong>`;
                field.className = 'dynamic-input';
                const suggestor = createUserProfileElement(data.suggestedBy)
                suggetorContainer.appendChild(field);
                suggetorContainer.appendChild(suggestor as Node)
                dynamicFields?.appendChild(suggetorContainer)
            }
            if (this.nodeManager.canCreate(rootNodeId)) {
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.className = 'dynamic-input';



                acceptButton.addEventListener('click', async (e) => {
                    e.preventDefault()

                    await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'accepted')
                    const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)
                    const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                    if (nodesArray) {
                        this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                    }
                    const rootNode = this.nodeManager.getNode(rootNodeId)
                    this.createViewMode(rootNode, memberPriviledge)
                });

                dynamicFields?.appendChild(acceptButton);
                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.className = 'dynamic-input';
                dynamicFields?.appendChild(rejectButton);
                rejectButton.addEventListener('click', async (e) => {
                    e.preventDefault()
                    await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'rejected')
                    const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

                    const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                    if (nodesArray) {
                        this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                    }
                    const rootNode = this.nodeManager.getNode(rootNodeId)
                    this.createViewMode(rootNode, memberPriviledge)

                });
                // const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)
            }
        };

        reviewSuggestionViewMode(nodeData)
    }

    createViewMode(data: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';
        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const field = document.createElement('p');
            field.innerHTML = `<strong>${key}:</strong> ${data[key as keyof FamilyNode] || 'N/A'}`;
            field.className = 'dynamic-input';
            if (dynamicFields) dynamicFields?.appendChild(field);
        });
        if (memberPriviledge === 'create' || memberPriviledge === 'update') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => {
                this.treeDrawer.toggleModes(data.id, 'edit')
                this.createEditMode(data, memberPriviledge)
            });
            dynamicFields?.appendChild(editButton);
            const details = otherNodeDetails(this.nodeManager.getNode(data.id))
            dynamicFields?.appendChild(details)
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id) as Contributor)
            dynamicFields?.appendChild(contributors);
            const deleteAllowed = this.nodeManager.isAllowedAction(data.id, genericActionTypes.DeleteNode);
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
                    dynamicFields?.appendChild(deleteButton);
                }
            }
        } else if (memberPriviledge === 'suggest' || memberPriviledge === 'only-create') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Suggest Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => { this.createSuggestionMode(data, memberPriviledge) });
            dynamicFields?.appendChild(editButton);
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
                dynamicFields?.appendChild(deleteButton)
            }
            const details = otherNodeDetails(this.nodeManager.getNode(data.id))
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id) as Contributor)
            dynamicFields?.appendChild(contributors);
            dynamicFields?.appendChild(details)

        }
    };

    createEditMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';
        const formData: { [key: string]: HTMLInputElement } = {};

        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = (key.includes('Date')) ? 'date' : (key.includes('Id')) ? 'number' : 'text';
            input.name = key;
            input.placeholder = key;
            input.value = nodeData[key as keyof FamilyNode] as string || '';
            input.className = 'dynamic-input';
            dynamicFields?.appendChild(input);
            formData[key] = input;
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'dynamic-input';
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const updatedData: { [key: string]: string } = {};
            Object.keys(formData).forEach(key => {
                if (formData[key]?.value && formData[key].value !== nodeData[key as keyof FamilyNode]) {
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

        dynamicFields?.appendChild(saveButton);
        dynamicFields?.appendChild(cancelButton);
    };

    deleteMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';
        const deleteMessage = document.createElement('p');
        deleteMessage.innerHTML = `Are you sure you want to delete <b>${nodeData.name}</b>?`;
        deleteMessage.className = 'delete-message';


        const deleteButtonYes = document.createElement('button');
        deleteButtonYes.textContent = 'Yes';
        deleteButtonYes.className = 'delete-button';
        deleteButtonYes.addEventListener('click', async (e) => {
            e.preventDefault()
            await nodeManagmentService.deleteNode(this.familyTreeId, nodeData.id)
            const previousNodeId = this.treeDrawer.popRootHistory(nodeData.id)

            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, previousNodeId as number, true);
            }
            // Return to the previous old node
        });
        const deleteButtonNo = document.createElement('button');
        deleteButtonNo.textContent = 'No';
        deleteButtonNo.className = 'dynamic-input';
        deleteButtonNo.addEventListener('click', async () => {
            this.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields?.appendChild(deleteMessage);
        dynamicFields?.appendChild(deleteButtonYes);
        dynamicFields?.appendChild(deleteButtonNo);
    };
    suggestDeleteMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';

        const reason = 'reason'
        const input = document.createElement('input') as HTMLInputElement;
        input.type = 'text';
        input.id = reason;
        input.name = reason;
        input.placeholder = reason.replace(/([A-Z])/g, ' $1').trim();
        input.className = 'dynamic-input';
        input.required = false
        const familyTreeForm = document.getElementById('familyTreeForm')
        familyTreeForm?.appendChild(input);
        dynamicFields?.append(input)
        const SuggestDeleteButton = document.createElement('button')
        SuggestDeleteButton.textContent = 'Suggest Delete';
        SuggestDeleteButton.className = 'delete-button';
        SuggestDeleteButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const formData = new FormData(familyTreeForm as HTMLFormElement);
// @ts-ignore
            const deletionBody: { [key: string]: string } =  Object.fromEntries(formData.entries());

            if (input.value) {
                deletionBody[reason] = input.value;
            }


            await suggestionCreationService.suggestDeleteNode(this.familyTreeId, nodeData.id, deletionBody)

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

        dynamicFields?.appendChild(SuggestDeleteButton);
        dynamicFields?.appendChild(deleteButtonNo);
    };

    createSuggestionMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';

        const formData: { [key: string]: HTMLInputElement } = {};
        const name = 'reason'
        const input = document.createElement('input');
        input.type = 'text';
        input.id = name;
        input.name = name;
        input.placeholder = name.replace(/([A-Z])/g, ' $1').trim();
        input.className = 'dynamic-input';
        input.required = false
        dynamicFields?.appendChild(input);

        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = (key.includes('Date')) ? 'date' : (key.includes('Id')) ? 'number' : 'text';
            input.name = key;
            input.placeholder = key;
            input.value = nodeData[key as keyof FamilyNode] as string || '';
            input.className = 'dynamic-input';
            dynamicFields?.appendChild(input);
            formData[key] = input;
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Suggestion';
        saveButton.className = 'dynamic-input';
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const familyTreeForm = document.getElementById('familyTreeForm')
            const formData = new FormData(familyTreeForm as HTMLFormElement);
// @ts-ignore
            const filteredData: { [key: string]: string } = Object.fromEntries(formData.entries());

            Object.keys(formData).forEach(key => {
                if (formData.get(key) && formData.get(key) !== nodeData[key as keyof FamilyNode]) {
                } else {
                    delete filteredData[key]
                }
            });

            await suggestionCreationService.suggestUpdateNode(this.familyTreeId, nodeData.id, filteredData)

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

        dynamicFields?.appendChild(saveButton);
        dynamicFields?.appendChild(cancelButton);
    };
    infoDisplayer(nodeData: FamilyNode, rootNodeId: number) {
        this.rootNodeId = rootNodeId
        const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId)

        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';





        this.createViewMode(nodeData, memberPriviledge);
    }

    displayNodeDetails() {
        this.showTab('details')
        this.setModeType('view')
        return 'view'
    }
}

