import * as d3 from "d3";
import { treeDatazy } from "./dataManager";
interface FamilyTreeNode {
  id: string;             // Unique identifier for each node
  name: string;           // Display name of the person
  type: "spouse" | "child"; // Node type: spouse or child
  target: string | null;        // ID of the spouse (for marriage line)
  mother: string | null;        // ID of the mother
  father: string | null;        // ID of the father
  children: FamilyTreeNode[]; // Array of child nodes
}

const width = 1960;
const height = 1800;
const NODE_RADIUS = 40; // Change this to scale node size
const verticalSpacing = 100; // Space between generations
const horizontalSpacing = NODE_RADIUS * 3; // Space between siblings/spouses

const treeLayout = d3.tree().nodeSize([horizontalSpacing, horizontalSpacing
]); // Adjusted spacing
const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(1350,250)");
const data: FamilyTreeNode = {
  name: "Muhammedsaid",
  id: "root",
  children: [
    {
      id: "root2",
      name: "Ahmedsalih",
      mother: '',
      father: 'root',
      target: null,
      type: 'child',
      children: [
        {
          id: "P1",
          mother: null,
          father: "root2",
          name: "Aziza",
          type: "spouse",
          target: "P2",
          children: []
        },
        {
          id: "P2",
          name: "Mesud",
          mother: null,
          father: "root2",
          type: "child",
          target: "P1",
          children: [
            {
              id: "P2",
              name: "Musab",
              mother: "P1",
              father: "P2",
              type: "child",
              target: "P1",
              children: []
            }

          ]
        },
        {
          id: "C1",
          name: "Abdu",
          type: "child",
          mother: null,
          father: "root2",
          target: null,
          children: [
            {
              id: "GC1",
              name: "Umer",
              type: "child",
              mother: "C1",
              father: null,
              target: '',
              children: []
            },
            {
              id: "GC2",
              name: "Selman",
              type: "child",
              mother: "C1",
              father: null,
              target: null,
              children: [],
            }
          ]
        },
        {
          id: "C2",
          name: "shakir",
          type: "child",
          mother: null,
          father: "root2",
          target: null,
          children: [
            {
              id: "GC1",
              name: "Umer",
              type: "child",
              mother: "C2",
              father: null,
              target: '',
              children: []
            },
            {
              id: "GC2",
              name: "Selman",
              type: "child",
              mother: "C2",
              father: null,
              target: null,
              children: [],
            }
          ]

        }
      ]
    }
  ]
};
// const root = d3.hierarchy(data);
const root = d3.hierarchy(treeDatazy);
console.log("first root", root)
const treeData = treeLayout(root);
const nodes = treeData.descendants();
const links = treeData.links();
// Draw marriage lines based on 'target' property
console.log("nodes", nodes)

function drawMarriageLines() {

  nodes.forEach(d => {
    if (d.data.type === "spouse" && d.data.target) {
      const spouse = nodes.find(n => n.data.id === d.data.target);
      if (spouse) {
        svg.append("line")
          .attr("x1", d.x)
          .attr("y1", d.y)
          .attr("x2", spouse.x)
          .attr("y2", spouse.y)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        // Store midpoint of marriage line for children connections
        d.marriageMidpoint = {
          x: (d.x + spouse.x) / 2,
          y: d.y
        };
        spouse.marriageMidpoint = d.marriageMidpoint;
      }
    }
  });
}
// Draw child-parent connections
function drawParentChildLine() {

  nodes.forEach(d => {



    if (d.data.type === "child") {

      // Draw connect child with both parents
      if (d.data.mother && d.data.father) {
        const mother = nodes.find(n => n.data.id === d.data.mother);
        const father = nodes.find(n => n.data.id === d.data.father);
        if (mother && father && mother.marriageMidpoint) {
          svg.append("path")
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

        svg.append("path")
          .attr("class", "child-link")
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5)
          .attr("d",
            `M${pr.x},${pr.y + NODE_RADIUS / 2}
          V${(pr.y + d.y) / 2}
          H${d.x}
          V${d.y - NODE_RADIUS / 2}`);

      }
    }

  });
}
// Draw nodes


