drawAnceParentChildLine(nodes: d3.HierarchyNode<DrawableNode>[], svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>) {
    const paths = svg.selectAll("path.child-link").data(nodes.filter(d => d.data.type === "child"), d => {
        let key = "";
        if (d.data.mother && d.data.father) {
            const motherId = Math.min(d.data.mother, d.data.father);
            const fatherId = Math.max(d.data.mother, d.data.father);
            key = `${motherId}-${fatherId}-${d.data.id}`;
        } else if (d.data.mother) {
            key = `${d.data.mother}-${d.data.id}`;
        } else if (d.data.father) {
            key = `${d.data.father}-${d.data.id}`;
        }
        return key;
    });

    paths.exit().transition().duration(this.fadeInAnimationDuration).attr("opacity", 0).remove();

    paths.transition().duration(this.fadeInAnimationDuration).attr("d", d => {
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
    }).attr("opacity", 1);

    const enter = paths.enter().append("path").attr("class", "child-link").attr("fill", "none").attr("stroke", "#ccc").attr("stroke-width", 1.5).attr("opacity", 0);

    enter.attr("d", d => {
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
