import * as d3 from "d3";

const width = 960;
const height = 2000;

const treeLayout = d3.tree().size([width - 160, height]);

// Custom N-shaped link function
const nLink = d => {
  return `M${d.source.x},${d.source.y}
          V${(d.source.y + d.target.y) / 2}
          H${d.target.x}
          V${d.target.y}`;
};

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(80,40)");

async function loadData() {
  try {
    const json = {
      title: "root",
      children: [
        { name: "vertex" },
        {
          name: "vertex",
          children: [{ name: "vertex" }]
        },
        {
          name: "vertex",
          children: [
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            { name: "vertex" },
            {
              name: "vertex",
              children: [{ name: "vertex", children: [{ name: "vertex",children: [{ name: "vertex" },            { name: "vertex" },
              ] },            { name: "vertex" },
              ] }]
            }
          ]
        }
      ]
    };

    const root = d3.hierarchy(json);
    const treeData = treeLayout(root);

    const links = treeData.links();
    const nodes = treeData.descendants();

    svg.selectAll("path.link")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("d", nLink); // Use the N-shaped path generator

    const node = svg.selectAll("g.node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 4.5)
      .attr("fill", "#999");

    node.append("text")
      .attr("dx", 8)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .text(d => d.data.name);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

loadData();
