const svgWidth = 960;
const svgHeight = 600;
const margin = { top: 30, right: 50, bottom: 150, left: 50 };
const graphWidth = svgWidth - margin.right - margin.left;
const graphHeight = svgHeight - margin.top - margin.bottom;

let svg = d3
  .select("#viz")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleBand().range([0, graphWidth]).padding(0.1);
const y = d3.scaleLinear().range([graphHeight, 0]);

d3.csv("sales.csv", (d) => {
  d.sales = +d.sales;
  return d;
})
  .then((results) => {
    const maxVal = d3.max(results, (d) => d.sales);

    x.domain(results.map((d) => d.flavors));
    y.domain([0, maxVal]).nice();

    //axises
    svg.append("g").call(d3.axisLeft(y));
    svg
      .append("g")
      .attr("transform", `translate(0, ${graphHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("transform", "rotate(90)")
      .attr("text-anchor", "start");

    createBars(results); // draw rectangles (bars) at first time

    // slider logic
    const rangeSlider = document.getElementById("sales-range");
    rangeSlider.min = 0;
    rangeSlider.max = maxVal;
    rangeSlider.onchange = () => {
      const filteredData = results.filter((d) => d.sales >= rangeSlider.value);
      createBars(filteredData);
    };
  })
  .catch((error) => {
    throw error;
  });

function createBars(results) {
  svg
    .selectAll(".bar-group")
    .data(results, (d) => d.flavors)
    .join(
      (enter) => {
        const bar = enter
          .append("g")
          .attr("class", "bar-group")
          .style("opacity", 1);

        // bars (rectangles)
        bar
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.flavors))
          // .attr("y", (d) => y(d.sales))
          .attr("y", (d) => y(0))
          .attr("width", x.bandwidth())
          // .attr("height", (d) => graphHeight - y(d.sales))
          // start position (needed for animation)
          .attr("height", 0)
          .attr("fill", "steelblue")
          .transition()
          .duration(750)
          .attr("y", (d) => y(d.sales))
          .attr("height", (d) => graphHeight - y(d.sales));

        // labels
        bar
          .append("text")
          .text((d) => d.sales)
          .attr("x", (d) => x(d.flavors) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.sales) - 5)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", 10)
          .style("opacity", 0)
          .transition()
          .duration(750)
          .style("opacity", 1);
      },
      (update) => {
        update.transition().duration(750).style("opacity", 1);
      },
      (exit) => {
        exit.transition().duration(750).style("opacity", 0.15);
      }
    );
}
