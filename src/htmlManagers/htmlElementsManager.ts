import { DrawableNode, FamilyNode, genericActionTypes, MemberPriviledge, SuggestEdits } from "../interfaces/node.interface";
import { nodeManagmentService } from "../services/node-managment-service";
import { FamilyTreeDrawer } from "../FamilyTreeDrawer";
import { DataManager } from "../services/data-manager";
import { TabManager } from "./TabManager";
import { SuggestionManager } from "./SuggestionManager";
import { ActionFormManager } from "./ActionFormManager";
import { NodeModeManager } from "./NodeModeManager";

export class HtmlElementsManager {
    private treeDrawer: FamilyTreeDrawer;
    private familyTreeId: number;
    private rootNodeId: number;
    public nodeManager: DataManager;
    // @ts-ignore
    private tabManager: TabManager;
    private suggestionManager: SuggestionManager;
    private actionFormManager: ActionFormManager;
    private nodeModeManager: NodeModeManager;

    constructor(nodeManager: DataManager, familyTreeId: number, rootNodeId: number, drawer: FamilyTreeDrawer) {
        this.treeDrawer = drawer;
        this.rootNodeId = rootNodeId;
        this.familyTreeId = familyTreeId;
        this.nodeManager = nodeManager;

        this.tabManager = new TabManager(this, nodeManager, familyTreeId);
        this.suggestionManager = new SuggestionManager(this, nodeManager, familyTreeId, drawer);
        this.actionFormManager = new ActionFormManager(this, nodeManager, familyTreeId, drawer);
        this.nodeModeManager = new NodeModeManager(this, nodeManager, familyTreeId, drawer);

        const modeButton = document.getElementById('modeType');
        modeButton?.addEventListener('click', () => {
            this.treeDrawer.toggleModes();
        });
    }

    setRootNodeId(nodeId: number) {
        this.rootNodeId = nodeId;
    }

    setModeType(text: string) {
        const modeButton = document.getElementById('modeType');
        if (modeButton) modeButton.textContent = text;
    }

    showTab(tab: string) {
        const allTabElements = document.querySelectorAll('.tab');
        allTabElements.forEach(tabEl => {
            const id = tabEl.id.replace('Tab', '');
            const content = document.getElementById(`${id}Content`);
            if (content) content.classList.add('hidden');
            tabEl.classList.remove('active');
        });

        const selectedContent = document.getElementById(`${tab}Content`);
        const selectedTab = document.getElementById(`${tab}Tab`);
        if (selectedContent) selectedContent.classList.remove('hidden');
        if (selectedTab) selectedTab.classList.add('active');

        if (tab === 'editSuggestions') {
            this.displaySuggestionUpdateEdits(this.rootNodeId);
        }
    }

    async refreshAfterSuggestion(rootNodeId: number) {
        const nodesArray = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
        if (nodesArray) {
            this.treeDrawer.fetchData(nodesArray, rootNodeId, true);
        }
        this.displaySuggestionUpdateEdits(rootNodeId);
        this.treeDrawer.updateNodesNameText();
    }

    displaySuggestionUpdateEdits(familyNodeId: number) {
        this.suggestionManager.displaySuggestionUpdateEdits(familyNodeId);
    }

    displaySuggestionInfo(suggestionBody: SuggestEdits, rootNodeId: number) {
        this.suggestionManager.displaySuggestionInfo(suggestionBody, rootNodeId);
    }

    setActionTypeLabel(actionType: genericActionTypes, node: d3.HierarchyNode<DrawableNode>, currentNodeId: number) {
        this.actionFormManager.setActionTypeLabel(actionType, node, currentNodeId);
    }

    createViewMode(data: FamilyNode, memberPriviledge: MemberPriviledge) {
        this.nodeModeManager.createViewMode(data, memberPriviledge);
    }

    createEditMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        this.nodeModeManager.createEditMode(nodeData, memberPriviledge);
    }

    deleteMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        this.nodeModeManager.deleteMode(nodeData, memberPriviledge);
    }

    suggestDeleteMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        this.nodeModeManager.suggestDeleteMode(nodeData, memberPriviledge);
    }

    createSuggestionMode(nodeData: FamilyNode, memberPriviledge: MemberPriviledge) {
        this.nodeModeManager.createSuggestionMode(nodeData, memberPriviledge);
    }

    infoDisplayer(nodeData: FamilyNode, rootNodeId: number) {
        this.setRootNodeId(rootNodeId);
        this.createViewMode(nodeData, this.nodeManager.memberPriviledge(this.familyTreeId, rootNodeId));
    }

    displayNodeDetails() {
        this.showTab('details');
        this.setModeType('view');
        return 'view';
    }
}