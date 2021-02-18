function preparePostsParams(sbksData, network, params) {
    params.fields = sbksData.posts_networks[network].fields

    if (sbksData.posts_networks[network].sort) {
        params.sort = params.sort || []
        for (const field of sbksData.posts_networks[network].sort) {
            params.sort.push({
                field: field,
                order: sbksData.posts_networks[network].order
            })
        }
    }

    // Field can also be a network in case of advanced filtering -> the else if handles that case 
    for (const [field, value] of Object.entries(sbksData.posts_filters)) {
        if (field === 'post_labels') {
            params.filter = params.filter || []
            params.filter.push({field: field, value: value})
        }
        else if (field in POSTS_FILTER_FIELDS && POSTS_FILTER_FIELDS[field][network].length > 0) {
            params.filter = params.filter || []
            let intersect = value.filter(v => POSTS_FILTER_FIELDS[field][network].includes(v))
            params.filter.push({field: field, value: intersect})
        }
        else if(!(field in POSTS_FILTER_FIELDS) && field == network){
            for(const [fld, val] of Object.entries(value))
                if(POSTS_FILTER_FIELDS[fld][network].length > 0){
                    params.filter = params.filter || []
                    params.filter.push({field: fld, value: val})
                }
        }
    }
    return params
}

function processPost(post) {
    let row = {}
    for (let [field, value] of Object.entries(post)) {
        let fieldObj = POSTS_FIELDS[field]

        if (!fieldObj) {
            console.log(`Unknown field in the response: ${field}`)
            continue
        }

        if (fieldObj.type) {
            row[field] = value
        } else if (fieldObj.array && fieldObj.subfields && Array.isArray(value)) {
            if (field === 'attachments' && value['type'] === 'album') {
                value = value['attachements'] || []
            }

            for (const [i, item] of Object.entries(value)) {
                if (i >= MAX_POSTS_ARRAY_DEPTH) {
                    break
                }

                for (const subField of Object.keys(fieldObj.subfields)) {
                    row[`${field}_${subField}_${parseInt(i, 10) + 1}`] = item[subField]
                }
            }
        } else if (fieldObj.subfields && value) {
            for (const subField of Object.keys(fieldObj.subfields)) {
                row[`${field}_${subField}`] = value[subField]
            }
        }
    }

    return row
}

async function getPostsData(sbksData) {
    let requests = []
    let dateRange = adjustDateRange(sbksData.date_range)
    for (const [network, network_profiles] of Object.entries(sbksData.profiles_selected)) {
        for (const profiles of chunkArray(Object.keys(network_profiles), MAX_PROFILES)) {
            let params = preparePostsParams(sbksData, network, {
                date_start: dateRange.start,
                date_end: dateRange.end,
                profiles: profiles
            })

            requests.push(doApiCall(sbksData.postsUrl[network], sbksData, params))
        }
    }

    let rows = []
    await Promise.all(requests)
    for (const request of requests) {
        let apiResponse = await request
        if (!apiResponse || !apiResponse.data) {
            continue
        }

        for (const post of apiResponse.data.posts) {
            rows.push(processPost(post))
        }
    }

    return rows
}
