const tooltipContainer = document.getElementById('tooltip-container');
const tooltipWidth = 300;
const tooltipHeight = 110;
const tooltipDistanceConsonant = 20;
const tooltipDistanceRight = tooltipDistanceConsonant;
const tooltipDistanceLeft = -(tooltipWidth + tooltipDistanceConsonant);
const tooltipDistanceTop = -(tooltipHeight / 2);
const pagePadding = 20;

const setHorizontalDistance = (x) => {
  const { width: clientWidth } = document.body.getBoundingClientRect();

  if (x + tooltipDistanceRight + tooltipWidth + pagePadding > clientWidth) {
    return tooltipDistanceLeft;
  }

  return tooltipDistanceRight;
};

const formatTooltipText = (name, category, value) =>
  `Name: ${name}<br />Category: ${category}<br />Value: ${value}`;

const drawTooltip = (event, data) => {
  const { clientX, clientY } = event;
  const distance = setHorizontalDistance(clientX);

  const tooltip = d3
    .create('div')
    .attr('id', 'tooltip')
    .attr('data-value', data.value)
    .style('top', `${clientY + tooltipDistanceTop}px`)
    .style('left', `${clientX + distance}px`)
    .join('p')
    .html(formatTooltipText(data.name, data.category, data.value));

  tooltipContainer.appendChild(tooltip.node());
};

const updateTooltipLocation = (event) => {
  const { clientX, clientY } = event;
  const distance = setHorizontalDistance(clientX);

  d3.select('#tooltip')
    .style('top', `${clientY + tooltipDistanceTop}px`)
    .style('left', `${clientX + distance}px`);
};

const removeTooltip = () => {
  tooltipContainer.innerHTML = '';
};

const drawChart = async () => {
  const data = await d3.json(
    'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  );

  const svgContainer = document.getElementById('svg-container');

  const { height: HEIGHT, width: WIDTH } = svgContainer.getBoundingClientRect();
  const TOP_PADDING = 50;
  const BOTTOM_PADDING = 150;
  const LEFT_PADDING = 40;
  const RIGHT_PADDING = 40;

  const treemapSvg = d3
    .create('svg')
    .attr('width', WIDTH - (LEFT_PADDING + RIGHT_PADDING))
    .attr('height', HEIGHT - (TOP_PADDING + BOTTOM_PADDING))
    .attr('transform', `translate(${LEFT_PADDING}, ${TOP_PADDING})`);

  const legendSvg = d3
    .create('svg')
    .attr('width', WIDTH - (LEFT_PADDING + RIGHT_PADDING))
    .attr('height', BOTTOM_PADDING)
    .attr('transform', `translate(${LEFT_PADDING}, ${TOP_PADDING})`);

  const root = d3
    .hierarchy(data)
    .sum((data) => data.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  const colorDomain = root.data.children.map((child) => child.name);
  const colorRange = [...d3.schemeTableau10, ...d3.schemeSet3];
  const colorScale = d3.scaleOrdinal().domain(colorDomain).range(colorRange);

  const treemap = d3
    .treemap()
    .size([
      WIDTH - (LEFT_PADDING + RIGHT_PADDING),
      HEIGHT - (TOP_PADDING + BOTTOM_PADDING),
    ])
    .paddingInner(1);

  treemap(root);

  treemapSvg
    .selectAll('rect')
    .data(root.leaves())
    .join('g')
    .attr('class', 'tile-container')
    .attr('transform', ({ x0, y0 }) => `translate(${x0}, ${y0})`)
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', ({ data }) => data.name)
    .attr('data-category', ({ data }) => data.category)
    .attr('data-value', ({ data }) => data.value)
    .attr('width', ({ x0, x1 }) => x1 - x0)
    .attr('height', ({ y0, y1 }) => y1 - y0)
    .style('fill', ({ data }) => colorScale(data.category))
    .on('mouseover', (event, { data }) => drawTooltip(event, data))
    .on('mousemove', (event) => updateTooltipLocation(event))
    .on('mouseout', () => removeTooltip());

  treemapSvg
    .selectAll('.tile-container')
    .append('text')
    .attr('class', 'tile-title')
    .html(({ data }) =>
      data.name.split(' ').reduce((htmlText, namePart, namePartIndex) => {
        return (htmlText += `<tspan x="5" y="${
          10 * (namePartIndex + 1)
        }">${namePart}</tspan>`);
      }, '')
    );

  legendSvg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(5, 15)')
    .selectAll('g')
    .data(colorDomain)
    .join('g')
    .attr(
      'transform',
      (_, index) =>
        `translate(${Math.floor(index / 4) * 120}, ${(index % 4) * 30})`
    )
    .append('rect')
    .attr('class', 'legend-item')
    .style('fill', colorScale);

  legendSvg
    .select('#legend')
    .selectAll('g')
    .append('text')
    .attr('transform', 'translate(25, 15)')
    .text((data) => data);

  svgContainer.appendChild(treemapSvg.node());
  svgContainer.appendChild(legendSvg.node());
};

drawChart();
