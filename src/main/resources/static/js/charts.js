// Initialize chart
let chartInstance = null;
const chartContainer = document.getElementById('chart-container');
const chartTypeSelector = document.getElementById('chart-type');
const refreshButton = document.getElementById('refresh-btn');

// Function to initialize the chart
function initChart() {
    if (chartInstance) {
        chartInstance.dispose();
    }
    
    chartInstance = echarts.init(chartContainer);
    chartInstance.showLoading();
    
    // Get selected chart type
    const chartType = chartTypeSelector.value;
    
    // Fetch data from the server
    fetchChartData(chartType);
}

// Function to fetch chart data from the server
function fetchChartData(chartType) {
    fetch(`/charts/data?type=${chartType}`)
        .then(response => response.json())
        .then(data => {
            chartInstance.hideLoading();
            renderChart(data, chartType);
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
            chartInstance.hideLoading();
            chartInstance.setOption({
                title: {
                    text: 'Error Loading Data',
                    left: 'center'
                },
                graphic: {
                    elements: [{
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                            text: 'Failed to load chart data. Please try again.',
                            fontSize: 16,
                            fill: '#999'
                        }
                    }]
                }
            });
        });
}

// Function to render the chart with the fetched data
function renderChart(data, chartType) {
    let options = {
        title: {
            text: data.title,
            subtext: data.subtitle,
            left: 'center'
        },
        tooltip: {
            trigger: chartType === 'pie' ? 'item' : 'axis',
            formatter: chartType === 'pie' ? '{a} <br/>{b}: {c} ({d}%)' : '{a} <br/>{b}: {c}'
        },
        toolbox: {
            feature: {
                saveAsImage: {},
                dataView: {},
                restore: {},
                dataZoom: {},
                magicType: { type: ['line', 'bar'] }
            }
        }
    };
    
    // Add specific chart type options
    if (chartType === 'pie') {
        options = {
            ...options,
            series: data.series.map(series => ({
                name: series.name,
                type: series.type,
                radius: '55%',
                center: ['50%', '50%'],
                data: series.data.map((value, index) => ({
                    value,
                    name: data.legend.data[index]
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }))
        };
    } else {
        options = {
            ...options,
            legend: {
                data: data.legend ? data.legend.data : data.series.map(s => s.name),
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: data.xAxis ? {
                type: data.xAxis.type,
                data: data.xAxis.data,
                name: data.xAxis.name,
                nameLocation: 'middle',
                nameGap: 30
            } : {},
            yAxis: data.yAxis ? {
                type: data.yAxis.type,
                name: data.yAxis.name,
                nameLocation: 'middle',
                nameGap: 50
            } : {},
            series: data.series
        };
    }
    
    // Apply the options to the chart
    chartInstance.setOption(options);
    
    // Handle resize
    window.addEventListener('resize', () => {
        chartInstance.resize();
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    
    chartTypeSelector.addEventListener('change', () => {
        initChart();
    });
    
    refreshButton.addEventListener('click', () => {
        initChart();
    });
});
