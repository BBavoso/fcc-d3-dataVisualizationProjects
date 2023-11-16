import * as d3 from "d3";

const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// D3 Setup
const margin = { top: 0, bottom: 20, left: 40, right: 0 };
const scalePadding = { x: 1, y: 5 };

const colors = { notDoping: "rgb(180, 200, 255)", doping: "red" };

const height = 400;
const width = 800;

fetch(dataUrl)
  .then((data) => data.json())
  .then((dataset) => {
    // ***************************
    // change time property
    dataset.forEach((d) => {
      const [minutes, seconds] = d.Time.split(":");
      d.Time = new Date(1970, 0, 1, 0, minutes, seconds);
    });

    const svg = d3
      .select("#graph-container")
      .append("svg")
      .attr("height", height)
      .attr("width", width);

    // ***************************
    // Axis

    // X and Y Axis
    const [xMin, xMax] = getMinAndMax(dataset, (element) => element.Year);
    const xScale = d3
      .scaleLinear()
      .domain([xMin - scalePadding.x, xMax + scalePadding.x])
      .range([margin.left, width - margin.right]);

    const [yMin, yMax] = getMinAndMax(dataset, (element) => element.Seconds);
    const yScale = d3
      .scaleLinear()
      .domain([yMax + scalePadding.y, yMin - scalePadding.y])
      .range([height - margin.bottom, margin.top]);

    // Axis Labels
    svg
      .append("g")
      .call(d3.axisBottom(xScale).tickFormat((d) => d))
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .attr("id", "x-axis");

    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat(
            (d) =>
              `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, "0")}`
          )
      )
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("id", "y-axis");

    // ***************************
    // Create Legend

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - 100}, 100)`);

    function appendToLegend(text, color, translateY = 0) {
      const group = legend
        .append("g")
        .attr("transform", `translate(0, ${translateY})`);

      group.append("text").text(text).attr("text-anchor", "end");
      group
        .append("rect")
        .attr("fill", color)
        .attr("width", 14)
        .attr("height", 14)
        .attr("transform", `translate(4, -13)`)
        .attr("stroke-width", 0.3)
        .attr("stroke", "black");
    }

    appendToLegend("No Doping Alleged", colors.notDoping);
    appendToLegend("Doping Alleged", colors.doping, -18);

    // ***************************
    //  Initialize Tooltip

    const tooltip = d3
      .select("#graph-container")
      .append("div")
      .attr("id", "tooltip")
      .html(`<p>test tooltip</p>`);

    // ***************************
    // Add dots
    svg
      .selectAll(".dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5.5)
      .attr("cx", (d) => xScale(d.Year))
      .attr("data-xvalue", (d) => d.Year)
      .attr("cy", (d) => yScale(d.Seconds))
      .attr("data-yvalue", (d) => d.Time.toISOString())
      .attr("fill", (d) => (d.Doping === "" ? colors.notDoping : colors.doping))
      .on("mouseenter", (e, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", `${e.x + 20}px`)
          .style("top", `${e.y - 70}px`)
          .attr("data-year", d.Year)
          .attr("data-xvalue", d.Time.toISOString()).html(`
          <p>${d.Name}</p>
          <p>${d.Nationality}</p>
          <p>${Math.floor(d.Seconds / 60)}:${d.Seconds % 60}</p>
          `);
      })
      .on("mouseleave", (e, d) => {
        tooltip.style("opacity", 0);
      });
  });

/**
 * Finds both the min and max in one pass of an unsorted array
 * @param {Array} data The array that will be iterated through
 * @param {Function} callback the callback function that will be called on each element
 * should return a number
 * @returns an array containing the min and max
 * in the form [min, max]
 */
function getMinAndMax(data, callback = (element) => element) {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  data.forEach((element) => {
    const value = callback(element);

    min = value < min ? value : min;
    max = value > max ? value : max;
  });
  return [min, max];
}
