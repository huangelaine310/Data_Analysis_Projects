//load data
      d3.queue()
      .defer(d3.tsv, "Cliches.tsv")
      .defer(d3.tsv, "Movies-IMDB.tsv")
      .defer(d3.csv, "QuoteMovie.csv")
      .await(loadData);

  var quote_data = [];
  var overallaverage = 0;
  var overallratinglst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  function loadData(error, cliches, imdb, quotemovie) {

      if (error) {console.log(error);}

      //change values to numbers
      cliches.forEach(function(d) {
          d.clicheID = +d.clicheID;
      });
      imdb.forEach(function(d) {
          if (d.rating != "NO DATA") {d.rating = +d.rating;}
      });
      quotemovie.forEach(function(d) {
          d.movieID = +d.movieID;
          d.clicheID = +d.clicheID;
      })

      var genres_per_cliche = [];
      cliches.forEach(function(d) {
          //calculate count
          var count = 0;
          var movielst = []
          quotemovie.forEach(function(i) {
              if (i.clicheID == d.clicheID) {
                  count += 1;
                  movielst.push(i.movieID);
              }
          })

          //calculate average_rating
          var rating = d3.mean(movielst, function(d){ return imdb[d-1].rating; });

          //calculate overall average
          overallaverage = d3.mean(imdb, function(d) {return d.rating;});

          //store list of ratings for histogram
          var rating_lst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          movielst.forEach(function(d) {
              if (imdb[d-1].rating != "NO DATA")
                rating_lst[Math.floor(imdb[d-1].rating)] += 1;
          });

          //overall ratings list
          imdb.forEach(function(d) {
              if (d.rating != "NO DATA")
                  overallratinglst[Math.floor(d.rating)] += 1;
          })

          var obj = {
              cliche : d.cliche,
              clicheID : d.clicheID,
              count : count,
              average_rating : rating,
              rating_lst : rating_lst
          }

          quote_data.push(obj);
      });

      //word chart
      bubbles(quote_data);

      //overall historgram
      var overallcount = 0;
      quote_data.forEach(function(d) {
          overallcount += d.count;
      });
      var overall = {
          cliche : "all",
          clicheID : 0,
          count : overallcount,
          average_rating : overallaverage,
          rating_lst : overallratinglst
      }
      histogram(overall);

      //genre
      bubbles_genres(overall);

  }
