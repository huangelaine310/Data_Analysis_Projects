function bubbles_genres(clicked) {
	//svg width of genre chart
	var width = 600,
		 height = 450;

	// set colors for drama and comedy clusters
	var comedyColor = "#A69114",
		dramaColor = "#3D1933";

	d3.queue()
		.defer(d3.tsv, "Cliches.tsv")
		.defer(d3.tsv, "Movies-IMDB.tsv")
		.defer(d3.csv, "QuoteMovie.csv")
		.await(loadData);

	// generate bubbles for each cliche
 	function loadData(error, cliches, imdb, quotemovie) {
 		if (error) {console.log(error);}
 		//change values to numbers
 		cliches.forEach(function(d) { d.clicheID = +d.clicheID; });
 		imdb.forEach(function(d) { if (d.rating != "NO DATA") {d.rating = +d.rating;} });
 		quotemovie.forEach(function(d) {
 				d.movieID = +d.movieID;
 				d.clicheID = +d.clicheID;
 		});

 		var genres_per_cliche = [];
 		cliches.forEach(function(d) {
 			var movies = [];
 			quotemovie.forEach(function(i) {
 					if (i.clicheID == d.clicheID) {
 							var index = imdb.findIndex(function(movie) {
 								return movie.movieID == i.movieID;
 							});
 							genre_movie = (imdb[index].genres).split(", ");
 							genre_movie.forEach(function (j) {
 									if (j != "NO DATA") {
 										movies.push({movie: imdb[index].movieTitle, genre: j})
 									}
 							});
 					}
 			});
 			genres_per_cliche.push({clicheID: d.clicheID, movies: movies});
 		});

	// If no cliche is selected, output top two genres
	if (clicked.clicheID == 0) {
		var svg = d3.select('#putGenreSvgHere')
			.append("svg")
			.attr("id", "svg_genre")
			.attr("height", height)
			.attr("width", width)
			.append("g")
			.attr("transform", "translate(0,0)");

		function generate_focals_start() {
			var unique_genres = {};
			genres_per_cliche.forEach(function (cliche) {
				cliche.movies.forEach(function (d) {
						if (d.genre in unique_genres) {
							unique_genres[d.genre] += 1;
						} else {
							unique_genres[d.genre] = 1;
						}
				});
			});

			var unique_genres = Object.keys(unique_genres).map(function(key) {
			    return [key, unique_genres[key]];
			});
			unique_genres.sort(function(first, second) {
			    return second[1] - first[1];
			});

			var colors = {"Comedy": comedyColor,
										"Drama": dramaColor};

			var foci = {};
			var y = height * (2/5);
			var x_1 = width * (1/3);
			var x_2 = width * (2/3);

			foci[unique_genres[0][0]] = {"x": x_1, "y": y, "color": colors[unique_genres[0][0]]};
			foci[unique_genres[1][0]] = {"x": x_2, "y": y, "color": colors[unique_genres[1][0]]};

			return foci;
		}

		function generate_bubbles_start() {

			// get cluster centers
			var foci = generate_focals_start();

			// only include the top 2 genres
			genre_cleanup = [];
			genres_per_cliche.forEach(function (cliche) {
				cliche.movies.forEach(function (d) {
	      	if (d.genre in foci) {
						genre_cleanup.push(d);
					}
				});
			});

			var forceX = d3.forceX((d) => foci[d.genre].x);
			var forceY = d3.forceY((d) => foci[d.genre].y);

			var svg = d3.select('#svg_genre');
			svg.remove();
			var svg = d3.select('#putGenreSvgHere')
				.append("svg")
				.attr("id", "svg_genre")
				.attr("height", height)
				.attr("width", width)
				.append("g")
				.attr("transform", "translate(0,0)");

			// hover bubble
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
					var txt = d.movie;
					return txt;
			 });

			svg.call(tip);
			var node = svg.append("g")
									.attr("class", "nodes")
									.selectAll("circleGenre")
									.data(genre_cleanup)
									.enter().append("circle")
									.attr("r", 2)
									.on('mouseover', tip.show)
									.on('mouseout', tip.hide);

			var first_lbl = {};

			genre_cleanup.forEach(function (d, i) {
				if (!(d.genre in first_lbl)) {
						first_lbl[d.genre] = i;
				}
			});

			// Add labels of genres
			var label = svg.selectAll(null)
						    .data(genre_cleanup)
						    .enter()
						    .append("text")
						    .text(function (d, i) {
									if (i == first_lbl[d.genre]) {
										return d.genre; }
									})
								.transition()
							   .duration(500)
								.attr("x", function (d) {
									if (foci[d.genre].x == width * (1/3)) {
										return foci[d.genre].x - 20;
									} else {
										return foci[d.genre].x + 20;
									}
								})
								.attr("y", (d) => foci[d.genre].y - 130)
						    .style("text-anchor", "middle")
						    .style("fill", "#555")
						    .style("font-size", 18);

			var force = d3.forceSimulation(node)
	        .force("charge", d3.forceManyBody().strength(-1))
					.force('x', forceX)
					.force('y', forceY)
	        .alphaTarget(1);

			force.nodes(genre_cleanup)
					.on('tick', function() {
						 node
					 		.attr("fill", (d) => foci[d.genre].color)
							.attr('transform', (d) => {
									return 'translate(' + (d.x) + ',' + (d.y) + ')';
							});
				});
			}

			generate_bubbles_start();

	} else {

		function generate_focals(cliche) {
			var unique_genres = {};
			cliche.movies.forEach(function (d) {
					if (d.genre in unique_genres) {
						unique_genres[d.genre] += 1;
					} else {
						unique_genres[d.genre] = 1;
					}
			});

			var unique_genres = Object.keys(unique_genres).map(function(key) {
			    return [key, unique_genres[key]];
			});

			unique_genres.sort(function(first, second) {
			    return second[1] - first[1];
			});

			var colors = {"Romance": "#00808D",
										"Comedy": comedyColor,
										"Drama": dramaColor,
										"Action": "#B35B07",
										"Crime": "#7D7A7B",
										"Horror": "#342D33",
										"Mystery": "#392613",
										"Animation": "#929BCF",
										"Adventure": "#92CFC0",
										"Thriller": "#120D6B",
										"Sci-Fi": "#183B2D",
										"Family": "#F6B645",
										"Short": "#BCA2E6"};

			var foci = {};
			var y_1 = height * (1/3);
			var y_2 = height * (2/3);
			var x_1 = width * (1/4);
			var x_2 = width * (2/4);
			var x_3 = width * (3/4);

			// output cluster centers for top 6 genres
			foci[unique_genres[0][0]] = {"x": x_2, "y": y_1, "color": colors[unique_genres[0][0]]};
			foci[unique_genres[1][0]] = {"x": x_1, "y": y_2, "color": colors[unique_genres[1][0]]};
			foci[unique_genres[2][0]] = {"x": x_3, "y": y_2, "color": colors[unique_genres[2][0]]};
			foci[unique_genres[3][0]] = {"x": x_1, "y": y_1, "color": colors[unique_genres[3][0]]};
			foci[unique_genres[4][0]] = {"x": x_2, "y": y_2, "color": colors[unique_genres[4][0]]};
			foci[unique_genres[5][0]] = {"x": x_3, "y": y_1, "color": colors[unique_genres[5][0]]};

			return foci;
		}

		function generate_bubbles(cliche) {
			var foci = generate_focals(cliche);
			genre_cleanup = [];
			cliche.movies.forEach(function (d) {
      	if (d.genre in foci) {
					genre_cleanup.push(d);
				}
			});

			var forceX = d3.forceX((d) => foci[d.genre].x);
			var forceY = d3.forceY((d) => foci[d.genre].y);

			var svg = d3.select('#svg_genre');
			svg.remove();
			var svg = d3.select('#putGenreSvgHere')
				.append("svg")
				.attr("id", "svg_genre")
				.attr("height", height)
				.attr("width", width)
				.append("g")
				.attr("transform", "translate(0,0)");

			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
					var txt = d.movie;
					return txt;
			 });

			svg.call(tip);

			var node = svg.append("g")
									.attr("class", "nodes")
									.selectAll("circleGenre")
									.data(genre_cleanup)
									.enter().append("circle")
									.attr("r", 5)
									.on("mouseover", tip.show)
									.on("mouseout", tip.hide);

			var first_lbl = {};

			genre_cleanup.forEach(function (d, i) {
				if (!(d.genre in first_lbl)) {
						first_lbl[d.genre] = i;
				}
			});

			var label = svg.selectAll(null)
						    .data(genre_cleanup)
						    .enter()
						    .append("text")
						    .text(function (d, i) {
									if (i == first_lbl[d.genre]) {
										return d.genre; }
									})
								.transition()
							   .duration(300)
								.attr("x", function (d) {
									if (foci[d.genre].x != width * (3/4)) {
										return foci[d.genre].x - 15;
									} else {
										return foci[d.genre].x + 10;
									}
								})
								.attr("y", function (d) {
									if (foci[d.genre].y == height * (1/3)) {
										return foci[d.genre].y - 90;
									} else {
										return foci[d.genre].y - 50;
									}
								})
						    .style("text-anchor", "middle")
						    .style("fill", "#555")
						    .style("font-size", 18);

			var force = d3.forceSimulation(node)
	        .force("charge", d3.forceManyBody().strength(-5))
					.force('x', forceX)
					.force('y', forceY)
	        .alphaTarget(1);

			force.nodes(genre_cleanup)
					.on('tick', function() {
						 node
					 		.attr("fill", (d) => foci[d.genre].color)
							.attr('transform', (d) => {
									return 'translate(' + (d.x) + ',' + (d.y) + ')';
							});
				});
			}

			var cliche_idx = genres_per_cliche.findIndex(function(c) {
			  	return c.clicheID == clicked.clicheID;
			});

			generate_bubbles(genres_per_cliche[cliche_idx]);

		}
	}
}
