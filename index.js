const width = 960;
const height = 600;

let nameById = d3.map();
let IdByName = d3.map();
let myArr = [];

let us;
let happiness_data;
let ids;

let selectedCountry;
let mapCountry;
let selectedCountryYears = {
  2015: {},
  2016: {},
  2017: {},
  2018: {},
  2019: {},
  2020: {},
  2021: {},
};

let category = "Happiness_Score";
let year = 2021;
let proj = "Mercator";

var projection = d3.geoMercator();

let path = d3.geoPath().projection(projection);

let happiness_facts;
let yearHDim;
let avgByYearGroup;
let xScaleH;
let xFinalScale;
let varFreedom;
let varGdp;
let varGenerosity;
let varGovernmentTrust;
let varLifeExpectancy;
let varSocialSupport;

let lineChart;

let barChart1;
let barChart2;
let barChart3;
let barChart4;
let barChart5;
let barChart6;

function centerOnSouthAmerica() {
  projection = d3.geoMercator().scale(300).center([-70, -15]);
  path = d3.geoPath().projection(projection);
}

function centerOnEurope() {
  projection = d3.geoMercator().scale(500).center([20, 60]);
  path = d3.geoPath().projection(projection);
}

function centerOnAsia() {
  projection = d3.geoMercator().scale(500).center([80, 30]);
  path = d3.geoPath().projection(projection);
}

function centerOnAustraliaNZ() {
  projection = d3.geoMercator().scale(500).center([150, -30]);
  path = d3.geoPath().projection(projection);
}

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Lolipop Chart declaration Begin here!
// set the dimensions and margin_lolis of the graph
var margin_loli = { top: 10, right: 30, bottom: 40, left: 200 },
  width_loli = 460 - margin_loli.left - margin_loli.right,
  height_loli = 500 - margin_loli.top - margin_loli.bottom;

// append the svg_loli object to the body of the page
var svg_loli = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width_loli + margin_loli.left + margin_loli.right)
  .attr("height", height_loli + margin_loli.top + margin_loli.bottom);

svg_loli = svg_loli
  .append("g")
  .attr(
    "transform",
    "translate(" + margin_loli.left + "," + margin_loli.top + ")"
  );

var x_loli = d3.scaleLinear().domain([0, 10]).range([0, width_loli]);

var xAxis_loli = svg_loli
  .append("g")
  .attr("transform", "translate(0," + height_loli + ")")
  .call(d3.axisBottom(x_loli))
  .selectAll("text")
  .attr("transform", "translate(-10,0)rotate(-45)")
  .style("text-anchor", "end");

// Y axis
var y_loli = d3.scaleBand().range([0, height_loli]).padding(1);

var yAxis_loli = svg_loli.append("g").attr("class", "myYaxis");

// Lollipop Chart declaration ends here!

// Bar Chart Custom declaration starts here!
var margin_bar = { top: 20, right: 30, bottom: 40, left: 200 },
  width_bar = 460 - margin_bar.left - margin_bar.right,
  height_bar = 400 - margin_bar.top - margin_bar.bottom;

// append the svg object to the body of the page
var svg_bar = d3
  .select("#my_dataviz_bar")
  .append("svg")
  .attr("width", width_bar + margin_bar.left + margin_bar.right)
  .attr("height", height_bar + margin_bar.top + margin_bar.bottom)
  .append("g")
  .attr(
    "transform",
    "translate(" + margin_bar.left + "," + margin_bar.top + ")"
  );

// Bar Chart Custom declaration ends here!

// ParaLine Chart declaration starts here!

var margin_para_line = { top: 30, right: 10, bottom: 10, left: 50 },
  width_para_line = 500 - margin_para_line.left - margin_para_line.right,
  height_para_line = 400 - margin_para_line.top - margin_para_line.bottom;

// append the svg object to the body of the page
var svg_para_line = d3
  .select("#my_dataviz_para_line")
  .append("svg")
  .attr(
    "width",
    width_para_line + margin_para_line.left + margin_para_line.right
  )
  .attr(
    "height",
    height_para_line + margin_para_line.top + margin_para_line.bottom
  )
  .append("g")
  .attr(
    "transform",
    "translate(" + margin_para_line.left + "," + margin_para_line.top + ")"
  );

// ParaLine Chart declaration ends here!

// Spider chart declaration starts here!

