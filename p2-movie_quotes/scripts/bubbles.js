function bubbles(data) {
	var width = 778,
			height = 650;

	var circleFillColor = "#EAC67A";
	var highlightColor  = "#AB5E68";

	var svg = d3.select('#wordChartSvg');
    //clear everything in svg
    svg.selectAll("*").remove();

    svg.attr("height", height)
		.attr("width", width)
		.append("g")
		.attr("transform", "translate(0,0)");

	var radiusScale  = d3.scaleSqrt()
		.domain([22, 189]) // min and max of useCases
		.range([50, 56]); // min and max radius of circles

	var fontSizeScale  = d3.scaleSqrt()
		.domain([22, 189]) // min and max of useCases
		.range([9, 19]);

	// Gets first line for cliche
	function getText1(clicheText) {
		var words = String(clicheText).split(/\s+/);
		var wordBreak = 3; //after this many words we make a new line
		var line = [];

		if (words.length > wordBreak) {
			for (var i = 0; i < wordBreak; i++) {
				line.push(words[i]);
			}
		} else{
			for (var i = 0; i < words.length; i++) {
				line.push(words[i]);
			}
		}
		return line.join(" ");
	}

	// Gets second line for cliche
	function getText2(clicheText) {
		var words = String(clicheText).split(/\s+/);
		var wordBreak = 3; //after this many words of text1 we make text2
		var line = [];

		if (words.length > wordBreak) {
			for (var i = wordBreak; i < words.length; i++) {
				line.push(words[i]);
			}
		} else{
			line = []
		}
		return line.join(" ");
	}

	// Gets radius of circle based on fontsize
	function getRadius(clicheText, useCases){
		var text1 = getText1(clicheText);
		var text2 = getText2(clicheText);
		var biggerLength = Math.max(text1.length, text2.length);
		var textSize = fontSizeScale(Number(useCases));
		var diameter = textSize * biggerLength;
		return diameter/4 + 2;
	}

	// Define forces as variables
	var forceXSeparate = d3.forceX(function(d) {
		if (d.RotGroup == 1) {
			return 300;
		} else {
			return 700;
		}
	}).strength(0.05);

	var forceXCombine = d3.forceX(width/2).strength(0.05);

	var forceCollide = d3.forceCollide(function(d) {
		return getRadius(String(d.cliche), Number(d.count));
	})

	// this simulation is like a list of forces
	// which tell the circles which direction to go in
	// especially when the user interacts with them
	var simulation = d3.forceSimulation()
		.force("x", forceXCombine)
		.force("y", d3.forceY(height / 2).strength(0.05))
		.force("collide", forceCollide) // inside forceCollide() is the radius of avoidance

  ready(data);
	function ready (datapoints) {

		// for each line in csv file, make a new g element
		var elem = svg.selectAll("g")
			.data(datapoints);

		// make each g element
		var elemEnter = elem.enter()
			.append("g");

		//make the circle element
		var ellipses  = elemEnter.append("ellipse")
			.attr("class", "clicheCircles")
			.attr("id", function (d) {
				return ("ID"+d.clicheID);
			})
			.attr("rx", function(d){
				return getRadius(String(d.cliche), Number(d.count));
			})
			.attr("ry", function(d){
				return getRadius(String(d.cliche), Number(d.count));
			})
			.attr("fill", circleFillColor)
			.on("click", function(d) {

				// Change color of bubbles when one is selected
				d3.selectAll(".clicheCircles")
				.transition().delay(10).duration(1000)
				.style("fill", circleFillColor)
				.style("opacity", "0.3");

				d3.select(this)
				.transition().duration(1000)
				.style("fill", highlightColor)
				.style("opacity", "1");

				d3.selectAll(".textcliche")
				.transition().duration(500)
				.style("fill", "black");

				d3.select("#IDtext1".concat(d.clicheID))
				.transition().duration(500)
				.style("fill", "white");

				d3.select("#IDtext2".concat(d.clicheID))
				.transition().duration(500)
				.style("fill", "white");

				 histogram(d);
				 bubbles_genres(d);
				});

		// make the text element
		var text = elemEnter.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "textcliche")
					.attr("id", function (d) {
						return ("IDtext1"+d.clicheID);
					})
        	.text(function(d){return getText1(String(d.cliche))})
        	.style("font-size", function(d){return fontSizeScale(Number(d.count)) + "px"})
          .on("click", function(d) {

						d3.selectAll(".clicheCircles")
						.transition().duration(1000)
						.style("fill", circleFillColor)
						.style("opacity", "0.3");

						d3.selectAll(".textcliche")
						.transition().duration(500)
						.style("fill", "black");

						d3.select("#IDtext1".concat(d.clicheID))
						.transition().duration(500)
						.style("fill", "white");

						d3.select("#IDtext2".concat(d.clicheID))
						.transition().duration(500)
						.style("fill", "white");

						d3.select("#ID".concat(d.clicheID))
						.transition().duration(1000)
						.style("fill", highlightColor)
						.style("opacity", "1");

						 histogram(d);
						 bubbles_genres(d);
					});


    var text2 = elemEnter.append("text")
			.attr("text-anchor", "middle")
			.attr("class", "textcliche")
			.attr("id", function (d) {
				return ("IDtext2"+d.clicheID);
			})
			.attr("dy", function(d){return fontSizeScale(d.count) + "px"})
			.style("font-size", function(d){return fontSizeScale(Number(d.count)) + "px"})
        	.text(function(d){ return getText2(String(d.cliche))})
        	.on("click", function(d) {
						d3.selectAll(".clicheCircles")
						.transition().duration(1000)
						.style("fill", circleFillColor)
						.style("opacity", "0.3");

						d3.selectAll(".textcliche")
						.transition().duration(500)
						.style("fill", "black");

						d3.select("#IDtext1".concat(d.clicheID))
						.transition().duration(500)
						.style("fill", "white");

						d3.select("#IDtext2".concat(d.clicheID))
						.transition().duration(500)
						.style("fill", "white");

						d3.select("#ID".concat(d.clicheID))
						.transition().duration(1000)
						.style("fill", highlightColor)
						.style("opacity", "1");

						 histogram(d);
						 bubbles_genres(d);
						});

		simulation.nodes(datapoints)
			.on('tick', ticked)

		function ticked() {
			ellipses
				.attr("cx", function(d) {
					return d.x
				})
				.attr("cy", function(d) {
					return d.y
				});

			text
				.attr("x", function(d) {
					return d.x
				})
				.attr("y", function(d) {
					return d.y
				});

			text2
				.attr("x", function(d) {
					return d.x
				})
				.attr("y", function(d) {
					return d.y
				});
		}
	}
};