function drawNodes() {

  const node = svg.selectAll("g.node")
    .data(nodes)
    .enter().append("g")
    .attr("class",
      "node")
    .attr("transform",
      d => `translate(${d.x
        },
        ${d.y})`);

node.append("circle")
  .attr("r", NODE_RADIUS) // Dynamically scale node size
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
  .attr("r", NODE_RADIUS) // Dynamically scale node size
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
  .attr("r", NODE_RADIUS) // Dynamically scale node size
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
  .attr("r", NODE_RADIUS) // Dynamically scale node size
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
  .attr("r", NODE_RADIUS) // Dynamically scale node size
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
drawMarriageLines()
drawParentChildLine()
drawNodes()


const flatData = [
  {
    "id": 1,
    "data": {
      "firstName": "Foree",
      "gender": "F",
      "isFounder": true,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [
        2
      ],
      "children": [
        7
      ]
    }
  },
  {
    "id": 2,
    "data": {
      "firstName": "Prurururu",
      "gender": "M",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [
        1
      ],
      "children": [
        7
      ],
      "father": 6
    }
  },
  {
    "id": 3,
    "data": {
      "firstName": "Hyuu",
      "gender": "F",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [
        7
      ],
      "children": [
        4,
        5
      ]
    }
  },
  {
    "id": 4,
    "data": {
      "firstName": "Nami",
      "gender": "F",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [],
      "children": [],
      "father": 7,
      "mother": 3
    }
  },
  {
    "id": 5,
    "data": {
      "firstName": "Chopeor",
      "gender": "M",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [],
      "children": [],
      "father": 7,
      "mother": 3
    }
  },
  {
    "id": 6,
    "data": {
      "firstName": "Zoro",
      "gender": "M",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [],
      "children": [
        2,
        8
      ]
    }
  },
  {
    "id": 7,
    "data": {
      "firstName": "Name Surname",
      "gender": "M",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [
        3
      ],
      "children": [
        4,
        5
      ],
      "father": 2,
      "mother": 1
    }
  },
  {
    "id": 8,
    "data": {
      "firstName": "Pru's brother",
      "gender": "M",
      "isFounder": false,
      "avatar": "myImage.jpg"
    },
    "rels": {
      "spouses": [],
      "children": [],
      "father": 6
    }
  }
]

function buildDescendantsHiararchy(flatData: any[], startNodeId: number) {
  const foundNode = flatData.find(item => item.id === startNodeId)
  // Create a map of all nodes by ID
  const children = foundNode.rels.children.map(item => {
    const childDescendants = buildDescendantsHiararchy(flatData, item)
    return childDescendants
  })
  return {
    id: startNodeId,
    children
  }
}

function buildAncestorsHierarchy(flatData, startNodeId) {
  const foundNode = flatData.find(item => item.id === startNodeId)
  // Create a map of all nodes by ID
  console.log(startNodeId, foundNode)
  const parents = [foundNode.rels.mother, foundNode.rels.father]
  console.log("prpr", parents)
  const operatedParents = parents.filter(item => item).map(item => {
    return buildAncestorsHierarchy(flatData, item)
  })
  return {
    id: startNodeId,
    parents: operatedParents
  }
}



// Convert the list to a tree
// const treeDataz = customBuildDescendantsHiararchy(customFlatData, 6);
// const treeDataz = customBuildAncestorsHierarchy(customFlatData, 7);

// Now pass it to d3.hierarchy()
// const treeDataz = buildAncestorsHierarchy(flatData, 4);
const rootx = d3.hierarchy(treeDatazy);
console.log("rt", rootx);

// const children = getChildren(customFlatData, 6)

// console.log("ch",children)

