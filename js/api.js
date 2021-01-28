function createHeaders() {
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${btoa(`${tableau.username}:${tableau.password}`)}`,
        'x-api-consumer': 'Tableau V3'
    }
}

async function callSbksApi(path, method, data) {
    let response = await fetch(SBKS.apiUrl + path, {
        method: method,
        headers: createHeaders(),
        body: data ? JSON.stringify(data) : null
    })

    return await response.json()
}

// Call the API and fetch the metrics
async function doApiCall(path, sbksData, params) {
    let response = await callSbksApi(path, 'POST', params)

    if (!response.success) {
        console.log("API Request Failed", response)
        return
    }

    if (response.header) {
        // Replace profile and post label IDs with names for metrics requests
        for (const [index, header] of response.header.entries()) {
            if (header.type === 'profile_label') {
                response['header'][index]['rows'] = header.rows.map(label_id => {
                    let label = sbksData.profile_labels.find(l => l.id === label_id)
                    return label ? label.name : label_id
                })
            } else if (header.type === 'post_labels') {
                response['header'][index]['rows'] = header.rows.map(label_id => {
                    let label = sbksData.post_labels.find(l => l.id === label_id)
                    return label ? label.name : label_id
                })
            }
        }
    }

    return response
}