var spider_width = window.innerWidth*0.20,
  spider_height = window.innerWidth*0.20;

// Config for the Radar chart
var spider_config = {
  w: spider_width,
  h: spider_height,
  maxValue: 1.5,
  levels: 5,
  ExtraWidthX: 300,
};

var spider_svg = d3
  .select("body")
  .selectAll("svg")
  .append("svg")
  .attr("width", spider_width)
  .attr("height", spider_height);

// Spider chart declaration ends here!

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

// Obtendo todos os dados
Promise.all(promises).then(ready);

document.getElementById("years").addEventListener("change", () => {
  year = +document.getElementById("years").value;
  ready([]);
});

document.getElementById("cat").addEventListener("change", () => {
  category = document.getElementById("cat").value;
  ready([]);
});

document.getElementById("proj").addEventListener("change", () => {
  proj = document.getElementById("proj").value;
  if (proj == "Mercator") {
    projection = d3.geoMercator();
  }
  if (proj == "Aitoff") {
    projection = d3.geoAitoff();
  }
  if (proj == "August") {
    projection = d3.geoAugust();
  }
  if (proj == "Azimuthal") {
    projection = d3.geoAzimuthalEqualArea();
  }
  if (proj == "Baker") {
    projection = d3.geoBaker();
  }
  if (proj == "Bertin") {
    projection = d3.geoBertin1953();
  }
  if (proj == "Bromley") {
    projection = d3.geoBromley();
  }
  if (proj == "Africa") {
    projection = d3.geoChamberlinAfrica();
  }
  if (proj == "Azimuthal_USA") {
    projection = d3.geoTwoPointAzimuthalUsa();
  }

  path = d3.geoPath().projection(projection);

  if (proj == "South_America") {
    centerOnSouthAmerica();
  }

  if (proj == "Europe") {
    centerOnEurope();
  }

  if (proj == "Asia") {
    centerOnAsia();
  }
  if (proj == "ANZ") {
    centerOnAustraliaNZ();
  }

  d3.selectAll("#map > svg > *").remove();
  ready([]);
});

// d3.geoAiry() / d3.geoAitoff() / d3.geoArmadillo() / d3.geoAugust() / d3.geoAzimuthalEqualArea() / d3.geoAzimuthalEquidistant()

function ready([local_us, local_happiness_data, local_ids]) {
  console.log("INSIDE READY");
  console.log(selectedCountryYears);
  console.log("OUTSIDE READY");
  if (happiness_facts) happiness_facts.remove(() => true);

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

  console.log("1");
  happiness_facts = crossfilter(happiness_data);
  yearHDim = happiness_facts.dimension((d) => d.Year);
  console.log("2");

  varFreedom = yearHDim.group().reduceSum((d) => {
    return d.Freedom / 158;
    if (!selectedCountry) {
      return d.Freedom / 158;
    }
    return selectedCountryYears[d.Year].Freedom / 158;
  });
  varGdp = yearHDim.group().reduceSum((d) => {
    if (!selectedCountry) {
      return d.GDP_Per_Capita / 158;
    }
    return selectedCountryYears[d.Year].GDP_Per_Capita / 158;
  });
  varGenerosity = yearHDim.group().reduceSum((d) => {
    if (!selectedCountry) {
      return d.Generosity / 158;
    }
    return selectedCountryYears[d.Year].Generosity / 158;
  });
  varGovernmentTrust = yearHDim.group().reduceSum((d) => {
    if (!selectedCountry) {
      return d.Government_Trust / 158;
    }
    return selectedCountryYears[d.Year].Government_Trust / 158;
  });
  varLifeExpectancy = yearHDim.group().reduceSum((d) => {
    if (!selectedCountry) {
      return d.Life_Expectancy / 158;
    }
    return selectedCountryYears[d.Year].Life_Expectancy / 158;
  });
  varSocialSupport = yearHDim.group().reduceSum((d) => {
    if (!selectedCountry) {
      return d.Social_Support / 158;
    }
    return selectedCountryYears[d.Year].Social_Support / 158;
  });
  console.log("3");

  avgByYearGroup = yearHDim.group().reduce(
    function (p, v) {
      if (selectedCountry && v.Country != selectedCountry.Country) {
        return p;
      }
      ++p.count;
      p.total += v.Happiness_Score;
      if (p.count == 0) {
        p.average = 0;
      } else {
        p.average = p.total / p.count;
      }
      return p;
    },
    // remove
    function (p, v) {
      if (selectedCountry && v.Country != selectedCountry.Country) {
        return p;
      }
      --p.count;
      p.total -= v.Happiness_Score;
      if (p.count == 0) {
        p.average = 0;
      } else {
        p.average = p.total / p.count;
      }
      return p;
    },
    // initial
    function () {
      return {
        count: 0,
        total: 0,
        average: 0,
      };
    }
  );

  xScaleH = d3
    .scaleLinear()
    .domain([yearHDim.bottom(1)[0].Year - 0.5, yearHDim.top(1)[0].Year + 0.5]);

  xFinalScale = d3.scaleBand().domain(
    varFreedom
      .top(Infinity)
      .sort((a, b) => a.key - b.key)
      .map((d) => d.key)
  );

  loadMap();
  loadSpider();
  loadParaLine();
  loadLine();
  loadBar();
  loadLoli();
  loadRankBar();
}

