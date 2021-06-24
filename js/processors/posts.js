function preparePostsParams(sbksData, network, params) {
    params.fields = sbksData.posts_networks[network].fields
    if (params.fields.includes('country')) {
        params.fields.splice(params.fields.indexOf('country'), 1)
    }
    if (params.fields.includes('gender_age')) {
        params.fields.splice(params.fields.indexOf('gender_age'), 1)
    }
    params.fields = params.fields.map(
        (field)=> field.startsWith('insights_video_view_time_by_gender_age') ? "insights_video_view_time_by_gender_age" : field
    )
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
        if (field === 'insights_video_view_time_by_gender_age') {
            field = 'insights_video_view_time_by_gender_age_v1'
        }
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
                    let formattedSubField = subField
                        .replace(/\./g, '_')
                        .replace(/-/g, '_')
                    row[`${field}_${formattedSubField}_${parseInt(i, 10) + 1}`] = item[subField]
                }
            }
        } else if (fieldObj.subfields && value) {
            for (const subField of Object.keys(value)) {
                let formattedSubField = subField
                    .replace(/\./g, '_')
                    .replace(/-/g, '_')
                row[`${field}_${formattedSubField}`] = value[subField]
            }
        }
    }

    return row
}


function processFakeDimResponse(post, data){
    let byCountry = post.insights_video_view_time_by_country
    let byGenderAge = post.insights_video_view_time_by_gender_age
    let edgeCase = byCountry ? byCountry : byGenderAge
    if (!edgeCase){
        return
    }
    for ([key, value] of Object.entries(edgeCase)) {
        if (data.hasOwnProperty(key))
            data[key] += value
        else
            data[key] = value
    }
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
    let fakeDimData = {}
    let typeOfFakeDim = null
    await Promise.all(requests)
    for (const request of requests) {
        let apiResponse = await request
        if (!apiResponse || !apiResponse.data) {
            continue
        }

        for (const post of apiResponse.data.posts) {
            if (post.hasOwnProperty('insights_video_view_time_by_country') || sbksData.gender_age_version === 2){
                typeOfFakeDim = post.hasOwnProperty('insights_video_view_time_by_country') ? 'country' : 'gender_age'
                processFakeDimResponse(post, fakeDimData)
                continue
            }
            rows.push(processPost(post))
        }
    }
    if (!rows.length){
        for ([key, value] of Object.entries(fakeDimData)) {
            data = {}
            data[typeOfFakeDim] = key
            data[`insights_video_view_time_by_${typeOfFakeDim === 'gender_age' ? 'gender_age_v2' : typeOfFakeDim}`] = value
            rows.push(data)
        }
    }
    return rows
}
