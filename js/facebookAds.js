let $facebookAds = $('#facebook_ads')
let $filtersSortsFbAds = $('#filtersSortsFbAds')
let $fbAdsForm = $('#facebookAdsForm')

$(function () {
    $fbAdsForm.submit(onFbAdsSubmit)
})

function onFbAdsSubmit(e) {
    e.preventDefault()
    $('#fbAdsSpinner').show()

    let filters = {}, sorts = {}, conf = {};
    for (const item of $fbAdsForm.serializeArray()) {
        if (['', undefined, null].includes(item.value)) {
            continue
        }
        if (item.name === 'fields[]') {
            conf = processFormField(conf, item)
            continue
        }

        if (item.name === 'dimensions[]') {
            conf = processFormField(conf, item)
            continue
        }

        if (item.name === 'daterange') {
            SBKS.date_range = parseDateRange(item.value)
            continue
        }

        if (item.name.includes("[]")) {
            filters = processFormField(filters, item)
            continue
        }

        sorts = processFormField(sorts, item)
    }

    sorts["campaign_limit"] = Number(sorts["campaign_limit"])
    sorts["country_limit"] = Number(sorts["country_limit"])

    if (!showModalIfLimitError(sorts, conf.dimensions) || !showModalDimensionError(conf.dimensions)) {
        $('#fbAdsSpinner').hide()
        return
    }
    SBKS.fb_ads.filters = filters
    SBKS.fb_ads.sorts = sorts
    SBKS.fb_ads.conf = conf

    tableau.connectionData = JSON.stringify(SBKS)
    invokeConnector(SBKS.data_source)
}


function showModalIfLimitError(sorts, dimensions){
    for (const dim of ["campaign", "country"]) {
        if (sorts[`${dim}_limit`] === 0 && dimensions.includes(dim)) {
            showModal(
                'Dimension missing limit',
                `You cannot select the ${dim} dimension without setting the limit for it first.`
            )
            return false
        }
    }
    if (sorts.campaign_limit * sorts.country_limit > 50000) {
        showModal(
            'Limits too high',
            `Campaign and country limit multiplied can result in max of 50 000.
            Currently the result is: ${sorts.campaign_limit * sorts.country_limit}`
        )
    }
    return true
}

function showModalDimensionError(dimensions){
    if (dimensions.length < 2) {
        return true
    } else if (dimensions.length > 2) {
        showModal(
            'Too many dimensions',
            `You can select up to two dimensions.`
        )
        return false
    }

    if	(FACEBOOK_ADS_DIMENSION_FORBIDDEN_COMBINATIONS.hasOwnProperty(dimensions[0]) &&
        FACEBOOK_ADS_DIMENSION_FORBIDDEN_COMBINATIONS[dimensions[0]].includes(dimensions[1])) {
        showModal(
            'Dimension combination not allowed',
            `You cannot select ${dimensions[0]} together with ${dimensions[1]}. 
            Refer to the API documentation for more information on this topic.`
        )
        return false
    }
    return true
}


function renderFacebookAds() {
    $('#fbAdsSpinner').hide()
    $filtersSortsFbAds.empty()
    renderFacebookAdsFiltersSorts()
    $facebookAds.show()

    // Fix the positioning bug with select2
    $('select').each(function () {
        if($(this).outerWidth() > 10) {
            $(this).css({width: `${$(this).outerWidth() - 1}px`})
        }
    })
    $('#fields').select2({
        multiple: true,
        data: facebookMetrics.map(field => {
            return {id: field, text: field}
        })
    })
    $('#dimensions').select2({
        multiple: true,
        data: facebookDimensions.map(dimension => {
            return {id: dimension, text: dimension}
        })
    })
    $('#campaigns').select2({
        multiple: true,
        data: SBKS.campaigns.map(campaign => {
            return {id: campaign.id, text: campaign.name}
        })
    })

    $('select.form-select[multiple]').select2()
}

function renderFacebookAdsFiltersSorts() {
    let filters = `<div class="input-group mb-3" id="gender_container">
        <label class="input-group-text">Gender</label>
        <select class="form-select" name="gender[]" id="gender" multiple>
        </select>
    </div>
    <div class="input-group mb-3" id="age_container">
        <label class="input-group-text">Age</label>
        <select class="form-select" name="age[]" id="age" multiple>
        </select>
    </div>
    <div class="input-group mb-3" id="objectives_container">
        <label class="input-group-text">Objectives</label>
        <select class="form-select" name="objectives[]" id="objectives" multiple>
        </select>
    </div>
    <div class="input-group mb-3" id="publisher_platform_container">
        <label class="input-group-text">Publisher Platform</label>
        <select class="form-select" name="publisher_platform[]" id="publisher_platform" multiple>
        </select>
    </div>
    <div class="input-group mb-3" id="placement_container">
        <label class="input-group-text">Placement</label>
        <select class="form-select" name="placement[]" id="placement" multiple>
        </select>
    </div>
    <div class="input-group mb-3" id="country_container">
        <label class="input-group-text">Country</label>
        <select class="form-select" name="country[]" id="country" multiple>
        </select>
    </div>`

    $filtersSortsFbAds.append(filters)

    for (const [key, values] of Object.entries(facebookAdsFilter)) {
        values.forEach((item)=>{
            let val = key === 'country' ? item.country_code : item
            let text = key === 'country' ? item.name : item
            $(`#${key}`).append($('<option>', {
                    value: val,
                    text: text.charAt(0).toUpperCase() + text.slice(1),
                })
            )
        })
    }

    let sorts = `<div class="input-group mb-3">
        <label class="input-group-text">Sort</label>
        <select class="form-select" name="sort" id="sort_facebook_ads"></select>
    </div>
    <div class="row">
        <div class="col">
            <div class="input-group mb-3">
                <label class="input-group-text">Order</label>
                <select class="form-select" name="order">
                    <option value="asc">Ascending</option>
                    <option value="desc" selected>Descending</option>
                </select>
            </div>
        </div>
        <div class="col">
            <div class="input-group mb-3">
                <label class="input-group-text">Campaign Limit</label>
                <input type="number" min="0" max="2000" value="0" class="form-control" name="campaign_limit">
            </div>
        </div>
        <div class="col">
            <div class="input-group mb-3">
                <label class="input-group-text">Country Limit</label>
                <input type="number" min="0" max="250" value="0" class="form-control" name="country_limit">
            </div>
        </div>
    </div>
    `
    $filtersSortsFbAds.append(sorts)

    // Add empty option for sorting
    $('#sort_facebook_ads').append($('<option>', {
        value: "",
        text: "",
    }))

    facebookAdsSort.forEach(
        (item)=> $('#sort_facebook_ads').append($('<option>', {
            value: item,
            text: item.charAt(0).toUpperCase() + item.slice(1),
        }))
    )
}
