async function getAggregatedPostData(sbksData) {
    let selected_profiles = []
    let metric = sbksData.aggregated_post_metrics[0] // Only 1 metric allowed for aggregated-metrics
    for (const [network, network_profiles] of Object.entries(sbksData.profiles_selected)) {
        for (const profile_id of Object.keys(network_profiles)) {
            selected_profiles.push({id: profile_id, platform: network})
        }
    }

    let response = null, profile_response = null
    let dateRange = adjustDateRange(sbksData.date_range)
    for (const [date_start, date_end] of Object.entries(splitDateRange(dateRange.start, dateRange.end, MAX_DAYS))) {
        profile_response = null
        for (const profiles of chunkArray(selected_profiles, MAX_PROFILES)) {
            let dimensions = (sbksData.aggregated_post_dimensions || []).map(dimension => {
                return {type: dimension}
            })

            let apiResponse = await doApiCall(
                `3/aggregated-metrics`, sbksData, {
                    date_start: date_start,
                    date_end: date_end,
                    profiles: profiles,
                    metric: metric,
                    dimensions: dimensions
                }
            )

            if (!apiResponse) {
                continue
            }
            if (!profile_response) {
                profile_response = apiResponse
            } else {
                profile_response = mergeHeader(profile_response, apiResponse, ['metric'])
                profile_response.data = deepmerge(
                    profile_response.data, apiResponse.data, {arrayMerge: combineMerge}
                )
            }
        }

        if (!response) {
            response = profile_response
        } else {
            mergeHeader(response, profile_response, ['date.day', 'date.week', 'date.month'])
            response.data = deepmerge(response.data, profile_response.data)
        }
    }

    let rows = []
    if (response.header.length === 1) {
        processMetricItem(response, response.data, 0, 0, {}, rows)
    } else {
        for (const [index, item] of Object.entries(response.data)) {
            processMetricItem(response, item, 0, index, {}, rows)
        }
    }

    return rows
}
