import { FamilyTreeDrawer } from "../FamilyTreeDrawer";
import { FamilyNode, MemberPriviledge, Contributor, genericActionTypes, formDataEntries } from "../interfaces/node.interface";
import { DataManager } from "../services/data-manager";
import { nodeManagmentService } from "../services/node-managment-service";
import { suggestionCreationService } from "../services/suggestion-creation-service";
import { otherNodeDetails, contributorsElementGenerator } from "../utils/utils";
import { HtmlElementsManager } from "./htmlElementsManager";

export class NodeModeManager {
    private htmlElementsManager: HtmlElementsManager;
    private nodeManager: DataManager;
    private familyTreeId: number;
    private treeDrawer: FamilyTreeDrawer;

    constructor(htmlElementsManager: HtmlElementsManager, nodeManager: DataManager, familyTreeId: number, treeDrawer: FamilyTreeDrawer) {
        this.htmlElementsManager = htmlElementsManager;
        this.nodeManager = nodeManager;
        this.familyTreeId = familyTreeId;
        this.treeDrawer = treeDrawer;
    }

    createViewMode(data: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';

        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const field = document.createElement('p');
            field.innerHTML = `<strong>${key}:</strong> ${data[key as keyof FamilyNode] || 'N/A'}`;
            field.className = 'dynamic-input';
            dynamicFields?.appendChild(field);
        });

        if (memberPriviledge === 'create' || memberPriviledge === 'update') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => {
                this.treeDrawer.toggleModes(data.id, 'edit');
                this.htmlElementsManager.createEditMode(data, memberPriviledge);
            });
            dynamicFields?.appendChild(editButton);

            const details = otherNodeDetails(this.nodeManager.getNode(data.id));
            dynamicFields?.appendChild(details);
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id) as Contributor);
            dynamicFields?.appendChild(contributors);

            const deleteAllowed = this.nodeManager.isAllowedAction(data.id, genericActionTypes.DeleteNode);
            const canSuggest = this.nodeManager.canContribute();
            const canUpdate = this.nodeManager.canUpdate(data.id);

            if (deleteAllowed && canSuggest) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = canUpdate ? 'Delete' : 'Suggest Deletion';
                deleteButton.className = 'delete-button';
                deleteButton.addEventListener('click', () => {
                    this.treeDrawer.toggleModes(data.id, 'edit');
                    if (canUpdate) {
                        this.htmlElementsManager.deleteMode(data, memberPriviledge);
                    } else {
                        this.htmlElementsManager.suggestDeleteMode(data, memberPriviledge);
                    }
                });
                dynamicFields?.appendChild(deleteButton);
            }
        } else if (memberPriviledge === 'suggest' || memberPriviledge === 'only-create') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Suggest Edit';
            editButton.className = 'dynamic-input';
            editButton.addEventListener('click', () => {
                this.htmlElementsManager.createSuggestionMode(data, memberPriviledge);
            });
            dynamicFields?.appendChild(editButton);

            const deleteAllowed = this.nodeManager.isAllowedAction(data.id, genericActionTypes.DeleteNode);
            if (deleteAllowed) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Suggest Deletion';
                deleteButton.className = 'delete-button';
                deleteButton.addEventListener('click', () => {
                    this.treeDrawer.toggleModes(data.id, 'edit');
                    this.htmlElementsManager.suggestDeleteMode(data, memberPriviledge);
                });
                dynamicFields?.appendChild(deleteButton);
            }

            const details = otherNodeDetails(this.nodeManager.getNode(data.id));
            const contributors = contributorsElementGenerator(this.nodeManager.data.contributors.find(item => item.id === data.id) as Contributor);
            dynamicFields?.appendChild(contributors);
            dynamicFields?.appendChild(details);
        }
    }

    createEditMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';

        const formData: { [key: string]: HTMLInputElement; } = {};
        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = key.includes('Date') ? 'date' : key.includes('Id') ? 'number' : 'text';
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
            e.preventDefault();
            const updatedData: { [key: string]: string; } = {};
            Object.keys(formData).forEach(key => {
                if (formData[key]?.value && formData[key].value !== nodeData[key as keyof FamilyNode]) {
                    updatedData[key] = formData[key].value;
                }
            });
            await nodeManagmentService.updateNode(this.familyTreeId, nodeData.id, updatedData);
            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }
            const updatedNode = this.nodeManager.getNode(nodeData.id);
            this.htmlElementsManager.createViewMode(updatedNode, memberPriviledge);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'dynamic-input';
        cancelButton.addEventListener('click', () => {
            this.htmlElementsManager.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields?.appendChild(saveButton);
        dynamicFields?.appendChild(cancelButton);
    }

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
            e.preventDefault();
            await nodeManagmentService.deleteNode(this.familyTreeId, nodeData.id);
            const previousNodeId = this.treeDrawer.popRootHistory(nodeData.id);
            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, previousNodeId as number, true);
            }
        });

        const deleteButtonNo = document.createElement('button');
        deleteButtonNo.textContent = 'No';
        deleteButtonNo.className = 'dynamic-input';
        deleteButtonNo.addEventListener('click', () => {
            this.htmlElementsManager.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields?.appendChild(deleteMessage);
        dynamicFields?.appendChild(deleteButtonYes);
        dynamicFields?.appendChild(deleteButtonNo);
    }

    suggestDeleteMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';

        const input = document.createElement('input') as HTMLInputElement;
        input.type = 'text';
        input.id = 'reason';
        input.name = 'reason';
        input.placeholder = 'Reason';
        input.className = 'dynamic-input';
        input.required = false;
        const familyTreeForm = document.getElementById('familyTreeForm');
        familyTreeForm?.appendChild(input);
        dynamicFields?.append(input);

        const suggestDeleteButton = document.createElement('button');
        suggestDeleteButton.textContent = 'Suggest Delete';
        suggestDeleteButton.className = 'delete-button';
        suggestDeleteButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const formData = new FormData(familyTreeForm as HTMLFormElement);
            const deletionBody: formDataEntries = Object.fromEntries(formData.entries());
            if (input.value) deletionBody['reason'] = input.value;

            await suggestionCreationService.suggestDeleteNode(this.familyTreeId, nodeData.id, deletionBody);
            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }
            this.htmlElementsManager.createViewMode(nodeData, memberPriviledge);
        });

        const deleteButtonNo = document.createElement('button');
        deleteButtonNo.textContent = 'No';
        deleteButtonNo.className = 'dynamic-input';
        deleteButtonNo.addEventListener('click', () => {
            this.htmlElementsManager.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields?.appendChild(suggestDeleteButton);
        dynamicFields?.appendChild(deleteButtonNo);
    }

    createSuggestionMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        const dynamicFields = document.getElementById('dynamicFields');
        if (dynamicFields) dynamicFields.innerHTML = '';

        const formData: { [key: string]: HTMLInputElement; } = {};
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'reason';
        input.name = 'reason';
        input.placeholder = 'Reason';
        input.className = 'dynamic-input';
        input.required = false;
        dynamicFields?.appendChild(input);

        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const input = document.createElement('input');
            input.type = key.includes('Date') ? 'date' : key.includes('Id') ? 'number' : 'text';
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
            e.preventDefault();
            const familyTreeForm = document.getElementById('familyTreeForm');
            const formData = new FormData(familyTreeForm as HTMLFormElement);
            const filteredData: formDataEntries = Object.fromEntries(formData.entries());

            Object.keys(formData).forEach(key => {
                if (formData.get(key) && formData.get(key) !== nodeData[key as keyof FamilyNode]) {
                } else {
                    delete filteredData[key];
                }
            });

            await suggestionCreationService.suggestUpdateNode(this.familyTreeId, nodeData.id, filteredData);
            const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                this.treeDrawer.fetchData(nodesArray, nodeData.id, true);
            }
            const rootNode = this.nodeManager.getNode(nodeData.id);
            this.htmlElementsManager.createViewMode(rootNode, memberPriviledge);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'dynamic-input';
        cancelButton.addEventListener('click', () => {
            this.htmlElementsManager.createViewMode(nodeData, memberPriviledge);
        });

        dynamicFields?.appendChild(saveButton);
        dynamicFields?.appendChild(cancelButton);
    }
}
