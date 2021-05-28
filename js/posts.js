let $postsDiv = $('#posts')
let $posts = $('#postsForm')
let $postsSorts = $('#postsSorts')
let $postsSpinner = $('#postsSpinner').hide()
let $advancedFilteringSwitch = $('#advancedFiltering')
let $basicFiltering = $('#basicFiltering')

$(function () {
    $posts.submit(onPostsSubmit)
})

function processFormField(data, item) {
    data = data || {}
    if (item.name.indexOf('[]') !== -1) {
        let name = item.name.replace('[]', '')
        data[name] = data[name] || []
        data[name].push(item.value)
    } else {
        data[item.name] = item.value
    }

    return data
}

async function onPostsSubmit(e) {
    e.preventDefault()
    $postsSpinner.show()

    let posts_filters = {}, posts_networks = {}
    let country_metric_selected = false
    let gender_age_metric_selected = false
    for (const item of $posts.serializeArray()) {
        if (['', undefined, null].includes(item.value)) {
            continue
        }

        if (item.name === 'daterange') {
            SBKS.date_range = parseDateRange(item.value)
            continue
        }

        let skip = false
        for (const network of SBKS.networks) {
            if (item.name.indexOf(network) === 0) {
                if (item.value === 'insights_video_view_time_by_country'){
                    country_metric_selected = true
                }
                if (item.value === 'insights_video_view_time_by_gender_age'){
                    gender_age_metric_selected = true
                }
                item.name = item.name.replace(`${network}-`, '')
                posts_networks[network] = processFormField(posts_networks[network], item)
                skip = true
                break
            }
            if(!skip && item.name.indexOf(network) > 0) {
                item.name = item.name.replace(`_${network}`, '')
                posts_filters[network] = processFormField(posts_filters[network], item)
                skip = true
                break
            }
        }

        if (skip) {
            continue
        }

        posts_filters = processFormField(posts_filters, item)
    }

    if (!showModalIfNotValid(country_metric_selected, gender_age_metric_selected, posts_networks['facebook']['fields'])) {
        $postsSpinner.hide()
        return
    }
    
    if (country_metric_selected) {
        posts_networks['facebook']['fields'].push('country')
    }
    if (gender_age_metric_selected) {
        posts_networks['facebook']['fields'].push('gender_age')
    }
    SBKS.posts_filters = posts_filters
    SBKS.posts_networks = posts_networks

    tableau.connectionData = JSON.stringify(SBKS)

    invokeConnector(SBKS.data_source)
}

function showModalIfNotValid(countrySelected, genderAgeSelected, fields){
    if (countrySelected && fields.length != 1){
        showModal(
            'Field combination not allowed',
            'The field: <code>Insights video view time by country</code> cannot be combined with other fields'
        )
        return false
    }
    if (genderAgeSelected && fields.length != 1) {
        showModal(
            'Field combination not allowed',
            'The field: <code>Insights video view time by gender age</code> cannot be combined with other fields'
        )
        return false
    }
    return true
}

function renderPosts() {
    $postsSorts.empty()
    renderPostsSorts()
    $postsDiv.show()

    // Fix the positioning bug with select2
    $('select').each(function () {
        if($(this).outerWidth() > 10) {
            $(this).css({width: `${$(this).outerWidth() - 1}px`})
        }
    })

    $('select[data-sort]').each(function () {
        let $self = $(this)
        let network = $self.data('sort')

        let data = Object.keys(POSTS_SORT_FIELDS).map((key, index) => {
            if (!POSTS_SORT_FIELDS[key].includes(network)) {
                return undefined
            }

            let text = key.replace(/_/g, ' ').replace('.', ': ')
            return {id: key, text: text.charAt(0).toUpperCase() + text.slice(1), selected: key === 'created_time'}
        })

        $self.select2({
            multiple: true,
            minimumResultsForSearch: -1,
            data: data
        }).on('select2:select', function (e) {
            let $element = $(e.params.data.element)
            $element.detach()
            $(this).append($element)
            $(this).trigger('change')
        })
    })

    $('#post_labels').select2({
        multiple: true,
        data: SBKS.post_labels.map(label => {
            return {id: label.id, text: label.name}
        })
    })

    $('select[data-fields]').each(function () {
        let $self = $(this)
        let network = $self.data('fields')
        let insights = Object.entries(SBKS.profiles_selected[network]).find(v => v[1] ? v : null)

        let data = []
        for (const [field, config] of Object.entries(POSTS_FIELDS)) {
            if (field === 'country' || field === 'gender_age') {
                continue
            }
            if (!insights && field.indexOf('insights') === 0) {
                continue
            }
            if (config.networks.includes(network)) {
                let text = field.replace(/_/g, ' ')
                data.push({id: field, text: text.charAt(0).toUpperCase() + text.slice(1)})
            }
        }

        $self.select2({multiple: true, data: data}).val(['page','profile','channel']).change()
    })

    $('select.form-select[multiple]').select2()
}


