ImmigrantCountryVis = function(_parentElement, _data, _gdpdata, _infantmortalitydata, _lifeexpectancydata, _metric, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.countrycode = "";
    this.countryname = "";
    this.gdpdata = _gdpdata;
    this.infantmortalitydata = _infantmortalitydata;
    this.lifeexpectancydata = _lifeexpectancydata;
    this.metric = _metric;
    this.eventHandler = _eventHandler;
    this.countryGDPdata = [];
    this.countryIMdata = [];
    this.countryLEdata = [];

    this.displayData = []; // for the immigration/emigration data
    this.displayData2 = []; // for the metric

    // defines constants
    this.margin = {top: 25, right: 25, bottom: 50, left: 40},
    this.width = 450 - this.margin.left - this.margin.right,
    this.height = 250 - this.margin.top - this.margin.bottom;

    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
ImmigrantCountryVis.prototype.initVis = function(){

    var that = this;

    var gender_names = ["Female", "Male", "Total"];
    
    // create axis and scales
    var x0 = d3.scale.ordinal()
        .domain(this.displayData.map(function(d) { return d.year; }))
        .rangeRoundBands([0, this.width], .1);

    var x1 = d3.scale.ordinal()
        .domain(gender_names)
        .rangeRoundBands([0, x0.rangeBand()]);

    var y1 = d3.scale.linear()
        // .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .domain([0, this.ymax])
        .range([this.height, 0]);

    var y2 = d3.scale.linear()
        .domain([0, d3.max(this.displayData2, function(d) { return d3.max(d.years, function(d) { return d.value; }); })])
        .range([this.height, 0]);

    var color = d3.scale.category10();

    this.xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    this.y1Axis = d3.svg.axis()
        .scale(y1)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    this.y2Axis = d3.svg.axis()
        .scale(y2)
        .orient("right")
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
          .call(this.y1Axis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("fill", "white")
          .text("immigrants");

    this.svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + this.width + ",0)")
          .call(this.y2Axis)
        .append("text")
          .attr("transform", "rotate(90)")
          .attr("y", 6)
          .attr("x", 20)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("fill", "white")
          .text(this.metric);
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
 
ImmigrantCountryVis.prototype.wrangleData= function(_filterFunction){

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
ImmigrantCountryVis.prototype.updateVis = function(){

    var that = this;

    var gender_names = ["Female", "Male", "Total"];

    // update scales
    var x0 = d3.scale.ordinal()
        .domain(this.displayData.map(function(d) { return d.year; }))
        .rangeRoundBands([0, this.width], .1);

    var x1 = d3.scale.ordinal()
        .domain(gender_names)
        .rangeRoundBands([0, x0.rangeBand()]);

    var y1 = d3.scale.linear()
        // .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .domain([0, this.ymax])
        .range([this.height, 0]);

    var color = d3.scale.category10();

    this.xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    this.y1Axis = d3.svg.axis()
        .scale(y1)
        .orient("left")
        .ticks(6)
        .tickFormat(d3.format(".2s"));

    // update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.y1Axis);

    // removes all rectangles
    this.svg.selectAll("rect").remove();

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
      .attr("y", function(d) { return y1(d.value); })
      .attr("height", function(d) { return that.height - y1(d.value); })
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

    // update bar chart title
    this.svg.select(".title").remove();
    this.svg.append("text")
        .attr("class", "title")
        .attr("x", (this.width / 2))
        .attr("y", 5 - (this.margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(this.countryname + " - Immigrants");

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
ImmigrantCountryVis.prototype.onSelectionChange = function (code, cname, ymax){

    // console.log("Country is now " + cname + " with code: " + code);

    this.countrycode = code;
    this.countryname = cname;
    this.ymax = ymax;

    this.wrangleData(null);
    this.updateVis();
}

/**
 * Gets called by event handler and should update metric
 * @param selection
 */
ImmigrantCountryVis.prototype.onMetricChange = function (metric){

    // console.log("Metric is now " + metric);

    this.metric = metric;
    this.wrangleData(null);
    this.updateVis();
}

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
ImmigrantCountryVis.prototype.filterAndAggregate = function(_filter){

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    this.displayData = [];

    var that = this;
    var male_immigrants_1960 = 0;
    var female_immigrants_1960 = 0;
    var male_immigrants_1970 = 0;
    var female_immigrants_1970 = 0;
    var male_immigrants_1980 = 0;
    var female_immigrants_1980 = 0;
    var male_immigrants_1990 = 0;
    var female_immigrants_1990 = 0;
    var male_immigrants_2000 = 0;
    var female_immigrants_2000 = 0;

    this.data.forEach(function(d){
        d.years.forEach(function(f){
            if (f.year == "1960") {
                f.dests.forEach(function(g){
                    if (g.country == that.countrycode) {
                        if (!isNaN(g["Male"]))
                            male_immigrants_1960 += g["Male"];
                        if (!isNaN(g["Female"]))
                            female_immigrants_1960 += g["Female"];
                    }
                });                
            } else if (f.year == "1970") {
                f.dests.forEach(function(g){
                    if (g.country == that.countrycode) {
                        if (!isNaN(g["Male"]))
                            male_immigrants_1970 += g["Male"];
                        if (!isNaN(g["Female"]))
                            female_immigrants_1970 += g["Female"];
                    }
                });                
            } else if (f.year == "1980") {
                f.dests.forEach(function(g){
                    if (g.country == that.countrycode) {
                        if (!isNaN(g["Male"]))
                            male_immigrants_1980 += g["Male"];
                        if (!isNaN(g["Female"]))
                            female_immigrants_1980 += g["Female"];
                    }
                });                
            } else if (f.year == "1990") {
                f.dests.forEach(function(g){
                    if (g.country == that.countrycode) {
                        if (!isNaN(g["Male"]))
                            male_immigrants_1990 += g["Male"];
                        if (!isNaN(g["Female"]))
                            female_immigrants_1990 += g["Female"];
                    }
                });                
            } else {
                f.dests.forEach(function(g){
                    if (g.country == that.countrycode) {
                        if (!isNaN(g["Male"]))
                            male_immigrants_2000 += g["Male"];
                        if (!isNaN(g["Female"]))
                            female_immigrants_2000 += g["Female"];
                    }
                });                
            }
        })
    });

    var total_immigrants_1960 = male_immigrants_1960 + female_immigrants_1960;
    var genderdata_1960 = [
        {
            name: "Male",
            value: male_immigrants_1960
        },
        {
            name: "Female",
            value: female_immigrants_1960
        },
        {
            name: "Total",
            value: total_immigrants_1960
        }
    ];
    var data1960 = {
        year: "1960",
        male: male_immigrants_1960,
        female: female_immigrants_1960,
        total: total_immigrants_1960,
        genders: genderdata_1960
    }
    this.displayData.push(data1960);

    var total_immigrants_1970 = male_immigrants_1970 + female_immigrants_1970;
    var genderdata_1970 = [
        {
            name: "Male",
            value: male_immigrants_1970
        },
        {
            name: "Female",
            value: female_immigrants_1970
        },
        {
            name: "Total",
            value: total_immigrants_1970
        }
    ];
    var data1970 = {
        year: "1970",
        male: male_immigrants_1970,
        female: female_immigrants_1970,
        total: total_immigrants_1970,
        genders: genderdata_1970
    }
    this.displayData.push(data1970);

    var total_immigrants_1980 = male_immigrants_1980 + female_immigrants_1980;
    var genderdata_1980 = [
        {
            name: "Male",
            value: male_immigrants_1980
        },
        {
            name: "Female",
            value: female_immigrants_1980
        },
        {
            name: "Total",
            value: total_immigrants_1980
        }
    ];
    var data1980 = {
        year: "1980",
        male: male_immigrants_1980,
        female: female_immigrants_1980,
        total: total_immigrants_1980,
        genders: genderdata_1980
    }
    this.displayData.push(data1980);

    var total_immigrants_1990 = male_immigrants_1990 + female_immigrants_1990;
    var genderdata_1990 = [
        {
            name: "Male",
            value: male_immigrants_1990
        },
        {
            name: "Female",
            value: female_immigrants_1990
        },
        {
            name: "Total",
            value: total_immigrants_1990
        }
    ];
    var data1990 = {
        year: "1990",
        male: male_immigrants_1990,
        female: female_immigrants_1990,
        total: total_immigrants_1990,
        genders: genderdata_1990
    }
    this.displayData.push(data1990);

    var total_immigrants_2000 = male_immigrants_2000 + female_immigrants_2000;
    var genderdata_2000 = [
        {
            name: "Male",
            value: male_immigrants_2000
        },
        {
            name: "Female",
            value: female_immigrants_2000
        },
        {
            name: "Total",
            value: total_immigrants_2000
        }
    ];
    var data2000 = {
        year: "2000",
        male: male_immigrants_2000,
        female: female_immigrants_2000,
        total: total_immigrants_2000,
        genders: genderdata_2000
    }
    this.displayData.push(data2000);

    // update country GDP data to contain only GDP data for the country
    this.countryGDPdata = [];
    this.gdpdata.forEach(function(d){
        if (d.country == that.countrycode) {
            that.countryGDPdata.push(d);
        }
    });
    this.countryGDPdata = this.countryGDPdata[0];
    // console.log("GDP DATA FOR COUNTRY " + this.countryname);
    // console.log(this.countryGDPdata);

    // update country infant mortality data to contain only infant mortality data for the country
    this.countryIMdata = [];
    this.infantmortalitydata.forEach(function(d){
        if (d.country == that.countrycode) {
            that.countryIMdata.push(d);
        }
    });
    this.countryIMdata = this.countryIMdata[0];
    // console.log("INFANT MORTALITY DATA FOR COUNTRY " + this.countryname);
    // console.log(this.countryIMdata);

    // update country life expectancy data to contain only life expectancy data for the country
    this.countryLEdata = [];
    this.lifeexpectancydata.forEach(function(d){
        if (d.country == that.countrycode) {
            that.countryLEdata.push(d);
        }
    });
    this.countryLEdata = this.countryLEdata[0];
    // console.log("LIFE EXPECTANCY DATA FOR COUNTRY " + this.countryname);
    // console.log(this.countryLEdata);

    if (this.metric == "GDP ($)")
        this.displayData2 = this.countryGDPdata;
    else if (this.metric == "Life Expectancy (years)")
        this.displayData2 = this.countryLEdata;
    else 
        this.displayData2 = this.countryIMdata;
    // console.log(this.displayData2);

    return this.displayData;

}

// returns the maximum y-value of this dataset for the purpose of regulating y-axis scales
ImmigrantCountryVis.prototype.getMaxY = function(){
    return d3.max(this.displayData, function(d) { 
        return d3.max(d.genders, function(d) { 
            return d.value; 
        }); 
    });
}
