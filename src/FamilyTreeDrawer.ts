import * as d3 from "d3";
import { DrawableNode } from "./node.interface";


export class FamilyTreeDrawer {
    private width = 1000;
    private height = 1000;
    private xScale = d3.scaleLinear().domain([0, this.width]).range([0, this.width]);
    private yScale = d3.scaleLinear().domain([0, this.height]).range([0, this.height]);
    private minTreeX: number = 0;
    private minTreeY: number = 0;
    private maxTreeX: number = 0;
    private maxTreeY: number = 0;
    private NODE_RADIUS = 40; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * 3; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * 3; // Space between siblings/spouses
    private descTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private descRoot: d3.HierarchyNode<DrawableNode>;
    private descTreeData: d3.HierarchyPointNode<DrawableNode>;
    private descNodes: d3.HierarchyNode<DrawableNode>[];

    private anceTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private anceRoot: d3.HierarchyNode<DrawableNode>;
    private anceTreeData: d3.HierarchyPointNode<DrawableNode>;
    private anceNodes: d3.HierarchyNode<DrawableNode>[];
    private rootNodeId: number;
    private containerClassName: string = '#treeContainer';
    private fadeInAnimationDuration = 1000;

    // private root =  d3.hierarchy({});
    private svg = d3.select('body').select(this.containerClassName)
        .append('svg')
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");


    constructor(desc: DrawableNode, ance: DrawableNode, rootNodeId: number
    //     , options?: {
    //     containerClassName: string;
    // }
) {

        this.rootNodeId = rootNodeId;
        const familyTreeGroup = this.svg.append("g").attr("class", "familyTree");
        const ancestorsGroup = familyTreeGroup.append("g").attr("class", "ancestors");
        const descendantsGroup = familyTreeGroup.append("g").attr("class", "descendants");

        this.descRoot = d3.hierarchy<DrawableNode>(desc);
        this.descTreeData = this.descTreeLayout(this.descRoot);
        this.descNodes = this.descTreeData.descendants().filter(item => item.data.id !== 0);
        // this.descNodes = this.descTreeData.descendants();
        console.log('this is desc nodes', this.descNodes);
        this.anceRoot = d3.hierarchy<DrawableNode>(ance);
        this.anceTreeData = this.anceTreeLayout(this.anceRoot);
        this.anceNodes = this.anceTreeData.descendants().filter(item => item.data.id !== 0);
        // this.anceNodes = this.anceTreeData.descendants()
        this.joinTree();
        this.calculateTreeWidthReposition();
        // this.scaleGroupToFit(ancestorsGroup)
        // this.scaleGroupToFit(descendantsGroup)
        this.scaleGroupToFit(familyTreeGroup);
        this.drawDescMarriageLines(this.descNodes, descendantsGroup);
        this.drawDescParentChildLine(this.descNodes, descendantsGroup);
        this.drawDescNodes(this.descNodes, descendantsGroup);
        this.drawAnceMarriageLines(this.anceNodes, ancestorsGroup);
        this.drawAnceParentChildLine(this.anceNodes, ancestorsGroup);
        this.drawAnceNodes(this.anceNodes, ancestorsGroup);
        console.log(this.anceNodes, this.descNodes);
        // this.centerTree()
        // window.addEventListener("resize", () => this.updateSvgSize());
        // this.updateSvgSize();
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

        // Calculate translation to center the group inside the SVG
        // const translateX = (svgWidth - groupWidth * scaleFactor) / 2;
        // const translateY = (svgHeight - groupHeight * scaleFactor) / 2;
        // console.log("dh3dhed",)
        // Apply transform: scale and translate
        group.attr('transform', `scale(${scaleFactor})`);
    }




    private centerTree() {

        const allNodes = [...this.descNodes, ...this.anceNodes];
        const minX = d3.min(allNodes, d => d.x) ?? 0;
        const maxX = d3.max(allNodes, d => d.x) ?? 0;
        const minY = d3.min(allNodes, d => d.y) ?? 0;
        const maxY = d3.max(allNodes, d => d.y) ?? 0;

        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        const middleX = (this.width + treeWidth) / 2;
        const middleY = (this.height + treeHeight) / 2;
        d3.select("svg g")

            .transition()
            .duration(500)
            .attr("transform", `translate(${middleX}, ${middleY})`);

    }

    // const root = d3.hierarchy(data);
    // Draw marriage lines based on 'target' property
    drawDescMarriageLines(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        nodes.forEach(d => {
            if (d.data.type === "spouse" && d.data.target) {
                const spouse = nodes.find(n => n.data.id === d.data.target);
                if (spouse) {
                    const line = svg.append("line")
                        .attr("x1", d.x ?? 0)
                        .attr("y1", d.y ?? 0)
                        .attr("x2", spouse.x ?? 0)
                        .attr("y2", spouse.y ?? 0)
                        .attr("stroke", "#000")
                        .attr("stroke-width", 2)
                        .attr("opacity", 0); // Start with opacity 0


                    // Animate opacity to 1 in 500ms
                    line.transition()
                        .duration(500)
                        .delay(500)
                        .attr("opacity", 1);

                    // Store midpoint of marriage line for children connections
                    d.marriageMidpoint = {
                        x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                        y: d.y
                    };
                    spouse.marriageMidpoint = d.marriageMidpoint;
                }
            }
        });
    }

