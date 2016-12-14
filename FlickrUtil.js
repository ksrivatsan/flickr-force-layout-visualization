var FlickrUtils = {};

//builds a d3 network of tag co-occurrence in photos
FlickrUtils.getTagNetwork = function(dataJson, minLinkValue) {
	var nodes = [],
		edges = [];
	var nodesMap = d3.map();
	var edgesCount = d3.map();

	minLinkValue = minLinkValue !== undefined ? minLinkValue : 10;

	function getNodeOrCreate(t) {
		var node;
		if (!nodesMap.has(t)) {
			nodesMap.set(t, { "name": t, "value": 0 }); // viewcount added
		}
		return nodesMap.get(t);

	}

	function addCount(t) {
		var node = getNodeOrCreate(t);
		node.value += 1;
		// node.viewCount += parseInt(viewCount); // new line added
		nodesMap.set(t, node);
		return node;
	}

	dataJson.photos.photo.forEach(function(d) {
		var tags = d.tags.split(" ");
		tags.forEach(function(t1) {
			tags.forEach(function(t2) {
				if (t1 === t2) {
					return;
				}
				// addCount(t1, d.count_views); // changed from addCount(t1);
				// addCount(t2, d.count_views);

				addCount(t1);
				addCount(t2);

				var key = t1 < t2 ? t1 + "," + t2 : t2 + "," + t1;
				if (edgesCount.has(key)) {
					edgesCount.set(key, edgesCount.get(key) + 1);
				} else {
					edgesCount.set(key, 0);
				}

			});
		});
	});

	edges = edgesCount.entries().filter(function(d) {
		return d.value > minLinkValue;
	}).map(function(d) {
		var t1, t2;
		t1 = d.key.split(",")[0];
		t2 = d.key.split(",")[1];
		var node1 = getNodeOrCreate(t1);
		var node2 = getNodeOrCreate(t2);
		if (nodes.indexOf(node1) === -1) { nodes.push(node1); }
		if (nodes.indexOf(node2) === -1) { nodes.push(node2); }
		// if (nodes.indexOf(node1) === -1) {
		// 	if (node1.viewCount > minViewCount)
		// 		nodes.push(node1);
		// }
		// if (nodes.indexOf(node2) === -1) {
		// 	if (node2.viewCount > minViewCount)
		// 		nodes.push(node2);
		// }

		return {
			source: node1,
			target: node2,
			value: d.value
		};
	});
	return { "nodes": nodes, "edges": edges };
};
