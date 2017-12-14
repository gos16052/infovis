/* mskim append */
// Mapping of step names to colors.
var colors = {
	"home": "#5687d1",
	"product": "#7b615c",
	"search": "#de783b",
	"account": "#6ab975",
	"other": "#a173d1",
	"end": "#bbbbbb"
};

function google20c(n) {
	var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
	return colores_g[n % colores_g.length];
}

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
	w: 75,
	h: 30,
	s: 3,
	t: 10
};
/* mskim append end */

var width = 700,
	height = 700,
	radius = Math.min(width, height) / 2;

var x = d3.scale.linear()
	.range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
	.range([0, radius]);



var color = d3.scale.category20c();


var svg = d3.select("#main").append("svg")
	.attr("transform", "translate(" + 0 + ",0)") //mskim, sunburst x
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("id", "container") // color marker
	.attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

var partition = d3.layout.partition()
	.sort(null)
	.value(function (d) {
		return d.size;
	});

var arc = d3.svg.arc()
	.startAngle(function (d) {
		return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
	})
	.endAngle(function (d) {
		return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
	})
	.innerRadius(function (d) {
		return Math.max(0, y(d.y));
	})
	.outerRadius(function (d) {
		return Math.max(0, y(d.y + d.dy));
	});

// Keep track of the node that is currently being displayed as the root.
var node;
var path
var BigData;

function getData() {
	// console.log("getdata")
	return {path: path, node: node,data: BigData}
}

function updateLockInfo(node){
	if(node.children == undefined) return;
	var locks = Array();

	for(var i=0; i<node.children.length; i++){
		
		locks.forEach(function(v){
			node.children[i].locks = Array();
			node.children[i].locks.push(v);
		})
		updateLockInfo(node.children[i]);
		if(isLock(node.children[i].name)){
 			locks.push(getLock(node.children[i].name))
		}


		// remove lock,
		if(node.children[i].name.indexOf("lock") != -1 && 
			(ind = node.children[i].name.indexOf("_other")) != -1){
			var lockName = node.children[i].name.substring(0,ind)
			var rmIndex = -1;
			for(var j=0; j<locks.length; j++){
				if(locks[j].name.indexOf(lockName) != -1){
					rmIndex = j;
					break;
				}
			}
			if(rmIndex != -1){
				locks.splice(rmIndex,1);
			}
		}
	}
}

d3.json("../data/data.json", function (error, root) {
	/* mskim append */
	// Basic setup of page elements.
	initializeBreadcrumbTrail();
	drawLegend();
	// d3.select("#togglelegend").on("click", toggleLegend);
	/* mskim append end */

	// console.log(root)

	node = root;
	path = svg.datum(root).selectAll("path")
		.data(partition.nodes)
		.enter().append("path")
		.attr("class", "sun_path")
		.attr("tt", 0)
		.attr("id", function (d) {return "sun_" + d.name + "-" + d.depth})
		.attr("d", arc)
		.attr("fill-rule", "evenodd")
		.style("fill", function (d, i) {
			var dname = (d.children ? d : d.parent).name
			if(isLock(d.name)){
				var lock = appendLock(d.name, d)
				// console.log(lock.acquire)
				return lock.color
			}
			// if(d.parent != undefined){
			// 	console.log(d.parent.children)
			// }
			return color(dname);
		})
		.on("click", function(d){	
			// console.log(d)
			let tree = d3.select("#tree_" + d.name + "-" + d.depth).node()
			console.log(tree.dispatchEvent(new MouseEvent("click2")));
			click(d)
		})
		.on("click2", function(d){
			console.log("click2 in sun")
			click(d)
		})
		.style("opacity", 1)
		.each(stash)
		// mskim: append below
		.on("mouseover", mouseover);
	
	// console.log(getLocks())
	// updateLockInfo(node);

	$("path.sun_path").mousedown(function(e){
		if(e.which == 2){ //wheel click 
			//fix bar
			// fixbar();
		}
	})
	/* mskim append */
	// Add the mouseleave handler to the bounding circle.
	d3.select("#container").on("mouseleave", mouseleave);
	// Get total size of the tree = value of root node from partition.
	totalSize = path.node().__data__.value;
	/* mskim append end */

	d3.selectAll("input").on("change", function change() {
		var value = this.value === "count" ?
			function () {
				return 1;
			} :
			function (d) {
				return d.size;
			};

		path
			.data(partition.value(value).nodes)
			.transition()
			.duration(1000)
			.attrTween("d", arcTweenData);
	});

	function click(d) {
		// console.log(d)
		node = d;

		// mskim: leaf node는 size attribute 를가지는 것을 이용해서 size attribute가 있으면 return시킴
		if (node.size) return;

		path.transition()
			.duration(500)
			.attrTween("d", arcTweenZoom(d));
	}
});

