import { FamilyTreeDrawer } from "../FamilyTreeDrawer";
import { SuggestEdits, SuggestableActions, FamilyNode } from "../interfaces/node.interface";
import { DataManager } from "../services/data-manager";
import { nodeManagmentService } from "../services/node-managment-service";
import { suggestionService } from "../services/suggestion-service";
import { createUserProfileElement } from "../utils/utils";
import { HtmlElementsManager } from "./htmlElementsManager";

export class SuggestionManager {
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

    reviewUpdateSuggestionBody(suggestionObject: SuggestEdits, rootNodeId: number) {
        const rootNodeData = this.nodeManager.getNode(rootNodeId);
        const suggestionContainer = document.createElement('div');
        suggestionContainer.style.border = '1px black solid';
        suggestionContainer.style.marginBottom = '5px';

        const suggestingMember = createUserProfileElement(suggestionObject.suggestedBy);
        suggestionContainer.appendChild(suggestingMember as HTMLDivElement);
        const field = document.createElement('p');
        field.innerHTML = `<strong>Reason:</strong> ${suggestionObject.reason || 'N/A'}`;
        field.className = 'dynamic-input';
        suggestionContainer.appendChild(field);

        ['name', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
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
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted');
                await this.htmlElementsManager.refreshAfterSuggestion(rootNodeId);
            });
            suggestionContainer.appendChild(acceptButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'buttonSecondary';
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected');
                await this.htmlElementsManager.refreshAfterSuggestion(rootNodeId);
            });
            suggestionContainer.appendChild(rejectButton);
        }

        const isSuggestor = suggestionObject.suggestedBy.id === this.nodeManager.data.myInfo?.id;
        if (isSuggestor) {
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'buttonPrimary';
            cancelButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id);
                await this.htmlElementsManager.refreshAfterSuggestion(rootNodeId);
            });
            suggestionContainer.appendChild(cancelButton);
        }

        return suggestionContainer;
    }

    reviewDeletionSuggestionBody(suggestionObject: SuggestEdits, rootNodeId: number) {
        const rootNodeData = this.nodeManager.getNode(rootNodeId);
        const suggestionContainer = document.createElement('div');
        suggestionContainer.style.border = '1px black solid';
        suggestionContainer.style.marginBottom = '5px';

        const suggestingMember = createUserProfileElement(suggestionObject.suggestedBy);
        suggestionContainer.appendChild(suggestingMember as HTMLDivElement);
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
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'accepted');
                const previousNodeId = this.treeDrawer.popRootHistory(rootNodeId);
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, previousNodeId as number, true);
                    this.treeDrawer.toggleModes(previousNodeId, 'view');
                }
                this.htmlElementsManager.displaySuggestionUpdateEdits(rootNodeId);
                this.treeDrawer.updateNodesNameText();
            });
            suggestionContainer.appendChild(acceptButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'buttonSecondary';
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionObject.id, 'rejected');
                await this.htmlElementsManager.refreshAfterSuggestion(rootNodeId);
            });
            suggestionContainer.appendChild(rejectButton);
        }

        const isSuggestor = suggestionObject.suggestedBy.id === this.nodeManager.data.myInfo?.id;
        if (isSuggestor) {
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'buttonPrimary';
            cancelButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.cancelSuggestion(this.familyTreeId, suggestionObject.id);
                await this.htmlElementsManager.refreshAfterSuggestion(rootNodeId);
            });
            suggestionContainer.appendChild(cancelButton);
        }

        return suggestionContainer;
    }

    displaySuggestionUpdateEdits(familyNodeId: number) {
        const pendingSuggestionsDisplayer = document.getElementById('pendingUpdateSuggestions');
        if (pendingSuggestionsDisplayer) pendingSuggestionsDisplayer.innerHTML = '';

        const nodesSuggestions = this.nodeManager.getNodeSuggestions(familyNodeId).filter(
            item => item.suggestedAction === SuggestableActions.UpdateNode || item.suggestedAction === SuggestableActions.DeleteNode
        );

        if (nodesSuggestions.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No pending suggestions';
            message.style.textAlign = 'center';
            pendingSuggestionsDisplayer?.appendChild(message);
        } else {
            nodesSuggestions.forEach(item => {
                if (item.suggestedAction === SuggestableActions.UpdateNode) {
                    const suggestionBody = this.reviewUpdateSuggestionBody(item, familyNodeId);
                    pendingSuggestionsDisplayer?.appendChild(suggestionBody);
                } else if (item.suggestedAction === SuggestableActions.DeleteNode) {
                    const suggestionBody = this.reviewDeletionSuggestionBody(item, familyNodeId);
                    pendingSuggestionsDisplayer?.appendChild(suggestionBody);
                }
            });
        }
    }

    displaySuggestionInfo(suggestionBody: SuggestEdits, rootNodeId: number) {
        const dynamicFields = document.getElementById('dynamicFields');
        let nodeData: FamilyNode;
        if (["ChildOfOneParent", "ChildOfTwoParents"].includes(suggestionBody.suggestedAction)) {
            nodeData = suggestionBody.suggestedNode2!;
        } else {
            nodeData = suggestionBody.suggestedNode1!;
        }

        if (dynamicFields) dynamicFields.innerHTML = '';

        const reason = document.createElement('p');
        reason.innerHTML = `<strong>Reason:</strong> ${suggestionBody.reason || 'N/A'}`;
        reason.className = 'dynamic-input';
        dynamicFields?.appendChild(reason);

        ['name', 'gender', 'title', 'phone', 'address', 'nickName', 'birthDate', 'deathDate'].forEach((key) => {
            const field = document.createElement('p');
            field.innerHTML = `<strong>${key}:</strong> ${nodeData[key as keyof FamilyNode] || 'N/A'}`;
            field.className = 'dynamic-input';
            dynamicFields?.appendChild(field);
        });

        if (suggestionBody.suggestedBy) {
            const suggetorContainer = document.createElement('div');
            suggetorContainer.style.border = '1px black solid';
            const field = document.createElement('p');
            field.innerHTML = `<strong>Suggested By:</strong>`;
            field.className = 'dynamic-input';
            const suggestor = createUserProfileElement(suggestionBody.suggestedBy);
            suggetorContainer.appendChild(field);
            suggetorContainer.appendChild(suggestor as Node);
            dynamicFields?.appendChild(suggetorContainer);
        }

        if (this.nodeManager.canCreate(rootNodeId)) {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'dynamic-input';
            acceptButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'accepted');
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId);
                this.htmlElementsManager.createViewMode(rootNode, this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId));
            });
            dynamicFields?.appendChild(acceptButton);

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.className = 'dynamic-input';
            rejectButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await suggestionService.acceptOrRejectSuggestion(this.familyTreeId, suggestionBody.id, 'rejected');
                const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
                if (nodesArray) {
                    this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
                }
                const rootNode = this.nodeManager.getNode(rootNodeId);
                this.htmlElementsManager.createViewMode(rootNode, this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId));
            });
            dynamicFields?.appendChild(rejectButton);
        }
    }
}
