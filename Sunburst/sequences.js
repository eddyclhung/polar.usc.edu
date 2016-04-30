// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 150, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "za": "#5687d1",
  "ws": "#7b615c",
  "vg": "#de783b",
  "us": "#6ab975",
  "uk": "#a173d1",
  "ua": "#bbbbbb",
  "tw": "#460f59",
  "tv": "#718fe0",
  "sg": "#f7ed76",
  "se": "#20bbe8",
  "ru": "#97d82c",
  "rs": "#f60f16",
  "ro": "#261732",
  "pt": "#8e1a1a",
  "pl": "#91f7dc",
  "org": "#2d5638",
  "www": "#5c0160",
  "schema": "#5b3a70",
  "data": "#4000f4",
  "apcd": "#4c6949",
  "fellows": "#f01969",
  "learningzone": "#782d10",
  "dev": "#bd9e21",
  "drwm": "#fef91e",
  "finds": "#185b72",
  "sa": "#375c6a",
  "cde": "#240de8",
  "archive": "#de2bd7",
  "britishlibrary": "#13b8b1",
  "chemistryworld": "#235eb0",
  "wes2012": "#40d09b",
  "users": "#86945a",
  "proj": "#b3966c",
  "cedadocs": "#937358",
  "wps2": "#400a94",
  "amdi": "#111f14",
  "openurl": "#522186",
  "valor": "#4a4e7b",
  "urgent": "#367bcc",
  "planetearth": "#af6487",
  "nora": "#778a7e",
  "search": "#fe1d97",
  "badc": "#013be8",
  "ermitage": "#67a316",
  "blogs": "#390cd9",
  "ncasweb": "#e040e7",
  "www2": "#da28a1",
  "alumni": "#b0420b",
  "ccst": "#e6d452",
  "gov": "#c49b79",
  "co": "#ad2fe6",
  "ac": "#e1bdd8",
  "kr": "#bbfb92",
  "edu": "#eb8313",
  "com": "#831b75",
  "www9": "#30e614",
  "yoyodesign": "#367c9d",
  "worldcat": "#9da893",
  "worldbank": "#0ccde0",
  "worldpress": "#de2ac5",
  "wmflabs": "#7e6f25",
  "wikidictionary": "#a76e9b",
  "wikipedia": "#08ba55",
  "wikimedia": "#7ea3e2",
  "wikipedia": "#f5f230",
  "wikibooks": "#50f3d4",
  "w3": "#4d8fdf",
  "unavo": "#fdc073",
  "ucsfimissionbayhospital": "#f2041f",
  "ucsfmedicalcenter": "#3af286",
  "ucsfhealth": "#3a89c2",
  "ucanr": "#a06d48",
  "uc4ca": "#d7fd20",
  "redmine": "#4229bd",
  "qb3": "#393f95",
  "purl": "#3bb953",
  "plos": "#9bfd9f",
  "perl6": "#65a9da",
  "perl": "#dfe6ef",
  "parrot": "#16829c",
  "opensource": "#48fa6f",
  "opendap": "#a034ac",
  "oclc": "#ef8649",
  "ntp": "#b55d59",
  "nsbe": "#a2bae5",
  "nspc": "#f4b898",
  "nprb": "#1622d8",
  "db": "#cc5655",
  "climate": "#4893e6",
  "support": "#476f27",
  "nerc": "#87d2e0",
  "rl": "#9f432a",
  "cam": "#fbc59c",
  "ch": "#328a07",
  "ozone": "#52e3f9",
  "reading": "#dcf7d0",
  "leeds": "#66f137",
  "see": "#1219cc",
  "atm": "#2c0ba8",
  "ceh": "#b696b2",
  "ed": "#d9a894",
  "bgs": "#49ac1a",
  "nlb": "#440d5d",
  "eresources": "#fadce5",
  "uae": "#7e7d9e",
  "man": "#86acd1",
  "le": "#be0381",
  "ceda": "#60866b",
  "jobs": "#9cb6ad",
  "learn": "#87e245",
  "peraldoc": "#266896",
  "ucolick": "#5b3e55",
  "nsidc": "#e94516",
  "rvdata": "#bcf6e3",
  "bl": "#d0059b",
  "va": "#439535",
  "glos": "#0b295e",
  "oasis": "#e06aaa",
  "open": "#8fa854",
  "docs": "#1e3fcc",
  "catalogue": "#c4ef2a",
  "met": "#06f5fb",
  "sport": "#6861f2",
  "google": "#840d2f",
  "ncf": "#12f462",
  "claire": "#5e951f",
  "wcrp": "#3da639"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("domainScores.csv", function(text) {
  console.log(text);
  var csv = d3.csv.parseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

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
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
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
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
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
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
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
    w: 150, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
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
  var root = {"name": "root", "children": []};
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
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};