d3.select(self.frameElement).style("height", height + "px");

// Setup for switching data: stash the old values for transition.
function stash(d) {
	d.x0 = d.x;
	d.dx0 = d.dx;
}

// When switching data: interpolate the arcs in data space.
function arcTweenData(a, i) {
	var oi = d3.interpolate({
		x: a.x0,
		dx: a.dx0
	}, a);

	function tween(t) {
		var b = oi(t);
		a.x0 = b.x;
		a.dx0 = b.dx;
		return arc(b);
	}
	if (i == 0) {
		// If we are on the first arc, adjust the x domain to match the root node
		// at the current zoom level. (We only need to do this once.)
		var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
		return function (t) {
			x.domain(xd(t));
			return tween(t);
		};
	} else {
		return tween;
	}
}

// When zooming: interpolate the scales.
function arcTweenZoom(d) {
	// d.children = d.children
	var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		yd = d3.interpolate(y.domain(), [d.y, 1]),
		yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	return function (d, i) {
		return i ?
			function (t) {
				return arc(d);
			} :
			function (t) {
				x.domain(xd(t));
				y.domain(yd(t)).range(yr(t));
				return arc(d);
			};
	};
}


// mskim sequence js


// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
	// console.log("hover")

	var percentage = (100 * d.value / totalSize).toPrecision(3);
	var percentageString = percentage + "%";
	if (percentage < 0.1) {
		percentageString = "< 0.1%";
	}

	d3.select("#percentage")
		.text(percentageString);

	d3.select("#explanation")
		.style("visibility", "");

	var sequenceArray = getAncestors(d);
	//
	updateBreadcrumbs(sequenceArray, percentageString);

	// Fade all the segments.
	d3.selectAll(".sun_path")
		.style("opacity", 0.4);

	// Then highlight only those that are an ancestor of the current segment.
	svg.selectAll(".sun_path")
		.filter(function (node) {
			return (sequenceArray.indexOf(node) >= 0);
		})
		.style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
	// Hide the breadcrumb trail
	// d3.select("#trail")
	// 	.style("visibility", "hidden");

	// Deactivate all segments during transition.
	d3.selectAll(".sun_path").on("mouseover", null);

	// Transition each segment to full opacity and then reactivate it.
	d3.selectAll(".sun_path")
		.transition()
		// .duration(1000)
		.style("opacity", 1)
		.each("end", function () {
			d3.select(this).on("mouseover", mouseover);
		});

	d3.select("#explanation")
		.style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
	var path = [];
	var current = node;
	while (current.parent) {
		path.unshift(current);
		current = current.parent;
	}
	
	// mskim, 상단 바에 root function이 안보이는 문제 수정 
	path.unshift(current);

	return path;
}

