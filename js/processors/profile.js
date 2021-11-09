function appendColumn(cols, id, dataType) {
    if (!cols.find(col => col.id === id)) {
        cols.push({id: id, dataType: dataType})
    }

    return cols
}

function appendMetricColumn(name, cols) {
    return appendColumn(cols, name.replace('.', '_'), tableau.dataTypeEnum.float)
}

function appendDimensionColumn(name, cols, sbksData) {
    if (name === 'profile') {
        cols = appendColumn(cols, 'profile_id', tableau.dataTypeEnum.string)
        cols = appendColumn(cols, 'profile', tableau.dataTypeEnum.string)

        if (sbksData.data_source === 'aggregated_post') {
            cols = appendColumn(cols, 'platform', tableau.dataTypeEnum.string)
        }
        return cols
    } else if (name === 'ad_account') {
        cols = appendColumn(cols, 'ad_account_id', tableau.dataTypeEnum.string)
        cols = appendColumn(cols, 'ad_account', tableau.dataTypeEnum.string)

        return cols
    } else if (name === 'campaign') {
        cols = appendColumn(cols, 'campaign_id', tableau.dataTypeEnum.string)
        cols = appendColumn(cols, 'campaign', tableau.dataTypeEnum.string)
        cols = appendColumn(cols, 'ad_account', tableau.dataTypeEnum.string)
        cols = appendColumn(cols, 'ad_account_id', tableau.dataTypeEnum.string)

        return cols
    }

    return appendColumn(
        cols,
        name.replace('.', '_'),
        name.indexOf('date.') === 0 ? tableau.dataTypeEnum.date : tableau.dataTypeEnum.string
    )

}

function mergeHeader(a, b, match) {
    for (const [i, aHeader] of a.header.entries()) {
        if (match.indexOf(aHeader.type) !== -1) {
            for (const bHeader of b.header) {
                if (match.indexOf(bHeader.type) !== -1) {
                    for (const row of bHeader.rows)
                        if(match[0] === "profile" && !a.header[i].rows.find(x => x.id === row.id))
                            a.header[i].rows.push(row)
                        else if(match[0] !== "profile")
                            a.header[i].rows.push(row)
                }
            }
        }
    }
    return a
}

function processMetricItem(sbksData, data, item, depth, index, row, rows) {
    let header = data.header[depth]

    if (header.type !== 'metric') {
        if (header.type === 'profile') {
            if (typeof header.rows[index] === 'string') {
                row['profile_id'] = header.rows[index]
            } else {
                row['profile_id'] = header.rows[index].id
                row['platform'] = header.rows[index].platform
            }
            let profile = sbksData.profiles[row.platform].find(p => p.id === row['profile_id'])
            row['profile'] = profile ? profile.name : null
        } else {
            row[header.type.replace('.', '_')] = header.rows[index]
        }

        if (data.header.length > depth) {
            let nextHeader = data.header[depth + 1]

            if (nextHeader.type === 'metric') {
                for (const [subIndex, subItem] of Object.entries(item)) {
                    row[nextHeader.rows[subIndex].replace('.', '_')] = subItem
                }

                rows.push(Object.assign({}, row))
            } else {
                for (const [subIndex, subItem] of Object.entries(item)) {
                    processMetricItem(sbksData, data, subItem, depth + 1, subIndex, row, rows)
                }
            }
        }
    } else {
        if (Array.isArray(item)) {
            for (const [subIndex, subItem] of Object.entries(item)) {
                row[header.rows[subIndex].replace('.', '_')] = subItem
            }
        } else {
            row[header.rows[index].replace('.', '_')] = item
        }

        rows.push(Object.assign({}, row))
    }
}

// Download the data respecting API limits
async function getProfileData(sbksData) {
    let dateRange = adjustDateRange(sbksData.date_range)
    let rows = [], response = null, metricsResponse = null, profileResponse = null
    for (const [network, network_profiles] of Object.entries(sbksData.profiles_selected)) {
        response = null
        for (const [date_start, date_end] of Object.entries(splitDateRange(dateRange.start, dateRange.end, MAX_DAYS))) {
            profileResponse = null
            for (const profiles of chunkArray(Object.keys(network_profiles), MAX_PROFILES)) {
                let requests = []
                for (const metrics of chunkArray(sbksData.profile_metrics[network] || [], MAX_METRICS)) {
                    let dimensions = (sbksData.profile_dimensions[network] || []).map(dimension => {
                        return {type: dimension}
                    })
                    requests.push(await doApiCall(
                        `3/${network}/metrics`, sbksData, {
                            date_start: date_start,
                            date_end: date_end,
                            profiles: profiles,
                            metrics: metrics,
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

        if (!response) {
            continue
        }

        if (response.header.length === 1) {
            processMetricItem(sbksData, response, response.data, 0, 0, {platform: network}, rows)
        } else {
            for (const [index, item] of Object.entries(response.data)) {
                processMetricItem(sbksData, response, item, 0, index, {platform: network}, rows)
            }
        }
    }

    return rows
}
