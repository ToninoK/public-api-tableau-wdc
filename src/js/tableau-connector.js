const MAX_PROFILES = 100
const MAX_METRICS = 25
const MAX_DAYS = 360
const MAX_POSTS_ARRAY_DEPTH = 10
let tableauConnector = tableau.makeConnector()

// Initialize Tableau Web Data Connector
tableauConnector.init = initCallback => {
    tableau.authType = tableau.authTypeEnum.custom
    initCallback()
}

// Define the schema
tableauConnector.getSchema = schemaCallback => {
    let sbksData = JSON.parse(tableau.connectionData)
    let cols = []
    if (sbksData.data_source === 'profile') {
        cols.push({id: 'platform', dataType: tableau.dataTypeEnum.string})
        for (const [network, metrics] of Object.entries(sbksData.profile_metrics)) {
            for (const metric of metrics || []) {
                cols = appendMetricColumn(metric, cols)
            }

            for (const dimension of sbksData.profile_dimensions[network] || []) {
                cols = appendDimensionColumn(dimension, cols, sbksData)
            }
        }
    } else if (sbksData.data_source === 'aggregated_post') {
        for (const metric of sbksData.aggregated_post_metrics || []) {
            cols = appendMetricColumn(metric, cols)
        }

        for (const dimension of sbksData.aggregated_post_dimensions || []) {
            cols = appendDimensionColumn(dimension, cols, sbksData)
        }
    } else if (sbksData.data_source === 'posts') {
        for (const items of Object.values(sbksData.posts_networks)) {
            for (const field of items.fields || []) {
                let fieldObj = POSTS_FIELDS[field]
                if (fieldObj.type) {
                    cols = appendColumn(cols, field, fieldObj.type)
                } else if (fieldObj.array && fieldObj.subfields) {
                    for (let i = 1; i < MAX_POSTS_ARRAY_DEPTH; i++) {
                        for (const [subField, type] of Object.entries(fieldObj.subfields)) {
                            cols = appendColumn(cols, `${field}_${subField}_${i}`, type)
                        }
                    }
                } else if (fieldObj.subfields) {
                    for (const [subField, type] of Object.entries(fieldObj.subfields)) {
                        cols = appendColumn(cols, `${field}_${subField}`, type)
                    }
                }
            }
        }
    }

    if (cols.length) {
        schemaCallback([{id: sbksData.data_source, alias: sbksData.data_source, columns: cols}])
    }
}

// Download the data respecting API limits
tableauConnector.getData = async (table, doneCallback) => {
    let sbksData = JSON.parse(tableau.connectionData)

    if (sbksData.data_source === 'profile') {
        table.appendRows(await getProfileData(sbksData))
    } else if (sbksData.data_source === 'aggregated_post') {
        table.appendRows(await getAggregatedPostData(sbksData))
    } else if (sbksData.data_source === 'posts') {
        table.appendRows(await getPostsData(sbksData))
    }

    doneCallback()
}

tableau.registerConnector(tableauConnector)

function invokeConnector(dataSource) {
    if (dataSource === 'profile') {
        tableau.connectionName = 'Socialbakers social media profiles'
    } else if (dataSource === 'aggregated_post') {
        tableau.connectionName = 'Socialbakers social media aggregated post metrics'
    } else if (dataSource === 'posts') {
        tableau.connectionName = 'Socialbakers social media posts'
    }

    tableau.submit()
}

