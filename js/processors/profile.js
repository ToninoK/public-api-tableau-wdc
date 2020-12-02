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
    if (name === 'profile' && sbksData.data_source === 'aggregated_post') {
        cols.push({id: 'profile_id', dataType: tableau.dataTypeEnum.string})
        cols.push({id: 'platform', dataType: tableau.dataTypeEnum.string})
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
                    a.header[i].rows.push(...bHeader.rows)
                }
            }
        }
    }
}

function processMetricItem(data, item, depth, index, row, rows) {
    let header = data.header[depth]

    if (header.type !== 'metric') {
        if (header.type === 'profile' && typeof header.rows[index] !== 'string') {
            row['profile_id'] = header.rows[index].id
            row['platform'] = header.rows[index].platform
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
                    processMetricItem(data, subItem, depth + 1, subIndex, row, rows)
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
    let rows = [], response = null, metrics_response = null, profile_response = null
    for (const [network, network_profiles] of Object.entries(sbksData.profiles_selected)) {
        response = null
        for (const [date_start, date_end] of Object.entries(splitDateRange(dateRange.start, dateRange.end, MAX_DAYS))) {
            profile_response = null
            for (const profiles of chunkArray(Object.keys(network_profiles), MAX_PROFILES)) {
                metrics_response = null
                for (const metrics of chunkArray(sbksData.profile_metrics[network] || [], MAX_METRICS)) {
                    let dimensions = (sbksData.profile_dimensions[network] || []).map(dimension => {
                        return {type: dimension}
                    })
                    let apiResponse = await doApiCall(
                        `3/${network}/metrics`, sbksData, {
                            date_start: date_start,
                            date_end: date_end,
                            profiles: profiles,
                            metrics: metrics,
                            dimensions: dimensions
                        }
                    )
                    if (!apiResponse) {
                        continue
                    }

                    if (!metrics_response) {
                        metrics_response = apiResponse
                    } else {
                        metrics_response = mergeHeader(metrics_response, apiResponse, ['metric'])
                        metrics_response.data = deepmerge(
                            metrics_response.data, apiResponse.data, {arrayMerge: combineMerge}
                        )
                    }
                }

                if (!profile_response) {
                    profile_response = metrics_response
                } else {
                    profile_response = mergeHeader(profile_response, metrics_response, ['profile'])
                    profile_response.data = deepmerge(profile_response.data, metrics_response.data)
                }
            }

            if (!response) {
                response = profile_response
            } else {
                mergeHeader(response, profile_response, ['date.day', 'date.week', 'date.month'])
                response.data = deepmerge(response.data, profile_response.data)
            }
        }

        if (!response) {
            continue
        }

        if (response.header.length === 1) {
            processMetricItem(response, response.data, 0, 0, {platform: network}, rows)
        } else {
            for (const [index, item] of Object.entries(response.data)) {
                processMetricItem(response, item, 0, index, {platform: network}, rows)
            }
        }
    }

    return rows
}
