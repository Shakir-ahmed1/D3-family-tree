import * as d3 from "d3";

const width = 960;
const height = 2000;

const treeLayout = d3.tree<any>().size([height,
  width - 160]);

const diagonal = d3.linkHorizontal<any,
  d3.HierarchyPointNode<any>>()
  .x(d => d.y)
  .y(d => d.x);

const svg = d3.select("body").append("svg")
  .attr("width",
    width)
  .attr("height",
    height)
  .append("g")
  .attr("transform",
    "translate(40,0)");

async function loadData() {
  try {
    const json = {
      title: "root",
      children: [{
        name: "vertex",
        children: [{
          name: "vertex",
          children: [{
            name: "vertex",
            children: [{
              name: "vertex",
              children: [{
                name: "vertex",
                children: [{
                  name: "vertex",
                  children: [{
                    name: "vertex",
                    children: [{
                      name: "vertex",
                      children: [{
                        name: "vertex",
                        children: [{
                          name: "vertex",
                          children: [{
                            name: "vertex",
                            children: [{
                              name: "vertex",
                              children: [{
                                name: "vertex",
                                children: [{
                                  name: "vertex",
                                  children: { name: 35 }
                                },
                                {
                                  name: "vertex",
                                  children: { name: 19 }
                                }]
                              },
                              {
                                name: "vertex",
                                children: { name: 19 }
                              }]
                            },
                            {
                              name: "vertex",
                              children: { name: 19 }
                            }]
                          },
                          {
                            name: "vertex",
                            children: { name: 19 }
                          }]
                        },
                        {
                          name: "vertex",
                          children: { name: 19 }
                        }]
                      },
                      {
                        name: "vertex",
                        children: { name: 19 }
                      }]
                    },
                    {
                      name: "vertex",
                      children: { name: 19 }
                    }]
                  },
                  {
                    name: "vertex",
                    children: { name: 19 }
                  }]
                },
                {
                  name: "vertex",
                  children: { name: 19 }
                }]
              },
              {
                name: "vertex",
                children: { name: 19 }
              }]
            },
            {
              name: "vertex",
              children: { name: 19 }
            }]
          },
          {
            name: "vertex",
            children: [{
              name: "vertex",
              children: [{
                name: "vertex",
                children: [{
                  name: "vertex",
                  children: { name: 35 }
                },
                {
                  name: "vertex",
                  children: [{
                    name: "vertex",
                    children: { name: 19 }
                  },
                  {
                    name: "vertex",
                    children: { name: 35 }
                  }]
                }]
              },
              {
                name: "vertex",
                children: [{
                  name: "vertex",
                  children: [{
                    name: "vertex",
                    children: { name: 35 }
                  },
                  {
                    name: "vertex",
                    children: { name: 35 }
                  }]
                },
                {
                  name: "vertex",
                  children: [{
                    name: "vertex",
                    children: { name: 35 }
                  },
                  {
                    name: "vertex",
                    children: { name: 35 }
                  }]
                }]
              }]
            },
            {
              name: "vertex",
              children: [{
                name: "vertex",
                children: [{
                  name: "vertex",
                  children: { name: 51 }
                },
                {
                  name: "vertex",
                  children: { name: 51 }
                }]
              },
              {
                name: "vertex",
                children: [{
                  name: "vertex",
                  children: { name: 51 }
                },
                {
                  name: "vertex",
                  children: { name: 51 }
                }]
              }]
            }]
          }]
        },
        {
          name: "vertex",
          children: [{
            name: "vertex",
            children: [{
              name: "vertex",
              children: [{
                name: "vertex",
                children: { name: 51 }
              },
              {
                name: "vertex",
                children: { name: 51 }
              }]
            },
            {
              name: "vertex",
              children: [{
                name: "vertex",
                children: { name: 51 }
              },
              {
                name: "vertex",
                children: { name: 67 }
              }]
            }]
          },
          {
            name: "vertex",
            children: [{
              name: "vertex",
              children: { name: 67 }
            },
            {
              name: "vertex",
              children: { name: 6 }
            }]
          }]
        }]
      },
      {
        name: "vertex",
        children: { name: 20 }
      }]}


    const root = d3.hierarchy(json);
    const treeData = treeLayout(root);

    const links = treeData.links();
    const nodes = treeData.descendants();

    svg.selectAll("path.link")
      .data(links)
      .enter().append("path")
      .attr("class",
        "link")
      .attr("fill",
        "none")
      .attr("stroke",
        "#ccc")
      .attr("stroke-width",
        1.5)
      .attr("d",
        d => diagonal({
          source: d.source,
          target: d.target
        })!);

    const node = svg.selectAll("g.node")
      .data(nodes)
      .enter().append("g")
      .attr("class",
        "node")
      .attr("transform",
        d => `translate(${d.y},
${d.x})`);

    node.append("circle")
      .attr("r",
        4.5)
      .attr("fill",
        "#999");

    node.append("text")
      .attr("dx",
        d => (d.children ? -8 : 8))
      .attr("dy",
        3)
      .attr("text-anchor",
        d => (d.children ? "end" : "start"))
      .text(d => d.data.name);

  } catch (error) {
    console.error("Error loading data:",
      error);
  }
}

loadData();