function initializeBreadcrumbTrail() {
	// Add the svg area.
	var trail = d3.select("#sequence")
		.append("svg:svg")
		.attr("width", width * 2)
		.attr("height", 120)
		.attr("id", "trail");
	// Add the label at the end, for the percentage.
	trail.append("svg:text")
		.attr("id", "endlabel")
		.style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
	var points = [];
	points.push("0,0");
	points.push(b.w + ",0");
	points.push(b.w + b.t + "," + (b.h / 2));
	points.push(b.w + "," + b.h);
	points.push("0," + b.h);
	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
		points.push(b.t + "," + (b.h / 2));
	}
	return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
		.selectAll("g")
		.data(nodeArray, function (d) {
			return d.name + d.depth;
		});

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	// mskim
	// entering.append("svg:polygon")
	//     .attr("points", breadcrumbPoints)
	//     .style("fill", function(d) { return colors[d.name]; });
	function clickNav(d) {
		node = d;

		// mskim: leaf node는 size attribute 를가지는 것을 이용해서 size attribute가 있으면 return시킴
		if (node.size) return;

		path.transition()
			.duration(500)
			.attrTween("d", arcTweenZoom(d));
	}


	let curLocks = 0;
	let lockHeight = 0;

	
	entering.append("svg:rect")
		.attr("vv", function (d) {
			lockHeight = 0;
			curLocks = 0;
		})
		.attr("class", "ss")
		.attr("width", function (d) {
			
			if (d.name.indexOf("lock") == 0) {
				lockHeight++;
			}

			var len;
			if(isLock(d.name)){
				var lockName = getLockName(d.name)
				len = lockName.length;
			}
			else {
				len = d.name.length
			}
			return len * 6.3 + 10;

			// return d.name.length * 6.3 + 10;
			// return b.w;
		})
		.attr("height", function (d) {
			if (d.name.indexOf("lock") == 0) {
				curLocks++;
				// console.log(lockHeight - curLocks + 1);
				let t = (lockHeight - curLocks + 1)
				// curLocks = 0;
				return b.h * t;
			} else {
				return b.h
			}
			// if (locks == 0) {
			// } else {
			// 	return b.h * 2
			// }
		})
		.style("fill", function (d) {
			if(isLock(d.name)){
				var lockName = getLockName(d.name)
				return getLock(lockName).color
			}
			return color((d.children ? d : d.parent).name);
		})
		.on("click", clickNav);
	
	g.selectAll(".ss")
	.attr("vv", function (d) {
		lockHeight = 0;
		curLocks = 0;
	})
	.attr("tt", function (d) {
		if (d.name.indexOf("lock") == 0) {
			lockHeight++;
		}
	})
	.attr("height", function (d) {
		if (d.name.indexOf("lock") == 0) {
			curLocks++;
			let t = (lockHeight - curLocks + 1)
			return b.h * t;
		} else {
			return b.h
		}
	})
	
	// mskim
	// entering.append("svg:text")
	//     .attr("x", (b.w + b.t) / 2)
	//     .attr("y", b.h / 2)
	//     .attr("dy", "0.35em")
	//     .attr("text-anchor", "middle")
	//     .text(function(d) { return d.name; });
	entering.append("svg:text")
		.attr("x", function (d) {
			var len;
			if(isLock(d.name)){
				var lockName = getLockName(d.name)
				len = lockName.length;
			}
			else {
				len = d.name.length
			}
			return len * 6.3/2 + 5;
		})
		.attr("y", 3)
		.attr("dy", "15px")
		.attr("class", "nav_text")
		.attr("text-anchor", "middle")
		.text(function (d) {
			if(isLock(d.name)){
				var lockName = getLockName(d.name)
				return lockName
			}
			return d.name;
		})
		.on("click", clickNav);

	// console
	//lock
	entering.append("svg:rect")
		.filter(function(v){
			return v.locks != undefined;
		})
		.attr("width", function(d) { return d.name.length*6.3 + 10;})
		.attr("height", b.h)
		.style("fill", function(d){
			console.log(d)
			return d.locks[0].color;
		})
		.attr("transform", "translate(0,"+b.h+")")
		.append("text")
		.attr("x", function(d) { return d.name.length *6.3/2+5; })
		.attr("y", 3 + b.h)
		.attr("dy", "15px")
		.attr("class", "nav_text")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.locks[0].name; })
		.attr("transform", "translate(0,"+b.h+")")


	let padding_left = 0;
	let padding_arr = [];
	let lock_height = 0;
	let locks = 0;
	// Set position for entering and updating nodes.
	g.attr("transform", function (d, i) {
		let width = this.childNodes[0].getAttribute("width");
		let ret;
		if (d.name.indexOf("lock") == 0) {
			locks++;
			if (locks == 1) {
				padding_arr.push(100);
			} 

			if (locks > 0) {
				padding_left = padding_arr[0]
				
				for (let i = 1; i < padding_arr.length; i++) {
					padding_left += Number(padding_arr[i]);
				}
			}
			// else {
			// 	padding_arr.push(Number(width))
			// }
			lock_height += b.h;
			
			ret = "translate(" + padding_left + ", " + lock_height + ")"
			padding_arr.push(Number(width))
		} else {
			ret = "translate(" + padding_left + ", " + lock_height + ")"
		}
		padding_left += Number(width);
		
		return ret;
	});

	// Remove exiting nodes.
	g.exit().remove();


	// Now move and update the percentage at the end.
	d3.select("#trail").select("#endlabel")
		.attr("x", function () {
			return padding_left + 40;
		})
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(percentageString);

	// Make the breadcrumb trail visible, if it's hidden.
	d3.select("#trail")
		.style("visibility", "");

}
 