    // Draw child-parent connections
    drawDescParentChildLine(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        nodes.forEach(d => {
            if (d.data.type === "child") {
                let path: d3.Selection<SVGPathElement, unknown, HTMLElement, any> | null = null;

                // Connect child with both parents
                if (d.data.mother && d.data.father) {
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    if (mother && father && mother.marriageMidpoint) {
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                        path = svg.append("path")
                            .attr("class", "child-link")
                            .attr("fill", "none")
                            .attr("stroke", "#ccc")
                            .attr("stroke-width", 1.5)
                            .attr("opacity", 0) // Start hidden
                            .attr("d",
                                `M${theSpouse.x}, ${theSpouse.y}
                             V${(theSpouse.marriageMidpoint.y + d.y) / 2}
                             H${d.x}
                             V${d.y}`);
                    }
                }

                // Connect child with a single known parent
                else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                    if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                    if (pr && pr.x && pr.y && d && d.y && d.x) {
                        path = svg.append("path")
                            .attr("class", "child-link")
                            .attr("fill", "none")
                            .attr("stroke", "#ccc")
                            .attr("stroke-width", 1.5)
                            .attr("opacity", 0) // Start hidden
                            .attr("d",
                                `M${pr.x},${pr.y + this.NODE_RADIUS / 2}
                             V${(pr.y + d.y) / 2}
                             H${d.x}
                             V${d.y - this.NODE_RADIUS / 2}`);
                    }
                }

                // Apply fade-in animation
                if (path) {
                    path.transition()
                        .duration(500)
                        .delay(500)

                        .attr("opacity", 1);
                }
            }
        });
    }

    // Draw nodes
    drawDescNodes(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        const node = svg.selectAll("g.node")
            .data(nodes.filter(d => d.data.type !== 'root'))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${rootNode.x}, ${rootNode.y})`)
            .attr('opacity', 0);

        // Main node circle
        node.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("fill", d => {
                if (d.data.gender === "MALE") {
                    return "#9FC0CC";
                } else if (d.data.gender === "FEMALE") {
                    return "#D8A5AD";
                } else {
                    return "#AAA";
                }
            });

        // Name text
        node.append("text")
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .text(d => d.data.name);

        // Action buttons group
        const actionGroup = node.append("g")
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

        node.transition()
            .attr('opacity', 1)
            .duration(this.fadeInAnimationDuration)
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    drawAnceMarriageLines(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        nodes.forEach(d => {
            const spouse = nodes.find(n => n.data.id === d.data.target);
            if (spouse) {
                const line = svg.append("line")
                    .attr("x1", d.x ?? 0)
                    .attr("y1", d.y ?? 0)
                    .attr("x2", spouse.x ?? 0)
                    .attr("y2", spouse.y ?? 0)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0); // Start with opacity 0


                // Animate opacity to 1 over 500ms
                line.transition()
                    .duration(500)
                    .delay(500)

                    .attr("opacity", 1);

                // Store midpoint of marriage line for children connections
                d.marriageMidpoint = {
                    x: ((d.x ?? 0) + (spouse.x ?? 0)) / 2,
                    y: d.y
                };
                spouse.marriageMidpoint = d.marriageMidpoint;
            }
        });
    }

    // Draw child-parent connections
    drawAnceParentChildLine(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        nodes.forEach(d => {
            if (d.data.type === "child") {
                let path: d3.Selection<SVGPathElement, unknown, HTMLElement, any> | null = null;

                // Connect child with both parents
                if (d.data.mother && d.data.father) {
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    if (mother && father && mother.marriageMidpoint) {
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
                        path = svg.append("path")
                            .attr("class", "child-link")
                            .attr("fill", "none")
                            .attr("stroke", "#ccc")
                            .attr("stroke-width", 1.5)
                            .attr("opacity", 0) // Start hidden
                            .attr("d",
                                `M${theSpouse.marriageMidpoint.x}, ${theSpouse.marriageMidpoint.y}
                             V${(theSpouse.marriageMidpoint.y + d.y) / 2}
                             H${d.x}
                             V${d.y}`);
                    }
                }

                // Connect child with a single known parent
                else if (d.data.mother || d.data.father) {
                    let pr;
                    if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
                    if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);
                    if (pr && pr.x && pr.y && d && d.y && d.x) {
                        path = svg.append("path")
                            .attr("class", "child-link")
                            .attr("fill", "none")
                            .attr("stroke", "#ccc")
                            .attr("stroke-width", 1.5)
                            .attr("opacity", 0) // Start hidden
                            .attr("d",
                                `M${pr.x},${pr.y + this.NODE_RADIUS / 2}
                             V${(pr.y + d.y) / 2}
                             H${d.x}
                             V${d.y - this.NODE_RADIUS / 2}`);
                    }
                }

                // Apply fade-in animation
                if (path) {
                    path.transition()
                        .duration(500)
                        .delay(500)

                        .attr("opacity", 1);
                }
            }
        });
    }

    // Draw nodes
    drawAnceNodes(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
        const rootNode = nodes.find(item => item.data.id === this.rootNodeId);

        const node = svg.selectAll("g.node")
            .data(nodes.filter(d => d.data.type !== 'root'))
            .enter().append("g")
            .attr("class", "node")
            .attr('opacity', 0)
            .attr("transform", d => `translate(${rootNode.x}, ${rootNode.y})`)
            .attr('opacity', 0);

        // Main node circle
        node.append("circle")
            .attr("r", this.NODE_RADIUS)
            .attr("fill", (d: d3.HierarchyNode<DrawableNode>) => {
                if (d.data.gender === "MALE") {
                    return "#9FC0CC";
                } else if (d.data.gender === "FEMALE") {
                    return "#D8A5AD";
                } else {
                    return "#AAA";
                }
            });

        // Name text
        node.append("text")
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .text((d: d3.HierarchyNode<DrawableNode>) => d.data.name);

        // Action buttons group
        const actionGroup = node.append("g")
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

        node.transition()
            .attr('opacity', 1)
            .duration(this.fadeInAnimationDuration)
            .attr("transform", (d: d3.HierarchyNode<DrawableNode>) => `translate(${d.x},${d.y})`);
    }



    updateTreeData(desc: DrawableNode, ance: DrawableNode, rootNodeId: number) {
        const oldRootNodeId = this.rootNodeId;
        this.rootNodeId = rootNodeId;
        const familyTreeGroup = this.svg.select("g").attr("class", "familyTree");
        const ancestorsGroup = familyTreeGroup.select("g").attr("class", "ancestors");
        const descendantsGroup = familyTreeGroup.select("g").attr("class", "descendants");

        const oldAnceData = this.anceNodes.map(item=>item.data.id);
        const oldDescData = this.descNodes.map(item=>item.data.id);

        this.descRoot = d3.hierarchy<DrawableNode>(desc);
        this.descTreeData = this.descTreeLayout(this.descRoot);
        this.descNodes = this.descTreeData.descendants().filter(item => item.data.id !== 0);
        this.anceRoot = d3.hierarchy<DrawableNode>(ance);
        this.anceTreeData = this.anceTreeLayout(this.anceRoot);
        this.anceNodes = this.anceTreeData.descendants().filter(item => item.data.id !== 0);


        const stayAnceNode = []
        const stayDescNode = []
        const outAnceNode = []
        const outDescNode = []

        const anceNodeId = this.anceNodes.map(item => item.data.id)
        const descNodeId = this.descNodes.map(item => item.data.id)



        oldAnceData.map(item1 => {
            console.log("dkdkdkd", anceNodeId, item1)
            if (anceNodeId.includes(item1)) {
                stayAnceNode.push(item1)
            } else {
                outAnceNode.push(item1)
            }
        }
        );
        oldDescData.map(item1 => {
            if (descNodeId.includes(item1)) {
                stayDescNode.push(item1)
            } else {
                outDescNode.push(item1)
            }
        }
        );


        // console.log(oldRootNodeId, this.rootNodeId)
        // console.log('ance', oldAnceData, this.anceNodes,)
        // console.log('desc', oldDescData, this.descNodes,)
        function customPrinter(obj) {
            return obj.map(item => item)
        }
        console.log('old root', oldRootNodeId)
        console.log('new root', this.rootNodeId)
        console.log(`stay`, customPrinter(stayAnceNode), customPrinter(stayDescNode))
        console.log(`out`, customPrinter(outAnceNode), customPrinter(outDescNode))
        console.log(`new`, customPrinter(this.anceNodes), customPrinter(this.descNodes))
        console.log(`old`, customPrinter(oldAnceData), customPrinter(oldDescData))


        // this.joinTree();
        // this.calculateTreeWidthReposition();

        // this.scaleGroupToFit(familyTreeGroup);
        // this.drawDescMarriageLines(this.descNodes, descendantsGroup);
        // this.drawDescParentChildLine(this.descNodes, descendantsGroup);
        // this.drawDescNodes(this.descNodes, descendantsGroup);
        // this.drawAnceMarriageLines(this.anceNodes, ancestorsGroup);
        // this.drawAnceParentChildLine(this.anceNodes, ancestorsGroup);
        // this.drawAnceNodes(this.anceNodes, ancestorsGroup);
        // console.log(this.anceNodes, this.descNodes);

    }

}
