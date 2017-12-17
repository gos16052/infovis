var m = [20, 120, 20, 20],
	w = 700 - m[1] - m[3],
	h = 700 - m[0] - m[2],
	i = 0,
	root;


var tree = d3.layout.tree()
	.size([h, w]);

var diagonal = d3.svg.diagonal()
	.projection(function (d) {
		return [d.y, d.x];
	});

var vis = d3.select("#main").append("svg:svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g")
	.attr("id", "tree")
	.attr("transform", "translate(" + (m[3] + 100) + "," + m[0] + ")");

d3.json("../data/data.json", function (json) {
	root = json;
	root.x0 = h / 2;
	root.y0 = 0;

	function toggleAll(d) {
		if (d.children) {
			d.children.forEach(toggleAll);
			toggle(d);
		}
	}

	
	// console.log(3312412)
	// console.log(path)

	// Initialize the display to show a few nodes.
	root.children.forEach(toggleAll);
	// toggle(root.children[1]);
	// toggle(root.children[1].children[2]);
	// toggle(root.children[9]);
	// toggle(root.children[9].children[0]);
	cleanOther(root)

	update(root);
});

function cleanOther(obj) {
	// console.log(obj)
	if (obj._children) {
		for (let i = 0; i < obj._children.length; i++) {
			if (obj._children[i].name == "other") {
				obj._children.splice(i, 1)
			} else {
				cleanOther(obj._children[i])
			}
		}
	} else if (obj.children) {
		for (let i = 0; i < obj.children.length; i++) {
			if (obj.children[i].name == "other") {
				obj.children.splice(i, 1)
			} else {
				cleanOther(obj.children[i])
			}
		}
	}
}

function update(source) {
	var duration = d3.event && d3.event.altKey ? 5000 : 500;

	// console.log(root)

	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse();

	// Normalize for fixed-depth.
	nodes.forEach(function (d) {
		d.y = d.depth * 180;
	});
	// console.log(source)


	// Update the nodes…
	var node = vis.selectAll("g.node")
		.data(nodes, function (d) {
			return d.id || (d.id = ++i);
		});

	// var tt = getData()
	// var path = tt.path
	// var tNode = tt.node

	// function clickNav(d) {
	// 	tNode = d;
	// 	// d.children = d._children;

	// 	// mskim: leaf node는 size attribute 를가지는 것을 이용해서 size attribute가 있으면 return시킴
	// 	if (tNode.size) return;

	// 	path.transition()
	// 		.duration(500)
	// 		.attrTween("d", arcTweenZoom(d));
	// }

	// Enter any new nodes at the parent's previous position.
	
	var nodeEnter = node.enter().append("svg:g")
		.attr("class", "node")
		.attr("id", function (d) {return "tree_" + d.name + "-" + d.depth})
		.attr("transform", function (d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		})
		.on("click", function (d) {
			toggle(d);
			update(d);
			// clickNav(d)
			let sun = d3.select("#sun_" + d.name + "-" + d.depth).node()
			// console.log("#sun_" + d.name)
			sun.dispatchEvent(new MouseEvent("click2"));
			
			d3.select("#tree").transition().duration(500).attr("transform", "translate(" + (m[3] - 140 * (d.depth - 1)) + "," + m[0] + ")");
		})
		.on("click2", function (d) {
			console.log("click2 in tree")
			// console.log(d)
			// if (d.)
			toggle(d);
			update(d);
		});
		
	nodeEnter.append("svg:circle")
		.attr("r", 1e-6)
		.style("fill", function (d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	nodeEnter.append('a')
		.attr('xlink:href', function (d) {
			return d.url;
		})
		.append("svg:text")
		.attr("x", function (d) {
			return d.children || d._children ? -30 : -30;
		})
		.attr("y", -15)
		.attr("dy", ".35em")
		.attr("text-anchor", function (d) {
			return d.children || d._children ? "start" : "start";
		})
		.text(function (d) {
			return d.name + "()";
		})
		.style('fill', function (d) {
			return d.free ? 'black' : '#999';
		})
		.style("fill-opacity", 1e-6)
		.on("click", function (d) {
			toggle(d);
			// update(d);
			// clickNav(d)
			// let sun = d3.select("#sun_" + d.name + "-" + d.depth).node()
			// console.log(sun.dispatchEvent(new MouseEvent("click")))
			// d3.select("#tree").transition().duration(500).attr("transform", "translate(" + (m[3] - 140 * (d.depth - 1)) + "," + m[0] + ")");
		})
		.on("mouseover", function (d) {
			let sun = d3.select("#sun_" + d.name + "-" + d.depth).node()
			sun.dispatchEvent(new MouseEvent("mouseover"))
			// let link = d3.select("#link_" + d.name)
			// link.style("stroke", "red")
			linkPathColor(d, "red")
		})
		.on("mouseleave", function (d) {
			linkPathColor(d, "#ccc")
		});

	function linkPathColor(d, color) {
		console.log(d)
		console.log(color)
		let link = d3.select("#link_" + d.name)
		link.style("stroke", color)
		if (d.parent) {
			linkPathColor(d.parent, color)
		}
		// console.log(link)
	}

	nodeEnter.append("svg:title")
		.text(function (d) {
			return d.description;
		});

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x + ")";
		});

	nodeUpdate.select("circle")
		.attr("r", 6)
		.style("fill", function (d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	nodeUpdate.select("text")
		.style("fill-opacity", 1);

	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + source.y + "," + source.x + ")";
		})
		.remove();

	nodeExit.select("circle")
		.attr("r", 1e-6);

	nodeExit.select("text")
		.style("fill-opacity", 1e-6);

		// console.log(nodes)
	// Update the links…
	let link = vis.selectAll("path.link")
		.data(tree.links(nodes), function (d) {
			// console.log(d)
			return d.target.id;
		});

	// Enter any new links at the parent's previous position.
	link.enter().insert("svg:path", "g")
		.attr("class", "link")
		.attr("id", function (d) {
			console.log(d)
			return "link_" + d.target.name
		})
		.attr("d", function (d) {
			// console.log(d)
			var o = {
				x: source.x0,
				y: source.y0
			};
			return diagonal({
				source: o,
				target: o
			});
		})
		.transition()
		.duration(duration)
		.attr("d", diagonal);

	// Transition links to their new position.
	link.transition()
		.duration(duration)
		.attr("d", diagonal)
		// .on("mouseover", function (d) {
		// 	// let sun = d3.select("#link_" + d.name).node()
		// 	// console.log(snu)
		// });

	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
		.duration(duration)
		.attr("d", function (d) {
			var o = {
				x: source.x,
				y: source.y
			};
			return diagonal({
				source: o,
				target: o
			});
		})
		.remove();

	// Stash the old positions for transition.
	nodes.forEach(function (d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}

// Toggle children.
function toggle(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
}