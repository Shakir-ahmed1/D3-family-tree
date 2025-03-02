import * as d3 from "d3";
import { DrawableNode } from "./node.interface";
import { ND } from "./dataManager";


export class FamilyTreeDrawer {
    private width = 800;
    private height = 800;
    private minTreeX: number = 0;
    private minTreeY: number = 0;
    private maxTreeX: number = 0;
    private maxTreeY: number = 0;
    private fetchedDesendants;
    private fetchedAncestors;



    private oldAnceData: d3.HierarchyNode<DrawableNode>[] = [];
    private oldDescData: d3.HierarchyNode<DrawableNode>[] = [];
    private oldJointData: d3.HierarchyNode<DrawableNode>[] = [];
    private NODE_RADIUS = 40; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * 3; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * 3; // Space between siblings/spouses
    private widthPadding = 2 * this.NODE_RADIUS;
    private heightPadding = 2 * this.NODE_RADIUS;
    private descTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private descRoot: d3.HierarchyNode<DrawableNode>;
    private descTreeData: d3.HierarchyPointNode<DrawableNode>;
    private descNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private jointNode: d3.HierarchyNode<DrawableNode>[] = []

    private anceTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private anceRoot: d3.HierarchyNode<DrawableNode>;
    private anceTreeData: d3.HierarchyPointNode<DrawableNode>;
    private anceNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private rootNodeId: number;
    private containerClassName: string = '#treeContainer';
    private fadeInAnimationDuration = 1000;

