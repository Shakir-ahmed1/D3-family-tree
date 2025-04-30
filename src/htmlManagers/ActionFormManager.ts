import { FamilyTreeDrawer } from "../FamilyTreeDrawer";
import { genericActionTypes, DrawableNode } from "../interfaces/node.interface";
import { DataManager } from "../services/data-manager";
import { nodeCreationService } from "../services/node-creation-services";
import { nodeManagmentService } from "../services/node-managment-service";
import { localStorageManager } from "../services/storage-manager";
import { suggestionCreationService } from "../services/suggestion-creation-service";
import { hoverEffect, createDropdown } from "../utils/utils";
import { HtmlElementsManager } from "./htmlElementsManager";

export class ActionFormManager {
    private htmlElementsManager: HtmlElementsManager;
    private nodeManager: DataManager;
    private familyTreeId: number;
    private treeDrawer: FamilyTreeDrawer;
    private relationType = [
        { id: 'UNKNOWN', name: 'UNKNOWN' },
        { id: 'EX', name: 'EX' },
        { id: 'FRIEND', name: 'FRIEND' },
        { id: 'MAIN', name: 'MAIN' },
    ];

    constructor(htmlElementsManager: HtmlElementsManager, nodeManager: DataManager, familyTreeId: number, treeDrawer: FamilyTreeDrawer) {
        this.htmlElementsManager = htmlElementsManager;
        this.nodeManager = nodeManager;
        this.familyTreeId = familyTreeId;
        this.treeDrawer = treeDrawer;
    }

    setActionTypeLabel(actionType: genericActionTypes, node: d3.HierarchyNode<DrawableNode>, currentNodeId: number) {
        this.htmlElementsManager.setRootNodeId(currentNodeId);
        const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, currentNodeId);
        const currentMemberMode = (memberPriviledge === 'create' || memberPriviledge === 'only-create') ? 'create' : 'suggest';
        const dynamicFields = document.getElementById('dynamicFields');

        if (dynamicFields) dynamicFields.innerHTML = '';
        const hoverEffectTest = hoverEffect(this.treeDrawer.createPopUp, currentNodeId);
        dynamicFields?.appendChild(hoverEffectTest);

