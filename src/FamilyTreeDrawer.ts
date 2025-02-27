import * as d3 from "d3";
import { DrawableNode } from "./node.interface";


export class FamilyTreeDrawer {
    private width = 600;
    private height = 1000;
    private xScale = d3.scaleLinear().domain([0, this.width]).range([0, this.width]);
    private yScale = d3.scaleLinear().domain([0, this.height]).range([0, this.height]);
    private minTreeX: number = 0;
    private minTreeY: number = 0;
    private maxTreeX: number = 0;
    private maxTreeY: number = 0;


    private oldAnceData: d3.HierarchyNode<DrawableNode>[] = [];
    private oldDescData: d3.HierarchyNode<DrawableNode>[] = [];
    private oldJointData: d3.HierarchyNode<DrawableNode>[] = [];
    private NODE_RADIUS = 40; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * 3; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * 3; // Space between siblings/spouses
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

    private svg = d3.select('body').select(this.containerClassName)
        .append('svg')
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");

    familyTreeGroup = this.svg.append("g").attr("class", "familyTree").attr('opacity', 1);
    ancestorsGroup = this.familyTreeGroup.append("g").attr("class", "ancestors");
    descendantsGroup = this.familyTreeGroup.append("g").attr("class", "descendants");
    private nodePositions: Map<number, { x: number; y: number }> = new Map();

    constructor(

    ) {
    }
    private attachNodes() {
        this.anceNodes.forEach(item => {
            item.data.catag = 'ance'
        })
        this.descNodes.forEach(item => {
            item.data.catag = 'desc'
        })
        this.jointNode = [...this.descNodes, ...this.anceNodes]

    }

    private drawNodes() {
        this.attachNodes()
        this.joinTree();
        this.calculateTreeWidthReposition();
        this.scaleGroupToFit(this.familyTreeGroup);
        this.drawDescMarriageLines(this.jointNode, this.descendantsGroup);
        this.drawDescParentChildLine(this.jointNode, this.descendantsGroup);
        this.drawDescNodes(this.jointNode, this.descendantsGroup);


        this.reorderElements(this.descendantsGroup);
        // this.centerTree()
    }

