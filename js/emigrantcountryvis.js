/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure

/**
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
EmigrantCountryVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.countryname = "";
    this.eventHandler = _eventHandler;
    this.displayData = [];

    // defines constants
    this.margin = {top: 25, right: 25, bottom: 50, left: 40},
    this.width = 450 - this.margin.left - this.margin.right,
    this.height = 250 - this.margin.top - this.margin.bottom;

    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
EmigrantCountryVis.prototype.initVis = function(){

    var that = this;

    var gender_names = ["Female", "Male", "Total"];
    
    // create axis and scales
    var x0 = d3.scale.ordinal()
        .domain(this.displayData.map(function(d) { return d.year; }))
        .rangeRoundBands([0, this.width], .1);

    var x1 = d3.scale.ordinal()
        .domain(gender_names)
        .rangeRoundBands([0, x0.rangeBand()]);

    var y = d3.scale.linear()
        .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .range([this.height, 0]);

    var color = d3.scale.category10();

    this.xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    // construct SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // call axes
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "white")
      .text("emigrants");
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
 
EmigrantCountryVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data whiche is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
EmigrantCountryVis.prototype.updateVis = function(){

    var that = this;

    var gender_names = ["Female", "Male", "Total"];

    // update scales
    var x0 = d3.scale.ordinal()
        .domain(this.displayData.map(function(d) { return d.year; }))
        .rangeRoundBands([0, this.width], .1);

    var x1 = d3.scale.ordinal()
        .domain(gender_names)
        .rangeRoundBands([0, x0.rangeBand()]);

    var y = d3.scale.linear()
        .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .range([this.height, 0]);

    var color = d3.scale.category10();

    this.xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(6)
        .tickFormat(d3.format(".2s"));

    // update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis);

    // removes all rectangles
    this.svg.selectAll("rect").remove();

    // update bar chart title
    this.svg.select(".title").remove();
    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width / 2))
        .attr("y", 15 - (this.margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(this.countryname + " - Emigrants");

    // add rectangles
    var year = this.svg.selectAll(".year")
      .data(this.displayData)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.year) + ",0)"; });

    year.selectAll("rect")
      .data(function(d) { return d.genders; })
    .enter().append("rect")
      .attr("width", x1.rangeBand()-2)
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return that.height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });

    // graph legend
    var legend = this.svg.selectAll(".legend")
        .data(gender_names.slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + i * 70 + ",210)"; });

    legend.append("circle")
      .attr("cx", this.width - 250)
      .attr("r", 5)
      .style("fill", color);

    legend.append("text")
      .attr("x", this.width - 260)
      .attr("y", 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("fill", "white")
      .text(function(d) { return d; });

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
EmigrantCountryVis.prototype.onSelectionChange = function (cdata, cname){

    console.log("Country is now " + cname + ":");
    console.log(cdata);

    this.countryname = cname;
    this.data = cdata;

    this.wrangleData(null);
    this.updateVis();
}

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
EmigrantCountryVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var that = this;

    // TODO: filter data
    this.displayData = [];
    var country = this.data.country;
    var latitude = this.data.latitude;
    var longitude = this.data.longitude;
    var gender_names = ["Female", "Male", "Total"];
    this.data.years.forEach(function(d){
        var male_emigrants = 0;
        var female_emigrants = 0;
        d.dests.forEach(function(d){
            if (!isNaN(d["Male"]))
                male_emigrants += d["Male"];
            if (!isNaN(d["Female"]))
                female_emigrants += d["Female"];
        });
        var total_emigrants = male_emigrants + female_emigrants;
        var genderdata = [
            {
                name: "Male",
                value: male_emigrants
            },
            {
                name: "Female",
                value: female_emigrants
            },
            {
                name: "Total",
                value: total_emigrants
            }
        ];
        var yeardata = {
            year: d.year,
            male: male_emigrants,
            female: female_emigrants,
            total: total_emigrants,
            genders: genderdata
        };
        that.displayData.push(yeardata);
    });
    // console.log(this.displayData);

    return this.displayData;

}