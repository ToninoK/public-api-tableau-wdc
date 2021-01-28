let $profileMetrics = $('#profileMetrics')
let $profileMetricsContent = $('#profileMetricsContent')
let $profileMetricsSpinner = $('#profileMetricsSpinner').hide()

$(function () {
    $profileMetrics.submit(onProfileMetricsSubmit)
})

async function onProfileMetricsSubmit(e) {
    e.preventDefault()
    $profileMetricsSpinner.show()

    SBKS.profile_metrics = {}
    SBKS.profile_dimensions = {}
    let time_dimension = null
    for (const item of $profileMetrics.serializeArray()) {
        if (item.name === 'daterange') {
            SBKS.date_range = parseDateRange(item.value)
            continue
        } else if (item.name === 'time') {
            if (item.value) {
                time_dimension = item.value
            }
            continue
        }

        let [network, type] = item.name.split('-')

        SBKS.profile_dimensions[network] = SBKS.profile_dimensions[network] || []
        SBKS.profile_metrics[network] = SBKS.profile_metrics[network] || []

        if (time_dimension && !SBKS.profile_dimensions[network].includes(time_dimension)) {
            SBKS.profile_dimensions[network].unshift(time_dimension)
        }

        SBKS[type][network].push(item.value)
    }

    tableau.connectionData = JSON.stringify(SBKS)

    invokeConnector(SBKS.data_source)
}

function renderProfileMetrics() {
    $profileMetricsContent.html('')
    let selected_with_no_labels = []
    for (const network of Object.keys(SBKS.profiles_selected)) {

        selected_with_no_labels = [ ...selected_with_no_labels,
            ...(Object.keys(SBKS.profiles_selected[network])
            .filter(item => SBKS.profiles_with_no_labels[network].includes(item))
        )]

        $profileMetricsContent.append($(`
            <div class="capitalize" style="padding: 8px 0 12px 0; margin-left: -5px">
                <ion-icon style="vertical-align: sub; font-size: 22px;" 
                    title="${network}" name="${SBKS.icons[network]}"></ion-icon> 
                ${network}
            </div>
            
            <div class="input-group mb-3">
                <label class="input-group-text">Metrics</label>
                <select class="form-select" data-network="${network}" data-type="profile_metrics" 
                        name="${network}-profile_metrics"></select>
            </div>
            <div class="input-group mb-3">
                <label class="input-group-text">Dimensions</label>
                <select class="form-select" data-network="${network}" data-type="profile_dimensions" 
                        name="${network}-profile_dimensions"></select>
            </div>
        `))
    }
    if(selected_with_no_labels.length){
        $profileMetricsContent.append($(`
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
    $profileMetrics.show()
    initProfileMetricsAndDimensions()
}

function initProfileMetricsAndDimensions() {
    // Fix the positioning bug with select2
    $('select').each(function () {
        if($(this).outerWidth() > 10) {
            $(this).css({width: `${$(this).outerWidth() - 1}px`})
        }
    })

    $('select[data-type=profile_metrics]').each(function () {
        let self = $(this)
        let network = self.data('network')
        let insights = Object.entries(SBKS.profiles_selected[network]).find(v => v[1] ? v : null)

        self.empty().select2({
            multiple: true,
            data: Object.keys(PROFILE_METRICS[network]).map(v => {
                if (!insights && v.indexOf('insights') === 0) {
                    return undefined
                }
                return {id: v, text: v}
            })
        })
    }).change(function () {
        let self = $(this)
        let dimensions = []
        let network = self.data('network')

        for (const metric of self.val()) {
            dimensions = !dimensions.length
                ? PROFILE_METRICS[network][metric]
                : intersect(dimensions, PROFILE_METRICS[network][metric])
        }

        let $dimensionsSelect = $(`select[data-type=profile_dimensions][data-network=${network}]`)
        let value = $dimensionsSelect.val()
        $dimensionsSelect.empty().select2({
            multiple: true,
            data: dimensions.map(v => {
                return {id: v, text: v}
            })
        }).val(value && value.length ? value : ['profile']).trigger('change')
    }).trigger('change')

    // Allow up to 1 custom dimension and ensure it's the last one selected
    $(document).on('select2:select', 'select[data-type=dimensions]', function (e) {
        let dimension = e.params.data.id
        if (PROFILE_COMMON_DIMENSIONS.includes(dimension)) {
            return
        }

        let self = $(this)
        let selected = self.val().filter(d => PROFILE_COMMON_DIMENSIONS.includes(d))
        selected.push(dimension)
        self.val(selected).trigger('change')
    })
}
