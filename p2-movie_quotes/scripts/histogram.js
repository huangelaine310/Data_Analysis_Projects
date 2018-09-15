function histogram(d) {
    var svg = d3.select("#histograph");

    //clean everything first
    svg.selectAll("*").remove();

    var height = document.getElementById("ratingsHistogram").clientHeight;
    var width = document.getElementById("ratingsHistogram").clientWidth;

    svg
    .attr("width", width)
    .attr("height", height);

    //scale
    var xscale = d3.scaleLinear().domain([0, 100]).range([100, width - 100]);
    var yscale = d3.scaleLinear().domain([0, 10]).range([0, height]);
    var allscale = d3.scaleLinear().domain([0, 12500]).range([100, width - 100]);

    if (d.clicheID == 0) {
        xscale = allscale;
    }


    //draw histogram
    d.rating_lst.forEach(function(d, i) {
        svg.append("text")
        .text(function (d) {
          if (i == 9) {
            return "";
          } else {
            return (9-i).toString();
          }
         })
        .attr("x", xscale(0) - 10)
        .attr("y", yscale(i) + 5)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging");

        // delay text appearance until after bars have appeared
        setTimeout(function() {
            if (d != 0) {
               svg.append("text")
                .text(d)
                .attr("x", xscale(d) + 5)
                .attr("y", yscale(9-i) + 5)
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "hanging")
                .style("font-size", "11px")
                .style("opacity", 0.8);
            }
        }, 700);
    });

    // generate rectanges for histogram bars
    svg.selectAll('rect')
        .data(d.rating_lst)
        .enter()
        .append("rect")
        .attr("x", xscale(0))
        .attr("y", function (d,i) {
          return yscale(9-i) + 5
        })
        .attr("height", height * (1/15))
        .attr("fill", "#233237")
        .attr("width", 0)
        .transition()
			   .duration(500)
         .delay(function (d, i) {
    				return i * 50;
    			})
        .attr("x", xscale(0))
        .attr("width", function (d) {
          return xscale(d) - xscale(0);
        });

    //update average rating
    var div = document.getElementById("average_rating");
    div.innerHTML = "Average Rating: " + d.average_rating.toPrecision(2);

}
