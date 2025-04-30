import * as d3 from "d3";
import { HtmlElementsManager } from "./htmlElementsManager";
import { CustomFlatData, DrawableNode, FamilyNode, genericActionTypes } from "./interfaces/node.interface";
import { DataManager } from "./services/data-manager";
import { nodeManagmentService } from "./services/node-managment-service";
import { stringMax, stringMin } from "./utils/utils";

function calculatePositionChildParentPosition(x: number, nodeRadius: number, scale: number, gender: string) {
    const offset = 1.5
    let sign;
    if (gender === 'MALE') {
        sign = 1
    } else {
        sign = -1
    }
    return x + sign * ((nodeRadius * offset) * scale)
}


async function fetchNodeImage(nodeId: number, token?: string): Promise<string | null> {
    const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`
    try {
        const response = await fetch(`http://localhost:3000/api/family-tree/1/nodes/${nodeId}/primaryPicture`, {
            headers: {
                'Authorization': token ? token : bearerToken,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error("Image not found");

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (err) {
        console.warn(`Could not fetch image for node ${nodeId}:`, err);
        return null;
    }
}











export class FamilyTreeDrawer {
    private colors = {
        suggestionMale: '#9FCC9F',
        suggestionFemale: '#B58FCB',
        nodeMale: '#9FC0CC',
        nodeFemale: '#D8A5AD',
        nodeDefault: '#AAA',
        actionUpdate: '#FFD700',
        actionCreate: '#2E8B57',
        actionSuggest: '#D2691E',
        actionOnlyCreate: '#2E8B57',
        actionTextColor: "#ffffff",
        lineMarriage: "#000",
        lineParentChild: "#ccc",
        circlularStroke: "#999",
        editNodeBackground: "#f0f0f0"
    }
    private values = {
        svgWidth: 800,
        svgHeight: 800,
        nodeRadius: 40,
        nodesVerticalSpacingFactor: 3.3,
        nodesHorizontalSpacingFactor: 3,
        svgWidthPaddingFactor: 4,
        svgHeightPaddingFactor: 4,
        fadeInAnimationDuration: 1000,
        fadeOutAnimationDuration: 1000,
        fadeInAnimationDurationEditMode: 1000,
        fadeOutAnimationDurationEditMode: 1000
    }
    private sourceData: any
    private width = this.values.svgWidth;
    private height = this.values.svgHeight;
    private minTreeX: number = 0;
    private minTreeY: number = 0;
    private maxTreeX: number = 0;
    private maxTreeY: number = 0;
    private memberPriviledge: string = 'viewer';
    private fetchedDesendants: DrawableNode | undefined;
    private fetchedAncestors: DrawableNode | undefined;
    private oldJointData: d3.HierarchyNode<DrawableNode>[] = [];
    private NODE_RADIUS = this.values.nodeRadius; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * this.values.nodesVerticalSpacingFactor; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * this.values.nodesVerticalSpacingFactor; // Space between siblings/spouses
    private widthPadding = this.values.svgWidthPaddingFactor * this.NODE_RADIUS;
    private heightPadding = this.values.svgHeightPaddingFactor * this.NODE_RADIUS;
    private descTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private descRoot: d3.HierarchyNode<DrawableNode> | undefined;
    private descTreeData: d3.HierarchyPointNode<DrawableNode> | undefined;
    private descNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private jointNode: d3.HierarchyNode<DrawableNode>[] = []
    private anceTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private anceRoot: d3.HierarchyNode<DrawableNode> | undefined;
    private anceTreeData: d3.HierarchyPointNode<DrawableNode> | undefined;
    private anceNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private rootNodeId: number | undefined;
    private containerId: string = '#treePopUp';
    private fadeInAnimationDuration = this.values.fadeInAnimationDuration;
    private fadeOutAnimationDuration = this.values.fadeOutAnimationDuration;
    private oldRootNodeId: number | undefined;
    private offSetX = 0;
    private offSetY = 0;
    private scaleFactor = 0.5;
    private svg
    private familyTreeGroup
    descendantsGroup
    currentMode = 'view';
    private rootHistory: number[] = []

    // edit mode
    private fetchedEditModeParents: DrawableNode | undefined;
    private fetchedEditModeChildren: DrawableNode | undefined;


    private childTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private childRoot: d3.HierarchyNode<DrawableNode> | undefined;
    private childTreeData: d3.HierarchyPointNode<DrawableNode> | undefined;
    private childNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private parentTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private parentRoot: d3.HierarchyNode<DrawableNode> | undefined;
    private parentTreeData: d3.HierarchyPointNode<DrawableNode> | undefined;
    private parentNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private oldCurrentEditModeNodeId: number | undefined;
    private oldJointDataEditMode: d3.HierarchyNode<DrawableNode>[] = [];
    private minTreeXEditMode: number = 0;
    private maxTreeXEditMode: number = 0;
    private minTreeYEditMode: number = 0;
    private maxTreeYEditMode: number = 0;
    private offSetXEditMode: number = 0;
    private offSetYEditMode: number = 0;
    private scaleFactorEditMode: number = 0.5;


    private isPopUp = false;

    descendantsGroupEditMode
    // descendantsGroupEditMode = this.familyTreeGroup.append("g").attr("class", "descendantsEditMode");
    private fadeInAnimationDurationEditMode = this.values.fadeInAnimationDurationEditMode;
    private fadeOutAnimationDurationEditMode = this.values.fadeOutAnimationDurationEditMode;
    private formManager: HtmlElementsManager | undefined;
    familyTreeId: number;
    nodeManager: DataManager;
    private nonFounderId

    constructor(ND: DataManager, familyTreeId: number, containerId: string, width: number, height: number, isPopUp: boolean, nonFounderId?: number) {
        this.nonFounderId = nonFounderId
        this.containerId = containerId
        this.width = width;
        this.height = height;
        this.isPopUp = isPopUp;

        this.svg = d3.select('body').select(this.containerId)
            .append('svg')
            .attr('class', 'svgContainer')
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g");
        this.familyTreeGroup = this.svg.append("g").attr("class", "familyTree").attr('opacity', 1).attr('transform', 'translate(0,0)');
        this.descendantsGroup = this.familyTreeGroup.append("g").attr("class", "descendants");
        this.descendantsGroupEditMode = this.descendantsGroup

        this.familyTreeId = familyTreeId
        this.nodeManager = ND;
        this.intialize()
    }

    async intialize() {
        let tempRootId;
        try {
            let nodesArray: CustomFlatData = await nodeManagmentService.fetchNodesArrays(this.familyTreeId);
            if (nodesArray) {
                let founderNode;
                if (this.nonFounderId) {
                    founderNode = nodesArray.familyNodes.find(item => item.id === this.nonFounderId);
                } else {
                    founderNode = nodesArray.familyNodes.find(item => item.isFounder);
                }
                tempRootId = founderNode?.id as number
                this.nodeManager.setData(nodesArray)
                if (!this.isPopUp) { this.formManager = new HtmlElementsManager(this.nodeManager, this.familyTreeId, tempRootId, this) }
                if (founderNode) {
                    this.fetchData(nodesArray, founderNode.id as number, true);
                } else {
                    throw new Error('Founder Node Not Found')
                }
                // alert('Data fetched successfully. You can now set Self Node ID to draw the tree.');
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }

    }
    updateSVGSize(size: number) {
        this.width = size
        this.height = size

        d3.select('.svgContainer')
            .transition()
            .attr("width", this.width)
            .attr("height", this.height)
            .duration(this.fadeInAnimationDuration)
            ;
        this.fetchData(this.sourceData, this.rootNodeId as number, false)
    }
    private attachNodes() {
        this.anceNodes.forEach(item => {
            item.data.catag = 'ance'
        })
        const foundAnceRoot = this.anceNodes.find(item => item.data.id === this.rootNodeId)
        const foundDescRoot = this.descNodes.find(item => item.data.id === this.rootNodeId)
        this.descNodes.forEach(item => {
            item.data.catag = 'desc'
        })
        if (foundDescRoot && foundAnceRoot) {
            foundDescRoot.data.mother = foundAnceRoot?.data.mother as string
            foundDescRoot.data.father = foundAnceRoot?.data.father as string;
            foundDescRoot.data.catag = 'ance'
        }

        this.jointNode = [...this.descNodes, ...this.anceNodes.filter(item => item.data.id !== this.rootNodeId)]


    }
    private attachNodesEditMode() {

        const foundParentCurrent = this.parentNodes.find(item => item.data.id === this.rootNodeId)
        const foundChildCurrent = this.childNodes.find(item => item.data.id === this.rootNodeId)

        if (foundChildCurrent && foundParentCurrent) {
            foundChildCurrent.data.father = foundParentCurrent.data.father as string;
            foundChildCurrent.data.mother = foundParentCurrent.data.mother as string;
            foundChildCurrent.data.catag = 'editAnce'
        }

        this.jointNode = [...this.childNodes, ...this.parentNodes.filter(item => item.data.id !== this.rootNodeId)]
    }

    private adjustPostioning() {
        this.attachNodes()
        this.joinTree();
        this.centerTree()
        this.scaleGroupToFit()
    }
    private adjustPostioningEditMode() {
        this.attachNodesEditMode()
        this.joinTreeEditMode();
        this.centerTreeEditMode()
        this.scaleGroupToFitEditMode()
    }
    private drawNodes() {
        this.adjustPostioning()
        this.custPrint(this.jointNode)
        this.drawDescMarriageLines();
        this.drawDescParentChildLine();
        this.drawDescNodes();
        this.reorderElements();
        this.centerFamilyGroup();
    }
    private drawNodesEditMode() {
        this.adjustPostioningEditMode()
        this.custPrint(this.jointNode)
        this.drawDescMarriageLinesEditMode();
        this.drawDescParentChildLineEditMode();
        this.drawDescNodesEditMode();
        this.reorderElementsEditMode();
        this.centerFamilyGroupEditMode();
    }

    fetchData(fetchedNodesArray: any, rootId: number, setData: boolean) {
        this.sourceData = fetchedNodesArray;
        if (setData) {
            this.nodeManager.setData(fetchedNodesArray)
        }
        this.memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, rootId)

        if (this.currentMode === 'view') {
            this.preProcessData(rootId)
        } else {
            this.preProcessDataEditMode(rootId)
        }
    }
    private preProcessData(rootId: number): void {
        console.log("ZZZZZZZZZ", this.jointNode, this.rootNodeId)
        if (this.jointNode && this.rootNodeId) {
            const foundCurrentRoot = this.jointNode.find(item => item.data.id === rootId)
            if (foundCurrentRoot) {
                const ancestorsData = this.nodeManager.customBuildAncestorsHierarchy(rootId, undefined);
                const descendantsData = this.nodeManager.customBuildDescendantsHiararchy(rootId);

                this.fetchedDesendants = descendantsData;
                this.fetchedAncestors = ancestorsData;

                this.updateTreeDrawing(rootId)

            } else {
            }
        } else {
            const ancestorsData = this.nodeManager.customBuildAncestorsHierarchy(rootId, undefined);
            const descendantsData = this.nodeManager.customBuildDescendantsHiararchy(rootId);

            this.fetchedDesendants = descendantsData;
            this.fetchedAncestors = ancestorsData;

            this.updateTreeDrawing(rootId)
        }
    }
    private preProcessDataEditMode(rootId: number) {

        if (this.isPopUp) {
            const editModeParents = this.nodeManager.customBuildParentPreview(rootId)
            const editModeChildren = this.nodeManager.customBuildChildrenPreview(rootId)
            this.fetchedEditModeParents = editModeParents;
            this.fetchedEditModeChildren = editModeChildren;
            this.updateTreeDrawingEditMode(rootId)
            this.custPrint(this.jointNode)
        }
        else {
            const editModeParents = this.nodeManager.customBuildParent(rootId)
            const editModeChildren = this.nodeManager.customBuildChildren(rootId)
            this.fetchedEditModeParents = editModeParents;
            this.fetchedEditModeChildren = editModeChildren;
            this.updateTreeDrawingEditMode(rootId)
            this.custPrint(this.jointNode)
        }
    }
    private joinTree() {
        // search the position of the root node in the descendants
        let descRootPossiton = this.descNodes.find(item => item.data.id === this.rootNodeId);
        if (!descRootPossiton) throw new Error('root node wasn\'t found in descendants');
        const descRootX: number = descRootPossiton.x as number;
        const descRootY: number = descRootPossiton.y as number;
        // Reposition the descendants relative to the root
        this.descNodes = this.descNodes.map(node => {
            node.y = node.y as number - descRootY;
            node.x = node.x as number - descRootX;
            return node;
        });
        // Filp ancestors upside down
        this.anceNodes = this.anceTreeData?.descendants()
            .map(node => {
                node.y = -node.y; // Flip Y-axis to move ancestors above the root
                return node;
            }) as d3.HierarchyNode<DrawableNode>[];
        // find the root in the ancestors
        let anceRootPossiton = this.anceNodes.find(item => item.data.id === this.rootNodeId);
        if (!anceRootPossiton) throw new Error('root node wasn\'t found in ancsestors');
        const anceRootX = anceRootPossiton.x as number;
        const anceRootY = anceRootPossiton.y as number;
        // repositon the ancestors relative to the root
        this.anceNodes = this.anceNodes.map(node => {
            node.y = node.y as number - anceRootY;
            node.x = node.x as number - anceRootX;
            return node;
        });
        if (this.oldJointData.length > 0 && this.oldRootNodeId) {
            const oldRootNode = this.oldJointData.find(item => item.data.id === this.rootNodeId);
            const newRootNode = this.jointNode.find(item => item.data.id === this.rootNodeId)
            const rootOffSetX: number = newRootNode?.x as number + (oldRootNode?.x as number)
            const rootOffSetY: number = newRootNode?.y as number + (oldRootNode?.y as number)
            this.jointNode.forEach(item => {
                item.x = item.x as number + rootOffSetX
                item.y = item.y as number + rootOffSetY
            })
        }
    }
    private joinTreeEditMode() {
        // search the position of the root node in the descendants
        let childRootPossiton = this.childNodes.find(item => item.data.id === this.rootNodeId);
        if (!childRootPossiton) throw new Error('root node wasn\'t found in descendants');
        const childRootX: number = childRootPossiton.x as number;
        const childRootY: number = childRootPossiton.y as number;
        // Reposition the descendants relative to the root
        // this.custPrint(this.childNodes)
        this.childNodes = this.childNodes.map(node => {
            node.y = node.y as number - childRootY;
            node.x = node.x as number - childRootX;
            return node;
        });
        // Filp ancestors upside down
        this.parentNodes = this.parentTreeData?.descendants()
            .map(node => {
                node.y = -node.y; // Flip Y-axis to move parentstors above the root
                return node;
            }) as d3.HierarchyNode<DrawableNode>[];
        // find the root in the parentstors
        let parentRootPossiton = this.parentNodes.find(item => item.data.id === this.rootNodeId);
        if (!parentRootPossiton) throw new Error('root node wasn\'t found in ancsestors');
        const parentRootX: number = parentRootPossiton.x as number;
        const parentRootY: number = parentRootPossiton.y as number;
        // repositon the parentstors relative to the root
        this.parentNodes = this.parentNodes.map(node => {
            node.y = node.y as number - parentRootY as number;
            node.x = node.x as number - parentRootX as number;
            return node;
        });
        if (this.oldJointDataEditMode.length > 0 && this.oldRootNodeId) {
            const oldRootNode = this.oldJointDataEditMode.find(item => item.data.id === this.rootNodeId) as d3.HierarchyNode<DrawableNode>;;
            const newRootNode = this.jointNode.find(item => item.data.id === this.rootNodeId) as d3.HierarchyNode<DrawableNode>;
            const rootOffSetX = newRootNode?.x as number + (oldRootNode?.x as number)
            const rootOffSetY = newRootNode?.y as number + (oldRootNode?.y as number)
            this.jointNode.forEach(item => {
                item.x = item.x as number + rootOffSetX
                item.y = item.y as number + rootOffSetY
            })
        }
    }
    custPrint(nodes: d3.HierarchyNode<DrawableNode>[]) {
        const newList = []
        for (let a of nodes) {
            newList.push((a.data))
        }
        console.log("custom print", newList)
    }
    private scaleGroupToFit() {
        const treeWidth = this.maxTreeX - this.minTreeX;
        const treeHeight = this.maxTreeY - this.minTreeY;
        const svgWidth = this.width - this.widthPadding;
        const svgHeight = this.height - this.heightPadding;
        const scaleX = svgWidth / treeWidth;
        const scaleY = svgHeight / treeHeight;
        this.scaleFactor = Math.min(scaleX, scaleY, 1); // Use the smallest scale, and don't scale up
        // console.log(`
        //     scale:
        //     x : (${this.minTreeX}, ${this.maxTreeX})
        //     y : (${this.minTreeY}, ${this.maxTreeY})
        //     scale x: ${scaleX}
        //     scale y: ${scaleY}
        //     `)
        const treeLeftPadding = 2 * (this.NODE_RADIUS) * this.scaleFactor;
        const treeTopPadding = 2 * (this.NODE_RADIUS) * this.scaleFactor;
        this.jointNode.forEach(item => {
            item.x = (this.scaleFactor * (item.x as number)) + treeLeftPadding;
            item.y = (this.scaleFactor * (item.y as number)) + treeTopPadding;
        })
    }
    private scaleGroupToFitEditMode() {
        const treeWidth = this.maxTreeXEditMode - this.minTreeXEditMode;
        const treeHeight = this.maxTreeYEditMode - this.minTreeYEditMode;
        const svgWidth = this.width - this.widthPadding;
        const svgHeight = this.height - this.heightPadding;
        const scaleX = svgWidth / treeWidth;
        const scaleY = svgHeight / treeHeight;
        this.scaleFactorEditMode = Math.min(scaleX, scaleY, 1); // Use the smallest scale, and don't scale up
        // console.log(`
        //     scale:
        //     x : (${this.minTreeX}, ${this.maxTreeX})
        //     y : (${this.minTreeY}, ${this.maxTreeY})
        //     scale x: ${scaleX}
        //     scale y: ${scaleY}
        //     `)
        const treeLeftPadding = 2 * (this.NODE_RADIUS) * this.scaleFactorEditMode;
        const treeTopPadding = 2 * (this.NODE_RADIUS) * this.scaleFactorEditMode;
        this.jointNode.forEach(item => {
            item.x = (this.scaleFactorEditMode * (item.x as number)) + treeLeftPadding;
            item.y = (this.scaleFactorEditMode * (item.y as number)) + treeTopPadding;
        })
    }
    centerFamilyGroup() {
        // const svgRect = this.svg.node().getBoundingClientRect();
        const svgWidth = this.width - this.widthPadding;
        const svgHeight = this.height - this.heightPadding;
        const familyWidth = (this.maxTreeX - this.minTreeX) * this.scaleFactor;
        const familyHeight = (this.maxTreeY - this.minTreeY) * this.scaleFactor;
        if (familyHeight > svgHeight || familyWidth > svgWidth) {
            throw new Error(`family tree shouldn't be greater than the svg container ${familyWidth},${familyHeight}`)
        }
        const translateX = ((svgWidth - familyWidth) / 2);
        const translateY = ((svgHeight - familyHeight) / 2);
        this.familyTreeGroup.transition().duration(this.fadeInAnimationDuration).attr('transform', `translate(${translateX}, ${translateY})`);
    }
    centerFamilyGroupEditMode() {
        // const svgRect = this.svg.node().getBoundingClientRect();
        const svgWidth = this.width - this.widthPadding;
        const svgHeight = this.height - this.heightPadding;
        const familyWidth = (this.maxTreeXEditMode - this.minTreeXEditMode) * this.scaleFactorEditMode;
        const familyHeight = (this.maxTreeYEditMode - this.minTreeYEditMode) * this.scaleFactorEditMode;
        if (familyHeight > svgHeight + 1 || familyWidth > svgWidth + 1) {
            throw new Error(`family tree shouldn't be greater than the svg container ${familyWidth},${familyHeight}`)
        }
        const translateX = ((svgWidth - familyWidth) / 2);
        const translateY = ((svgHeight - familyHeight) / 2);
        this.familyTreeGroup.transition().duration(this.fadeInAnimationDurationEditMode).attr('transform', `translate(${translateX}, ${translateY})`);
    }
    private centerTree() {
        this.minTreeX = d3.min(this.jointNode, d => d.x) ?? 0;
        this.maxTreeX = d3.max(this.jointNode, d => d.x) ?? 0;
        this.minTreeY = d3.min(this.jointNode, d => d.y) ?? 0;
        this.maxTreeY = d3.max(this.jointNode, d => d.y) ?? 0;
        this.offSetX = - this.minTreeX;
        this.offSetY = - this.minTreeY;
        this.jointNode.forEach(item => {
            item.x = this.offSetX + (item.x as number)
            item.y = this.offSetY + (item.y as number)
        })
    }
    private centerTreeEditMode() {
        this.minTreeXEditMode = d3.min(this.jointNode, d => d.x) ?? 0;
        this.maxTreeXEditMode = d3.max(this.jointNode, d => d.x) ?? 0;
        this.minTreeYEditMode = d3.min(this.jointNode, d => d.y) ?? 0;
        this.maxTreeYEditMode = d3.max(this.jointNode, d => d.y) ?? 0;
        this.offSetXEditMode = - this.minTreeXEditMode;
        this.offSetYEditMode = - this.minTreeYEditMode;
        this.jointNode.forEach(item => {
            item.x = this.offSetXEditMode + (item.x as number)
            item.y = this.offSetYEditMode + (item.y as number)
        })
    }
    // Draw marriage lines based on 'target' property
    drawDescMarriageLines() {
        // 1. DATA JOIN (Key by a combination of spouse IDs)
        const lines = this.descendantsGroup.selectAll("line.marriage-line")
            .data(this.jointNode.filter(d => {
                if (d.data.catag === 'desc') {
                    return d.data.type === "spouse" && d.data.target;
                } else if (d.data.catag === 'ance') {
                    const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                    return spouse !== undefined; // Check if spouse exists)
                } else {
                    throw new Error('data must have a .catag property set either to "desc" or "ance"')
                }
            }), (d: unknown) => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                if (nodeData.data.catag === 'desc') {
                    const spouseId = Math.min(nodeData.data.id, nodeData.data.target as number);
                    const otherSpouseId = Math.max(nodeData.data.id, nodeData.data.target as number);
                    return `${spouseId}-${otherSpouseId}`;
                } else if (nodeData.data.catag === 'ance') {
                    const spouse = this.jointNode.find(n => n.data.id === nodeData.data.target);
                    if (spouse) {
                        const spouseId = Math.min(nodeData.data.id, spouse.data.id); // Use spouse ID directly
                        const otherSpouseId = Math.max(nodeData.data.id, spouse.data.id);
                        return `${spouseId}-${otherSpouseId}`;
                    }
                    return ""; // Return empty string if no spouse found (will be filtered out))
                } else {
                    return ""; // Ensure a string is always returned
                }
            }

            );
        // 2. EXIT (Remove old lines - this is important!)
        lines.exit().transition()
            .duration(this.fadeOutAnimationDuration)
            .attr("opacity", 0)
            .remove(); // Remove immediately after transition
        // 3. UPDATE (Transition existing lines)
        lines.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.y ?? 0;
            })
            .attr("opacity", 1);
        // 4. ENTER (Create new lines)
        const enter = lines.enter().append("line")
            .attr("class", "marriage-line")
            .attr("stroke", this.colors.lineMarriage)
            .attr("stroke-width", 2 * this.scaleFactor)
            .attr("opacity", 0);
        enter.attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.y ?? 0;
            });
        enter.transition()
            .duration(this.fadeInAnimationDuration)
            // .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);
        // Midpoint calculation (do this AFTER data join and transitions)
        this.jointNode.forEach(d => {
            if (d.data.catag === 'desc') {
                if (d.data.type === "spouse" && d.data.target) {
                    const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        d.data.marriageMidpoint = {
                            x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                            y: d.y
                        };
                        spouse.data.marriageMidpoint = d.data.marriageMidpoint;
                    }
                }
            } else if (d.data.catag === 'ance') {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                if (spouse) {
                    d.data.marriageMidpoint = {
                        x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                        y: d.y
                    };
                    spouse.data.marriageMidpoint = d.data.marriageMidpoint;
                }
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
    }

    drawDescParentChildLine() {
        // 1. DATA JOIN (Key by a combination of parent and child IDs)
        const paths = this.descendantsGroup.selectAll("path.child-link")
            .data(this.jointNode.filter(d => d.data.type === "child"), (d: unknown) => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                let key = "";
                if (nodeData.data.mother && nodeData.data.father) {
                    const motherId = stringMin(nodeData.data.mother, nodeData.data.father);
                    const fatherId = stringMax(nodeData.data.mother, nodeData.data.father);
                    key = `${motherId}-${fatherId}-${nodeData.data.id}`; // Mother-Father-Child
                } else if (nodeData.data.mother) {
                    key = `${nodeData.data.mother}-${nodeData.data.id}`; // Mother-Child
                } else if (nodeData.data.father) {
                    key = `${nodeData.data.father}-${nodeData.data.id}`; // Father-Child
                }
                return key;
            });
        // 2. EXIT (Remove old paths)
        paths.exit().transition()
            .duration(this.fadeOutAnimationDuration)
            .attr("opacity", 0)
            .remove();
        // 3. UPDATE (Transition existing paths)
        paths.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("d", d => {  // Update the 'd' attribute

                if (d.data.catag === 'desc') {
                    let pathD = "";
                    if (d.data.mother && d.data.father) {
                        const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                        let theSpouse = (mother?.data.type === 'spouse') ? mother : father;
                        if (mother && father && theSpouse?.data.marriageMidpoint !== undefined) {

                            // pathD = `M${calculatePositionChildParentPosition(theSpouse.x, this.NODE_RADIUS, this.scaleFactor, theSpouse.data.gender)}, ${theSpouse.y} V${(theSpouse.data.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                            pathD = `M${calculatePositionChildParentPosition(theSpouse.x as number, this.NODE_RADIUS, this.scaleFactor, theSpouse.data.gender)}, ${theSpouse.y} V${((theSpouse?.data?.marriageMidpoint.y as number) + (d?.y as number)) / 2} H${d.x} V${d.y}`;
                        }
                    } else if (d.data.mother || d.data.father) {
                        let pr;
                        if (d.data.father) pr = this.jointNode.find(n => n.data.uuid === d.data.father);
                        if (d.data.mother) pr = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                            console.log("PRPRPRPRPRPRPR")
                            if (pr.data.type !== 'spouse') {
                                pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                            } else {
                                pathD = `M${calculatePositionChildParentPosition(pr.x, this.NODE_RADIUS, this.scaleFactor, pr.data.gender)},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                            }
                        }
                    }
                    return pathD;
                } else if (d.data.catag === 'ance') {
                    let pathD = "";
                    let parent;
                    if (d.data.mother && d.data.father) {
                        const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                        if (mother && father && mother.data.marriageMidpoint !== undefined) {
                            parent = (mother.data.type === 'spouse') ? mother : father;
                        }
                    } else if (d.data.mother) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    } else if (d.data.father) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                    }
                    if (parent && d) {
                        const midY = ((parent.y as number) + (d.y as number)) / 2;
                        pathD = `M${parent.data.marriageMidpoint ? parent.data.marriageMidpoint.x : parent.x},${parent.data.marriageMidpoint ? parent.data.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
                    }
                    return pathD;
                } else {
                    throw new Error('data must have a .catag property set either to "desc" or "ance"')
                }
            })
            .attr("opacity", 1);
        // 4. ENTER (Create new paths)
        const enter = paths.enter().append("path")
            .attr("class", "child-link")
            .attr("fill", "none")
            .attr("stroke", this.colors.lineParentChild)
            .attr("stroke-width", 1.5 * this.scaleFactor)
            .attr("opacity", 0);
        enter.attr("d", d => { // Set 'd' attribute for new paths
            if (d.data.catag === 'desc') {
                let pathD = "";
                if (d.data.mother && d.data.father) {
                    const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                    let theSpouse = (mother?.data.type === 'spouse') ? mother : father;
                    if (mother && father && theSpouse?.data.marriageMidpoint !== undefined) {
                        pathD = `M${calculatePositionChildParentPosition((theSpouse.x as number), this.NODE_RADIUS, this.scaleFactor, theSpouse.data.gender)}, ${theSpouse.y} V${((theSpouse.data.marriageMidpoint.y as number) + (d.y as number)) / 2} H${d.x} V${d.y}`;
                    }
                } else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = this.jointNode.find(n => n.data.uuid === d.data.father);
                    if (d.data.mother) pr = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                        pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                }
                return pathD;
            } else if (d.data.catag === 'ance') {
                let pathD = "";
                let parent;
                if (d.data.mother && d.data.father) {
                    const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                    if (mother && father && mother.data.marriageMidpoint !== undefined) {
                        parent = (mother.data.type === 'spouse') ? mother : father;
                    }
                } else if (d.data.mother) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                } else if (d.data.father) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                }
                if (parent && d) {
                    const midY = ((parent.y as number) + (d.y as number)) / 2;
                    pathD = `M${parent.data.marriageMidpoint !== undefined ? parent.data.marriageMidpoint.x : parent.x},${parent.data.marriageMidpoint !== undefined ? parent.data.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
                }
                return pathD;
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
        enter.transition()
            .duration(this.fadeInAnimationDuration)
            // .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);
    }

    modeController(rootId: number) {
        if (!this.isPopUp) {
            this.currentMode = this.formManager?.displayNodeDetails() as string
        }
        // this.nodeDetailDisplayer()
        this.preProcessData(rootId);


    }
    toggleModes(nodeId?: number, manualMode?: string) {
        if (!this.nodeManager.canContribute()) {
            this.currentMode = 'view'
        } else if (manualMode === 'edit' && this.currentMode === 'edit') {
            return
        } else {
            if (manualMode) {
                this.currentMode = manualMode
            } else {
                this.currentMode === "view" ? this.currentMode = "edit" : this.currentMode = "view"
            }
            if (!this.isPopUp) { this.formManager?.setModeType(this.currentMode) }
            if (this.currentMode === 'view') {
                this.preProcessData(nodeId ? nodeId : this.rootNodeId as number);

            } else if (this.currentMode === 'edit') {
                this.preProcessDataEditMode(nodeId ? nodeId : this.rootNodeId as number);
            }
            return this.currentMode
        }
        return
    }
    nodeDetailDisplayer() {
        let nodeData = this.nodeManager.data.familyNodes.find(item => {
            return item.id === this.rootNodeId
        })
        if (!this.isPopUp) {

            this.formManager?.infoDisplayer(nodeData as FamilyNode, this.rootNodeId as number)
        }
    }

    drawDescNodes() {
        const rootNode = this.jointNode.find(item => item.data.id === this.rootNodeId);
        console.log("ROOOt", rootNode)
        const strokeWidth = 3;

        const handleClick = (_event: any, d: d3.HierarchyNode<DrawableNode>) => {
            console.log("CLICKED", d.data.id)
            if (d.data.id !== this.rootNodeId) {
                this.modeController(d.data.id);
            } else {
                if (!this.isPopUp) {
                    this.currentMode = this.formManager?.displayNodeDetails() as string
                }
                // this.nodeDetailDisplayer()
            }
            if (d.data.mode === 'node')
                this.nodeDetailDisplayer()


        };

        const node = this.descendantsGroup.selectAll("g.node")
            .data(this.jointNode.filter(d => d.data.type !== 'root'), d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>;
                return nodeData.data.id
            });
        node.on('click', handleClick);
        node.selectAll(".node-circle")
            .attr("fill", d => {
                return this.getCustomColor(d)
            });
        node.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactor})`)
            .attr('opacity', 1);

        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", _d => `translate(${(rootNode?.x as number) - this.offSetX},${(rootNode?.y as number)}) scale(${this.scaleFactor})`)
            .attr('opacity', 0)
            .on('click', handleClick);

       enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("stroke", this.colors.circlularStroke)
            .attr("stroke-width", d => (d.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth))
            .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>));

        // console.log("old root", this.oldRootNodeId, this.rootNodeId);
        this.descendantsGroup.selectAll<SVGCircleElement, unknown>("circle") // Select specific circles
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr("stroke-width", (d: unknown) => { // Accept unknown datum
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth;
            });


        enter.append("text")
            .attr("dy", this.NODE_RADIUS + 20)
            .attr("text-anchor", "middle")
            .text(d => d.data.name);

        this.defaultNodePicture(enter);
        this.appendActionCircles(enter);

        enter.transition()

            .duration(this.fadeInAnimationDuration)
            .attr('opacity', 1)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactor})`);

        if (this.oldRootNodeId && this.oldJointData) {
            const foundOldRoot = this.jointNode.find(item => item.data.id === this.oldRootNodeId);
            node.exit().transition()


                .duration(this.fadeOutAnimationDuration)
                .attr("transform", d => {
                    const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type

                    return foundOldRoot ? `translate(${foundOldRoot.x},${foundOldRoot.y}) scale(${this.scaleFactor})` : `translate(${nodeData.x},${nodeData.y}) scale(${this.scaleFactor})`;
                })
                .attr('opacity', 0)
                .remove();
        } else {
            node.exit().transition()


                .duration(this.fadeOutAnimationDuration)
                .attr('opacity', 0)
                .remove();
        }

        // Store the previous root node ID for reference in the next update
        this.oldRootNodeId = this.rootNodeId;
    }

    drawDescMarriageLinesEditMode() {
        // 1. DATA JOIN (Key by a combination of spouse IDs)
        const lines = this.descendantsGroupEditMode.selectAll("line.marriage-line")
            .data(this.jointNode.filter(d => {
                if (d.data.catag === 'editDesc') {
                    return d.data.type === "spouse" && d.data.target;
                } else if (d.data.catag === 'editAnce') {
                    const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                    return spouse !== undefined; // Check if spouse exists
                }
                else if (d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc') {
                    return false
                }
                else {
                    throw new Error('data must have a .catag property set either to "editDesc" or "editAnce"')
                }
            }), (d: unknown) => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type

                // console.log("I am being excuted")
                if (nodeData.data.catag === 'editDesc') {
                    const spouseId = Math.min(nodeData.data.id, nodeData.data.target as number);
                    const otherSpouseId = Math.max(nodeData.data.id, nodeData.data.target as number);
                    return `${spouseId}-${otherSpouseId}`;
                } else if (nodeData.data.catag === 'editAnce') {
                    const spouse = this.jointNode.find(n => n.data.id === nodeData.data.target);
                    // console.log("sssssspouse", spouse)
                    if (spouse) {
                        const spouseId = Math.min(nodeData.data.id, spouse.data.id); // Use spouse ID directly
                        const otherSpouseId = Math.max(nodeData.data.id, spouse.data.id);
                        return `${spouseId}-${otherSpouseId}`;
                    }
                    return ""; // Return empty string if no spouse found (will be filtered out)
                } else {
                    return ""
                }
            });
        // 2. EXIT (Remove old lines - this is important!)
        lines.exit().transition()
            .duration(this.fadeOutAnimationDurationEditMode)
            .attr("opacity", 0)
            .remove(); // Remove immediately after transition
        // 3. UPDATE (Transition existing lines)
        lines.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            .attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                return spouse?.y ?? 0;
            })
            .attr("opacity", 1);
        // 4. ENTER (Create new lines)
        const enter = lines.enter().append("line")
            .attr("class", "marriage-line")
            .attr("stroke", this.colors.lineMarriage)
            .attr("stroke-width", 2 * this.scaleFactor)
            .attr("opacity", 0);
        enter.attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.y ?? 0;
            });
        enter.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            // .delay(this.fadeInAnimationDurationEditMode)
            .attr("opacity", 1);
        // Midpoint calculation (do this AFTER data join and transitions)
        this.jointNode.forEach(d => {
            if (d.data.catag === 'editDesc') {
                if (d.data.type === "spouse" && d.data.target) {
                    const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        d.data.marriageMidpoint = {
                            x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                            y: d.y
                        };
                        spouse.data.marriageMidpoint = d.data.marriageMidpoint;
                    }
                }
            } else if (d.data.catag === 'editAnce') {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                if (spouse) {
                    d.data.marriageMidpoint = {
                        x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                        y: d.y
                    };
                    spouse.data.marriageMidpoint = d.data.marriageMidpoint;
                }
            } else if (d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc') {
                // Not Implemented
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
    }

    drawDescParentChildLineEditMode() {
        // 1. DATA JOIN (Key by a combination of parent and child IDs)
        const paths = this.descendantsGroupEditMode.selectAll("path.child-link")
            .data(this.jointNode.filter(d => d.data.type === "child" || d.data.type === "suggest"), d => {
                let key = "";
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type

                if (nodeData.data.mother && nodeData.data.father) {
                    const motherId = stringMin(nodeData.data.mother, nodeData.data.father);
                    const fatherId = stringMax(nodeData.data.mother, nodeData.data.father);
                    key = `${motherId}-${fatherId}-${nodeData.data.id}`; // Mother-Father-Child
                } else if (nodeData.data.mother) {
                    key = `${nodeData.data.mother}-${nodeData.data.id}`; // Mother-Child
                } else if (nodeData.data.father) {
                    key = `${nodeData.data.father}-${nodeData.data.id}`; // Father-Child
                } else if (nodeData.data.source) {
                    key = `${nodeData.data.source}-${nodeData.data.id}`; // Father-Child
                }
                return key;
            });
        // 2. EXIT (Remove old paths)
        paths.exit().transition()
            .duration(this.fadeOutAnimationDurationEditMode)
            .attr("opacity", 0)
            .remove();
        // 3. UPDATE (Transition existing paths)
        paths.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            .attr("d", d => {  // Update the 'd' attribute
                if (d.data.catag === 'editDesc') {
                    let pathD = "";
                    if (d.data.mother && d.data.father) {
                        const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                        let theSpouse = (mother?.data.type === 'spouse') ? mother : father;
                        if (mother && father && theSpouse?.data.marriageMidpoint !== undefined) {
                            pathD = `M${calculatePositionChildParentPosition(theSpouse.x as number, this.NODE_RADIUS, this.scaleFactor, theSpouse.data.gender)}, ${theSpouse.y} V${(theSpouse.data.marriageMidpoint.y as number + (d.y as number)) / 2} H${d.x} V${d.y}`;
                        }
                    } else if (d.data.mother || d.data.father) {
                        let pr;
                        if (d.data.father) pr = this.jointNode.find(n => n.data.uuid === d.data.father);
                        if (d.data.mother) pr = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                            if (pr.data.type !== 'spouse') {
                                pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                            } else {
                                pathD = `M${calculatePositionChildParentPosition(pr.x, this.NODE_RADIUS, this.scaleFactor, pr.data.gender)},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                            }
                        }
                    }
                    return pathD;
                } else if (d.data.catag === 'editAnce') {
                    let pathD = "";
                    let parent;
                    if (d.data.mother && d.data.father) {
                        const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                        if (mother && father && mother.data.marriageMidpoint !== undefined) {
                            parent = (mother.data.type === 'spouse') ? mother : father;
                        }
                    } else if (d.data.mother) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    } else if (d.data.father) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                    }
                    if (parent && d) {
                        const midY = (parent.y as number + (d.y as number)) / 2;
                        pathD = `M${parent.data.marriageMidpoint ? parent.data.marriageMidpoint.x : parent.x},${parent.data.marriageMidpoint ? parent.data.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
                    }
                    return pathD;
                } else if (d.data.catag === 'suggestAnce') {
                    let pathD = "";
                    let sourceNode = this.jointNode.find(n => n.data.uuid === d.data.source);

                    if (sourceNode) {
                        const midY = (sourceNode.y as number + (d.y as number)) / 2; // Midpoint in Y direction
                        pathD = `M${sourceNode.x},${sourceNode.y}V${midY}H${d.x}V${d.y}`;
                    }

                    return pathD;
                } else if (d.data.catag === 'suggestDesc') {
                    let pathD = "";
                    let sourceNode = this.jointNode.find(n => n.data.uuid === d.data.source);

                    if (sourceNode) {
                        const midY = (sourceNode.y as number + (d.y as number)) / 2; // Midpoint in Y direction
                        pathD = `M${sourceNode.x},${sourceNode.y}V${midY}H${d.x}V${d.y}`;
                    }

                    return pathD;
                } else {
                    throw new Error('data must have a .catag property set either to "editAnce" or "editDesc"' + " " + d.data.catag)
                }
            })
            .attr("opacity", 1);
        // 4. ENTER (Create new paths)
        const enter = paths.enter().append("path")
            .attr("class", "child-link")
            .attr("fill", "none")
            .attr("stroke", this.colors.lineParentChild)
            .attr("stroke-width", 1.5 * this.scaleFactor)
            .attr("opacity", 0);
        enter.attr("d", d => { // Set 'd' attribute for new paths
            if (d.data.catag === 'editDesc') {
                let pathD = "";
                if (d.data.mother && d.data.father) {
                    const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                    let theSpouse = (mother?.data?.type === 'spouse') ? mother : father;
                    if (mother && father && theSpouse?.data.marriageMidpoint !== undefined) {
                        pathD = `M${calculatePositionChildParentPosition(theSpouse.x as number, this.NODE_RADIUS, this.scaleFactor, theSpouse.data.gender)}, ${theSpouse.y} V${(theSpouse.data.marriageMidpoint.y as number + (d.y as number)) / 2} H${d.x} V${d.y}`;
                    }
                } else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = this.jointNode.find(n => n.data.uuid === d.data.father);
                    if (d.data.mother) pr = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                        if (pr.data.type !== 'spouse') {
                            pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                        } else {
                            pathD = `M${calculatePositionChildParentPosition(pr.x, this.NODE_RADIUS, this.scaleFactor, pr.data.gender)},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    }
                }
                return pathD;
            } else if (d.data.catag === 'editAnce') {
                let pathD = "";
                let parent;
                // console.log("ddddddddd", d.data)
                if (d.data.mother && d.data.father) {

                    const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                    if (mother && father && mother.data.marriageMidpoint !== undefined) {
                        parent = (mother.data.type === 'spouse') ? mother : father;
                    }
                    // console.log("parent-----", parent)
                } else if (d.data.mother) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                } else if (d.data.father) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                }
                if (parent && d) {
                    const midY = (parent.y as number + (d.y as number)) / 2;
                    pathD = `M${parent.data.marriageMidpoint !== undefined ? parent.data.marriageMidpoint.x : parent.x},${parent.data.marriageMidpoint !== undefined ? parent.data.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
                }
                return pathD;
            } else if (d.data.catag === 'suggestAnce') {
                let pathD = "";
                let sourceNode = this.jointNode.find(n => n.data.uuid === d.data.source);

                if (sourceNode) {
                    const midY = (sourceNode.y as number + (d.y as number)) / 2; // Midpoint in Y direction
                    pathD = `M${sourceNode.x},${sourceNode.y}V${midY}H${d.x}V${d.y}`;
                }

                return pathD;
            } else if (d.data.catag === 'suggestDesc') {
                let pathD = "";
                let sourceNode = this.jointNode.find(n => n.data.uuid === d.data.source);

                if (sourceNode) {
                    const midY = (sourceNode.y as number + (d.y as number)) / 2; // Midpoint in Y direction
                    pathD = `M${sourceNode.x},${sourceNode.y}V${midY}H${d.x}V${d.y}`;
                }

                return pathD;
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
        enter.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            // .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);
    }


    private getCustomColor(d: unknown) {
        const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
        const foundNode = this.jointNode.find(item => item.data.id === nodeData.data.id)
        const color = this.getNodeColor(foundNode as d3.HierarchyNode<DrawableNode>)
        return color
    }

    updateNodesNameText() {
        const node = this.descendantsGroupEditMode.selectAll("g.node")
            .data(this.jointNode.filter(d => d.data.type !== 'root'), d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id
            });
        node.selectAll("text[dy='60'][text-anchor='middle']")
            .filter(d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id > 0 && !['suggestDesc', 'suggestAnce'].includes(nodeData.data.catag as string)
            })
            .text(d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return this.nodeManager.getNode(nodeData.data.id).name
            });
        node.selectAll("text[dy='60'][text-anchor='middle']").filter(d => {
            const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
            return nodeData.data.id > 0 && !['suggestDesc', 'suggestAnce']
                .includes(nodeData.data.catag as string)
        })
            .text(d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>
                return this.nodeManager.getNode(nodeData.data.id).name
            });

        node.selectAll(".node-circle")
            .attr("fill", d => {
                return this.getCustomColor(d)
            });

    }
    private drawDescNodesEditMode() {
        const rootNode = this.jointNode.find(item => item.data.id === this.rootNodeId);
        const strokeWidth = 3;

        const handleClick = (_event: any, d: d3.HierarchyNode<DrawableNode>) => {
            console.log("CLICKED", d.data.id)

            // When a node is clicked, check for the actionType and update the h2 label
            if (d.data.hasPending === false && d.data.mode === 'edit' && d.data.type !== 'suggest' && this.memberPriviledge !== 'suggest' && this.memberPriviledge !== 'update') {
                return
            }
            if (d.data.mode !== 'edit' && d.data.id !== this.rootNodeId) {
                this.modeController(d.data.id)
            } else if (d.data.type === 'suggest') {
                const foundSuggestion = this.nodeManager.getSuggestion(d.data.suggestionId as number)
                if (!this.isPopUp) { this.formManager?.displaySuggestionInfo(foundSuggestion, this.rootNodeId as number) }
            }
            else {

                // Simulate selecting the correct actionType and updating the h2 label
                const actionType = d.data.actionType;
                if (!this.isPopUp) { this.formManager?.setActionTypeLabel(actionType as genericActionTypes, d, this.rootNodeId as number) }; // Function to handle label update and field updates
            }
            // this.nodeDetailDisplayer()

            if (d.data.mode === 'node')
                this.nodeDetailDisplayer()

        }

        const node = this.descendantsGroupEditMode.selectAll("g.node")
            .data(this.jointNode.filter(d => d.data.type !== 'root'), d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id
            });
        node.selectAll(".node-circle")
            .attr("fill", d => {
                return this.getCustomColor(d)
            });
        node.transition().duration(this.fadeInAnimationDurationEditMode)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactorEditMode})`)
            .attr('opacity', 1);

        const foundCircles = node.selectAll('.node-circle')
        foundCircles.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            .attr('fill', d => this.getCustomColor(d)); // Update existing node colors

        node.select(".dynamic-color-nodes")
            .transition()
            .attr("fill", d => {
                const color = this.getCustomColor(d)
                return color;
            })

        node.selectAll("text[dy='60'][text-anchor='middle']")
            .filter(d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id > 0 && !['suggestDesc', 'suggestAnce'].includes(nodeData.data.catag as string)
            })
            .text(d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return this.nodeManager.getNode(nodeData.data.id).name
            });
        node.on('click', handleClick);

        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", _d => `translate(${rootNode?.x as number - this.offSetXEditMode},${rootNode?.y}) scale(${this.scaleFactorEditMode})`)
            .attr('opacity', 0)
            .on('click', handleClick);

        enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("stroke", this.colors.circlularStroke)
            .attr("stroke-width", d => (d.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth))
            .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>)); // Set initial node colors

        this.descendantsGroupEditMode.selectAll("circle")
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr("stroke-width", d => {
                const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type
                return nodeData.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth
            });

        enter.append("text")
            .attr("dy", this.NODE_RADIUS + 20)
            .attr("text-anchor", "middle")
            .text(d => d.data.name);

        this.defaultNodePictureEditMode(enter);
        this.appendActionCircles(enter);

        enter.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            .attr('opacity', 1)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactorEditMode})`);

        if (this.oldCurrentEditModeNodeId && this.oldJointData) {
            const foundOldRoot = this.jointNode.find(item => item.data.id === this.oldCurrentEditModeNodeId);
            node.exit().transition()
                .duration(this.fadeOutAnimationDurationEditMode)
                .attr("transform", d => {
                    const nodeData = d as d3.HierarchyNode<DrawableNode>; // Cast to the correct type

                    return foundOldRoot ? `translate(${foundOldRoot.x},${foundOldRoot.y}) scale(${this.scaleFactorEditMode})` : `translate(${nodeData.x},${nodeData.y}) scale(${this.scaleFactorEditMode})`;
                })
                .attr('opacity', 0)
                .remove();
        } else {
            node.exit().transition()
                .duration(this.fadeOutAnimationDurationEditMode)
                .attr('opacity', 0)
                .remove();
        }

        this.oldCurrentEditModeNodeId = this.rootNodeId;
    }

    // Sample call (replace with actual data)this.formManager.setActionTypeLabel('addParent', { data: { gender: 'MALE' } });


    private getNodeColor(dd: d3.HierarchyNode<DrawableNode>): string {
        const d: d3.HierarchyNode<DrawableNode> = this.jointNode.find(item => item.data.id === dd.data.id) as d3.HierarchyNode<DrawableNode>

        if (this.memberPriviledge === 'suggest' || this.memberPriviledge === 'update') {
            if (d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc' || d.data.mode === 'edit') {
                return d.data.gender === "MALE" ? this.colors.suggestionMale :  // Green (similar to the original blue)
                    d.data.gender === "FEMALE" ? this.colors.suggestionFemale : // Violet (similar to the original pink)
                        this.colors.nodeDefault; // Default gray
            } else {
                return d.data.gender === "MALE" ? this.colors.nodeMale :
                    d.data.gender === "FEMALE" ? this.colors.nodeFemale : this.colors.nodeDefault;
            }

        }
        else if (this.memberPriviledge === 'only-create') {
            if (d.data.hasPending === false) {
                return this.colors.nodeDefault
            }
            if (d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc') {
                return d.data.gender === "MALE" ? this.colors.suggestionMale :  // Green (similar to the original blue)
                    d.data.gender === "FEMALE" ? this.colors.suggestionFemale : // Violet (similar to the original pink)
                        this.colors.nodeDefault; // Default gray
            } else {
                return d.data.gender === "MALE" ? this.colors.nodeMale :
                    d.data.gender === "FEMALE" ? this.colors.nodeFemale : this.colors.nodeDefault;
            }
        }
        else if (this.memberPriviledge === 'create') {
            if (d.data.hasPending === false) {
                return this.colors.nodeDefault
            }
            if (d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc') {
                return d.data.gender === "MALE" ? this.colors.suggestionMale :  // Green (similar to the original blue)
                    d.data.gender === "FEMALE" ? this.colors.suggestionFemale : // Violet (similar to the original pink)
                        this.colors.nodeDefault; // Default gray
            } else {
                return d.data.gender === "MALE" ? this.colors.nodeMale :
                    d.data.gender === "FEMALE" ? this.colors.nodeFemale : this.colors.nodeDefault;
            }


        } else {
            return d.data.gender === "MALE" ? this.colors.nodeMale :
                d.data.gender === "FEMALE" ? this.colors.nodeFemale : this.colors.nodeDefault;

        }

    }
    // Draw child-parent connections
    private reorderElements() {
        this.descendantsGroup.selectAll("path.child-link").raise(); // Raise lines to the bottom (behind nodes)
        this.descendantsGroup.selectAll("line.marriage-line").raise(); // Raise marriage lines to the bottom
        this.descendantsGroup.selectAll("g.node").raise(); // Raise nodes to the top
    }
    private reorderElementsEditMode() {
        this.descendantsGroupEditMode.selectAll("path.child-link").raise(); // Raise lines to the bottom (behind nodes)
        this.descendantsGroupEditMode.selectAll("line.marriage-line").raise(); // Raise marriage lines to the bottom
        this.descendantsGroupEditMode.selectAll("g.node").raise(); // Raise nodes to the top
    }

    defaultNodePicture(
        svg: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>,
        options: { width?: number; height?: number; outerRadius?: number; innerRadius?: number; token?: string } = {}
    ) {
        const {
            width = 0,
            height = 0,
            outerRadius = this.NODE_RADIUS,
            innerRadius = outerRadius * 0.45,
            token = ''
        } = options;

        const cutoutColor = "white";
        const centerX = width / 2;
        const centerY = height / 2;

        const group = svg.append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        // Outer Circle
        group.append("circle")
            .attr('class', 'node-circle')
            .attr("r", outerRadius)
            .attr("fill", d => this.getNodeColor(d));

        // Inner Circle (Cutout)
        group.append("circle")
            .attr("r", innerRadius)
            .attr("fill", cutoutColor);

        // Lower Shape (Crescent-like bottom part)
        const lowerShapePath = `
            M${-outerRadius * 0.66},${outerRadius * 0.85} 
            q${outerRadius * 0.27},${-outerRadius * 0.35} ${outerRadius * 0.4},${-outerRadius * 0.35} 
            h${outerRadius * 0.54} 
            q${outerRadius * 0.4},0 ${outerRadius * 0.4},${outerRadius * 0.35} 
            a${outerRadius * 0.97},${outerRadius * 0.97} 0 0,1 ${-outerRadius * 1.3},0
        `;

        group.append("path")
            .attr("d", lowerShapePath)
            .attr("fill", cutoutColor);

        // Profile Picture: Fetch asynchronously
        group.each(function (d) {
            const nodeId = d.data.id;
            const container = d3.select(this);

            fetchNodeImage(nodeId, token).then(imageUrl => {
                if (!imageUrl) return;

                const defs = svg.append("defs");
                defs.append("clipPath")
                    .attr("id", `clip-${nodeId}`)
                    .append("circle")
                    .attr("r", outerRadius)
                    .attr("cx", 0)
                    .attr("cy", 0);

                container.append("image")
                    .attr("x", -outerRadius)
                    .attr("y", -outerRadius)
                    .attr("width", outerRadius * 2)
                    .attr("height", outerRadius * 2)
                    .attr("clip-path", `url(#clip-${nodeId})`)
                    .attr("href", imageUrl);
            });
        });
    }

    defaultNodePictureEditMode(
        svg: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>,
        options: { width?: number; height?: number; outerRadius?: number; innerRadius?: number; token?: string } = {}
    ) {
        const {
            width = 0,
            height = 0,
            outerRadius = this.NODE_RADIUS,
            innerRadius = outerRadius * 0.45,
            token = ''
        } = options;

        const cutoutColor = "white";
        const centerX = width / 2;
        const centerY = height / 2;


        svg.each((d: d3.HierarchyNode<DrawableNode>, i: number, nodes) => {
            if (!nodes[i]) return;
            const nodeGroup = d3.select(nodes[i])
                .append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);

            const isEdit = d.data.mode === 'edit';
            const isSuggestion = d.data.catag === 'suggestAnce' || d.data.catag === 'suggestDesc';

            if (!isEdit || isSuggestion) {
                // ✅ Normal Node with Profile Picture
                nodeGroup.append("circle")
                    .attr('class', 'node-circle')
                    .attr("r", outerRadius)
                    .attr("fill", d => this.getCustomColor(d));

                nodeGroup.append("circle")
                    .attr("r", innerRadius)
                    .attr("fill", cutoutColor);

                const lowerShapePath = `
                    M${-outerRadius * 0.66},${outerRadius * 0.85} 
                    q${outerRadius * 0.27},${-outerRadius * 0.35} ${outerRadius * 0.4},${-outerRadius * 0.35} 
                    h${outerRadius * 0.54} 
                    q${outerRadius * 0.4},0 ${outerRadius * 0.4},${outerRadius * 0.35} 
                    a${outerRadius * 0.97},${outerRadius * 0.97} 0 0,1 ${-outerRadius * 1.3},0`;

                nodeGroup.append("path")
                    .attr("d", lowerShapePath)
                    .attr("fill", cutoutColor);

                // 👇 Fetch and place image
                fetchNodeImage(d.data.id, token).then(imageUrl => {
                    if (!imageUrl) return;

                    const defs = svg.append("defs");
                    defs.append("clipPath")
                        .attr("id", `clip-${d.data.id}`)
                        .append("circle")
                        .attr("r", outerRadius)
                        .attr("cx", 0)
                        .attr("cy", 0);

                    nodeGroup.append("image")
                        .attr("x", -outerRadius)
                        .attr("y", -outerRadius)
                        .attr("width", outerRadius * 2)
                        .attr("height", outerRadius * 2)
                        .attr("clip-path", `url(#clip-${d.data.id})`)
                        .attr("href", imageUrl)
                        .attr("preserveAspectRatio", "xMidYMid slice"); // 🔥 this is key
                });


            } else {
                // ✅ Edit Node with Plus Icon
                nodeGroup.append("circle")
                    .attr("r", outerRadius)
                    .attr("fill", this.colors.editNodeBackground)
                    .attr("stroke", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>))
                    .attr("stroke-width", 2);

                // Plus icon
                const iconGroup = nodeGroup.append("g")
                    .attr("transform", `translate(0,0) scale(${outerRadius / 12})`);

                iconGroup.append("circle")
                    .attr("r", 12)
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .style("fill", "rgba(0,0,0,0)");

                iconGroup.append("path")
                    .attr("d", "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z")
                    .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>))
                    .attr("transform", "translate(-12,-12)");
            }
        });
    }

    actionCircleColor(d: d3.HierarchyNode<DrawableNode>) {
        const type = this.nodeManager.memberPriviledge(this.familyTreeId, d.data.id);

        if (type === 'update') return this.colors.actionUpdate; // Bright Yellow - Represents active change
        if (type === 'create') return this.colors.actionCreate; // Deep Green - Symbolizes growth and new additions
        if (type === 'suggest') return this.colors.actionSuggest; // Dark Orange - Encourages consideration and discussion
        if (type === 'only-create') return this.colors.actionOnlyCreate; // Soft Yellow - Highlights a limited action

        return 'none';
    }

    // actionIcon(d: string) {
    //     const type = this.nodeManager.memberPriviledge(this.familyTreeId, d.data.id);

    //     if (type === 'update') return '✎'; // Pencil - Represents editing
    //     if (type === 'create') return '+'; // Plus - Symbolizes adding a new node
    //     if (type === 'suggest') return '💡'; // Lightbulb - Suggesting an idea
    //     if (type === 'only-create') return '🛠️'; // Hammer & Wrench - Can create & suggest, but not update

    //     return ''; // Default: No icon
    // }
    actionIcon(d: d3.HierarchyNode<DrawableNode>) {
        const type = this.nodeManager.memberPriviledge(this.familyTreeId, d.data.id);

        if (type === 'update') return '✎'; // Edit - Pencil symbol
        if (type === 'create') return '+'; // Add - Plus sign
        if (type === 'suggest') return 'X'; // Suggest - Question mark (represents an idea or proposal)
        if (type === 'only-create') return '✎'; // Create/Suggest - Asterisk (indicates multiple options but no update)

        return ''; // Default: No icon
    }




    appendActionCircles(enter: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>) {
        // Action buttons group
        const actionGroup = enter.append("g")
            .attr("class", "node-actions");

        const iconOffset = this.NODE_RADIUS + 5; // Position outside top-right
        const iconSize = 12; // This controls both circle and text size
        const spacing = 12; // Spacing between circles

        // Append the circle only if the node type is 'suggest'
        const suggestGroup = actionGroup.filter(d => this.nodeManager.canContribute() && d.data.mode === 'node');

        // Circle (background)
        suggestGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5 + 2 * spacing)
            .attr("cy", -iconOffset)
            .attr("fill", d => this.actionCircleColor(d)) // Gray background
            .style("cursor", "pointer")
            .on("click", (_event, d) => {

                this.toggleModes(d.data.id, 'edit')
            });

        // Exclamation Mark (!)
        suggestGroup.append("text")
            .text(d => this.actionIcon(d as d3.HierarchyNode<DrawableNode>))
            .attr("x", iconOffset - this.NODE_RADIUS + 5 + 2 * spacing)
            .attr("y", -iconOffset + (iconSize / 5)) // Adjust to center text
            .attr("text-anchor", "middle") // Center align
            .attr("dominant-baseline", "middle") // Vertically align
            .attr("font-size", iconSize * 1.6) // Scale text with circle size
            .attr("fill", this.colors.actionTextColor) // White color for contrast
            .style("pointer-events", "none"); // Prevent text from blocking circle clicks
    }


    renewTreeData(desc: DrawableNode, ance: DrawableNode) {

        this.descRoot = d3.hierarchy<DrawableNode>(desc);
        this.descTreeData = this.descTreeLayout(this.descRoot);
        this.descNodes = this.descTreeData.descendants().filter(item => item.data.id !== 0);
        this.anceRoot = d3.hierarchy<DrawableNode>(ance);
        this.anceTreeData = this.anceTreeLayout(this.anceRoot);
        this.anceNodes = this.anceTreeData.descendants().filter(item => item.data.id !== 0);

        // this.renewTreeDataEditMode(desc, ance)
    }
    renewTreeDataEditMode(child: DrawableNode, parent: DrawableNode) {
        this.childRoot = d3.hierarchy<DrawableNode>(child);
        this.childTreeData = this.childTreeLayout(this.childRoot);

        this.childNodes = this.childTreeData.descendants().filter(item => item.data.type !== 'root');
        this.parentRoot = d3.hierarchy<DrawableNode>(parent);
        this.parentTreeData = this.parentTreeLayout(this.parentRoot);
        this.parentNodes = this.parentTreeData.descendants().filter(item => item.data.type !== 'root');

    }
    pushRootHistory() {
        this.rootHistory.push(this.rootNodeId as number)
    }
    popRootHistory(poppedNodeId: number) {
        let nodeDatas = this.nodeManager.data.familyNodes;

        while (this.rootHistory.length > 0) {
            const current = this.rootHistory.pop()
            if (current === poppedNodeId) {
                continue
            } else {
                const foundNode = nodeDatas.find(item => {
                    return item.id === current
                })
                if (foundNode) {
                    return current;
                } else {
                    continue
                }
            }

        }
        const founder = nodeDatas.find(item => item.isFounder === true)
        return founder?.id

    }
    updateTreeDrawing(rootNodeId: number) {
        this.renewTreeData(this.fetchedDesendants as DrawableNode, this.fetchedAncestors as DrawableNode);
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, this.rootNodeId)
        this.oldJointData = this.jointNode;
        this.pushRootHistory()
        this.drawNodes()
        this.nodeDetailDisplayer()
    }
    updateTreeDrawingEditMode(rootNodeId: number) {
        this.renewTreeDataEditMode(this.fetchedEditModeChildren as DrawableNode, this.fetchedEditModeParents as DrawableNode);
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.memberPriviledge = this.nodeManager.memberPriviledge(this.familyTreeId, this.rootNodeId)

        this.pushRootHistory()
        this.drawNodesEditMode()
        this.nodeDetailDisplayer()
    }
    createPopUp(familyNodeId: number) {
        return new FamilyTreeDrawer(this.nodeManager, 1, '#treePopUp', 300, 300, true, familyNodeId)
    }
}



