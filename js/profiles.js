let $profiles = $('#profiles')
let $profilesSpinner = $('#profilesSpinner').hide()
let $profilesTable = $('#profilesTable')

async function onProfilesSubmit(e) {
    e.preventDefault()
    $profilesSpinner.show()
    let selectedProfiles = $profiles.serializeArray()
    for (const selected of selectedProfiles) {
        let parts = selected.name.split('_')
        let network = parts[0]

        if (parts[1] === 'profile') {
            SBKS.profiles_selected[network] = SBKS.profiles_selected[network] || {}
            SBKS.profiles_selected[network][selected.value] = false
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
    }
}

$(function () {
    $profiles.submit(onProfilesSubmit)

    $('[data-source-type]').click(function () {
        SBKS.data_source = $(this).data('source-type')
        $('#data_source').text($(this).text())

        renderProfiles()
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
            $(`tr[data-profile-id=${profile.id}]`)
                .css('display', show ? '' : 'none')
                .attr('data-hidden', show ? '0' : '1')
        }

        $(`thead[data-network=${network}]`)
            .css('display', hasProfiles ? '' : 'none')
            .attr('data-hidden', hasProfiles ? '0' : '1')
    }
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