function loadMap() {
  if (
    selectedCountry &&
    mapCountry &&
    selectedCountry.Country != mapCountry.Country
  ) {
    d3.select(".selected_country").classed("selected_country", false);
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
    .range(d3.schemeRdYlBu[7]);

  svg.attr("fill", "gray").attr("background-color", "gray");

  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.countries).features)
    .enter()
    .append("path")
    .attr("stroke-width", 0.5)
    .attr("stroke", "#000000")
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

      const rect = this.getBoundingClientRect();

      let country = getCountryDataByYear(
        nameById.get(d.id),
        year,
        happiness_data
      );

      if (country) {
        showTooltip(
          country.Country,
          country[category],
          category,
          d3.event.pageX,
          d3.event.pageY
        );
      } else {
        showTooltip("Dados não disponíveis", null, null, rect.x, rect.y);
      }
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("cursor", "default")
        .attr("stroke-width", 0.5)
        .attr("stroke", "#000000");
      hideTooltip();
    })
    .on("click", function (d) {
      let country = getCountryDataByYear(
        nameById.get(d.id),
        year,
        happiness_data
      );

      d3.select(".selected_country").classed("selected_country", false);
      if (country && selectedCountry && selectedCountry.Name === country.Name) {
        selectedCountry = null;
        mapCountry = null;
      } else {
        d3.select(this).classed("selected_country", true);
        selectedCountry = country;
        mapCountry = country;
      }

      updateSelectedCountry();
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

function showTooltip(country_name, country_value, cat, x, y) {
  const offset = 10;
  const t = d3.select("#tooltip");

  t.select("#country_name").text(country_name);
  if (country_name != "Dados não disponíveis") {
    t.select("#country_cat").text(cat + ":");
    t.select("#country_value").text(country_value);
  } else {
    t.select("#country_cat").text("");
    t.select("#country_value").text("");
  }

  t.classed("hidden", false);
  const rect = t.node().getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (x + offset + w > width) {
    x = x - w;
  }
  t.style("left", x + "px").style("top", y + h / 2 + "px");
}

function updateSelectedCountry() {
  if (selectedCountry) {
    document.getElementById("selected_country_div").className = "";
    document.getElementById("selected_country").innerText =
      selectedCountry.Country;
    document.getElementsByClassName("titleLine")[0].innerText =
      "Média de felicidade do País: " + selectedCountry.Country;

    for (let i = 0; i < happiness_data.length; i++) {
      if (happiness_data[i].Country == selectedCountry.Country) {
        selectedCountryYears[happiness_data[i].Year] = happiness_data[i];
      }
    }
  } else {
    document.getElementById("selected_country_div").className = "hidden";
    document.getElementsByClassName("titleLine")[0].innerText =
      "Média de felicidade Mundial";
  }
  console.log("TEST")

  ready([]);
}
function loadLine() {
  lineChart = dc.lineChart("#line_chart");
  lineChart
    .width(window.innerWidth*0.5)
    .height(500)
    .dimension(yearHDim)
    .margins({ top: 30, right: 50, bottom: 25, left: 40 })
    .renderArea(false)
    .x(xScaleH)
    .renderHorizontalGridLines(true)
    .legend(
      dc
        .legend()
        .x(width - 200)
        .y(10)
        .itemHeight(13)
        .gap(5)
    )
    .group(avgByYearGroup, "Happiness_Score médio")
    .renderLabel(true)
    .brushOn(false)
    .yAxisLabel("Média de Happiness Score")
    .xAxisLabel("Anos")
    .ordinalColors(["darkorange"])
    .valueAccessor(function (d) {
      return d.value.average;
    })
    .y(d3.scaleLinear().domain([0, 10]))
    .renderDataPoints({ radius: 5, fillOpacity: 0.8, strokeOpacity: 0.0 })
    .xAxis()
    .tickFormat((d) => (d % 1 ? null : d));

  dc.renderAll();
}

function loadBar() {
  if (barChart1) barChart1.resetSvg();
  barChart1 = dc.barChart("#bar_chart_1");

  barChart1
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 40 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varFreedom, "Média de Freedom")
    .xUnits(dc.units.ordinal)
    .yAxisLabel("Pontuação média")
    .colors("#4E79A7");

  if (barChart2) barChart2.resetSvg();
  barChart2 = dc.barChart("#bar_chart_2");

  barChart2
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 10 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varGdp, "Média de GDP")
    .xUnits(dc.units.ordinal)
    .colors("#F28E2B");

  if (barChart3) barChart3.resetSvg();
  barChart3 = dc.barChart("#bar_chart_3");

  barChart3
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 10 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varGenerosity, "Média de Generosidade")
    .xUnits(dc.units.ordinal)
    .colors("#E15759");

  if (barChart4) barChart4.resetSvg();
  barChart4 = dc.barChart("#bar_chart_4");

  barChart4
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 40 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varGovernmentTrust, "Média de Confiança no Governo")
    .xUnits(dc.units.ordinal)
    .yAxisLabel("Pontuação média")
    .colors("#76B7B2");

  if (barChart5) barChart5.resetSvg();
  barChart5 = dc.barChart("#bar_chart_5");

  barChart5
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 10 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varLifeExpectancy, "Média de Expectativa de Vida")
    .xUnits(dc.units.ordinal)
    .colors("#59A14F");

  if (barChart6) barChart6.resetSvg();
  barChart6 = dc.barChart("#bar_chart_6");

  barChart6
    .width(400)
    .height(400)
    .dimension(yearHDim)
    .gap(5)
    .margins({ top: 30, right: 10, bottom: 25, left: 10 })
    .x(xFinalScale)
    .y(d3.scaleLinear().domain([0, 2]))
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(200 / 2))
    .brushOn(false)
    .group(varSocialSupport, "Média de Suporte Social")
    .xUnits(dc.units.ordinal)
    .colors("#EDC948");

  dc.renderAll();
}

