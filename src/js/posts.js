let $posts = $('#posts')
let $postsSorts = $('#postsSorts')
let $postsSpinner = $('#postsSpinner').hide()

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
                item.name = item.name.replace(`${network}-`, '')
                posts_networks[network] = processFormField(posts_networks[network], item)
                skip = true
                break
            }
        }

        if (skip) {
            continue
        }

        posts_filters = processFormField(posts_filters, item)
    }

    SBKS.posts_filters = posts_filters
    SBKS.posts_networks = posts_networks

    tableau.connectionData = JSON.stringify(SBKS)

    invokeConnector(SBKS.data_source)
}

function renderPosts() {
    $postsSorts.html('')
    for (const network of Object.keys(SBKS.profiles_selected)) {
        $postsSorts.append($(`
            <div class="capitalize" style="padding: 8px 0 12px 0; margin-left: -5px">
                <ion-icon style="vertical-align: sub; font-size: 22px;" 
                    title="${network}" name="${SBKS.icons[network]}"></ion-icon> 
                ${network}
            </div>
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
    }

    $posts.show()

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

            let text = key.replaceAll('_', ' ').replace('.', ': ')
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
            if (insights && field.indexOf('insights') === 0) {
                continue
            }
            if (config.networks.includes(network)) {
                let text = field.replaceAll('_', ' ')
                data.push({id: field, text: text.charAt(0).toUpperCase() + text.slice(1)})
            }
        }

        $self.select2({multiple: true, data: data}).val(['page','profile','channel']).change()
    })

    $('select.form-select[multiple]').select2()
}
