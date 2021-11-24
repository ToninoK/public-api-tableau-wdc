async function getFbAdsData(sbksData) {
    let dateRange = adjustDateRange(sbksData.date_range)
    const selectedCampaigns = 'campaigns' in sbksData.fb_ads.filters ? sbksData.fb_ads.filters.campaigns : []
    const payloads = getFacebookAdsPayloads(
        dateRange,
        sbksData.profiles_selected.facebook_ads,
        selectedCampaigns,
        sbksData.fb_ads,
    )
    const requests = []
    for (const payload of payloads) {
        requests.push(doApiCall(sbksData.fb_ads_url, sbksData, payload))
    }
    let rows = []
    let response = null
    await Promise.all(requests)
    for (const request of requests) {
        let apiResponse = await request
        if (!apiResponse || !apiResponse.data) {
            continue
        }

        if (!response) {
            response = apiResponse
        }

        response = mergeHeaderFb(
            response,
            apiResponse,
            [
                'ad_account',
                'campaign',
                'date.day',
                'date.week',
                'date.month',
                'date.quarter',
            ],
        )
        response.data = deepmerge(
            response.data, apiResponse.data, {arrayMerge: combineMerge}
        )

    }
    if (!response) {
        return
    }
    if (response.header.length === 1) {
        processMetricFbAd(sbksData, response, response.data, 0, 0, {}, rows)
    } else {
        for (const [index, item] of Object.entries(response.data)) {
            processMetricFbAd(sbksData, response, item, 0, index, {}, rows)
        }
    }
    return rows
}


function mergeHeaderFb(a, b, match) {
    for (const [i, aHeader] of a.header.entries()) {
        if (match.indexOf(aHeader.type) !== -1) {
            for (const bHeader of b.header) {
                if (match.indexOf(bHeader.type) !== -1) {
                    for (const row of bHeader.rows) {
                        if (["ad_account", "campaign"].includes(match[0]) && !a.header[i].rows.find(x => x === row))
                            a.header[i].rows.push(row)
                        else if (match[0] !== "ad_account" && match[0] !== "campaign")
                            a.header[i].rows.push(row)
                    }
                }
            }
        }
    }
    return a
}


function processMetricFbAd(sbksData, data, item, depth, index, row, rows) {
    let header = data.header[depth]

    if (header.type !== 'metric') {
        if (header.type === 'ad_account') {
            if (typeof header.rows[index] === 'string') {
                row['ad_account_id'] = header.rows[index]
                row['ad_account'] = sbksData.adaccounts.find(
                    element => element.id === header.rows[index]
                )['name']
            }
        } else if (header.type === 'campaign'){
            row['campaign'] = header.rows[index]
            row['campaign_id'] = sbksData.campaigns.find(
                element => element.name === header.rows[index]
            )['id']
            row['ad_account'] = sbksData.adaccounts.find(
                element => element.id === row['campaign_id'].split('#')[0]
            )['name']
            row['ad_account_id'] = row['campaign_id'].split('#')[0]
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


function getFacebookAdsPayloads (dateRange, adAccounts, adCampaigns, fbAdsConfig) {
    const adAccountChunks = chunkArray(adAccounts, MAX_AD_ACCOUNTS)
    const adCampaignChunks = chunkArray(adCampaigns, MAX_AD_CAMPAIGNS)
    const rangeChunks = splitDateRange(dateRange.start, dateRange.end, MAX_DAYS)

    const filters = buildFacebookFilters(fbAdsConfig.filters)
    const metrics = fbAdsConfig.conf.fields.map((field) => {return {metric: field}})
    const metricsIndexes = {}
    for (const [index, obj] of Object.entries(metrics)) {
        metricsIndexes[obj.metric] = index
    }
    const dimensions = buildFacebookDimensions(
        fbAdsConfig.conf["dimensions"],
        fbAdsConfig["sorts"],
        metricsIndexes,
    )

    const payloads = []
    for (const [start, end] of Object.entries(rangeChunks)) {
        for (const accounts_chunk of adAccountChunks) {
            const payload = {
                'date_start': start,
                'date_end': end,
                'ad_accounts': accounts_chunk,
                'metrics': metrics,
                'dimensions': dimensions,
            }
            if (filters.length !== 0) {
                payload['filter'] = filters
            }
            if (adCampaignChunks.length === 0) {
                payloads.push(payload)
                continue
            }
            for (const campaigns_chunk of adCampaignChunks) {
                payload['ad_campaigns'] = campaigns_chunk
                payloads.push(payload)
            }
        }
    }
    return payloads
}

function buildFacebookFilters(filters) {
    return Object.keys(filters).filter(item => item !== 'campaigns').map((filter) => {
        return {
            field: filter,
            value: filters[filter],
        }
    })
}

function buildFacebookDimensions (dimensions, sorts, metricsIndexes) {
    const dimensionsApiFormat = []
    for (const dimension of dimensions) {
        let group = {}
        if (sorts.sort && !facebookDimensions.includes(sorts.sort)) {
            group = {
                'sort': {
                    'key': 'value',
                    'order': sorts.order,
                    'valueIndex': Number(metricsIndexes[sorts.sort]),
                },
            }
        } else if (sorts && dimension === sorts.sort) {
            group = {
                'sort': {
                    'key': 'field',
                    'order': sorts.order,
                },
            }
        }
        group['limit'] = (
            dimension === 'campaign' ? sorts.campaign_limit : dimension === 'country' ? sorts.country_limit : 2000
        )

        let dimensionObj = {
            type: dimension,
            group: group,
            other: false,
        }

        if (dimension === 'campaign') {
            dimensionObj["fields"] = ['campaign_name']
        }

        dimensionsApiFormat.push(dimensionObj)
    }
    return dimensionsApiFormat
}
