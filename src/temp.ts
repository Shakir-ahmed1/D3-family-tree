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


    private oldAnceData: d3.HierarchyNode<DrawableNode>[] = [];
    private oldDescData: d3.HierarchyNode<DrawableNode>[] = [];
    private NODE_RADIUS = 40; // Change this to scale node size
    private verticalSpacing = this.NODE_RADIUS * 3; // Space between generations
    private horizontalSpacing = this.NODE_RADIUS * 3; // Space between siblings/spouses
    private descTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private descRoot: d3.HierarchyNode<DrawableNode>;
    private descTreeData: d3.HierarchyPointNode<DrawableNode>;
    private descNodes: d3.HierarchyNode<DrawableNode>[] = [];

    private anceTreeLayout = d3.tree<DrawableNode>().nodeSize([this.horizontalSpacing, this.verticalSpacing]);
    private anceRoot: d3.HierarchyNode<DrawableNode>;
    private anceTreeData: d3.HierarchyPointNode<DrawableNode>;
    private anceNodes: d3.HierarchyNode<DrawableNode>[] = [];
    private rootNodeId: number;
    private containerClassName: string = '#treeContainer';
    private fadeInAnimationDuration = 1000;

    // private familyTreeGroup;
    // private ancestorsGroup;
    // private descendantsGroup;
    private stayAnceNode: d3.HierarchyNode<DrawableNode>[] = []
    private stayDescNode: d3.HierarchyNode<DrawableNode>[] = []
    private outAnceNode: d3.HierarchyNode<DrawableNode>[] = []
    private outDescNode: d3.HierarchyNode<DrawableNode>[] = []

    private svg = d3.select('body').select(this.containerClassName)
        .append('svg')
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");

    familyTreeGroup = this.svg.append("g").attr("class", "familyTree").attr('opacity', 1);
    ancestorsGroup = this.familyTreeGroup.append("g").attr("class", "ancestors");
    descendantsGroup = this.familyTreeGroup.append("g").attr("class", "descendants");

    // private root =  d3.hierarchy({});

    constructor(
        //     , options?: {
        //     containerClassName: string;
        // }
    ) {


        // this.updateTreeData(desc, ance, rootNodeId)
        // this.descRoot = d3.hierarchy<DrawableNode>(desc);
        // this.descTreeData = this.descTreeLayout(this.descRoot);
        // this.descNodes = this.descTreeData.descendants().filter(item => item.data.id !== 0);
        // // this.descNodes = this.descTreeData.descendants();
        // console.log('this is desc nodes', this.descNodes);
        // this.anceRoot = d3.hierarchy<DrawableNode>(ance);
        // this.anceTreeData = this.anceTreeLayout(this.anceRoot);
        // this.anceNodes = this.anceTreeData.descendants().filter(item => item.data.id !== 0);
        // // this.anceNodes = this.anceTreeData.descendants()
        // console.log(this.anceNodes, this.descNodes);
        // this.drawNodes()
        // this.centerTree()
        // window.addEventListener("resize", () => this.updateSvgSize());
        // this.updateSvgSize();
    }
    // private drawNodes() {
    //     // if (this.oldAnceDataIds.length === 0 && this.oldDescDataIds.length === 0) {
    //     this.joinTree();
    //     this.calculateTreeWidthReposition();
    //     this.scaleGroupToFit(this.familyTreeGroup);
    //     this.drawDescMarriageLines(this.descNodes, this.descendantsGroup);
    //     this.drawDescParentChildLine(this.descNodes, this.descendantsGroup);
    //     this.drawDescNodes(this.descNodes, this.descendantsGroup);
    //     this.drawAnceMarriageLines(this.anceNodes, this.ancestorsGroup);
    //     this.drawAnceParentChildLine(this.anceNodes, this.ancestorsGroup);
    //     this.drawAnceNodes(this.anceNodes, this.ancestorsGroup);
    //     console.log(this.familyTreeGroup, this.ancestorsGroup, this.descendantsGroup)
    //     // } else {
    //     //     console.log("updating node condtion is excuted")
    //     //     familyTreeGroup = this.svg.select(".familyTree");
    //     //     ancestorsGroup = familyTreeGroup.select(".ancestors");
    //     //     descendantsGroup = familyTreeGroup.select(".descendants");
    //     //     console.log(familyTreeGroup, ancestorsGroup, descendantsGroup)
    //     //             familyTreeGroup.selectAll("*").remove();
    //     // ancestorsGroup.selectAll("*").remove();
    //     // descendantsGroup.selectAll("*").remove();

    //     // familyTreeGroup.transition().attr('opacity', 1)
    //     // this.joinTree();
    //     // this.calculateTreeWidthReposition();
    //     // this.scaleGroupToFit(familyTreeGroup);
    //     // this.drawDescMarriageLines(this.descNodes, descendantsGroup);
    //     // this.drawDescParentChildLine(this.descNodes, descendantsGroup);
    //     // this.drawDescNodes(this.descNodes, descendantsGroup);
    //     // this.drawAnceMarriageLines(this.anceNodes, ancestorsGroup);
    //     // this.drawAnceParentChildLine(this.anceNodes, ancestorsGroup);
    //     // this.drawAnceNodes(this.anceNodes, ancestorsGroup);

    //     // }


    // }
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
        // Filp ancestors upside down
        this.anceNodes = this.anceTreeData.descendants()
            .map(node => {
                node.y = -node.y; // Flip Y-axis to move ancestors above the root
                return node;
            });

        enter.transition().duration(this.fadeInAnimationDuration).delay(this.fadeInAnimationDuration).attr("opacity", 1);
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
                let pathD = "";
                if (d.data.mother && d.data.father) {
                    const mother = nodes.find(n => n.data.id === d.data.mother);
                    const father = nodes.find(n => n.data.id === d.data.father);
                    if (mother && father && mother.marriageMidpoint) {
                        let theSpouse = (mother.data.type === 'spouse') ? mother : father;
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
            let pathD = "";
            if (d.data.mother && d.data.father) {
                const mother = nodes.find(n => n.data.id === d.data.mother);
                const father = nodes.find(n => n.data.id === d.data.father);
                if (mother && father && mother.marriageMidpoint) {
                    let theSpouse = (mother.data.type === 'spouse') ? mother : father;
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
        });

        enter.transition()
            .duration(this.fadeInAnimationDuration)
            .delay(this.fadeInAnimationDuration)
            .attr("opacity", 1);
    }
