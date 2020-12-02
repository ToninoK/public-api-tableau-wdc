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

    for (const [field, value] of Object.entries(sbksData.posts_filters)) {
        if (field === 'post_labels' || POSTS_FILTER_FIELDS[field][network].length > 0) {
            params.filter = params.filter || []
            params.filter.push({field: field, value: value})
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
                    row[`${field}_${subField}_${i + 1}`] = item[subField]
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