function loadLoli() {
  regions = {};

  filtered_data = happiness_data
    .filter((d) => d.Year == year)
    .sort((a, b) => a[category] - b[category]);

  for (let i of filtered_data) {
    if (regions[i.Region]) {
      regions[i.Region].count += 1;
      regions[i.Region].scoreTotal += i[category];
    } else {
      regions[i.Region] = {
        count: 1,
        scoreTotal: i[category],
      };
    }
  }

  regions_data = [];

  for (let i in regions) {
    regions_data.push({
      Region: i,
      Score: regions[i].scoreTotal / regions[i].count,
    });
  }

  regions_data = regions_data.sort((a, b) => b.Score - a.Score);

  console.log(regions_data);

  y_loli.domain(
    regions_data.map(function (d) {
      return d.Region;
    })
  );
  yAxis_loli.transition().duration(1000).call(d3.axisLeft(y_loli));

  xAxis_loli.transition().duration(1000).call(d3.axisBottom(x_loli));

  var j_loli = svg_loli.selectAll(".myLine").data(regions_data);
  // update lines
  j_loli
    .enter()
    .append("line")
    .attr("class", "myLine")
    .merge(j_loli)
    .transition()
    .duration(1000)
    .attr("x1", function (d) {
      return x_loli(d.Score);
    })
    .attr("x2", x_loli(0))
    .attr("y1", function (d) {
      return y_loli(d.Region);
    })
    .attr("y2", function (d) {
      return y_loli(d.Region);
    })
    .attr("stroke", "grey");

  var u_loli = svg_loli.selectAll("circle").data(regions_data);

  u_loli
    .enter()
    .append("circle")
    .merge(u_loli)
    .transition()
    .duration(1000)
    .attr("cx", function (d) {
      return x_loli(d.Score);
    })
    .attr("cy", function (d) {
      return y_loli(d.Region);
    })
    .attr("r", "7")
    .style("fill", "#69b3a2")
    .attr("stroke", "black");
}

