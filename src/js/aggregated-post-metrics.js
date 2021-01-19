let $aggregatedPostMetrics = $('#aggregatedPostMetrics')
let $missingProfileLabels = $('#missingProfileLabels')
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
    $missingProfileLabels.empty()
    let metrics_available = []
    let selected_with_no_labels = []
    for (const [network, profiles] of Object.entries(SBKS.profiles_selected)) {
        let insights = Object.entries(profiles).find(v => v[1] ? v : null)
        for (const metric of Object.keys(AGGREGATED_POST_METRICS[network])) {
            if (!insights && metric.indexOf('insights') === 0) {
                continue
            }
            if(!metrics_available.find(met=>met.id === metric))
                metrics_available.push({id: metric, text: metric})
        }
        selected_with_no_labels = [ ...selected_with_no_labels,
            ...(Object.keys(profiles)
            .filter(item => SBKS.profiles_with_no_labels[network].includes(item))
        )]
    }

    // Fix the positioning bug with select2
    $('select').each(function () {
        if($(this).outerWidth() > 10) {
            $(this).css({width: `${$(this).outerWidth() - 1}px`})
        }
    })

    $aggregatedPostMetricsSelect.select2({
        multiple: true,
        data: metrics_available
    }).change(onMetricsChange)

    $aggregatedPostTimedimension.change(onMetricsChange)

    if(selected_with_no_labels.length){
        $missingProfileLabels.append($(`
        <div class="alert alert-info" role="alert">
            Some profiles you selected don't have profile labels. If you select profile_label as a dimension
            the data for that profile will not be shown.<br>
            Profiles: ${selected_with_no_labels
                .map(id => SBKS.profile_name_by_id[id])
                .join(", ")
            }
        </div>
        `))
    }
}

function onMetricsChange() {
    let dimensions = []

    for (const metric of $aggregatedPostMetricsSelect.val()) {
        for (const network of Object.keys(SBKS.profiles_selected)) {
            let metric_dimensions = AGGREGATED_POST_METRICS[network][metric]
            if (metric_dimensions) {
                dimensions = !dimensions.length ? metric_dimensions : intersect(dimensions, metric_dimensions)
            }
        }
    }

    if ($aggregatedPostMetricsSelect.val().includes('sentiment_manual_auto')) {
        $dimensionsSelect.val('sentiment')
    }

    let value = $dimensionsSelect.val()
    $dimensionsSelect.empty().select2({
        multiple: true,
        data: dimensions.map(v => {
            return {id: v, text: v}
        }),
        maximumSelectionLength: $aggregatedPostTimedimension.val() === '' ? 2 : 1
    }).val(value).trigger('change')
}
