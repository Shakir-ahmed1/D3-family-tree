import * as d3 from "d3";
import { DrawableNode, treeDatazy } from "./dataManager";

export class FamilyTreeDrawer {
  private width = 1960;
  private height = 1800;
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


  // private root =  d3.hierarchy({});
  private svg = d3.select("body").append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr("transform", "translate(1350,250)");
  constructor(desc: DrawableNode, ance: DrawableNode) {
    this.descRoot = d3.hierarchy<DrawableNode>(desc);
    this.descTreeData = this.descTreeLayout(this.descRoot);
    this.descNodes = this.descTreeData.descendants();
    this.drawDescMarriageLines(this.descNodes)
    this.drawDescParentChildLine(this.descNodes)
    this.drawDescNodes(this.descNodes)

    // this.anceRoot = d3.hierarchy<DrawableNode>(ance);
    // this.anceTreeData = this.anceTreeLayout(this.anceRoot);
    // this.anceNodes = this.anceTreeData.descendants();
    // this.drawMarriageLines(this.anceNodes)
    // this.drawParentChildLine(this.anceNodes)
    // this.drawNodes(this.anceNodes)
  }


  // const root = d3.hierarchy(data);
  // Draw marriage lines based on 'target' property

  drawDescMarriageLines(nodes: d3.HierarchyNode<DrawableNode>[]) {

    nodes.forEach(d => {
      // console.log("dddddddddd", d)
      if (d.data.type === "spouse" && d.data.target) {
        const spouse = nodes.find(n => n.data.id === d.data.target);
        if (spouse) {
          this.svg.append("line")
            .attr("x1", d.x ?? 0)
            .attr("y1", d.y ?? 0)
            .attr("x2", spouse.x ?? 0)
            .attr("y2", spouse.y ?? 0)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
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
  drawDescParentChildLine(nodes: d3.HierarchyNode<DrawableNode>[]) {

    nodes.forEach(d => {



      if (d.data.type === "child") {

        // Draw connect child with both parents
        if (d.data.mother && d.data.father) {
          const mother = nodes.find(n => n.data.id === d.data.mother);
          const father = nodes.find(n => n.data.id === d.data.father);
          if (mother && father && mother.marriageMidpoint) {
            this.svg.append("path")
              .attr("class", "child-link")
              .attr("fill", "none")
              .attr("stroke", "#ccc")
              .attr("stroke-width", 1.5)
              .attr("d",
                `M${mother.marriageMidpoint.x}, ${mother.marriageMidpoint.y}
          V${(mother.marriageMidpoint.y + d.y) / 2}
          H${d.x}
          V${d.y}`);
          }
        }
        // Draw to connect achild with 1 known parent
        else if (d.data.mother || d.data.father) {
          let pr;
          if (d.data.father) pr = nodes.find(n => n.data.id === d.data.father);
          if (d.data.mother) pr = nodes.find(n => n.data.id === d.data.mother);

          this.svg.append("path")
            .attr("class", "child-link")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1.5)
            .attr("d",
              `M${pr.x},${pr.y + this.NODE_RADIUS / 2}
          V${(pr.y + d.y) / 2}
          H${d.x}
          V${d.y - this.NODE_RADIUS / 2}`);

        }
      }

    });
  }
  // Draw nodes


  drawDescNodes(nodes: d3.HierarchyNode<DrawableNode>[]) {

    const node = this.svg.selectAll("g.node")
      .data(nodes.filter(d => d.data.type !== 'root'))
      .enter().append("g")
      .attr("class",
        "node")
      .attr("transform",
        d => `translate(${d.x
          },
        ${d.y})`);

    node.append("circle")
      .attr("r", this.NODE_RADIUS) // Dynamically scale node size
      .attr("fill", d => {
        if (d.data.gender === "male") {
          return "#0F0"; // Green for male
        } else if (d.data.gender === "female") {
          return "#F0F"; // Purple for female
        } else {
          return "#AAA"; // Default color for unknown gender
        }
      });
    node.append("circle")
      .attr("r", this.NODE_RADIUS) // Dynamically scale node size
      .attr("fill", d => {
        if (d.data.gender === "male") {
          return "#0F0"; // Green for male
        } else if (d.data.gender === "female") {
          return "#F0F"; // Purple for female
        } else {
          return "#AAA"; // Default color for unknown gender
        }
      });
    node.append("circle")
      .attr("r", this.NODE_RADIUS) // Dynamically scale node size
      .attr("fill", d => {
        if (d.data.gender === "male") {
          return "#0F0"; // Green for male
        } else if (d.data.gender === "female") {
          return "#F0F"; // Purple for female
        } else {
          return "#AAA"; // Default color for unknown gender
        }
      });
    node.append("circle")
      .attr("r", this.NODE_RADIUS) // Dynamically scale node size
      .attr("fill", d => {
        if (d.data.gender === "male") {
          return "#0F0"; // Green for male
        } else if (d.data.gender === "female") {
          return "#F0F"; // Purple for female
        } else {
          return "#AAA"; // Default color for unknown gender
        }
      });
    node.append("circle")
      .attr("r", this.NODE_RADIUS) // Dynamically scale node size
      .attr("fill", d => {
        if (d.data.gender === "MALE") {
          return "#0F0"; // Green for male
        } else if (d.data.gender === "FEMALE") {
          return "#F0F"; // Purple for female
        } else {
          return "#AAA"; // Default color for unknown gender
        }
      });


    node.append("text")
      .attr("dy",
        -10)
      .attr("text-anchor",
        "middle")
      .text(d => d.data.name);

  }


}



const drawer = new FamilyTreeDrawer(treeDatazy, treeDatazy);