function loadRankBar() {
  // filtering and sorting
  let filtered_data = happiness_data
    .filter((d) => d.Year == year)
    .sort((a, b) => b.Happiness_Score - a.Happiness_Score);

  let customCountry = selectedCountry;
  if (!customCountry) {
    customCountry = filtered_data[0];
  }

  selectedIndex = filtered_data.findIndex(
    (d) => d.Country == customCountry.Country
  );

  console.log(selectedIndex);
  console.log(filtered_data[selectedIndex]);
  console.log(filtered_data.length);

  if (selectedIndex <= 3) {
    filtered_data = filtered_data.slice(0, 7);
  } else if (selectedIndex >= 155) {
    filtered_data = filtered_data.slice(151, 158);
  } else {
    filtered_data = filtered_data.slice(selectedIndex - 3, selectedIndex + 4);
  }

  console.log(filtered_data);

  // Add X axis
  var x_bar = d3
    .scaleLinear()
    .domain([
      filtered_data[6].Happiness_Score - 0.5,
      filtered_data[0].Happiness_Score + 0.5,
    ])
    .range([0, width_bar]);

  svg_bar.selectAll("text").remove();
  svg_bar.selectAll("rect").remove();
  svg_bar.selectAll("g").remove();

  svg_bar
    .append("g")
    .attr("transform", "translate(0," + height_bar + ")")
    .call(d3.axisBottom(x_bar))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Y axis
  var y_bar = d3
    .scaleBand()
    .range([0, height_bar])
    .domain(
      filtered_data.map(function (d) {
        return d.Country;
      })
    )
    .padding(0.1);

  svg_bar.append("g").call(d3.axisLeft(y_bar));

  //Bars
  svg_bar
    .selectAll("myRectBar")
    .data(filtered_data)
    .enter()
    .append("rect")
    .attr("x", x_bar(filtered_data[6].Happiness_Score - 0.493))
    .attr("y", function (d) {
      return y_bar(d.Country);
    })
    .attr("width", function (d) {
      return x_bar(d.Happiness_Score);
    })
    .attr("height", y_bar.bandwidth())
    .attr("class", "clickable")
    .on("click", (d) => {
      selectedCountry = d;
      updateSelectedCountry();
    })
    .attr("fill", "#69b3a2")
    .append("title")
    .text(function (d) {
      return `Happiness Score: ${d.Happiness_Score}`;
    });

  svg_bar
    .selectAll("myRectBar")
    .data(filtered_data)
    .enter()
    .append("text")
    .attr("x", function (d) {
      return x_bar(d.Happiness_Score) + 20;
    })
    .attr("y", function (d) {
      return y_bar(d.Country) + 25;
    })
    .attr("text-anchor", "middle")
    .text(function (d) {
      return `${d.Happiness_Rank}°`;
    });
}

