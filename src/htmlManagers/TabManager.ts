import { DataManager } from "../services/data-manager";
import { HtmlElementsManager } from "./htmlElementsManager";

export class TabManager {
    private htmlElementsManager: HtmlElementsManager;
    private nodeManager: DataManager;
    private familyTreeId: number;

    constructor(htmlElementsManager: HtmlElementsManager, nodeManager: DataManager, familyTreeId: number) {
        this.htmlElementsManager = htmlElementsManager;
        this.nodeManager = nodeManager;
        this.familyTreeId = familyTreeId;
        this.initTabs();
    }

    initTabs() {
        document.getElementById('detailsTab')?.addEventListener('click', () => this.htmlElementsManager.showTab('details'));
        document.getElementById('imagesTab')?.addEventListener('click', () => this.htmlElementsManager.showTab('images'));
        document.getElementById('notesTab')?.addEventListener('click', () => this.htmlElementsManager.showTab('notes'));

        if (this.nodeManager?.data?.canContribute) {
            const editTab = document.createElement('div');
            editTab.className = 'tab';
            editTab.id = 'editSuggestionsTab';
            editTab.textContent = 'Edit Suggestions';
            editTab.addEventListener('click', () => this.htmlElementsManager.showTab('editSuggestions'));

            const notesTab = document.getElementById('notesTab');
            notesTab?.parentNode?.insertBefore(editTab, notesTab.nextSibling);
        }
    }
}
