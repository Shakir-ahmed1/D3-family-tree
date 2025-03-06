import d3 from "d3";
import { ND } from "./dataManager";
import { DrawableNode } from "./node.interface";

export class EditModeDrawer {
    private childTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private parentTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);

    private fetchedEditModeParents;
    private fetchedEditModeChildren;
    private childRoot;
    private childTreeData;
    private childNodes;
    private parentRoot;
    private parentTreeData;
    private parentNodes;
    private rootNodeId;
    constructor() {

    }
    preProcessData(rootId: number) {
        const editModeParents = ND.customBuildParent(rootId)
        const editModeChildren = ND.customBuildChildren(rootId)
        this.fetchedEditModeParents = editModeParents;
        this.fetchedEditModeChildren = editModeChildren;
    }
    renewTreeData(child: DrawableNode, parent: DrawableNode) {
        this.childRoot = d3.hierarchy<DrawableNode>(child);
        this.childTreeData = this.childTreeLayout(this.childRoot);
        this.childNodes = this.childTreeData.childendants().filter(item => item.data.id !== 0);
        this.parentRoot = d3.hierarchy<DrawableNode>(parent);
        this.parentTreeData = this.parentTreeLayout(this.parentRoot);
        this.parentNodes = this.parentTreeData.childendants().filter(item => item.data.id !== 0);
    }
    updateTreeDrawing(rootNodeId: number) {
        this.renewTreeData(this.fetchedDesendants as DrawableNode, this.fetchedAncestors as DrawableNode);
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.drawNodes()
    }


}