    private stayAnceNode: d3.HierarchyNode<DrawableNode>[] = []
    private stayDescNode: d3.HierarchyNode<DrawableNode>[] = []
    private outAnceNode: d3.HierarchyNode<DrawableNode>[] = []
    private outDescNode: d3.HierarchyNode<DrawableNode>[] = [];
    private oldRootNodeId;

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
    constructor(

    ) {
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
            console.log(`
                ance: (${foundAnceRoot.x} ${foundAnceRoot.y})
                desc: (${foundDescRoot.x} ${foundDescRoot.y})
                `)

        }
        this.jointNode = [...this.descNodes, ...this.anceNodes.filter(item => item.data.id !== this.rootNodeId)]
    }

    private drawNodes() {
        this.joinTree();
        this.centerTree()

        this.scaleGroupToFit()
        this.drawDescMarriageLines(this.jointNode, this.descendantsGroup);
        this.drawDescParentChildLine(this.jointNode, this.descendantsGroup);
        this.drawDescNodes(this.jointNode, this.descendantsGroup);
        this.reorderElements(this.descendantsGroup);
        this.centerFamilyGroup()
    }
    fetchData(fetchedNodesArray, rootId, setData) {
        if (setData) {
            ND.setData(fetchedNodesArray)
        }
        const ancestorsData = ND.customBuildAncestorsHierarchy(rootId, undefined);
        const descendantsData = ND.customBuildDescendantsHiararchy(rootId);
        this.fetchedDesendants = descendantsData;
        this.fetchedAncestors = ancestorsData;
        this.updateTreeData(rootId)
    }

    private joinTree() {
        this.attachNodes()




        // search the position of the root node in the descendants
        let descRootPossiton = this.descNodes.find(item => item.data.id === this.rootNodeId);
        if (!descRootPossiton) throw new Error('root node wasn\'t found in descendants');
        const descRootX = descRootPossiton.x;
        const descRootY = descRootPossiton.y;
        // Reposition the descendants relative to the root
        this.custPrint(this.descNodes)
        this.descNodes = this.descNodes.map(node => {
            node.y = node.y - descRootY;
            node.x = node.x - descRootX;
            return node;
        });
        // Filp ancestors upside down
        this.anceNodes = this.anceTreeData.descendants()
            .map(node => {
                node.y = -node.y; // Flip Y-axis to move ancestors above the root
                return node;
            });

        // find the root in the ancestors
        let anceRootPossiton = this.anceNodes.find(item => item.data.id === this.rootNodeId);
        if (!anceRootPossiton) throw new Error('root node wasn\'t found in ancsestors');

        const anceRootX = anceRootPossiton.x;
        const anceRootY = anceRootPossiton.y;

        // repositon the ancestors relative to the root
        this.anceNodes = this.anceNodes.map(node => {
            node.y = node.y - anceRootY;
            node.x = node.x - anceRootX;
            return node;
        });
        console.log(`Join tree
            ance: (${anceRootPossiton.x} ${anceRootPossiton.y})
        desc: (${descRootPossiton.x} ${descRootPossiton.y})`)






        if (this.oldJointData.length > 0 && this.oldRootNodeId) {

            const oldRootNode = this.oldJointData.find(item => item.data.id === this.rootNodeId);
            const newRootNode = this.jointNode.find(item => item.data.id === this.rootNodeId)
            const rootOffSetX = newRootNode.x + oldRootNode.x
            const rootOffSetY = newRootNode.y + oldRootNode?.y
            const jointNodeIds = this.jointNode.map(item => item.data.id)
            this.jointNode.forEach(item => {
                item.x = item.x + rootOffSetX
                item.y = item.y + rootOffSetY
            })
        }


        // this.custPrint(this.jointNode)
    }

    custPrint(nodes) {
        const newList = []
        for (let a of nodes) {
            const newObject = {
                id: a.data.id,
                x: a.x,
                y: a.y
            }
            newList.push(JSON.stringify(newObject))
        }
        console.log("Joint nodes", newList)
    }

    private scaleGroupToFit() {
        // this.custPrint(this.jointNode)

        // this.custPrint(this.jointNode)
        // if (!this.jointNode || this.jointNode.length === 0) {
        //     return; // No nodes, nothing to scale
        // }

        const treeWidth = this.maxTreeX - this.minTreeX;
        const treeHeight = this.maxTreeY - this.minTreeY;

        const svgWidth = this.width - this.widthPadding;
        const svgHeight = this.height - this.heightPadding;

        const scaleX = svgWidth / treeWidth;
        const scaleY = svgHeight / treeHeight;

        this.scaleFactor = Math.min(scaleX, scaleY, 1); // Use the smallest scale, and don't scale up
        console.log(`
            scale:
            x : (${this.minTreeX}, ${this.maxTreeX})
            y : (${this.minTreeY}, ${this.maxTreeY})
            scale x: ${scaleX}
            scale y: ${scaleY}
            `)
        const treeLeftPadding = 2 * (this.NODE_RADIUS) * this.scaleFactor;
        const treeTopPadding = 2 * (this.NODE_RADIUS) * this.scaleFactor;
        this.jointNode.forEach(item => {
            item.x = (this.scaleFactor * item.x) + treeLeftPadding;
            item.y = (this.scaleFactor * item.y) + treeTopPadding;
            if (item.data.id === 1 || item.data.id === 2)
                console.log('before coordinates', item.data.id, ":", item.x, item.y)
        })
        // this.familyTreeGroup.attr("transform", `scale(${this.scaleFactor})`);

        // adjust node radius and spacing if desired
        // this.NODE_RADIUS = 40 / this.scaleFactor;
        // this.verticalSpacing = this.NODE_RADIUS * 3;
        // this.horizontalSpacing = this.NODE_RADIUS * 3;
        // this.descTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
        // this.anceTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
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
        console.log('translate values', translateX, translateY)
        this.familyTreeGroup.transition().duration(this.fadeInAnimationDuration).attr('transform', `translate(${translateX}, ${translateY})`);
    }

    private centerTree() {

        this.minTreeX = d3.min(this.jointNode, d => d.x) ?? 0;
        this.maxTreeX = d3.max(this.jointNode, d => d.x) ?? 0;
        this.minTreeY = d3.min(this.jointNode, d => d.y) ?? 0;
        this.maxTreeY = d3.max(this.jointNode, d => d.y) ?? 0;


        const treeMiddleX = (this.maxTreeX - this.minTreeX) / 2;
        const treeMiddleY = (this.maxTreeY - this.minTreeY) / 2;
        const svgMiddleX = (this.width) / 2;
        const svgMiddleY = (this.height) / 2;

        this.offSetX = - this.minTreeX;
        this.offSetY = - this.minTreeY;


        console.log("offset", this.offSetX, this.offSetY)


        this.jointNode.forEach(item => {
            item.x = this.offSetX + item.x
            item.y = this.offSetY + item.y
        })
    }

    // Draw marriage lines based on 'target' property
    drawDescMarriageLines(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {

        // 1. DATA JOIN (Key by a combination of spouse IDs)
        const lines = svg.selectAll("line.marriage-line")
            .data(nodes.filter(d => {
                if (d.data.catag === 'desc') {
                    return d.data.type === "spouse" && d.data.target;
                } else if (d.data.catag === 'ance') {
                    const spouse = nodes.find(n => n.data.id === d.data.target);
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
                    const spouse = nodes.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        const spouseId = Math.min(d.data.id, spouse.data.id); // Use spouse ID directly
                        const otherSpouseId = Math.max(d.data.id, spouse.data.id);
                        return `${spouseId}-${otherSpouseId}`;
                    }
                    return ""; // Return empty string if no spouse found (will be filtered out)

                } else {
                    throw new Error('data must have a .catag property set either to "desc" or "ance"')
                }

            });

        // 2. EXIT (Remove old lines - this is important!)
        lines.exit().transition()
            .duration(this.fadeInAnimationDuration)
            .attr("opacity", 0)
            .remove(); // Remove immediately after transition

        // 3. UPDATE (Transition existing lines)
        lines.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("x1", d => d.x ?? 0)
            .attr("y1", d => d.y ?? 0)
            .attr("x2", d => {
                const spouse = nodes.find(n => n.data.id === d.data.target);
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = nodes.find(n => n.data.id === d.data.target);
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
                const spouse = nodes.find(n => n.data.id === d.data.target);
                return spouse?.x ?? 0;
            })
            .attr("y2", d => {
                const spouse = nodes.find(n => n.data.id === d.data.target);
                return spouse?.y ?? 0;
            });

        enter.transition()
            .duration(this.fadeInAnimationDuration)
            .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);


        // Midpoint calculation (do this AFTER data join and transitions)
        nodes.forEach(d => {
            if (d.data.catag === 'desc') {
                if (d.data.type === "spouse" && d.data.target) {
                    const spouse = nodes.find(n => n.data.id === d.data.target);
                    if (spouse) {
                        d.marriageMidpoint = {
                            x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                            y: d.y
                        };
                        spouse.marriageMidpoint = d.marriageMidpoint;
                    }
                }
            } else if (d.data.catag === 'ance') {
                const spouse = nodes.find(n => n.data.id === d.data.target);
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


    drawDescParentChildLine(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        // 1. DATA JOIN (Key by a combination of parent and child IDs)

        const paths = svg.selectAll("path.child-link")
            .data(nodes.filter(d => d.data.type === "child"), d => {
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
            .duration(this.fadeInAnimationDuration)
            .attr("opacity", 0)
            .remove();

        // 3. UPDATE (Transition existing paths)
        paths.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("d", d => {  // Update the 'd' attribute
                if (d.data.catag === 'desc') {
                    let pathD = "";
                    if (d.data.mother && d.data.father) {
                        const mother = nodes.find(n => n.data.id === d.data.mother);
                        const father = nodes.find(n => n.data.id === d.data.father);
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                        if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                            pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    } else if (d.data.mother || d.data.father) {
                        let pr;
                        if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                        if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                        if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                            pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    }
                    return pathD;
                } else if (d.data.catag === 'ance') {
                    let pathD = "";
                    let parent;
                    if (d.data.mother && d.data.father) {
                        const mother = nodes.find(n => n.data.id === d.data.mother);
                        const father = nodes.find(n => n.data.id === d.data.father);
                        if (mother && father && mother.marriageMidpoint !== undefined) {
                            parent = (mother.data.type === 'spouse') ? mother : father;
                        }
                    } else if (d.data.mother) {
                        parent = nodes.find(n => n.data.id === d.data.mother);
                    } else if (d.data.father) {
                        parent = nodes.find(n => n.data.id === d.data.father);
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
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                    if (mother && father && theSpouse.marriageMidpoint !== undefined) {
                        pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                } else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                    if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                    if (pr && pr.x !== undefined && pr.y !== undefined && d && d.y !== undefined && d.x !== undefined) {
                        pathD = `M${pr.x},${pr.y} V${(pr.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                }
                return pathD;

            } else if (d.data.catag === 'ance') {
                let pathD = "";
                let parent;

                if (d.data.mother && d.data.father) {
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    if (mother && father && mother.marriageMidpoint !== undefined) {
                        parent = (mother.data.type === 'spouse') ? mother : father;
                    }
                } else if (d.data.mother) {
                    parent = nodes.find(n => n.data.id === d.data.mother);
                } else if (d.data.father) {
                    parent = nodes.find(n => n.data.id === d.data.father);
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
            .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);
    }

    drawDescNodes(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = this.jointNode.find(item => item.data.id === this.rootNodeId);

        // 1. SELECT and DATA JOIN: This is the KEY change
        const node = svg.selectAll("g.node")  // Select existing nodes
            .data(nodes.filter(d => d.data.type !== 'root'), d => d.data.id); // Key by ID

        // 2. UPDATE: Handle existing nodes (transitions)
        node.transition()
            .duration(this.fadeInAnimationDuration)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactor})`)
            .attr('opacity', 1)
        // .on('click', (event, d) => this.updateTreeData(d.data.id))

        // 3. ENTER: Handle new nodes
        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => {
                // Animate from parent or a relevant existing node
                const parent = nodes.find(n => n.children && n.children.some(child => child.data.id === d.data.id));
                if (parent) {
                    return `translate(${parent.x},${parent.y}) scale(${this.scaleFactor})`;
                } else if (rootNode) {
                    return `translate(${rootNode.x},${rootNode.y}) scale(${this.scaleFactor})`
                }
                return `translate(${d.x},${d.y}) scale(${this.scaleFactor})`
            })
            .attr('opacity', 0);

        enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .on('click', (event, d) => {
                const ancestorsData = ND.customBuildAncestorsHierarchy(d.data.id, undefined);
                const descendantsData = ND.customBuildDescendantsHiararchy(d.data.id);
                this.fetchedDesendants = descendantsData;
                this.fetchedAncestors = ancestorsData;
                this.updateTreeData(d.data.id)
            })

            .attr("fill", d => this.getNodeColor(d))


        enter.append("text")
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .text(d => d.data.name);

        this.appendActionCircles(enter); // Add action circles

        enter.transition()
            .duration(this.fadeInAnimationDuration)
            .attr('opacity', 1)
            .attr("transform", d => `translate(${d.x},${d.y}) scale(${this.scaleFactor})`);

        // 4. EXIT: Handle removed nodes
        if (this.oldRootNodeId && this.oldJointData) {

            const foundOldRoot = this.jointNode.find(item => item.data.id === this.oldRootNodeId)
            node.exit().transition()
                .duration(this.fadeInAnimationDuration)
                .attr("transform", d => {
                    if (foundOldRoot) {
                        return `translate(${foundOldRoot.x},${foundOldRoot.y}) scale(${this.scaleFactor})`
                    } else {
                        return `translate(${d.x},${d.y}) scale(${this.scaleFactor})`
                    }
                })
                .attr('opacity', 0)
                .remove();
        } else {
            node.exit().transition()
                .duration(this.fadeInAnimationDuration)
                .attr('opacity', 0)
                .remove();
        }
    }

    private getNodeColor(d: d3.HierarchyNode<DrawableNode>): string {
        return d.data.gender === "MALE" ? "#9FC0CC" :
            d.data.gender === "FEMALE" ? "#D8A5AD" : "#AAA";
    }

    // Draw child-parent connections
    private reorderElements(svgGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        svgGroup.selectAll("path.child-link").raise(); // Raise lines to the bottom (behind nodes)
        svgGroup.selectAll("line.marriage-line").raise(); // Raise marriage lines to the bottom
        svgGroup.selectAll("g.node").raise(); // Raise nodes to the top
    }
    // Draw nodes



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
            .on("click", (event, d) => console.log("handle edit", d.data.id));

        // Suggest Edit Circle
        actionGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5 + spacing)
            .attr("cy", -iconOffset)
            .attr("fill", "#FFC107") // Yellow for suggest edit
            .style("cursor", "pointer")
            .on("click", (event, d) => console.log("suggest edit", d.data.id));

        // Delete Circle
        actionGroup.append("circle")
            .attr("r", iconSize)
            .attr("cx", iconOffset - this.NODE_RADIUS + 5 + 2 * spacing)
            .attr("cy", -iconOffset)
            .attr("fill", "#F44336") // Red for delete
            .style("cursor", "pointer")
            .on("click", async (event, d) => {
                const deleteUri = `http://localhost:3000/api/family-tree/1/node/${d.data.id}`
                try {
                    const response = await fetch(deleteUri, {
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

    }
    processUpdate(rootNodeId) {
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.oldAnceData = this.anceNodes;
        this.oldDescData = this.descNodes;
        this.oldJointData = this.jointNode


        this.stayAnceNode = []
        this.stayDescNode = []
        this.outAnceNode = []
        this.outDescNode = []

        const anceNodeId = this.anceNodes.map(item => item.data.id)
        const descNodeId = this.descNodes.map(item => item.data.id)



        this.oldAnceData.map(item1 => {
            if (anceNodeId.includes(item1.data.id)) {
                this.stayAnceNode.push(item1)
            } else {
                this.outAnceNode.push(item1)
            }
        }
        );
        this.oldDescData.map(item1 => {
            if (descNodeId.includes(item1.data.id)) {
                this.stayDescNode.push(item1)
            } else {
                this.outDescNode.push(item1)
            }
        }
        );

        this.attachNodes();
        this.drawNodes()
    }
    updateTreeData(rootNodeId: number) {
        this.jointNode.map(item => {
            if (item.data.id === 1 || item.data.id === 2)
                console.log('coordinates', item.data.id, ":", item.x, item.y)
        })
        this.renewTreeData(this.fetchedDesendants, this.fetchedAncestors);

        this.processUpdate(rootNodeId)
        this.jointNode.map(item => {
            if (item.data.id === 1 || item.data.id === 2)
                console.log('coordinates', item.data.id, ":", item.x, item.y)
        })
    }


}