    private calculateTreeWidthReposition() {
        // reposition to positives of x and y
        let paddingTreeX = this.NODE_RADIUS;
        let paddingTreeY = this.NODE_RADIUS;
        this.descNodes.map(node => {
            if (node) {
                if (node?.x && node.x < this.minTreeX) this.minTreeX = node.x;
                if (node?.y && node.y < this.minTreeY) this.minTreeY = node.y;
                if (node?.x && node.x > this.maxTreeX) this.maxTreeX = node.x;
                if (node?.y && node.y > this.maxTreeY) this.maxTreeY = node.y;
            }

        });
        this.anceNodes.map(node => {
            if (node?.x && node.x < this.minTreeX) this.minTreeX = node.x;
            if (node?.y && node.y < this.minTreeY) this.minTreeY = node.y;
            if (node?.x && node.x > this.maxTreeX) this.maxTreeX = node.x;
            if (node?.y && node.y > this.maxTreeY) this.maxTreeY = node.y;
        });

        this.anceNodes.forEach(item => {
            if (item.x !== undefined) item.x = item.x - this.minTreeX + paddingTreeX;
            if (item.y !== undefined) item.y = item.y - this.minTreeY + paddingTreeY;
            return item;
        });
        this.descNodes.forEach(item => {
            if (item.x !== undefined) item.x = item.x - this.minTreeX + paddingTreeX;
            if (item.y !== undefined) item.y = item.y - this.minTreeY + paddingTreeY;
            return item;
        });
    }
    private updateSvgSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        d3.select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
    }

    private joinTree() {

        // search the position of the root node in the descendants
        let descRootPossiton = this.descNodes.find(item => item.data.id === this.rootNodeId);
        if (!descRootPossiton) throw new Error('root node wasn\'t found in descendants');
        const descRootX = descRootPossiton.x;
        const descRootY = descRootPossiton.y;
        // Reposition the descendants relative to the root
        this.descNodes = this.descNodes.map(node => {
            if (descRootY && node.y) node.y = node.y - descRootY;
            if (descRootX && node.x) node.x = node.x - descRootX;
            return node;
        });
        console.log('this is desc nodes', this.descNodes);
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

        console.log('roots', anceRootPossiton, descRootPossiton);
        // repositon the ancestors relative to the root
        this.anceNodes = this.anceNodes.map(node => {
            if (anceRootY && node.y) node.y = node.y - anceRootY;
            if (anceRootX && node.x) node.x = node.x - anceRootX;
            return node;
        });


        this.anceNodes.map(item => {
            return item;
        });
        this.descNodes.map(item => {
            return item;
        });
        console.log("Join treenodes", this.anceNodes, this.descNodes)
    }

    private scaleGroupToFit(group: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        // Get the bounding box of the group (natural size before scaling)
        let targetHeight = this.height;
        let targetWidth = this.width;
        const groupWidth = this.maxTreeX - this.minTreeX + this.NODE_RADIUS * 13;
        const groupHeight = this.maxTreeY - this.minTreeY + this.NODE_RADIUS * 13;

        console.log("scaletofit", groupWidth, groupHeight);
        if (groupWidth === 0 || groupHeight === 0) {
            console.warn("Warning: The group has no elements or zero size.");
            return;
        }

        // Create linear scales for width and height
        this.xScale = d3.scaleLinear()
            .domain([0, groupWidth])
            .range([0, targetWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, groupHeight])
            .range([0, targetHeight]);

        // Maintain aspect ratio: Use the smallest scale factor
        const scaleFactor = Math.min(this.xScale(groupWidth) / groupWidth, this.yScale(groupHeight) / groupHeight);
        group.attr('transform', `scale(${scaleFactor})`);
    }

    private centerTree() {

        const minX = d3.min(this.jointNode, d => d.x) ?? 0;
        const maxX = d3.max(this.jointNode, d => d.x) ?? 0;
        const minY = d3.min(this.jointNode, d => d.y) ?? 0;
        const maxY = d3.max(this.jointNode, d => d.y) ?? 0;

        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        const middleX = (this.width + treeWidth) / 2;
        const middleY = (this.height + treeHeight) / 2;
        d3.select("svg g")

            .transition()
            .duration(500)
            .attr("transform", `translate(${middleX}, ${middleY})`);

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
                console.log('Marriage lines assignement', d.data.id, d.data)
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
        console.log(paths)
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
                        console.log("father and mother", mother?.data.id, mother.marriageMidpoint, father?.data.id, father.marriageMidpoint)
                        if (mother && father && theSpouse.marriageMidpoint) {
                            pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                        }
                    } else if (d.data.mother || d.data.father) {
                        let pr;
                        if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                        if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                        if (pr && pr.x && pr.y && d && d.y && d.x) {
                            pathD = `M${pr.x},${pr.y + this.NODE_RADIUS / 2} V${(pr.y + d.y) / 2} H${d.x} V${d.y - this.NODE_RADIUS / 2}`;
                        }
                    }
                    return pathD;
                } else if (d.data.catag === 'ance') {
                    let pathD = "";
                    let parent;
                    if (d.data.mother && d.data.father) {
                        const mother = nodes.find(n => n.data.id === d.data.mother);
                        const father = nodes.find(n => n.data.id === d.data.father);
                        if (mother && father && mother.marriageMidpoint) {
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
                    if (mother && father && theSpouse.marriageMidpoint) {
                        pathD = `M${theSpouse.x}, ${theSpouse.y} V${(theSpouse.marriageMidpoint.y + d.y) / 2} H${d.x} V${d.y}`;
                    }
                } else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                    if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                    if (pr && pr.x && pr.y && d && d.y && d.x) {
                        pathD = `M${pr.x},${pr.y + this.NODE_RADIUS / 2} V${(pr.y + d.y) / 2} H${d.x} V${d.y - this.NODE_RADIUS / 2}`;
                    }
                }
                return pathD;

            } else if (d.data.catag === 'ance') {
                let pathD = "";
                let parent;

                if (d.data.mother && d.data.father) {
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    if (mother && father && mother.marriageMidpoint) {
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
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr('opacity', 1); // Ensure opacity is set

        // 3. ENTER: Handle new nodes
        const enter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => {
                // Animate from parent or a relevant existing node
                const parent = nodes.find(n => n.children && n.children.some(child => child.data.id === d.data.id));
                if (parent) {
                    return `translate(${parent.x},${parent.y})`;
                } else if (rootNode) {
                    return `translate(${rootNode.x},${rootNode.y})`
                }
                return `translate(${d.x},${d.y})`
            })
            .attr('opacity', 0);

        enter.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("fill", d => this.getNodeColor(d)); // Helper function

        enter.append("text")
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .text(d => d.data.name);

        this.appendActionCircles(enter); // Add action circles

        enter.transition()
            .duration(this.fadeInAnimationDuration)
            .attr('opacity', 1)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // 4. EXIT: Handle removed nodes
        if (this.oldRootNodeId && this.oldJointData) {

            const foundOldRoot = this.jointNode.find(item => item.data.id === this.oldRootNodeId)
            node.exit().transition()
                .duration(this.fadeInAnimationDuration)
                .attr("transform", d => {
                    if (foundOldRoot) {
                        return `translate(${foundOldRoot.x},${foundOldRoot.y})`
                    } else {
                        return `translate(${d.x},${d.y})`
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
            .on("click", (event, d) => console.log("node deleted", d.data.id));

    }



    updateTreeData(desc: DrawableNode, ance: DrawableNode, rootNodeId: number) {
        this.oldJointData.forEach(node => {
            this.nodePositions.set(node.data.id, { x: node.x, y: node.y });
        });
        this.oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        this.oldAnceData = this.anceNodes;
        this.oldDescData = this.descNodes;
        this.oldJointData = this.jointNode

        this.descRoot = d3.hierarchy<DrawableNode>(desc);
        this.descTreeData = this.descTreeLayout(this.descRoot);
        this.descNodes = this.descTreeData.descendants().filter(item => item.data.id !== 0);
        this.anceRoot = d3.hierarchy<DrawableNode>(ance);
        this.anceTreeData = this.anceTreeLayout(this.anceRoot);
        this.anceNodes = this.anceTreeData.descendants().filter(item => item.data.id !== 0);


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

        function customPrinter(obj) {
            return obj.map(item => item)
        }

        this.stayAnceNode.forEach(node => {
            const pos = this.nodePositions.get(node.data.id);
            if (pos) {
                node.x = pos.x;
                node.y = pos.y;
            }
        });
        this.stayDescNode.forEach(node => {
            const pos = this.nodePositions.get(node.data.id);
            if (pos) {
                node.x = pos.x;
                node.y = pos.y;
            }
        });


        console.log('old root', this.oldRootNodeId)
        console.log('new root', this.rootNodeId)
        console.log(`stay`, customPrinter(this.stayAnceNode), customPrinter(this.stayDescNode))
        console.log(`out`, customPrinter(this.outAnceNode), customPrinter(this.outDescNode))
        console.log(`new`, customPrinter(this.anceNodes), customPrinter(this.descNodes))
        console.log(`old`, customPrinter(this.oldAnceData), customPrinter(this.oldDescData))
        this.attachNodes();
        this.drawNodes()
    }


}
