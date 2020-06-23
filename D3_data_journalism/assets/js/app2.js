
// Define SVG area dimensions
var svgWidth = 800;
var svgHeight = 600;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 80
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup,newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//Updates the circle labes with a transition to new circles.
function renderCirclesLabel(circleLabels,newXScale, chosenXAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circleLabels;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty(%):";
  }
  else {
    label = "Healthcare:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([10, -20])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Obesity: ${d.obesity}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  console.log(censusData);

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
   // data.smokes = +data.smokes;
  });

 // xLinearScale function above csv import
 var xLinearScale = xScale(censusData, chosenXAxis);

 // Create y scale function
 var yLinearScale = d3.scaleLinear()
   .domain([15, d3.max(censusData, d => d.obesity)])
   .range([height, 15]);

 // Create initial axis functions
 var bottomAxis = d3.axisBottom(xLinearScale);
 var leftAxis = d3.axisLeft(yLinearScale);

 // append x axis
 var xAxis = chartGroup.append("g")
   .classed("x-axis", true)
   .attr("transform", `translate(0, ${height})`)
   .call(bottomAxis);

 // append y axis
 chartGroup.append("g")
   .call(leftAxis);

 // append initial circles
 var circlesGroup = chartGroup.selectAll("circle")
   .data(censusData)
   .enter()
   .append("circle")
   .attr("cx", d => xLinearScale(d[chosenXAxis]))
   .attr("cy", d => yLinearScale(d.obesity))
   .attr("r", 20)
   .attr("fill", "blue")
   .attr("opacity", ".5");


   // append initial circle Labels.  This puts the state initials in the circles
   var circleLabels = chartGroup.selectAll(null)
   .data(censusData)
   .enter()
   .append("text");

    circleLabels
      .attr("x", function(d) {
        return xLinearScale(d[chosenXAxis]);
      })
      .attr("y", function(d) {
        return yLinearScale(d.obesity);
      })
      .text(function(d) {
        return d.abbr;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

 // Create group for two x-axis labels
 var labelsGroup = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + 20})`);

 var povertyLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 25)
   .attr("value", "poverty") // value to grab for event listener
   .classed("active", true)
   .text("(%) Lives In Poverty");

   var healthcareLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 50)
   .attr("value", "healthcare") // value to grab for event listener
   .classed("active", true)
   .text("(%)Lacks Healthcare");


 // append y axis
 chartGroup.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left)
   .attr("x", 0 - (height / 2))
   .attr("dy", "1em")
   .classed("axis-text", true)
   .text("(%)Obesity");

 // updateToolTip function above csv import
 var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

 // x axis labels event listener
 labelsGroup.selectAll("text")
   .on("click", function() {
     // get value of selection
     var value = d3.select(this).attr("value");
     if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;

       // console.log(chosenXAxis)

       // functions here found above csv import
       // updates x scale for new data
       xLinearScale = xScale(censusData, chosenXAxis);

       // updates x axis with transition
       xAxis = renderAxes(xLinearScale, xAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup,xLinearScale, chosenXAxis);

       circleLabels = renderCirclesLabel(circleLabels,xLinearScale, chosenXAxis);

       // updates tooltips with new info
       circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

       // changes classes to change bold text
       if (chosenXAxis === "healthcare") {
        healthcareLabel
           .classed("active", true)
           .classed("inactive", false);
        povertyLabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else {
        healthcareLabel
           .classed("active", false)
           .classed("inactive", true);
        povertyLabel
           .classed("active", true)
           .classed("inactive", false);
       }
     }
   });
}).catch(function(error) {
 console.log(error);
});