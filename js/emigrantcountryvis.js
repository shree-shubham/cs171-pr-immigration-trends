EmigrantCountryVis = function(_parentElement, _data, _gdpdata, _infantmortalitydata, _lifeexpectancydata, _metric, _eventHandler){
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
    this.margin = {top: 25, right: 50, bottom: 50, left: 40},
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

    var y1 = d3.scale.linear()
        // .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .domain([0, this.ymax])
        .range([this.height, 0]);

    // get max of this.displayData2;
    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    }

    var notNullArray = [];
    this.displayData2.forEach(function(d){
        if (d.value != null && !isNaN(d.value)) {
            notNullArray.push(d.value);
        }
    })
    var max2 = getMaxOfArray(notNullArray);
    
    var y2 = d3.scale.linear()
        .domain([0, max2])
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
          .attr("class", "y1 axis")
          .call(this.y1Axis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("fill", "white")
          .text("emigrants");

    this.svg.append("g")
          .attr("class", "y2 axis")
          .attr("transform", "translate(" + this.width + ",0)")
          .call(this.y2Axis)
        .append("text")
          .attr("transform", "rotate(90)")
          .attr("y", -50)
          .attr("x", 100)
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .text(this.metric);
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

    var y1 = d3.scale.linear()
        // .domain([0, d3.max(this.displayData, function(d) { return d3.max(d.genders, function(d) { return d.value; }); })])
        .domain([0, this.ymax])
        .range([this.height, 0]);

    // get max of this.displayData2;
    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    }

    var notNullArray = [];
    this.displayData2.forEach(function(d){
        if (d.value != null && !isNaN(d.value)) {
            notNullArray.push(d.value);
        }
    })
    var max2 = getMaxOfArray(notNullArray);
    
    var y2 = d3.scale.linear()
        .domain([0, max2])
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

    this.y2Axis = d3.svg.axis()
        .scale(y2)
        .orient("right")
        .ticks(6)
        .tickFormat(d3.format(".2s"));

    // update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y1.axis")
        .call(this.y1Axis);

    // removes all rectangles
    this.svg.selectAll("rect").remove();

    // redraw y2 axis
    this.svg.select(".y2.axis").remove();

    this.svg.append("g")
          .attr("class", "y2 axis")
          .attr("transform", "translate(" + this.width + ",0)")
          .call(this.y2Axis)
        .append("text")
          .attr("y", -50)
          .attr("x", 100)
          .attr("transform", "rotate(90)")
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .text(this.metric);

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

    // redraw metric line
    this.svg.select(".line").remove();
    var metricline = d3.svg.line()
        .x(function(d) { return x0(d.year)+30; })
        .y(function(d) { return y2(d.value); })

    this.svg.append("path")
        .attr("class", "line")
        .attr("d", metricline(this.displayData2));

    // redraw dot markers
    this.svg.selectAll(".dot").remove();
    this.svg.selectAll("dot")
        .data(this.displayData2)
    .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("fill", "red")
        .attr("cx", function(d) { return x0(d.year)+30; })
        .attr("cy", function(d) { return y2(d.value); });

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
        .text(this.countryname + " - Emigrants");

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
EmigrantCountryVis.prototype.onSelectionChange = function (code, cdata, cname, ymax){

    // console.log("Country is now " + cname + " with code: " + code);
    // console.log(cdata);

    this.countryname = cname;
    this.data = cdata;
    this.ymax = ymax;
    this.countrycode = code;

    this.wrangleData(null);
    this.updateVis();
}

/**
 * Gets called by event handler and should update metric
 * @param selection
 */
EmigrantCountryVis.prototype.onMetricChange = function (metric){

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

    // build emigration data
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

    // update country GDP data to contain only GDP data for the country
    this.countryGDPdata = [];
    this.gdpdata.forEach(function(d){
        if (d.country == that.countrycode) {
            that.countryGDPdata.push(d);
        }
    });
    this.countryGDPdata = this.countryGDPdata[0];
    var gdpArray = [ 
        {
            year: "1960",
            value: this.countryGDPdata.years["1960"]
        },
        {
            year: "1970",
            value: this.countryGDPdata.years["1970"]
        },
        {
            year: "1980",
            value: this.countryGDPdata.years["1980"]
        },
        {
            year: "1990",
            value: this.countryGDPdata.years["1990"]
        },
        {
            year: "2000",
            value: this.countryGDPdata.years["2000"]
        }
    ];
    this.countryGDPdata = gdpArray;
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
    var imArray = [ 
        {
            year: "1960",
            value: this.countryIMdata.years["1960"]
        },
        {
            year: "1970",
            value: this.countryIMdata.years["1970"]
        },
        {
            year: "1980",
            value: this.countryIMdata.years["1980"]
        },
        {
            year: "1990",
            value: this.countryIMdata.years["1990"]
        },
        {
            year: "2000",
            value: this.countryIMdata.years["2000"]
        }
    ];
    this.countryIMdata = imArray;
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
    var leArray = [ 
        {
            year: "1960",
            value: this.countryLEdata.years["1960"]
        },
        {
            year: "1970",
            value: this.countryLEdata.years["1970"]
        },
        {
            year: "1980",
            value: this.countryLEdata.years["1980"]
        },
        {
            year: "1990",
            value: this.countryLEdata.years["1990"]
        },
        {
            year: "2000",
            value: this.countryLEdata.years["2000"]
        }
    ];
    this.countryGDPdata = gdpArray;
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
EmigrantCountryVis.prototype.getMaxY = function(){
    return d3.max(this.displayData, function(d) { 
        return d3.max(d.genders, function(d) { 
            return d.value; 
        }); 
    });
}