function loadParaLine() {
  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  dimensions = ["Pais", 2015, 2016, 2017, 2018, 2019, 2020, 2021];

  svg_para_line.selectAll("text").remove();
  svg_para_line.selectAll("rect").remove();
  svg_para_line.selectAll("line").remove();
  svg_para_line.selectAll("path").remove();
  svg_para_line.selectAll("g").remove();

  let correct_data = {};
  let countries = [];

  for (let i = 0; i < happiness_data.length; i++) {
    if (!correct_data[happiness_data[i].Country]) {
      correct_data[happiness_data[i].Country] = {
        Pais: 0,
        2015: 0,
        2016: 0,
        2017: 0,
        2018: 0,
        2019: 0,
        2020: 0,
        2021: 0,
        Country: happiness_data[i].Country,
      };
      countries.push(happiness_data[i].Country);
    }
    correct_data[happiness_data[i].Country][happiness_data[i].Year] =
      +happiness_data[i].Happiness_Rank;
    if (happiness_data[i].Year == 2015) {
      correct_data[happiness_data[i].Country].Pais =
        +happiness_data[i].Happiness_Rank;
    }
  }

  correct_data = Object.values(correct_data).sort(
    (a, b) => a["2015"] - b["2015"]
  );
  console.log(correct_data);

  let local_selected_contry = selectedCountry
    ? selectedCountry
    : correct_data[0]["2015"];

  // Descobrindo o índice do país selecionado
  let selectedIndex = correct_data.findIndex(
    (d) => d.Country == local_selected_contry.Country
  );

  if (selectedIndex <= 3) {
    correct_data = correct_data.slice(0, 7);
  } else if (selectedIndex >= 155) {
    correct_data = correct_data.slice(151, 158);
  } else {
    correct_data = correct_data.slice(selectedIndex - 3, selectedIndex + 4);
  }

  let values = [];
  // Vamos descobrir qual é o maior ranking que aparece, no início, faremos de 1 a 10, e aumentamos se necessário
  for (let i = 0; i < correct_data.length; i++) {
    console.log(Object.values(correct_data[i]));
    values = [...values, ...Object.values(correct_data[i]).slice(0, 7)];
  }

  // [TODO] ALTERAR COMO ESSA COR ESTÁ DEFINIDA, ISSO VAI QUEBRAR, PaisCISO USAR OS DADOS DEPOIS DE FILTRAR
  let color = d3
    .scaleOrdinal()
    .domain([countries])
    .range([
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#ff7f00",
      "#e31a1c",
      "#fdbf6f",
      "#fb9a99",
      "#cab2d6",
      "#6a3d9a",
    ]);

  console.log(values);

  let [minRank, maxRank] = d3.extent(values);
  console.log(minRank);
  console.log(maxRank);

  // For each dimension, I build a linear scale. I store all in a y object
  var y = {};
  for (i in dimensions) {
    name = dimensions[i];
    if (name == "Pais") {
      y[name] = d3
        .scaleLinear()
        .domain([correct_data[0]["2015"], correct_data[0]["2015"] + 6])
        .range([0, height_para_line]);
    } else {
      y[name] = d3
        .scaleLinear()
        .domain([minRank, maxRank])
        .range([0, height_para_line]);
    }
  }

  console.log(y["2015"](1));

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint().range([0, width_para_line]).padding(1).domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    console.log(d);
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y[p](d[p])];
      })
    );
  }

  // Draw the lines
  svg_para_line
    .selectAll("myPath")
    .data(correct_data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", (d) => {
      return color(d.Country);
    })
    .style("opacity", (d) => {
      if (d.Country == local_selected_contry.Country) {
        return 1;
      }
      return 0.3;
    })
    .attr("stroke-width", (d) => {
      if (d.Country == local_selected_contry.Country) {
        return 6;
      }
      return 3;
    })
    .on("mouseover", function (d) {
      d3.select(this)
        .style("fill", "none")
        .attr("stroke-width", 10)
        .style("opacity", 1);
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .style("fill", "none")
        .attr("stroke-width", (d) => {
          if (d.Country == local_selected_contry.Country) {
            return 6;
          }
          return 3;
        })
        .style("opacity", (d) => {
          if (d.Country == local_selected_contry.Country) {
            return 1;
          }
          return 0.3;
        });
    })
    .on("click", (d) => {
      console.log(d);
    });
  let test = -1;
  // Draw the axis:
  svg_para_line
    .selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions)
    .enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    // And I build the axis with the call function
    .each(function (d) {
      d3.select(this).call(
        d3.axisLeft(y[d]).tickFormat((d) => {
          if (d % 1 == 0 && test < 6) {
            test += 1;
            return `${correct_data[test].Country} : ${d}`;
          } else if (d % 1 == 0) {
            return d;
          }
          return "";
        })
      );
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "black");
}

