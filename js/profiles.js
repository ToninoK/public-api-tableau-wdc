let $profiles = $('#profiles')
let $profilesSpinner = $('#profilesSpinner').hide()
let $profilesTable = $('#profilesTable')
let $adaccountsSpinner = $('#adaccountsSpinner')

async function onProfilesSubmit(e) {
    e.preventDefault()
    $profilesSpinner.show()
    let selectedProfiles = $profiles.serializeArray()
    for (const selected of selectedProfiles) {
        if (selected.name === 'daterange') {
            continue
        }
        let parts = selected.name.split('_')
        let network = parts[0]

        if (parts[1] === 'profile') {
            SBKS.profiles_selected[network] = SBKS.profiles_selected[network] || {}
            SBKS.profiles_selected[network][selected.value] = false
        }
        if (parts[1] === 'adaccount') {
            SBKS.profiles_selected['facebook_ads'] = SBKS.profiles_selected['facebook_ads'] || []
            SBKS.profiles_selected['facebook_ads'].push(selected.value)
        }
    }

    for (const selected of selectedProfiles) {
        let parts = selected.name.split('_')
        let network = parts[0]

        if (parts[1] === 'insights') {
            SBKS.profiles_selected[network] = SBKS.profiles_selected[network] || {}
            SBKS.profiles_selected[network][selected.value] = true
        }
    }

    for (const label of SBKS.profile_labels) {
        for (const profile of label.profiles) {
            if (!(profile.platform in SBKS.profiles_selected)) {
                continue
            }

            if (profile.id in SBKS.profiles_selected[profile.platform]) {
                label.selected_profiles.push(profile)
            }
        }
    }

    $profiles.hide()
    if (SBKS.data_source === 'profile') {
        renderProfileMetrics()
    } else if (SBKS.data_source === 'aggregated_post') {
        renderAggregatedPostMetrics()
    } else if (SBKS.data_source === 'posts') {
        renderPosts()
    } else if (SBKS.data_source === 'facebook_ads') {
        renderFacebookAds() 
    }
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$(function() {
    $('#daterangeAccounts').daterangepicker({
        opens: 'right'
    }, prepareFacebookAds);
});

$(function () {
    $profiles.submit(onProfilesSubmit)

    $('[data-source-type]').click(function (e) {
        e.preventDefault()
        SBKS.data_source = $(this).data('source-type')
        $('#data_source').text($(this).text())
        if(SBKS.data_source === 'facebook_ads') {
            $('#adAccountRange').css('visibility', 'visible')
            renderAdAccounts()
        }
        else {
            $('#adAccountRange').css('visibility', 'hidden')
            renderProfiles()
        }
        $('#search').keyup()
    })

    $(document).on('change', '[data-select-multiple]', function () {
        let self = $(this)
        $(`tr[data-hidden=0] input[name=${self.data('select-multiple')}]`).each(function () {
            $(this).prop('checked', self.prop('checked')).change()
        })
    })

    $(document).on('change', 'input[type=checkbox][name$=_profile]', function () {
        $('#profiles button[type=submit]')
            .prop('disabled', !$('input[type=checkbox][name$=_profile]:checked').length)
    })

    $(document).on('change', 'input[type=checkbox][name$=_adaccount]', function () {
        $('#profiles button[type=submit]')
            .prop('disabled', !$('input[type=checkbox][name$=_adaccount]:checked').length)
    })

    $(document).on('click', '#profiles tbody tr', function (e) {
        if (e.target.type !== 'checkbox') {
            let $checkbox = $(this).find(':checkbox').first()
            $checkbox.prop('checked', !$checkbox.prop('checked')).change()
        }
    })

    $(document).on('keyup', '#search', function () {
        filterProfiles($(this).val())

        if (!$('tr[data-hidden=0]').length) {
            let self = $(this)
            let value = self.val()
            self.val(value.substring(0, value.length - 1)).keyup()
        }
    })

    $(document).on('click', 'th.toggleTbody', function () {
        let self = $(this)
        let network = self.parents('thead').data('network')
        let tbody = $(`tbody[data-network=${network}]`)
        let icon = self.find('ion-icon')

        if (icon.attr('name') === 'caret-up-outline') {
            tbody.css('display', 'none')
            icon.attr('name', 'caret-down-outline')
        } else {
            tbody.css('display', '')
            icon.attr('name', 'caret-up-outline')
        }
    })

    $('#clearSearch').click(function () {
        $('#search').val('').keyup()
    })
})

function filterProfiles(search) {
    for (const [network, profiles] of Object.entries(SBKS.profiles)) {
        if (!profiles || !profiles.length) {
            return
        }

        let hasProfiles = false
        for (const profile of profiles) {
            let show = !search || profile.name.match(new RegExp('(' + search + ')', 'gi'))
            hasProfiles = hasProfiles || show
            $(`tr[data-profile-id='${profile.id}']`)
                .css('display', show ? '' : 'none')
                .attr('data-hidden', show ? '0' : '1')
        }

        $(`thead[data-network=${network}]`)
            .css('display', hasProfiles ? '' : 'none')
            .attr('data-hidden', hasProfiles ? '0' : '1')
    }
}


async function prepareFacebookAds(start, end, label) {
    let dateRange = parseDateRange(`${start.format('MM/DD/YYYY')} - ${end.format('MM/DD/YYYY')}`)
    let adjustedDateRange = adjustDateRange(dateRange)
    await setAdAccounts(adjustedDateRange.start, adjustedDateRange.end, true)
    await setCampaigns(adjustedDateRange.start, adjustedDateRange.end)
}

async function setAdAccounts(start, end, render) {
    $adaccountsSpinner.show()
    let response = await callSbksApi(
        '3/ads/accounts',
        'POST',
        {
            date_start: start,
            date_end: end,
        }
    )

    SBKS.adaccounts = response.success ? response.ad_accounts : []
    if (render) {
        renderAdAccounts()
    }
    $adaccountsSpinner.hide()
}

async function setCampaigns(start, end) {
    let response = await callSbksApi(
        '3/facebook/ads/metrics',
        'POST',
        {
            'ad_accounts': SBKS.adaccounts.map((item) => item.id),
            'date_start': start,
            'date_end': end,
            'metrics': [{'metric': 'clicks'}],
            'dimensions': [
                {
                    'type': 'campaign',
                    'fields': [
                        'campaign_name',
                    ],
                    'group': {
                        'limit': 2000,
                    },
                },
            ]
        },
    )

	const campaignsFormatted = []
    if (response.success) {
		const campaigns = response.header[0]
		for (let i = 0; i < campaigns.fields.length; i++) {
			campaignsFormatted.push({
				id: campaigns.rows[i],
				name: campaigns.fields[i].campaign_name,
			})
		}
    }
    SBKS.campaigns = campaignsFormatted
}

function renderAdAccounts() {
    $profilesTable.html('')
    $profilesTable.append($(`
            <thead data-network="facebook">
                <tr>
                    <th style="width: 30px" title="Select all">
                        <input class="form-check-input" type="checkbox" data-select-multiple="facebook_adaccount" />
                    </th>
                    <th>
                        <ion-icon style="vertical-align: sub;font-size: 22px;"
                            title="facebook" name="${SBKS.icons["facebook"]}"></ion-icon> Facebook
                    </th>
                    <th>ID</th>
                </tr>
            </thead>`)
    )
    let $tbody = $(`<tbody data-network="facebook">`)
    for (const account of SBKS.adaccounts) {
        renderAdAccount(account, $tbody)
    }
    $profilesTable.append($tbody)
    $profiles.show()
}

function renderProfiles() {
    $profilesTable.html('')

    for (const [network, profiles] of Object.entries(SBKS.profiles)) {
        if (!profiles || !profiles.length || (SBKS.data_source === 'profile' && network === 'vkontakte')) {
            continue
        }

        $profilesTable.append($(`
            <thead data-network="${network}">
                <tr>
                    <th style="width: 30px" title="Select all">
                        <input class="form-check-input" type="checkbox" data-select-multiple="${network}_profile" />
                    </th>
                    <th>
                        <ion-icon style="vertical-align: sub;font-size: 22px;"
                            title="${network}" name="${SBKS.icons[network]}"></ion-icon> ${network}</th>
                    <th>ID</th>
                    <th>Insights</th>
                    <th class="toggleTbody" title="Toggle"><ion-icon name="caret-up-outline"></ion-icon></th>
                </tr>
            </thead>`)
        )
        let $tbody = $(`<tbody data-network="${network}">`)
        for (const profile of profiles) {
            renderProfile(network, profile, $tbody)
        }
        $profilesTable.append($tbody)
    }

    $profiles.show()
}

function renderProfile(network, profile, $tbody) {
    $tbody.append(
        $(`<tr data-profile-id="${profile.id}" data-hidden="0">
               <td><input class="form-check-input" type="checkbox" name="${network}_profile" value="${profile.id}"></td>
               <td><img src="${profile.picture}" alt="${profile.name}"/> ${profile.name}</td>
               <td>${profile.id}</td>
               <td colspan="2">
                   <input class="form-check-input" style="display: ${profile.insights_enabled ? 'block' : 'none'}" 
                          type="checkbox" name="${network}_insights" value="${profile.id}">
               </td>
           </tr>`)
    )
}

function renderAdAccount(account, $tbody) {
    $tbody.append(
        $(`<tr data-profile-id="${account.id}" data-hidden="0">
               <td><input class="form-check-input" type="checkbox" name="facebook_adaccount" value="${account.id}"></td>
               <td>${account.name}</td>
               <td>${account.id}</td>
           </tr>`)
    )
}
