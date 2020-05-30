// @TODO: YOUR CODE HERE!

// Set variables
var svgWidth;
var svgHeight;
var margin;
var width;
var height;
var svg;
var chartGroup;

function base() {
    // if the SVG area isn't empty when the browser loads, remove it
    // and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg").classed('body', true);
    if (!svgArea.empty()) {
    svgArea.remove();
    }

    svgWidth = window.innerWidth;;
    svgHeight = window.innerHeight;

    margin = {
    top: 50,
    right: 70,
    bottom: 90,
    left: 50
    };


    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;


    // Step 2: Create an SVG wrapper,
    // append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    // =================================
    svg = d3
    .select("#scatter")
    .append("svg")
    .classed('chart', true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function show(){
    d3.csv("assets/data/data.csv").then(function(data, err){
    base();
    if (err) throw err;
    console.log(data)
    console.log(data.map(d=> d.abbr));

    // Parse data
    data.forEach(function (a){
        a.healthcare = +a.healthcare;
        a.poverty = +a.poverty;
    });

    // Create scales
    var xScale = d3.scaleLinear()
        .domain([d3.min(data,d=>d.poverty)* 0.87, d3.max(data, d=>d.poverty)*1.0777])
        .range([0, width]);
    // console.log(xScale(22));
    var yScale = d3.scaleLinear()
        .domain([d3.min(data, d=> d.healthcare)*0.93 , d3.max(data, d=> d.healthcare)*1.2])
        .range([height, 0]);
    console.log(data.map(d=>d.poverty));
    // Create axes
    var n = [0,1];
    function ax(n,i){return 10+(n*i)};
    var xAxis = d3.axisBottom(xScale).ticks(5)//.tickValues([0,10,12,14,16,18,20,22]);
    var yAxis = d3.axisLeft(yScale);

    // Append axes
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    chartGroup.append("g")
        .call(yAxis);

    // Append circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "10")
        .attr("fill", "#89bdd3")
        .attr("opacity", "0.8");

    // State abbreviations
    chartGroup.selectAll(".stateText")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => (yScale(d.healthcare)))
        .attr('dy', 4)
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr('font-size', '10px')
        .attr("fill", "white")
        .on("mouseover", function(d) {
            toolTip.show(d);
        })
        .on("mouseout", function(d,i) {
            toolTip.hide(d);
        });

    
     // y labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 1.85)
        .attr("dy", "1em")
        .classed("aText", true)
        .attr("data-axis-name", "healthcare")
        .text("Lacks Healthcare (%)");

    // x labels
    chartGroup.append("text")
        .attr("transform", "translate(" + width / 1.85 + " ," + (height + margin.top ) + ")")
        .attr("data-axis-name", "poverty")
        .classed("aText", true)
        .text("In Poverty (%)");
       
    // Initialize Tooltip
    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(function(d){
            return(`${d.abbr}<br>In Poverty (%): ${d.poverty}%<br>Lacks Healthcare (%): ${d.healthcare}%`);

        })
    // Create the tooltip in chartGroup
    chartGroup.call(toolTip)

    //Create event listener
    circlesGroup.on("mouseover", function(d){
        toolTip.show(d, this);
    })
        .on("mouseout", function(d){
            toolTip.hide();
        });
    }).catch(function(error){
        console.log(error);
    });
}
show();