        const endpointFieldMapNew = {
            addParent: {
                new: {
                    endpoint: { create: 'addNewParent', suggest: 'suggestNewParent' },
                    label: { create: { MALE: "Add New Father", FEMALE: "Add New Mother" }, suggest: { MALE: "Suggest New Father", FEMALE: "Suggest New Mother" } },
                    fields: ['partnerNodeData']
                },
                existing: {
                    endpoint: { create: 'addExistingParent', suggest: 'suggestExistingParent' },
                    label: { create: { MALE: "Add Existing Father", FEMALE: "Add Existing Mother" }, suggest: { MALE: "Suggest Existing Father", FEMALE: "Suggest Existing Mother" } },
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

            if (currentMemberMode === 'suggest') {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'reason';
                input.name = 'reason';
                input.placeholder = 'Reason';
                input.required = false;
                input.className = 'dynamic-input';
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
                        input.required = name === 'name' || name === 'gender';
                        input.className = 'dynamic-input';
                        if (name === 'gender') input.value = node.data.gender;
                        dynamicFields?.appendChild(input);
                    });
                } else if (field === 'targetNodeId' && actionType === genericActionTypes.addParent) {
                    nodeManagmentService.fetchAllowedParents(this.familyTreeId, currentNodeId, node.data.gender)
                        .then(item => {
                            const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing parent Node', 'Couldn\'t find a possible parent');
                            const referenceElement = document.getElementById('actionOptionSelect');
                            if (referenceElement && referenceElement.parentNode === dynamicFields) {
                                dynamicFields?.insertBefore(dropdown, referenceElement.nextSibling || null);
                            } else {
                                dynamicFields?.appendChild(dropdown);
                            }
                        })
                        .catch(error => console.error("Error fetching marriable nodes:", error));
                } else if (field === 'targetNodeId' && actionType === genericActionTypes.addPartner) {
                    nodeManagmentService.fetchMarriableNodes(this.familyTreeId, currentNodeId)
                        .then(item => {
                            const dropdown = createDropdown(item, 'targetNodeId', 'Select Existing Node', 'Couldn\'t find a possible pair');
                            const referenceElement = document.getElementById('actionOptionSelect');
                            if (referenceElement && referenceElement.parentNode === dynamicFields) {
                                dynamicFields?.insertBefore(dropdown, referenceElement.nextSibling || null);
                            } else {
                                dynamicFields?.appendChild(dropdown);
                            }
                        })
                        .catch(error => console.error("Error fetching marriable nodes:", error));
                } else if (field === 'partnershipType') {
                    dynamicFields?.appendChild(createDropdown(this.relationType, 'partnershipType', 'select relationship Status', 'Unknown Error Occurred'));
                } else if (field?.endsWith('Id')) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = field;
                    input.placeholder = field;
                    input.required = true;
                    input.className = 'dynamic-input';
                    if (actionType === 'addChildOfTwoParents' && field === 'targetNodeId') {
                        const partnerId = node.data.motherId === currentNodeId ? node.data.fatherId : node.data.motherId;
                        if (input) input.value = `${partnerId}`;
                        const p = document.createElement('p');
                        const partnerNode = this.nodeManager.getNode(partnerId as number);
                        p.textContent = `Partner: ${partnerNode.name}`;
                        dynamicFields?.appendChild(p);
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

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.id = 'allowed-save';
            saveButton.className = 'dynamic-input';
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
                const familyTreeForm = document.getElementById('familyTreeForm');
                const formData = new FormData(familyTreeForm as HTMLFormElement);
                const endpoint = localStorageManager.getItem('postEndpoint') as EndpointKey | null;
                const data: { [key: string]: string; } = Object.fromEntries(formData.entries());

                if (endpoint && endpoint in endpointServiceMap) {
                    try {
                        const serviceFunction = endpointServiceMap[endpoint];
                        await serviceFunction(this.familyTreeId, currentNodeId, data);
                        const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                        if (nodesArray) {
                            this.treeDrawer.fetchData(nodesArray, currentNodeId, true);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }

                const currentData = await this.nodeManager.getNode(currentNodeId);
                const memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, currentNodeId);
                this.htmlElementsManager.createViewMode(currentData, memberPriviledge);
            });
            dynamicFields?.appendChild(saveButton);
        };

        const actionOptions = endpointFieldMapNew[actionType as keyof typeof endpointFieldMapNew];
        type ValidSelectValue = "new" | "existing";
        const actionKeys = actionType as keyof typeof endpointFieldMapNew;

        if (!actionOptions) return;

        if (actionOptions.existing && actionOptions.new) {
            const select = document.createElement('select');
            select.id = 'actionOptionSelect';
            ['existing', 'new'].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = actionOptions[option as keyof typeof actionOptions].label[currentMemberMode][node.data.gender];
                select.appendChild(opt);
            });

            select.addEventListener('change', () => {
                const label = endpointFieldMapNew[actionKeys]?.[select.value as ValidSelectValue]?.label?.[currentMemberMode]?.[node.data.gender];
                const endpointLabel = document.getElementById('endpointLabel');
                if (endpointLabel) endpointLabel.textContent = label ?? null;
                localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys]?.[select.value as ValidSelectValue]?.endpoint[currentMemberMode]);
                generateFields(select.value as 'new' | 'existing');
            });
            dynamicFields?.appendChild(select);
            const label = endpointFieldMapNew[actionKeys]?.['existing' as ValidSelectValue]?.label[currentMemberMode][node.data.gender];
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys]['existing' as ValidSelectValue]?.endpoint[currentMemberMode]);
            const endpointLabel = document.getElementById('endpointLabel');
            if (endpointLabel) endpointLabel.textContent = label ?? null;
            generateFields('existing');
        } else {
            const option = (actionOptions.new ? 'new' : 'existing') as 'new' | 'existing';
            const label = endpointFieldMapNew[actionKeys][option]?.label[currentMemberMode][node.data.gender];
            const endpointLabel = document.getElementById('endpointLabel');
            if (endpointLabel) endpointLabel.textContent = label ?? null;
            localStorageManager.setItem('postEndpoint', endpointFieldMapNew[actionKeys][option]?.endpoint[currentMemberMode]);
            generateFields(option);
        }
    }
}
