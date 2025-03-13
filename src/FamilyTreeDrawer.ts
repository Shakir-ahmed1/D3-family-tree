import * as d3 from "d3";
import { DrawableNode } from "./node.interface";
import { ND } from "./dataManager";
import { Gender } from "./dtos/gender.enum";
export class FamilyTreeDrawer {
    private width = 800;
    private height = 800;
    private minTreeX: number = 0;
    private minTreeY: number = 0;
    private maxTreeX: number = 0;
    private maxTreeY: number = 0;
    private fetchedDesendants: DrawableNode | undefined;
    private fetchedAncestors: DrawableNode | undefined;
    private oldJointData: d3.HierarchyNode<DrawableNode>[] = [];
    private NODE_RADIUS = 40; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * 3.3; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * 3; // Space between siblings/spouses
    private widthPadding = 4 * this.NODE_RADIUS;
    private heightPadding = 4 * this.NODE_RADIUS;
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
    private containerClassName: string = '#treeContainer';
    private fadeInAnimationDuration = 1000;
    private fadeOutAnimationDuration = 1000;
    private oldRootNodeId: number | undefined;
    private offSetX = 0;
    private offSetY = 0;
    private scaleFactor = 0.5;
    private svg = d3.select('body').select(this.containerClassName)
        .append('svg')
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");
    private familyTreeGroup = this.svg.append("g").attr("class", "familyTree").attr('opacity', 1).attr('transform', 'translate(0,0)');
    descendantsGroup = this.familyTreeGroup.append("g").attr("class", "descendants");
    private currentMode = 'view';

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
    private currentEditModeNodeId: number | undefined;
    private oldCurrentEditModeNodeId: number | undefined;
    private jointNodeEditMode: d3.HierarchyNode<DrawableNode>[] = []
    private oldJointDataEditMode: d3.HierarchyNode<DrawableNode>[] = [];
    private minTreeXEditMode: number = 0;
    private maxTreeXEditMode: number = 0;
    private minTreeYEditMode: number = 0;
    private maxTreeYEditMode: number = 0;
    private offSetXEditMode: number = 0;
    private offSetYEditMode: number = 0;
    private scaleFactorEditMode: number = 0.5;

    descendantsGroupEditMode = this.descendantsGroup
    // descendantsGroupEditMode = this.familyTreeGroup.append("g").attr("class", "descendantsEditMode");
    private fadeInAnimationDurationEditMode = 1000;
    private fadeOutAnimationDurationEditMode = 1000;




    constructor(
    ) {
        const modeButton = document.getElementById('modeType')
        modeButton.addEventListener('click', (event) => {
            this.toggleModes()
        });

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
            foundDescRoot.data.mother = foundAnceRoot?.data.mother
            foundDescRoot.data.father = foundAnceRoot?.data.father
            foundDescRoot.data.catag = 'ance'
        }