function renderPostsSorts(){
    filters = (network) => {
        return `<div class="input-group mb-3" id="content_type_${network}_container">
        <label for="content_type" class="input-group-text">Content Type</label>
        <select class="form-select" name="content_type_${network}[]" id="content_type_${network}" multiple>
        </select>
        </div>
        <div class="input-group mb-3" id="grade_${network}_container">
            <label for="grade" class="input-group-text">Grade</label>
            <select class="form-select" name="grade_${network}[]" id="grade_${network}" multiple>
            </select>
        </div>
        <div class="input-group mb-3" id="media_type_${network}_container">
            <label for="media_type" class="input-group-text">Media Type</label>
            <select class="form-select" name="media_type_${network}[]" id="media_type_${network}" multiple>
            </select>
        </div>
        <div class="input-group mb-3" id="origin_${network}_container">
            <label for="origin" class="input-group-text">Origin</label>
            <select class="form-select" name="origin_${network}" id="origin_${network}">
                <option value=""></option>
            </select>
        </div>
        <div class="input-group mb-3" id="post_attribution_${network}_container">
            <label for="post_attribution" class="input-group-text">Post Attribution</label>
            <select class="form-select" name="post_attribution_${network}" id="post_attribution_${network}">
                <option value=""></option>
            </select>
        </div>
        <div class="input-group mb-3" id="video_type_${network}_container">
            <label for="video_type" class="input-group-text">Video Type</label>
            <select class="form-select" name="video_type_${network}[]" id="video_type_${network}" multiple>
            </select>
        </div>`
    }
    for (const network of Object.keys(SBKS.profiles_selected)) {
        $postsSorts.append($(`
            <div class="capitalize" style="padding: 8px 0 12px 0; margin-left: -5px">
                <ion-icon style="vertical-align: sub; font-size: 22px;" 
                    title="${network}" name="${SBKS.icons[network]}"></ion-icon> 
                ${network}
            </div>
            ${filters(network)}
            <div class="input-group mb-3">
                <label class="input-group-text">Fields</label>
                <select class="form-select" data-fields="${network}" name="${network}-fields[]"></select>          
            </div>
            <div class="input-group mb-3" style="${network === 'twitter' ? 'display:none' : ''}">
                <label class="input-group-text">Sort</label>
                <select class="form-select" data-sort="${network}" name="${network}-sort[]" multiple></select>
            </div>
            <div class="row">
                <div class="col">
                    <div class="input-group mb-3" style="${network === 'twitter' ? 'display:none' : ''}">
                        <label class="input-group-text">Order</label>
                        <select class="form-select" name="${network}-order">
                            <option value="asc">Ascending</option>
                            <option value="desc" selected>Descending</option>
                        </select>
                    </div>
                </div>
                <div class="col">
                    <div class="input-group mb-3">
                        <label class="input-group-text">Limit</label>
                        <input type="number" min="1" max="100" value="100" class="form-control" name="${network}-limit">
                    </div>
                </div>
            </div>
        `))
        for(const [filter, value] of Object.entries(POSTS_FILTER_FIELDS)) {
            $.each(value[network], (i, item) => {
                $(`#${filter}_${network}`).append($('<option>', {
                    value: item,
                    text: item.charAt(0).toUpperCase() + item.slice(1)
                }))
            })

            let filter_select = document.getElementById(`${filter}_${network}`)
            if (!filter_select)
                continue
            let options = filter_select.options
            if (options.length === 0 || (options.length === 1 && options[0].value === ""))
                $(`#${filter}_${network}_container`).hide()
        }
    }

}
