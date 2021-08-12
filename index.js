const width = 960;
const height = 600;

let nameById = d3.map();
let IdByName = d3.map();
let myArr = [];

let us;
let happiness_data;
let ids;

let selectedCountry;
let selectedCountryYears = {
  2015: {},
  2016: {},
  2017: {},
  2018: {},
  2019: {},
  2020: {},
  2021: {}
}

let category = "Happiness_Score";
let year = 2021;

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

function ready([local_us, local_happiness_data, local_ids]) {
  console.log("INSIDE READY")
  console.log(selectedCountryYears)
  console.log("OUTSIDE READY")
  if(happiness_facts)
    happiness_facts.remove(() => true);

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

  console.log("1")
  happiness_facts = crossfilter(happiness_data);
  yearHDim = happiness_facts.dimension((d) => d.Year);
  console.log("2")


  varFreedom = yearHDim.group().reduceSum( d  => {
    return d.Freedom/158;
    if(!selectedCountry){
      return d.Freedom/158;
    }
    return selectedCountryYears[d.Year].Freedom/158;
  })
  varGdp = yearHDim.group().reduceSum( d  => {
    if(!selectedCountry){
      return d.GDP_Per_Capita/158;
    }
    return selectedCountryYears[d.Year].GDP_Per_Capita/158;
  })
  varGenerosity = yearHDim.group().reduceSum( d  => {
    if(!selectedCountry){
      return d.Generosity/158;
    }
    return selectedCountryYears[d.Year].Generosity/158;
  })
  varGovernmentTrust = yearHDim.group().reduceSum( d  => {
    if(!selectedCountry){
      return d.Government_Trust/158;
    }
    return selectedCountryYears[d.Year].Government_Trust/158;
  })
  varLifeExpectancy = yearHDim.group().reduceSum( d  => {
    if(!selectedCountry){
      return d.Life_Expectancy/158;
    }
    return selectedCountryYears[d.Year].Life_Expectancy/158;
  })
  varSocialSupport = yearHDim.group().reduceSum( d  => {
    if(!selectedCountry){
      return d.Social_Support/158;
    }
    return selectedCountryYears[d.Year].Social_Support/158;
  })
  console.log("3")

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

  xScaleH = d3.scaleLinear()
        .domain([yearHDim.bottom(1)[0].Year - 0.5, yearHDim.top(1)[0].Year + 0.5]);

  
  xFinalScale = d3.scaleBand().domain(varFreedom.top(Infinity).sort((a, b) => a.key-b.key).map(d => d.key));

  console.log("4")
  loadMap();
  console.log("5")
  loadLine();
  console.log("6")
  loadBar();
  console.log("7")
}

function loadMap() {
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
  
  d3.selectAll("svg > *").remove()
  
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
        .attr("stroke-width", 0)
        .attr("stroke", "none");
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
      } else {
        d3.select(this).classed("selected_country", true);
        selectedCountry = country;
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
    document.getElementById("selected_country").innerText = selectedCountry.Country;
    document.getElementById("line_chart_title").innerText =  "Média de felicidade do País: " + selectedCountry.Country;

    for(let i = 0; i < happiness_data.length; i++){
      if(happiness_data[i].Country == selectedCountry.Country){
        selectedCountryYears[happiness_data[i].Year] = happiness_data[i];
      }
    }

  } else {
    document.getElementById("selected_country_div").className = "hidden";
    document.getElementById("line_chart_title").innerText =  "Média de felicidade Mundial";
  }
  
  ready([]);
}

function loadLine() {  
  
  dc.redrawAll();
  if (lineChart)
    lineChart.resetSvg();
  lineChart = dc.lineChart("#line_chart");
  lineChart
    .width(width)
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


    //dc.renderAll()
}


function loadBar(){

  if (barChart1)
    barChart1.resetSvg();
  barChart1 = dc.barChart("#bar_chart_1")
  
  barChart1.width(400)
           .height(400)
           .dimension(yearHDim)
           .gap(1)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .x(xFinalScale)
           .y(d3.scaleLinear().domain([0, 2]))
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(200/2))
           .brushOn(false)
           .group(varFreedom, 'Média de Freedom')
           .xUnits(dc.units.ordinal)
           .yAxisLabel("Pontuação média")
           .colors('#4E79A7')
          
           

  if (barChart2)
    barChart2.resetSvg();
  barChart2 = dc.barChart("#bar_chart_2")
  
  barChart2.width(400)
           .height(400)
           .dimension(yearHDim)
           .gap(1)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .x(xFinalScale)
           .y(d3.scaleLinear().domain([0, 2]))
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(200/2))
           .brushOn(false)
           .group(varGdp, 'Média de GDP')
           .xUnits(dc.units.ordinal)
           .colors('#F28E2B')
  
  if (barChart3)
    barChart3.resetSvg();
  barChart3 = dc.barChart("#bar_chart_3")
  
  barChart3.width(400)
          .height(400)
          .dimension(yearHDim)
          .gap(1)
          .margins({top: 30, right: 50, bottom: 25, left: 40})
          .x(xFinalScale)
          .y(d3.scaleLinear().domain([0, 2]))
          .renderHorizontalGridLines(true)
          .legend(dc.legend().x(200/2))
          .brushOn(false)
          .group(varGenerosity, 'Média de Generosidade')
          .xUnits(dc.units.ordinal)
          .colors('#E15759')

          
  
  if (barChart4)
    barChart4.resetSvg();
  barChart4 = dc.barChart("#bar_chart_4")

  barChart4.width(400)
           .height(400)
           .dimension(yearHDim)
           .gap(1)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .x(xFinalScale)
           .y(d3.scaleLinear().domain([0, 2]))
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(200/2))
           .brushOn(false)
           .group(varGovernmentTrust, 'Média de Confiança no Governo')
           .xUnits(dc.units.ordinal)
           .colors('#76B7B2')

    
  
  if (barChart5)
    barChart5.resetSvg();
  barChart5 = dc.barChart("#bar_chart_5")

  barChart5.width(400)
           .height(400)
           .dimension(yearHDim)
           .gap(1)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .x(xFinalScale)
           .y(d3.scaleLinear().domain([0, 2]))
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(200/2))
           .brushOn(false)
           .group(varLifeExpectancy, 'Média de Expectativa de Vida')
           .xUnits(dc.units.ordinal)
           .colors('#59A14F')

  
  if(barChart6)
    barChart6.resetSvg();
  barChart6 = dc.barChart("#bar_chart_6")  

  barChart6.width(400)
           .height(400)
           .dimension(yearHDim)
           .gap(1)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .x(xFinalScale)
           .y(d3.scaleLinear().domain([0, 2]))
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(200/2))
           .brushOn(false)
           .group(varSocialSupport, 'Média de Suporte Social')
           .xUnits(dc.units.ordinal)
           .colors('#EDC948')

  dc.renderAll()
}