function drawLegend() {

	// Dimensions of legend item: width, height, spacing, radius of rounded rect.
	var li = {
		w: 75,
		h: 30,
		s: 3,
		r: 3
	};

	var legend = d3.select("#legend").append("svg:svg")
		.attr("width", li.w)
		.attr("height", d3.keys(colors).length * (li.h + li.s));

	var g = legend.selectAll("g")
		.data(d3.entries(colors))
		.enter().append("svg:g")
		.attr("transform", function (d, i) {
			return "translate(0," + i * (li.h + li.s) + ")";
		});

	g.append("svg:rect")
		.attr("rx", li.r)
		.attr("ry", li.r)
		.attr("width", li.w)
		.attr("height", li.h)
		.style("fill", function (d) {
			return d.value;
		});

	g.append("svg:text")
		.attr("x", li.w / 2)
		.attr("y", li.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(function (d) {
			return d.key;
		});
}

function toggleLegend() {
	var legend = d3.select("#legend");
	if (legend.style("visibility") == "hidden") {
		legend.style("visibility", "");
	} else {
		legend.style("visibility", "hidden");
	}
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
	var root = {
		"name": "root",
		"children": []
	};
	for (var i = 0; i < csv.length; i++) {
		var sequence = csv[i][0];
		var size = +csv[i][1];
		if (isNaN(size)) { // e.g. if this is a header row
			continue;
		}
		var parts = sequence.split("-");
		var currentNode = root;
		for (var j = 0; j < parts.length; j++) {
			var children = currentNode["children"];
			var nodeName = parts[j];
			var childNode;
			if (j + 1 < parts.length) {
				// Not yet at the end of the sequence; move down the tree.
				var foundChild = false;
				for (var k = 0; k < children.length; k++) {
					if (children[k]["name"] == nodeName) {
						childNode = children[k];
						foundChild = true;
						break;
					}
				}
				// If we don't already have a child node for this branch, create it.
				if (!foundChild) {
					childNode = {
						"name": nodeName,
						"children": []
					};
					children.push(childNode);
				}
				currentNode = childNode;
			} else {
				// Reached the end of the sequence; create a leaf node.
				childNode = {
					"name": nodeName,
					"size": size
				};
				children.push(childNode);
			}
		}
	}
	return root;
};