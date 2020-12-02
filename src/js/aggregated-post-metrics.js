let $aggregatedPostMetrics = $('#aggregatedPostMetrics')
let $aggregatedPostMetricsSpinner = $('#aggregatedPostMetricsSpinner').hide()
let $dimensionsSelect = $('#aggregated_post_dimensions')
let $aggregatedPostMetricsSelect = $('#aggregated_post_metrics')
let $aggregatedPostTimedimension = $('#aggregated_post_timedimension')

$(function () {
    $aggregatedPostMetrics.submit(onAggregatedPostMetricsSubmit)
})

async function onAggregatedPostMetricsSubmit(e) {
    e.preventDefault()
    $aggregatedPostMetricsSpinner.show()

    SBKS.aggregated_post_metrics = []
    SBKS.aggregated_post_dimensions = []
    for (const item of $aggregatedPostMetrics.serializeArray()) {
        if (item.name === 'daterange') {
            SBKS.date_range = parseDateRange(item.value)
            continue
        } else if (item.name === 'time') {
            if (item.value) {
                SBKS.aggregated_post_dimensions.unshift(item.value)
            }
            continue
        }

        SBKS[item.name] = SBKS[item.name] || []
        SBKS[item.name].push(item.value)
    }

    tableau.connectionData = JSON.stringify(SBKS)

    invokeConnector(SBKS.data_source)
}

function renderAggregatedPostMetrics() {
    $aggregatedPostMetrics.show()
    let metrics_available = []
    for (const [network, profiles] of Object.entries(SBKS.profiles_selected)) {
        let insights = Object.entries(profiles).find(v => v[1] ? v : null)
        for (const metric of Object.keys(AGGREGATED_POST_METRICS[network])) {
            if (!insights && metric.indexOf('insights') === 0) {
                continue
            }
            metrics_available.push({id: metric, text: metric})
        }
    }

    // Fix the positioning bug with select2
    $('select').each(function () {
        $(this).css({width: `${$(this).outerWidth() - 1}px`})
    })

    $aggregatedPostMetricsSelect.select2({
        multiple: true,
        placeholder: 'Metrics',
        data: metrics_available,
        maximumSelectionLength: 1
    }).change(onMetricsChange)

    $aggregatedPostTimedimension.change(onMetricsChange)
}

function onMetricsChange() {
    let dimensions = []

    for (const metric of $aggregatedPostMetricsSelect.val()) {
        for (const network of Object.keys(SBKS.profiles_selected)) {
            let metric_dimensions = AGGREGATED_POST_METRICS[network][metric]
            if (metric_dimensions) {
                dimensions = !dimensions.length
                    ? metric_dimensions
                    : intersect(dimensions, metric_dimensions)
                break
            }
        }
    }

    if ($aggregatedPostMetricsSelect.val().includes('sentiment_manual_auto')) {
        $dimensionsSelect.val('sentiment')
    }

    let value = $dimensionsSelect.val()
    $dimensionsSelect.empty().select2({
        multiple: true,
        placeholder: 'Dimensions',
        data: dimensions.map(v => {
            return {id: v, text: v}
        }),
        maximumSelectionLength: $aggregatedPostTimedimension.val() === '' ? 2 : 1
    }).val(value).trigger('change')
}
