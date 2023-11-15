import * as d3 from "d3";

// D3 Setup
// Graph Dimentions
const margin = { top: 10, bottom: 20, left: 50, right: 10 };

const height = 400;
const width = 900;

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((request) => request.json())
  .then((json) => {
    const dataset = json.data;

    // y scale

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#graph-container").append("svg");
    svg.attr("height", height).attr("width", width);

    // Tooltip
    const tooltip = d3
      .select("#graph-container")
      .append("div")
      .attr("id", "tooltip")
      .html(`<p>This Is A Test<p>`)
      .style("opacity", 0);

    // Add Bars

    const barWidth = (width - margin.left - margin.right) / dataset.length;

    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("width", barWidth)
      .attr("height", (d) => height - margin.bottom - yScale(d[1]))
      .attr("x", (d, i) => i * barWidth + margin.left)
      .attr("y", (d) => yScale(d[1]))
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mouseover", (e, d) => {
        // console.log(e);
        const xDistFromCursor = 20;
        tooltip
          .style("opacity", 0.8)
          .style("left", `${e.x + xDistFromCursor}px`)
          .html(
            `
            <p>${d[0]}, ${d[1]}<p>
          `
          )
          .attr("data-date", d[0]);
      })
      .on("mouseout", (e, d) => {
        tooltip.style("opacity", 0);
      });

    // Add Axis
    // X Axis
    const [firstDate, lastDate] = [dataset[0][0], dataset.slice(-1)[0][0]];
    const dateRange = [new Date(firstDate), new Date(lastDate)];
    const xScale = d3.scaleTime(dateRange, [margin.left, width - margin.right]);
    svg
      .append("g")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("id", "x-axis");

    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${margin.left},0)`)
      .attr("id", "y-axis");
  });
