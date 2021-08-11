const width = 960;
const height = 600;

let nameById = d3.map();
let IdByName = d3.map();
let myArr = [];

let us;
let happiness_data;
let ids;

let category = "Happiness_Score";
let year = 2021;

var projection = d3.geoMercator().center([0, 30]);

let path = d3.geoPath().projection(projection);

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let promises = [
  d3.json(
    "https://raw.githubusercontent.com/JsBatista/chess_game_dataset/master/world-110m.json"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/JsBatista/chess_game_dataset/master/Arquivo_Total_Interpolado.csv"
  ),
  d3.json(
    "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json"
  ),
  d3.json(
    "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json"
  ),
];

Promise.all(promises).then(ready);

document.getElementById("years").addEventListener("change", () => {
  year = +document.getElementById("years").value;
  ready([]);
});

document.getElementById("cat").addEventListener("change", () => {
  category = document.getElementById("cat").value;
  ready([]);
});

function ready([local_us, local_happiness_data, local_ids]) {
  if (!us) {
    us = local_us;
  }
  if (!happiness_data) {
    local_happiness_data.forEach((d) => {
      d.Happiness_Rank = +d.Happiness_Rank;
      d.Happiness_Score = +d.Happiness_Score;
      d.GDP_Per_Capita = +d.GDP_Per_Capita;
      d.Social_Support = +d.Social_Support;
      d.Life_Expectancy = +d.Life_Expectancy;
      d.Freedom = +d.Freedom;
      d.Generosity = +d.Generosity;
      d.Government_Trust = +d.Government_Trust;
      d.Year = +d.Year;
    });
    happiness_data = local_happiness_data;
  }
  if (!ids) {
    local_ids.forEach((d) => {
      IdByName.set(d.name, +d["country-code"]);
      nameById.set(+d["country-code"], d.name);
    });
    ids = local_ids;
  }

  let ranges = {
    Happiness_Score: d3.extent(happiness_data, (d) => d.Happiness_Score),
    GDP_Per_Capita: d3.extent(happiness_data, (d) => d.GDP_Per_Capita),
    Social_Support: d3.extent(happiness_data, (d) => d.Social_Support),
    Life_Expectancy: d3.extent(happiness_data, (d) => d.Life_Expectancy),
    Freedom: d3.extent(happiness_data, (d) => d.Freedom),
    Generosity: d3.extent(happiness_data, (d) => d.Generosity),
    Government_Trust: d3.extent(happiness_data, (d) => d.Government_Trust),
  };

  function getCountryDataByYear(country, year, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].Name == country && data[i].Year == year) {
        return data[i];
      }
    }
  }

  colorScale = d3
    .scaleQuantize()
    .domain([
      ranges[category][0] - ranges[category][0] / 10,
      ranges[category][1] + ranges[category][1] / 10,
    ])
    .range(d3.schemeBlues[9]);

  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.countries).features)
    .enter()
    .append("path")
    .attr("fill", (d) => {
      let country = getCountryDataByYear(
        nameById.get(d.id),
        year,
        happiness_data
      );
      if (country) {
        return colorScale(country[category]);
      }
      return "gray";
    })
    .attr("d", path)
    .on("mouseover", function (d) {
      d3.select(this)
        .style("cursor", "pointer")
        .attr("stroke-width", 2)
        .attr("stroke", "#f55d5d");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "default")
        .attr("stroke-width", 0)
        .attr("stroke", "none");
    })

    .append("title")
    .text((d) => {
      let country = getCountryDataByYear(
        nameById.get(d.id),
        year,
        happiness_data
      );
      console.log(country);
      if (country) {
        return (
          "País: " +
          country.Country +
          "\n" +
          category +
          ": " +
          country[category]
        );
      }
      return "Dados indisponíveis";
    });

  svg
    .append("path")
    .datum(
      topojson.mesh(us, us.objects.land, function (a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", path);
}

function hideTooltip() {
  d3.select("#tooltip").classed("hidden", true);
}

function showTooltip(county_id, x, y) {
  const offset = 10;
  const t = d3.select("#tooltip");
  t.select("#taxa").text(rateById.get(county_id));
  t.select("#countyname").text(nameById.get(county_id));
  t.classed("hidden", false);
  const rect = t.node().getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (x + offset + w > width) {
    x = x - w;
  }
  t.style("left", x + offset + "px").style("top", y - h + "px");
}
