// @TODO: YOUR CODE HERE!
// if the SVG area isn't empty when the browser loads, remove it
    // and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg").classed('body', true);
    if (!svgArea.empty()) {
    svgArea.remove();
    }

var svgWidth = window.innerWidth;;
var svgHeight = window.innerHeight;


var margin ={
    top : 20,
    right: 40,
    bottom : 100,
    left : 100
};

var width = svgWidth - margin .left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  }

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
// create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis, circleText) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    circleText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var label = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      var label = "Age (Median):"
    }
    else {
      var label = "Household Income (Median):";
    }

    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes (%):";
    }
    else {
      var yLabel = "Obese (%):";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup
      // onmousein event
    .on("mouseover", toolTip.show)
      // onmouseout event
    .on("mouseout", toolTip.hide);
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data){
    console.log(data);
    
    // Parse data
    data.forEach(function(j){
        j.poverty = +j.poverty;
        j.age = +j.age;
        j.income = +j.income;
        j.obesity = +j.obesity;
        j.smokes = +j.smokes;
        j.healthcare = +j.healthcare;
        j.id = +j.id;
        j.state = j.state;
        j.abbr = j.abbr;
        j.povertyMoe = +j.povertyMoe;
        j.ageMoe = +j.ageMoe;
        j.incomeMoe = +j.incomeMoe;
        j.healthcareLow = +j.healthcareLow;
        j.healthcareHigh = +j.healthcareHigh;
        j.obesityLow = +j.obesityLow;
        j.obesityHigh = +j.obesityHigh;
        j.smokesLow = +j.smokesLow;
        j.smokesHigh = +j.smokesHigh;

    });

    // xLinearScale & yLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append circleTextGroup
    var circleTextGroup = chartGroup.append("g");

    // append initial circles
    var circlesGroup = circleTextGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("opacity", ".5");

    var circleText = circleTextGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr('dy', 4)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)
    .attr("font-size", "12px");

    console.log(chartGroup);

    // Create group for x- axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Household Income (Median)");

    // Create group for y- axis labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`)
    .attr("transform", "rotate(-90)");

    var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (0.5 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (0.75 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Smokes (%)");

    var obeseLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (1.00 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value);
    if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, circleText);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel 
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
  });
    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis, circleText);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
            .classed("active", true)
            .classed("inactie", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
});



}).catch(function(error) {
    console.log(error);
  });