function loadSpider() {
  let custom_data = [];

  const country = selectedCountry?selectedCountry.Country:"Iceland";
  const numberOfContries = 158;

  let splitedData = {};
  let meanData = {};

  /*
      Vamos agrupar nossos dados por anos entre 2015 e 2021
      Cada ano terá as métricas que queremos e servirá como acumulador
  */
  happiness_data.map((element) => {
    if (!(element.Year in splitedData)) {
      splitedData[element.Year] = {
        Freedom: Number(element["Freedom"]),
        GDP_Per_Capita: Number(element["GDP_Per_Capita"]),
        Generosity: Number(element["Generosity"]),
        Government_Trust: Number(element["Government_Trust"]),
        Life_Expectancy: Number(element["Life_Expectancy"]),
        Social_Support: Number(element["Social_Support"]),
      };
    } else {
      splitedData[element.Year] = {
        Freedom:
          Number(splitedData[element.Year]["Freedom"]) +
          Number(element["Freedom"]),
        GDP_Per_Capita:
          Number(splitedData[element.Year]["GDP_Per_Capita"]) +
          Number(element["GDP_Per_Capita"]),
        Generosity:
          Number(splitedData[element.Year]["Generosity"]) +
          Number(element["Generosity"]),
        Government_Trust:
          Number(splitedData[element.Year]["Government_Trust"]) +
          Number(element["Government_Trust"]),
        Life_Expectancy:
          Number(splitedData[element.Year]["Life_Expectancy"]) +
          Number(element["Life_Expectancy"]),
        Social_Support:
          Number(splitedData[element.Year]["Social_Support"]) +
          Number(element["Social_Support"]),
      };
    }
  });

  /*
      Aqui iremos armazenar a média de cada ano
      baseado no acumulador calculado acima
  */
  for (const [key, value] of Object.entries(splitedData)) {
    meanData[key] = {
      Freedom: splitedData[key]["Freedom"] / numberOfContries,
      GDP_Per_Capita: splitedData[key]["GDP_Per_Capita"] / numberOfContries,
      Generosity: splitedData[key]["Generosity"] / numberOfContries,
      Government_Trust: splitedData[key]["Government_Trust"] / numberOfContries,
      Life_Expectancy: splitedData[key]["Life_Expectancy"] / numberOfContries,
      Social_Support: splitedData[key]["Social_Support"] / numberOfContries,
    };
  }

  let filteredRegistry = {};

  if (country != "") {
    filteredRegistry = happiness_data.filter((element) => {
      if (element.Year == year && element.Country == country) {
        return element;
      }
    });
  }

  const meanConverted = [];
  const selectedCountryConverted = [];

  for (const [key, value] of Object.entries(meanData[year])) {
    meanConverted.push({
      area: key,
      value: value,
    });

    selectedCountryConverted.push({
      area: key,
      value: filteredRegistry[0][key],
    });
  }

  custom_data.push(meanConverted);
  if(selectedCountry){
    custom_data.push(selectedCountryConverted);
  }

  var RadarChart = {
    draw: function (id, d, options) {
      var cfg = {
        radius: 5,
        w: window.innerWidth*0.5,
        h: 600,
        factor: 1,
        factorLegend: 0.85,
        levels: 3,
        maxValue: 0,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
        ToRight: 5,
        TranslateX: 80,
        TranslateY: 30,
        ExtraWidthX: 100,
        ExtraWidthY: 100,
        color: d3.scaleOrdinal().range(["#6F257F", "#CA0D59"]),
      };

      if ("undefined" !== typeof options) {
        for (var i in options) {
          if ("undefined" !== typeof options[i]) {
            cfg[i] = options[i];
          }
        }
      }

      cfg.maxValue = 1.5;

      var allAxis = d[0].map(function (i, j) {
        return i.area;
      });
      var total = allAxis.length;
      var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
      var Format = d3.format("%");
      d3.select(id).select("svg").remove();

      var g = d3
        .select(id)
        .append("svg")
        .attr("width", cfg.w + cfg.ExtraWidthX)
        .attr("height", cfg.h + cfg.ExtraWidthY)
        .append("g")
        .attr(
          "transform",
          "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")"
        );

      var spider_tooltip;

      //Circular segments
      for (var j = 0; j < cfg.levels; j++) {
        var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels")
          .data(allAxis)
          .enter()
          .append("svg:line")
          .attr("x1", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("y1", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
            );
          })
          .attr("x2", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.sin(((i + 1) * cfg.radians) / total))
            );
          })
          .attr("y2", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.cos(((i + 1) * cfg.radians) / total))
            );
          })
          .attr("class", "line")
          .style("stroke", "grey")
          .style("stroke-opacity", "0.75")
          .style("stroke-width", "0.3px")
          .attr(
            "transform",
            "translate(" +
              (cfg.w / 2 - levelFactor) +
              ", " +
              (cfg.h / 2 - levelFactor) +
              ")"
          );
      }

      //Text indicating at what % each level is
      for (var j = 0; j < cfg.levels; j++) {
        var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels")
          .data([1]) //dummy data
          .enter()
          .append("svg:text")
          .attr("x", function (d) {
            return levelFactor * (1 - cfg.factor * Math.sin(0));
          })
          .attr("y", function (d) {
            return levelFactor * (1 - cfg.factor * Math.cos(0));
          })
          .attr("class", "legend")
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .attr(
            "transform",
            "translate(" +
              (cfg.w / 2 - levelFactor + cfg.ToRight) +
              ", " +
              (cfg.h / 2 - levelFactor) +
              ")"
          )
          .attr("fill", "#737373")
          .text(((j + 1) * 1.5) / cfg.levels);
      }

      series = 0;

      var axis = g
        .selectAll(".spider_axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "spider_axis");

      axis
        .append("line")
        .attr("x1", cfg.w / 2)
        .attr("y1", cfg.h / 2)
        .attr("x2", function (d, i) {
          return (
            (cfg.w / 2) * (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
          );
        })
        .attr("y2", function (d, i) {
          return (
            (cfg.h / 2) * (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
          );
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

      axis
        .append("text")
        .attr("class", "legend")
        .text(function (d) {
          return d;
        })
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("transform", function (d, i) {
          return "translate(0, -10)";
        })
        .attr("x", function (d, i) {
          return (
            (cfg.w / 2) *
              (1 - cfg.factorLegend * Math.sin((i * cfg.radians) / total)) -
            60 * Math.sin((i * cfg.radians) / total)
          );
        })
        .attr("y", function (d, i) {
          return (
            (cfg.h / 2) * (1 - Math.cos((i * cfg.radians) / total)) -
            20 * Math.cos((i * cfg.radians) / total)
          );
        });

      d.forEach(function (y, x) {
        dataValues = [];
        g.selectAll(".nodes").data(y, function (j, i) {
          dataValues.push([
            (cfg.w / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total)),
            (cfg.h / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total)),
          ]);
        });
        dataValues.push(dataValues[0]);
        g.selectAll(".area")
          .data([dataValues])
          .enter()
          .append("polygon")
          .attr("class", "radar-chart-serie" + series)
          .style("stroke-width", "2px")
          .style("stroke", cfg.color(series))
          .attr("points", function (d) {
            var str = "";
            for (var pti = 0; pti < d.length; pti++) {
              str = str + d[pti][0] + "," + d[pti][1] + " ";
            }
            return str;
          })
          .style("fill", function (j, i) {
            return cfg.color(series);
          })
          .style("fill-opacity", cfg.opacityArea)
          .on("mouseover", function (d) {
            z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
            g.selectAll(z).transition(200).style("fill-opacity", 0.7);
          })
          .on("mouseout", function () {
            g.selectAll("polygon")
              .transition(200)
              .style("fill-opacity", cfg.opacityArea);
          });
        series++;
      });
      series = 0;

      var spider_tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "spider_toolTip");
      d.forEach(function (y, x) {
        g.selectAll(".nodes")
          .data(y)
          .enter()
          .append("svg:circle")
          .attr("class", "radar-chart-serie" + series)
          .attr("r", cfg.radius)
          .attr("alt", function (j) {
            return Math.max(j.value, 0);
          })
          .attr("cx", function (j, i) {
            dataValues.push([
              (cfg.w / 2) *
                (1 -
                  (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.sin((i * cfg.radians) / total)),
              (cfg.h / 2) *
                (1 -
                  (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.cos((i * cfg.radians) / total)),
            ]);
            return (
              (cfg.w / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("cy", function (j, i) {
            return (
              (cfg.h / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total))
            );
          })
          .attr("data-id", function (j) {
            return j.area;
          })
          .style("fill", "#fff")
          .style("stroke-width", "2px")
          .style("stroke", cfg.color(series))
          .style("fill-opacity", 0.9)
          .on("mouseover", function (d) {
            console.log(d.area);
            spider_tooltip
              .style("left", d3.event.pageX - 80 + "px")
              .style("top", d3.event.pageY - 80 + "px")
              .style("display", "inline-block")
              .html(d.area + "<br><span>" + d.value + "</span>");
          })
          .on("mouseout", function (d) {
            spider_tooltip.style("display", "none");
          });

        series++;
      });
    },
  };

  RadarChart.draw("#chart", custom_data, spider_config);
}