        this.jointNode = [...this.descNodes, ...this.anceNodes.filter(item => item.data.id !== this.rootNodeId)]
    }
    private attachNodesEditMode() {
        this.parentNodes.forEach(item => {
            item.data.catag = 'editAnce'
        })
        const foundParentCurrent = this.parentNodes.find(item => item.data.id === this.currentEditModeNodeId)
        const foundChildCurrent = this.childNodes.find(item => item.data.id === this.currentEditModeNodeId)
        this.childNodes.forEach(item => {
            item.data.catag = 'editDesc'
        })
        if (foundChildCurrent && foundParentCurrent) {
            foundChildCurrent.data.father = foundParentCurrent.data.father
            foundChildCurrent.data.mother = foundParentCurrent.data.mother
            foundChildCurrent.data.catag = 'editAnce'
        }

        this.jointNodeEditMode = [...this.childNodes, ...this.parentNodes.filter(item => item.data.id !== this.currentEditModeNodeId)]
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
        this.custPrint(this.jointNodeEditMode)
        this.drawDescMarriageLinesEditMode();
        this.drawDescParentChildLineEditMode();
        this.drawDescNodesEditMode();
        this.reorderElementsEditMode();
        this.centerFamilyGroupEditMode();
    }
    fetchData(fetchedNodesArray: any, rootId: number, setData: boolean) {
        if (setData) {
            ND.setData(fetchedNodesArray)
        }
        this.currentMode = document.getElementById('modeType')?.textContent
        console.log('MMM', this.currentMode)
        if (this.currentMode === 'view') {
            this.preProcessData(rootId)
        } else {
            this.preProcessDataEditMode(rootId)
        }
    }
    fetchDataEditMode(fetchedNodesArray: any, rootId: number, setData: boolean) {
        if (setData) {
            ND.setData(fetchedNodesArray)
        }
        this.currentMode = document.getElementById('modeType')?.textContent

        if (this.currentMode === 'view') {
            this.preProcessData(rootId)
        } else {
            this.preProcessDataEditMode(rootId)
        }

    }
    private preProcessData(rootId: number) {
        if (this.jointNode && this.rootNodeId) {
            const foundCurrentRoot = this.jointNode.find(item => item.data.id === rootId)
            if (foundCurrentRoot) {
                const ancestorsData = ND.customBuildAncestorsHierarchy(rootId, undefined);
                const descendantsData = ND.customBuildDescendantsHiararchy(rootId);
                const editModeParents = ND.customBuildParent(rootId)
                const editModeChildren = ND.customBuildChildren(rootId)

                this.fetchedDesendants = descendantsData;
                this.fetchedAncestors = ancestorsData;

                this.updateTreeDrawing(rootId)

            }
        } else {
            const ancestorsData = ND.customBuildAncestorsHierarchy(rootId, undefined);
            const descendantsData = ND.customBuildDescendantsHiararchy(rootId);
            const editModeParents = ND.customBuildParent(rootId)
            const editModeChildren = ND.customBuildChildren(rootId)

            this.fetchedDesendants = descendantsData;
            this.fetchedAncestors = ancestorsData;

            this.updateTreeDrawing(rootId)
        }
    }
    private preProcessDataEditMode(rootId: number) {
        const ancestorsData = ND.customBuildAncestorsHierarchy(rootId, undefined);
        const descendantsData = ND.customBuildDescendantsHiararchy(rootId);
        const editModeParents = ND.customBuildParent(rootId)
        const editModeChildren = ND.customBuildChildren(rootId)


        // this.fetchedEditModeParents = editModeParents;
        // this.fetchedEditModeChildren = editModeChildren;
        this.fetchedEditModeParents = editModeParents;
        this.fetchedEditModeChildren = editModeChildren;
        // console.log("Parents", editModeParents, "children", editModeChildren)
        this.updateTreeDrawingEditMode(rootId)
    }
    private joinTree() {
        // search the position of the root node in the descendants
        let descRootPossiton = this.descNodes.find(item => item.data.id === this.rootNodeId);
        if (!descRootPossiton) throw new Error('root node wasn\'t found in descendants');
        const descRootX: number = descRootPossiton.x as number;
        const descRootY: number = descRootPossiton.y as number;
        // Reposition the descendants relative to the root
        // this.custPrint(this.descNodes)
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
            const rootOffSetX: number = newRootNode?.x as number + oldRootNode?.x as number
            const rootOffSetY: number = newRootNode?.y as number + oldRootNode?.y as number
            this.jointNode.forEach(item => {
                item.x = item.x as number + rootOffSetX
                item.y = item.y as number + rootOffSetY
            })
        }
    }
    private joinTreeEditMode() {
        // search the position of the root node in the descendants
        let childRootPossiton = this.childNodes.find(item => item.data.id === this.currentEditModeNodeId);
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
        let parentRootPossiton = this.parentNodes.find(item => item.data.id === this.currentEditModeNodeId);
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
            const oldRootNode = this.oldJointDataEditMode.find(item => item.data.id === this.currentEditModeNodeId) as d3.HierarchyNode<DrawableNode>;;
            const newRootNode = this.jointNodeEditMode.find(item => item.data.id === this.currentEditModeNodeId) as d3.HierarchyNode<DrawableNode>;
            const rootOffSetX = newRootNode?.x as number + oldRootNode?.x as number
            const rootOffSetY = newRootNode?.y as number + oldRootNode?.y as number
            this.jointNodeEditMode.forEach(item => {
                item.x = item.x as number + rootOffSetX
                item.y = item.y as number + rootOffSetY
            })
        }
    }
    custPrint(nodes: d3.HierarchyNode<DrawableNode>[]) {
        const newList = []
        for (let a of nodes) {

            const newObject = {
                id: a.data.id,
                uuid: a.data.uuid,
                name: a.data.name,
                mode: a.data.mode,
                catag: a.data.catag,
                father: a.data.father,
                mother: a.data.mother
            }
            newList.push((newObject))
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
        this.jointNodeEditMode.forEach(item => {
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
        if (familyHeight > svgHeight || familyWidth > svgWidth) {
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
        this.minTreeXEditMode = d3.min(this.jointNodeEditMode, d => d.x) ?? 0;
        this.maxTreeXEditMode = d3.max(this.jointNodeEditMode, d => d.x) ?? 0;
        this.minTreeYEditMode = d3.min(this.jointNodeEditMode, d => d.y) ?? 0;
        this.maxTreeYEditMode = d3.max(this.jointNodeEditMode, d => d.y) ?? 0;
        this.offSetXEditMode = - this.minTreeXEditMode;
        this.offSetYEditMode = - this.minTreeYEditMode;
        this.jointNodeEditMode.forEach(item => {
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
                    return spouse !== undefined; // Check if spouse exists
                } else {
                    throw new Error('data must have a .catag property set either to "desc" or "ance"')
                }
            }), d => {
                if (d.data.catag === 'desc') {
                    const spouseId = Math.min(d.data.id, d.data.target);
                    const otherSpouseId = Math.max(d.data.id, d.data.target);
                    return `${spouseId}-${otherSpouseId}`;
                } else if (d.data.catag === 'ance') {
                    const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        const spouseId = Math.min(d.data.id, spouse.data.id); // Use spouse ID directly
                        const otherSpouseId = Math.max(d.data.id, spouse.data.id);
                        return `${spouseId}-${otherSpouseId}`;
                    }
                    return ""; // Return empty string if no spouse found (will be filtered out)
                } else {
                    // console.log("data", d.data.id)
                    // throw new Error('data must have a .catag property set either to "desc" or "ance"')
                }
            });
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
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
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
                        d.marriageMidpoint = {
                            x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                            y: d.y
                        };
                        spouse.marriageMidpoint = d.marriageMidpoint;
                    }
                }
            } else if (d.data.catag === 'ance') {
                const spouse = this.jointNode.find(n => n.data.id === d.data.target);
                if (spouse) {
                    d.marriageMidpoint = {
                        x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                        y: d.y
                    };
                    spouse.marriageMidpoint = d.marriageMidpoint;
                }
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
    }

    drawDescParentChildLine() {
        // 1. DATA JOIN (Key by a combination of parent and child IDs)
        const paths = this.descendantsGroup.selectAll("path.child-link")
            .data(this.jointNode.filter(d => d.data.type === "child"), d => {
                let key = "";
                if (d.data.mother && d.data.father) {
                    const motherId = Math.min(d.data.mother, d.data.father);
                    const fatherId = Math.max(d.data.mother, d.data.father);
                    key = `${motherId}-${fatherId}-${d.data.id}`; // Mother-Father-Child
                } else if (d.data.mother) {
                    key = `${d.data.mother}-${d.data.id}`; // Mother-Child
                } else if (d.data.father) {
                    key = `${d.data.father}-${d.data.id}`; // Father-Child
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
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                        if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                            pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
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
                        if (mother && father && mother.marriageMidpoint !== undefined) {
                            parent = (mother.data.type === 'spouse') ? mother : father;
                        }
                    } else if (d.data.mother) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    } else if (d.data.father) {
                        parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                    }
                    if (parent && d) {
                        const midY = (parent.y + d.y) / 2;
                        pathD = `M${parent.marriageMidpoint ? parent.marriageMidpoint.x : parent.x},${parent.marriageMidpoint ? parent.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
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
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0);
        enter.attr("d", d => { // Set 'd' attribute for new paths
            if (d.data.catag === 'desc') {
                let pathD = "";
                if (d.data.mother && d.data.father) {
                    const mother = this.jointNode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNode.find(n => n.data.uuid === d.data.father);
                    let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                    if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                        pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
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
                    if (mother && father && mother.marriageMidpoint !== undefined) {
                        parent = (mother.data.type === 'spouse') ? mother : father;
                    }
                } else if (d.data.mother) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.mother);
                } else if (d.data.father) {
                    parent = this.jointNode.find(n => n.data.uuid === d.data.father);
                }
                if (parent && d) {
                    const midY = (parent.y + d.y) / 2;
                    pathD = `M${parent.marriageMidpoint !== undefined ? parent.marriageMidpoint.x : parent.x},${parent.marriageMidpoint !== undefined ? parent.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
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
    modeController(rootId) {
        this.currentMode = document.getElementById('modeType')?.textContent
        const modeButton = document.getElementById('modeType')
        modeButton.textContent = 'view'
        this.preProcessData(rootId);

        // if (this.currentMode === 'view') {

        // }
        // else if (this.currentMode === 'edit') {
        // this.preProcessDataEditMode(rootId);
        // }
    }
    toggleModes(nodeId?: number) {
        const modeButton = document.getElementById('modeType')
        modeButton.textContent === "view" ? modeButton.textContent = "edit" : modeButton.textContent = "view"
        this.currentMode = document.getElementById('modeType')?.textContent
        if (this.currentMode === 'view') {
            this.preProcessData(nodeId ? nodeId : this.currentEditModeNodeId);

        } else if (this.currentMode === 'edit') {
            this.preProcessDataEditMode(nodeId ? nodeId : this.rootNodeId);
        }
    }


    drawDescNodes() {
        const rootNode = this.jointNode.find(item => item.data.id === this.rootNodeId);
        const strokeWidth = 3;

        const handleClick = (_event, d) => {
            if (d.data.id !== this.rootNodeId) {
                this.modeController(d.data.id);
                this.selectEndpoint(d.data.id);
            }
        };

        const node = this.descendantsGroup.selectAll("g.node")
            .data(this.jointNode.filter(d => d.data.type !== 'root'), d => d.data.id);
        node.on('click', handleClick);

        node.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactor})`)
            .attr('opacity', 1);

        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${rootNode.x - this.offSetX},${rootNode.y}) scale(${this.scaleFactor})`)
            .attr('opacity', 0)
            .on('click', handleClick);

        const circles = enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("stroke", "#999")
            .attr("stroke-width", d => (d.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth))
            .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>));

        // console.log("old root", this.oldRootNodeId, this.rootNodeId);

        this.descendantsGroup.selectAll("circle")
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr("stroke-width", d => (d.data.id === this.rootNodeId ? strokeWidth * 5 : strokeWidth));

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
                    return foundOldRoot ? `translate(${foundOldRoot.x},${foundOldRoot.y}) scale(${this.scaleFactor})` : `translate(${d.x},${d.y}) scale(${this.scaleFactor})`;
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

    // Function to simulate selecting an endpoint and trigger dynamic fields
    selectEndpoint(nodeId: number) {
        // console.log("hey it's me")
        // const endpointMapping = {
        //     // Add a mapping from node data id to endpoint here
        //     // Assuming your node has a `type` or `id` that can map to your endpoints
        //     'node1': 'addNewParent',
        //     'node2': 'addExistingParent',
        //     'node3': 'addChildOfOneParent',
        //     'node4': 'addChildOfTwoParents',
        //     // Add more mappings as needed
        // };

        // const endpoint = endpointMapping[nodeId];

        // if (endpoint) {
        //     const select = document.getElementById('endpoint');
        //     select.value = endpoint; // Set the value in the hidden select
        //     const event = new Event('change');
        //     select.dispatchEvent(event);  // Trigger the change event to update dynamic fields
        // }
    }


    drawDescMarriageLinesEditMode() {
        // 1. DATA JOIN (Key by a combination of spouse IDs)
        const lines = this.descendantsGroupEditMode.selectAll("line.marriage-line")
            .data(this.jointNodeEditMode.filter(d => {
                if (d.data.catag === 'editDesc') {
                    return d.data.type === "spouse" && d.data.target;
                } else if (d.data.catag === 'editAnce') {
                    const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                    return spouse !== undefined; // Check if spouse exists
                } else {
                    throw new Error('data must have a .catag property set either to "editDesc" or "editAnce"')
                }
            }), d => {
                // console.log("I am being excuted")
                if (d.data.catag === 'editDesc') {
                    const spouseId = Math.min(d.data.id, d.data.target);
                    const otherSpouseId = Math.max(d.data.id, d.data.target);
                    return `${spouseId}-${otherSpouseId}`;
                } else if (d.data.catag === 'editAnce') {
                    const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                    // console.log("sssssspouse", spouse)
                    if (spouse) {
                        const spouseId = Math.min(d.data.id, spouse.data.id); // Use spouse ID directly
                        const otherSpouseId = Math.max(d.data.id, spouse.data.id);
                        return `${spouseId}-${otherSpouseId}`;
                    }
                    return ""; // Return empty string if no spouse found (will be filtered out)
                } else {
                    // throw new Error('data must have a .catag property set either to "editDesc" or "editAnce"' + `because it is ${d.data.catag}`)
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
                const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                return spouse?.y ?? 0;
            })
            .attr("opacity", 1);
        // 4. ENTER (Create new lines)
        const enter = lines.enter().append("line")
            .attr("class", "marriage-line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("opacity", 0);
        enter.attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target && n.data.type === 'child');
                return spouse?.y ?? 0;
            });
        enter.transition()
            .duration(this.fadeInAnimationDurationEditMode)
            // .delay(this.fadeInAnimationDurationEditMode)
            .attr("opacity", 1);
        // Midpoint calculation (do this AFTER data join and transitions)
        this.jointNodeEditMode.forEach(d => {
            if (d.data.catag === 'editDesc') {
                if (d.data.type === "spouse" && d.data.target) {
                    const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        d.marriageMidpoint = {
                            x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                            y: d.y
                        };
                        spouse.marriageMidpoint = d.marriageMidpoint;
                    }
                }
            } else if (d.data.catag === 'editAnce') {
                const spouse = this.jointNodeEditMode.find(n => n.data.id === d.data.target);
                if (spouse) {
                    d.marriageMidpoint = {
                        x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                        y: d.y
                    };
                    spouse.marriageMidpoint = d.marriageMidpoint;
                }
            } else {
                throw new Error('data must have a .catag property set either to "desc" or "ance"')
            }
        });
    }

    drawDescParentChildLineEditMode() {
        // 1. DATA JOIN (Key by a combination of parent and child IDs)
        const paths = this.descendantsGroupEditMode.selectAll("path.child-link")
            .data(this.jointNodeEditMode.filter(d => d.data.type === "child"), d => {
                let key = "";
                if (d.data.mother && d.data.father) {
                    const motherId = Math.min(d.data.mother, d.data.father);
                    const fatherId = Math.max(d.data.mother, d.data.father);
                    key = `${motherId}-${fatherId}-${d.data.id}`; // Mother-Father-Child
                } else if (d.data.mother) {
                    key = `${d.data.mother}-${d.data.id}`; // Mother-Child
                } else if (d.data.father) {
                    key = `${d.data.father}-${d.data.id}`; // Father-Child
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
                        const mother = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                        if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                            pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    } else if (d.data.mother || d.data.father) {
                        let pr;
                        if (d.data.father) pr = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                        if (d.data.mother) pr = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                        if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                            pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    }
                    return pathD;
                } else if (d.data.catag === 'editAnce') {
                    let pathD = "";
                    let parent;
                    if (d.data.mother && d.data.father) {
                        const mother = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                        const father = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                        if (mother && father && mother.marriageMidpoint !== undefined) {
                            parent = (mother.data.type === 'spouse') ? mother : father;
                        }
                    } else if (d.data.mother) {
                        parent = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                    } else if (d.data.father) {
                        parent = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                    }
                    if (parent && d) {
                        const midY = (parent.y + d.y) / 2;
                        pathD = `M${parent.marriageMidpoint ? parent.marriageMidpoint.x : parent.x},${parent.marriageMidpoint ? parent.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
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
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0);
        enter.attr("d", d => { // Set 'd' attribute for new paths
            if (d.data.catag === 'editDesc') {
                let pathD = "";
                if (d.data.mother && d.data.father) {
                    const mother = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                    let theSpouse = (mother?.data?.type === 'spouse') ? mother : father;
                    if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                        pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                } else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                    if (d.data.mother) pr = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                    if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                        pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                }
                return pathD;
            } else if (d.data.catag === 'editAnce') {
                let pathD = "";
                let parent;
                // console.log("ddddddddd", d.data)
                if (d.data.mother && d.data.father) {

                    const mother = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                    const father = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                    if (mother && father && mother.marriageMidpoint !== undefined) {
                        parent = (mother.data.type === 'spouse') ? mother : father;
                    }
                    // console.log("parent-----", parent)
                } else if (d.data.mother) {
                    parent = this.jointNodeEditMode.find(n => n.data.uuid === d.data.mother);
                } else if (d.data.father) {
                    parent = this.jointNodeEditMode.find(n => n.data.uuid === d.data.father);
                }
                if (parent && d) {
                    const midY = (parent.y + d.y) / 2;
                    pathD = `M${parent.marriageMidpoint !== undefined ? parent.marriageMidpoint.x : parent.x},${parent.marriageMidpoint !== undefined ? parent.marriageMidpoint.y : parent.y}V${midY}H${d.x}V${d.y}`;
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
    drawDescNodesEditMode() {
        const rootNode = this.jointNodeEditMode.find(item => item.data.id === this.currentEditModeNodeId);
        const strokeWidth = 3;

        const node = this.descendantsGroupEditMode.selectAll("g.node")
            .data(this.jointNodeEditMode.filter(d => d.data.type !== 'root'), d => d.data.id);

        node.transition().duration(this.fadeInAnimationDurationEditMode)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactorEditMode})`)
            .attr('opacity', 1);
        node.on('click', (_event, d) => {
            // When a node is clicked, check for the actionType and update the h2 label

            if (d.data.mode !== 'edit' && d.data.id !== this.currentEditModeNodeId) {
                // this.preProcessDataEditMode(d.data.id);
                this.modeController(d.data.id)
            } else {

                // Simulate selecting the correct actionType and updating the h2 label
                const actionType = d.data.actionType;
                this.setActionTypeLabel(actionType, d); // Function to handle label update and field updates
            }

        });
        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${rootNode.x - this.offSetXEditMode},${rootNode.y}) scale(${this.scaleFactorEditMode})`)
            .attr('opacity', 0)
            .on('click', (_event, d) => {
                // When a node is clicked, check for the actionType and update the h2 label

                if (d.data.mode !== 'edit' && d.data.id !== this.currentEditModeNodeId) {
                    // this.preProcessDataEditMode(d.data.id);
                    this.modeController(d.data.id)
                } else {

                    // Simulate selecting the correct actionType and updating the h2 label
                    const actionType = d.data.actionType;
                    this.setActionTypeLabel(actionType, d); // Function to handle label update and field updates
                }


            });

        const circles = enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("stroke", "#999")
            .attr("stroke-width", d => (d.data.id === this.currentEditModeNodeId ? strokeWidth * 5 : strokeWidth))
            .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>));

        this.descendantsGroupEditMode.selectAll("circle")
            .transition()

            .duration(300)
            .ease(d3.easeLinear)
            .attr("stroke-width", d => (d.data.id === this.currentEditModeNodeId ? strokeWidth * 5 : strokeWidth));

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
            const foundOldRoot = this.jointNodeEditMode.find(item => item.data.id === this.oldCurrentEditModeNodeId);
            node.exit().transition()
                .duration(this.fadeOutAnimationDurationEditMode)

                .attr("transform", d => {
                    return foundOldRoot ? `translate(${foundOldRoot.x},${foundOldRoot.y}) scale(${this.scaleFactorEditMode})` : `translate(${d.x},${d.y}) scale(${this.scaleFactorEditMode})`;
                })
                .attr('opacity', 0)
                .remove();
        } else {
            node.exit().transition()

                .duration(this.fadeOutAnimationDurationEditMode)
                .attr('opacity', 0)
                .remove();
        }

        // Store the previous root node ID for reference in the next update
        this.oldCurrentEditModeNodeId = this.currentEditModeNodeId;
    }

    // Function to update the h2 label and dynamic fields based on the actionType
    _setActionTypeLabel(actionType: string | number | null | undefined, node: d3.HierarchyNode<DrawableNode>) {
        // Update the h2 label with the corresponding actionType
        const actionTypeLabels = {
            addParent: { MALE: "Add New Father", FEMALE: "Add New Mother", },
            addChildOfOneParent: { MALE: "Add Son of One Parent", FEMALE: "Add Daughter of One Parent", },
            addChildOfTwoParents: { MALE: "Add Son of Two Parents", FEMALE: "Add Daughter of Two Parents", },
            addPartner: { MALE: "Add New Partner", FEMALE: "Add New Partner", },
            addPartnerAsParent: { MALE: "Add New Partner as Parent", FEMALE: "Add New Partner as Parent", },
        };
        // console.log("action type", actionType);
        // Update the h2 text with the corresponding action type
        let label = actionTypeLabels[actionType][node.data.gender] || "Select Action Type";

        document.getElementById('endpointLabel').textContent = label;
        document.getElementById('gender').value = node.data.gender;

        // Now, handle dynamic fields as before
        const dynamicFields = document.getElementById('dynamicFields');
        const endpointFieldMap = {
            addNewParent: ['otherNodeId'],
            addExistingParent: ['partnerNodeId', 'partnershipType'],
            addChildOfTwoParents: ['partnerNodeId', 'partnershipType'],
            addChildOfOneParent: [],
            addNewPartner: ['partnershipType'],
            addExistingPartner: ['partnerNodeId', 'partnershipType'],
            addNewPartnerAsParent: ['partnershipType', 'childNodeId'],
            addExistingPartnerAsParent: ['partnerNodeId', 'partnershipType', 'childNodeId'],
        };
        const endpointFieldMapNew = {
            addParent: {
                new: {
                    endpoint: 'addNewParent',
                    label: 'Add new parent',
                    fields: ['otherNodeId', 'partnerNodeData']
                },
                existing: {
                    endpoint: 'addExistingParent',
                    label: 'add existing parent',
                    fields: ['partnershipType', 'partnerNodeId']
                },
            },
            addChildOfTwoParents: {
                new: {
                    endpoint: 'addChildOfTwoParents',
                    label: 'add child of two parents',
                    fields: ['partnerNodeId', 'partnershipType', 'childNodeData']
                }
            },
            addChildOfOneParent: {
                new: {
                    endpoint: 'addChildOfOneParent',
                    label: 'add child of one parent',
                    fields: ['childNodeData']
                }
            },
            addPartner: {
                new: {
                    endpoint: 'addNewPartner',
                    label: 'add new partner',
                    fields: ['partnershipType', 'partnerNodeData']
                },
                existing: {
                    endpoint: 'addExistingPartner',
                    label: 'Add existing partner',
                    fields: ['partnershipType', 'partnerNodeId']
                },
            },
            addPartnerAsParent: {
                new: {
                    endpoint: 'addNewPartnerAsParent',
                    label: 'Add new partner as a parent',
                    fields: ['partnershipType', 'childNodeId', 'partnerNodeData',]
                },
                existing: {
                    endpoint: 'addExistingPartnerAsParent',
                    label: 'Add existing partner as Parent',
                    fields: ['partnershipType', 'childNodeId', 'partnerNodeId']
                },
            }
        };

        // Clear the dynamic fields first
        dynamicFields.innerHTML = '';

        // Get the fields for the selected actionType and create corresponding input elements
        const fields = endpointFieldMap[actionType] || [];
        fields.forEach((field: string) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = field;
            input.placeholder = field;
            input.required = true;
            dynamicFields.appendChild(input);
        });
    }
    setActionTypeLabel(actionType, node) {

        const dynamicFields = document.getElementById('dynamicFields');
        document.getElementById('familyNodeId').value = this.currentEditModeNodeId;

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
            addPartnerAsParent: {
                new: {
                    endpoint: 'addNewPartnerAsParent',
                    label: { MALE: "Add New Partner as Parent", FEMALE: "Add New Partner as Parent" },
                    fields: ['partnershipType', 'childNodeId', 'partnerNodeData',]
                },
                existing: {
                    endpoint: 'addExistingPartnerAsParent',
                    label: { MALE: "Add Existing Partner as Parent", FEMALE: "Add Existing Partner as Parent" },
                    fields: ['partnershipType', 'childNodeId', 'partnerNodeId']
                },
            }
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

    // Sample call (replace with actual data)
    // setActionTypeLabel('addParent', { data: { gender: 'MALE' } });


    private getNodeColor(d: d3.HierarchyNode<DrawableNode>): string {
        return d.data.gender === "MALE" ? "#9FC0CC" :
            d.data.gender === "FEMALE" ? "#D8A5AD" : "#AAA";
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
    // Draw nodes
    defaultNodePicture(svg: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>, options = {}) {
        const {
            width = 0,
            height = 0,
            outerRadius = this.NODE_RADIUS,
            innerRadius = outerRadius * 0.45,
        } = options;
        const cutoutColor = "white";

        const centerX = width / 2;
        const centerY = height / 2;

        const group = svg.append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        // Outer Circle
        group.append("circle")
            .attr("r", outerRadius)
            .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>));

        // Inner Circle (Cutout)
        group.append("circle")
            .attr("r", innerRadius)
            .attr("fill", cutoutColor);

        // Lower Shape (Crescent-like bottom part) - Scaled dynamically
        const lowerShapePath = `M${-outerRadius * 0.66},${outerRadius * 0.85} 
            q${outerRadius * 0.27},${-outerRadius * 0.35} ${outerRadius * 0.4},${-outerRadius * 0.35} 
            h${outerRadius * 0.54} 
            q${outerRadius * 0.4},0 ${outerRadius * 0.4},${outerRadius * 0.35} 
            a${outerRadius * 0.97},${outerRadius * 0.97} 0 0,1 ${-outerRadius * 1.3},0`;

        group.append("path")
            .attr("d", lowerShapePath)
            .attr("fill", cutoutColor);

        // Profile Picture
        const imageUrl = (d: d3.HierarchyNode<DrawableNode>) => `http://localhost:3000/api/family-tree/1/nodes/${d.data.id}/primaryPicture`;

        group.each(function (d) {
            fetch(imageUrl(d), {
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`,
                    'Content-Type': 'application/json',
                }
            }).then(response => {
                if (!response.ok) throw new Error('Image not found');
                return response.blob();
            }).then(blob => {
                const url = URL.createObjectURL(blob);
                const defs = svg.append("defs");
                defs.append("clipPath")
                    .attr("id", `clip-${d.data.id}`)
                    .append("circle")
                    .attr("r", outerRadius)
                    .attr("cx", 0)
                    .attr("cy", 0);

                d3.select(this).append("image")
                    .attr("x", -outerRadius)
                    .attr("y", -outerRadius)
                    .attr("width", outerRadius * 2)
                    .attr("height", outerRadius * 2)
                    .attr("clip-path", `url(#clip-${d.data.id})`)
                    .attr("href", url);
            }).catch(() => {
                // If image is not found, default SVG remains
            });
        });
    }

    defaultNodePictureEditMode(svg: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>, options = {}) {
        const {
            width = 0,
            height = 0,
            outerRadius = this.NODE_RADIUS,
            innerRadius = outerRadius * 0.45,
        } = options;
        const cutoutColor = "white";

        const centerX = width / 2;
        const centerY = height / 2;

        svg.each((d: d3.HierarchyNode<DrawableNode>, i: number, nodes) => {
            const nodeGroup = d3.select(nodes[i])
                .append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);

            if (d.data.mode !== 'edit') {
                // ✅ Normal Node with Profile Picture
                nodeGroup.append("circle")
                    .attr("r", outerRadius)
                    .attr("fill", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>));

                nodeGroup.append("circle")
                    .attr("r", innerRadius)
                    .attr("fill", cutoutColor);

                const lowerShapePath = `M${-outerRadius * 0.66},${outerRadius * 0.85} 
                    q${outerRadius * 0.27},${-outerRadius * 0.35} ${outerRadius * 0.4},${-outerRadius * 0.35} 
                    h${outerRadius * 0.54} 
                    q${outerRadius * 0.4},0 ${outerRadius * 0.4},${outerRadius * 0.35} 
                    a${outerRadius * 0.97},${outerRadius * 0.97} 0 0,1 ${-outerRadius * 1.3},0`;

                nodeGroup.append("path")
                    .attr("d", lowerShapePath)
                    .attr("fill", cutoutColor);

                const imageUrl = `http://localhost:3000/api/family-tree/1/nodes/${d.data.id}/primaryPicture`;

                fetch(imageUrl, {
                    headers: {
                        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzE5MzkwOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`,
                    }
                }).then(response => {
                    if (!response.ok) throw new Error('Image not found');
                    return response.blob();
                }).then(blob => {
                    const url = URL.createObjectURL(blob);
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
                        .attr("href", url);
                }).catch(() => {
                    // If image is not found, default SVG remains
                });

            } else if (d.data.mode === 'edit') {
                // ✅ Edit Node with Plus Icon
                nodeGroup.append("circle")
                    .attr("r", outerRadius)
                    .attr("fill", "#f0f0f0") // Gray background for edit mode
                    .attr("stroke", d => this.getNodeColor(d as d3.HierarchyNode<DrawableNode>))
                    .attr("stroke-width", 2);

                // Group for the plus icon (centered inside the node)
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
                    .attr("transform", "translate(-12,-12)"); // Center the plus icon inside the node
            }
        });
    }


    appendActionCircles(enter: d3.Selection<SVGGElement, d3.HierarchyNode<DrawableNode>, SVGGElement, unknown>) {
        // Action buttons group
        const actionGroup = enter.append("g")
            .attr("class", "node-actions");
        const iconOffset = this.NODE_RADIUS + 5; // Position outside top-right
        const iconSize = 6; // Equal size for all circles
        const spacing = 12; // Spacing between circles
        // Edit Circle
        actionGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5)
            .attr("cy", -iconOffset)
            .attr("fill", "#4CAF50") // Green for edit
            .style("cursor", "pointer")
            .on("click", (_event, d) => console.log("handle edit", d.data.id));
        // Suggest Edit Circle
        actionGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5 + spacing)
            .attr("cy", -iconOffset)
            .attr("fill", "#FFC107") // Yellow for suggest edit
            .style("cursor", "pointer")
            .on("click", (_event, d) => console.log("suggest edit", d.data.id));
        // Delete Circle
        actionGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5 + 2 * spacing)
            .attr("cy", -iconOffset)
            .attr("fill", "#F44336") // Red for delete
            .style("cursor", "pointer")
            .on("click", async (_event, d) => {
                const deleteUri = `http://localhost:3000/api/family-tree/1/node/${d.data.id}`
                try {
                    const
                        response = await fetch(deleteUri, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwMSIsImlhdCI6MTczNzI3MTkzOSwiZXhwIjoxODM3MzU4MzM5fQ.xyGMhsv6dcywwy7AImYvcFwxHWdvlAidvg-7M7ZeBB8`,
                                'Content-Type': 'application/json',
                            },
                        });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching nodes array:', error);
                    alert('Failed to fetch data. Check console for details.');
                    return null;
                }
            });
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


    updateTreeDrawing(rootNodeId: number) {
        this.renewTreeData(this.fetchedDesendants as DrawableNode, this.fetchedAncestors as DrawableNode);
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.oldJointData = this.jointNode;
        this.drawNodes()
    }
    updateTreeDrawingEditMode(rootNodeId: number) {
        this.renewTreeDataEditMode(this.fetchedEditModeChildren as DrawableNode, this.fetchedEditModeParents as DrawableNode);
        this.oldRootNodeId = this.rootNodeId;
        this.currentEditModeNodeId = rootNodeId

        this.drawNodesEditMode()
    }
}
