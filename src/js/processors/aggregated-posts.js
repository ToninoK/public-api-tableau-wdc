async function getAggregatedPostData(sbksData) {
    let selected_profiles = []
    for (const [network, network_profiles] of Object.entries(sbksData.profiles_selected)) {
        for (const profile_id of Object.keys(network_profiles)) {
            selected_profiles.push({id: profile_id, platform: network})
        }
    }

    let dimensions = (sbksData.aggregated_post_dimensions || []).map(dimension => {
        return {type: dimension}
    })

    let response = null, metricsResponse = null, profileResponse = null
    let dateRange = adjustDateRange(sbksData.date_range)

    for (const [date_start, date_end] of Object.entries(splitDateRange(dateRange.start, dateRange.end, MAX_DAYS))) {
        profileResponse = null
        for (const profiles of chunkArray(selected_profiles, MAX_PROFILES)) {
            let requests = []
            for (const metric of sbksData.aggregated_post_metrics) {
                requests.push(doApiCall(
                    `3/aggregated-metrics`, sbksData, {
                        date_start: date_start,
                        date_end: date_end,
                        profiles: profiles,
                        metric: metric,
                        dimensions: dimensions
                    }
                ))
            }

            await Promise.all(requests)
            metricsResponse = null
            for (const request of requests) {
                let apiResponse = await request
                if (!apiResponse) {
                    continue
                }

                if (!metricsResponse) {
                    metricsResponse = apiResponse
                } else {
                    metricsResponse = mergeHeader(metricsResponse, apiResponse, ['metric'])

                    metricsResponse.data = deepmerge(
                        metricsResponse.data, apiResponse.data, {arrayMerge: combineMerge}
                    )
                }
            }

            if (!profileResponse) {
                profileResponse = metricsResponse
            } else {
                profileResponse = mergeHeader(profileResponse, metricsResponse, ['profile'])
                profileResponse.data = deepmerge(profileResponse.data, metricsResponse.data)
            }
        }

        if (!response) {
            response = profileResponse
        } else {
            response = mergeHeader(response, profileResponse, ['date.day', 'date.week', 'date.month'])
            response.data = deepmerge(response.data, profileResponse.data)
        }
    }

    let rows = []
    if (response.header.length === 1) {
        processMetricItem(sbksData, response, response.data, 0, 0, {}, rows)
    } else {
        for (const [index, item] of Object.entries(response.data)) {
            processMetricItem(sbksData, response, item, 0, index, {}, rows)
        }
    }

    return rows
}
