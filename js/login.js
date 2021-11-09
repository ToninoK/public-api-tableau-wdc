let $login = $('#login')
let $loginSpinner = $('#loginSpinner').hide()

async function fetchProfilesAndLabels() {
    SBKS.profiles = {}

    let requests = {}
    for (const network of SBKS.networks) {
        requests[network] = callSbksApi(`3/${network}/profiles`, 'GET')
    }

    let profile_labels_request = callSbksApi('3/profile/labels', 'GET')
    let post_labels_request = callSbksApi('3/post/labels', 'GET')
    await Promise.all(Object.values(requests))
    for (const [network, coroutine] of Object.entries(requests)) {
        let response = {success: false}
        try {
            response = await coroutine
        } catch (err) {
            showModal('Profiles API error', err.toString())
            return
        }

        if (!response.success) {
            showModal(
                'API authorization failed',
                `API connection failed.<br><br><code>${JSON.stringify(response.errors)}</code>`
            )
            return -1
        }
        if (response.profiles.length) {
            response.profiles.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })

            SBKS.profiles[network] = response.profiles

            for(const profile of SBKS.profiles[network])
                SBKS.profile_name_by_id[profile.id] = profile.name

            SBKS.profiles_with_no_labels[network] = SBKS.profiles[network]
                .filter(profile => !profile.profile_labels.length)
                .map(profile => profile.id)
        }
    }

    try {
        let profile_labels_response = await profile_labels_request
        if (profile_labels_response.success) {
            profile_labels_response.data.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })
            for (const label of profile_labels_response.data) {
                label.selected_profiles = []
            }
            SBKS.profile_labels = profile_labels_response.data
        }
        let post_labels_response = await post_labels_request
        if (post_labels_response.success) {
            post_labels_response.data.sort((a, b) => {
                return a.name.localeCompare(b.name)
            })
            SBKS.post_labels = post_labels_response.data
        }
    } catch (err) {
        showModal('Labels API error', err.toString())
    }

    if ($.isEmptyObject(SBKS.profiles)) {
        showModal('Profiles not available', 'Your account doesn\'t have any profiles connected.')
        return
    }
}

async function onLoginSubmit(e) {
    e.preventDefault()
    $loginSpinner.show()

    tableau.username = $('#token').val()
    tableau.password = $('#secret').val()

    let today = moment()
    let monthAgo = today.subtract(30, 'days')

    let result = await fetchProfilesAndLabels()
    if (result === -1){
        $loginSpinner.hide()
        return
    }
    await setAdAccounts(monthAgo.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'), false)
    await setCampaigns(monthAgo.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'))

    $login.hide()
    if (SBKS.data_source === 'facebook_ads') {
        renderAdAccounts()
    } else {
        renderProfiles()
    }
}

function showModal(title, body) {
    $('#modalTitle').text(title)
    $('#modalBody').html(body)
    let modal = new bootstrap.Modal(document.getElementById('modal'))
    $('#modalButton').click((e)=> {modal.hide()})
    modal.show()
}

$(function () {
    $login.submit(onLoginSubmit)

    $('#profiles .back').click(function () {
        $('[id$=Spinner]').hide()
        $('#profiles').hide()
        $('#login').show()
    })

    $('#profileMetrics .back,#aggregatedPostMetrics .back, #posts .back').click(function () {
        $('[id$=Spinner]').hide()
        $('#profileMetrics, #aggregatedPostMetrics, #posts').hide()
        $('#profiles').show()
    })

    $('#facebook_ads .back').click(function () {
        $('[id$=Spinner]').hide()
        $('#facebook_ads').hide()
        $('#profiles').show()
    })
})
