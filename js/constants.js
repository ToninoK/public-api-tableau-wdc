// SHARED CONFIG
let SBKS = {
    apiUrl: 'https://api.socialbakers.com/',
    postsUrl: {
        facebook: '3/facebook/page/posts',
        instagram: '3/instagram/profile/posts',
        youtube: '3/youtube/profile/videos',
        twitter: '3/twitter/profile/tweets',
        linkedin: '3/linkedin/profile/posts',
        pinterest: '3/pinterest/profile/posts',
        vkontakte: '3/vkontakte/profile/posts'
    },
    data_source: 'profile',
    networks: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
    icons: {
        facebook: 'logo-facebook',
        instagram: 'logo-instagram',
        twitter: 'logo-twitter',
        youtube: 'logo-youtube',
        linkedin: 'logo-linkedin',
        pinterest: 'logo-pinterest',
        vk: 'logo-vk'
    },
    profiles: {},
    profiles_selected: {},
    profile_labels: [],
    post_labels: [],
    profile_labels_selected: [],
    profile_metrics: {},
    profile_dimensions: {},
    profiles_with_no_labels: {},
    profile_name_by_id: {},
    aggregated_post_metrics: [],
    aggregated_post_dimensions: [],
    posts_filters: {},
    posts_networks: {}
}

// COUNTRIES
let COUNTRIES = [
    "Andorra",
    "United Arab Emirates",
    "Afghanistan",
    "Antigua",
    "Anguilla",
    "Albania",
    "Armenia",
    "Netherlands Antilles",
    "Angola",
    "Antarctica",
    "Argentina",
    "American Samoa",
    "Austria",
    "Australia",
    "Aruba",
    "Aland Islands",
    "Azerbaijan",
    "Bosnia and Herzegovina",
    "Barbados",
    "Bangladesh",
    "Belgium",
    "Burkina Faso",
    "Bulgaria",
    "Bahrain",
    "Burundi",
    "Benin",
    "Saint Barthélemy",
    "Bermuda",
    "Brunei",
    "Bolivia",
    "Bonaire, Sint Eustatius and Saba",
    "Brazil",
    "The Bahamas",
    "Bhutan",
    "Bouvet Island",
    "Botswana",
    "Belarus",
    "Belize",
    "Canada",
    "Cocos (Keeling) Islands",
    "Democratic Republic of the Congo",
    "Central African Republic",
    "Republic of the Congo",
    "Switzerland",
    "Côte d'Ivoire",
    "Cook Islands",
    "Chile",
    "Cameroon",
    "China",
    "Colombia",
    "Costa Rica",
    "Cape Verde",
    "Curaçao",
    "Christmas Island",
    "Cyprus",
    "Czech Republic",
    "Germany",
    "Djibouti",
    "Denmark",
    "Dominica",
    "Dominican Republic",
    "Algeria",
    "Ecuador",
    "Estonia",
    "Egypt",
    "Western Sahara",
    "Eritrea",
    "Spain",
    "Ethiopia",
    "Finland",
    "Fiji",
    "Falkland Islands",
    "Federated States of Micronesia",
    "Faroe Islands",
    "France",
    "Gabon",
    "United Kingdom",
    "Grenada",
    "Georgia",
    "French Guiana",
    "Guernsey",
    "Ghana",
    "Gibraltar",
    "Greenland",
    "The Gambia",
    "Guinea",
    "Guadeloupe",
    "Equatorial Guinea",
    "Greece",
    "South Georgia and the South Sandwich Islands",
    "Guatemala",
    "Guam",
    "Guinea-Bissau",
    "Guyana",
    "Hong Kong",
    "Heard Island and McDonald Islands",
    "Honduras",
    "Croatia",
    "Haiti",
    "Hungary",
    "Indonesia",
    "Ireland",
    "Israel",
    "Isle Of Man",
    "India",
    "British Indian Ocean Territory",
    "Iraq",
    "Iceland",
    "Italy",
    "Jersey",
    "Jamaica",
    "Jordan",
    "Japan",
    "Kenya",
    "Kyrgyzstan",
    "Cambodia",
    "Kiribati",
    "Comoros",
    "Saint Kitts and Nevis",
    "South Korea",
    "Kuwait",
    "Cayman Islands",
    "Kazakhstan",
    "Laos",
    "Lebanon",
    "St. Lucia",
    "Liechtenstein",
    "Sri Lanka",
    "Liberia",
    "Lesotho",
    "Lithuania",
    "Luxembourg",
    "Latvia",
    "Libya",
    "Morocco",
    "Monaco",
    "Moldova",
    "Montenegro",
    "Saint Martin",
    "Madagascar",
    "Marshall Islands",
    "Macedonia",
    "Mali",
    "Myanmar",
    "Mongolia",
    "Macau",
    "Northern Mariana Islands",
    "Martinique",
    "Mauritania",
    "Montserrat",
    "Malta",
    "Mauritius",
    "Maldives",
    "Malawi",
    "Mexico",
    "Malaysia",
    "Mozambique",
    "Namibia",
    "New Caledonia",
    "Niger",
    "Norfolk Island",
    "Nigeria",
    "Nicaragua",
    "Netherlands",
    "Norway",
    "Nepal",
    "Nauru",
    "Niue",
    "New Zealand",
    "Oman",
    "Panama",
    "Peru",
    "French Polynesia",
    "Papua New Guinea",
    "Philippines",
    "Pakistan",
    "Poland",
    "Saint Pierre and Miquelon",
    "Pitcairn",
    "Puerto Rico",
    "Palestine",
    "Portugal",
    "Palau",
    "Paraguay",
    "Qatar",
    "Réunion",
    "Romania",
    "Serbia",
    "Russia",
    "Rwanda",
    "Saudi Arabia",
    "Solomon Islands",
    "Seychelles",
    "Sweden",
    "Singapore",
    "Saint Helena",
    "Slovenia",
    "Svalbard and Jan Mayen",
    "Slovakia",
    "Sierra Leone",
    "San Marino",
    "Senegal",
    "Somalia",
    "Suriname",
    "South Sudan",
    "Sao Tome and Principe",
    "El Salvador",
    "Sint Maarten",
    "Swaziland",
    "Turks and Caicos Islands",
    "Chad",
    "French Southern Territories",
    "Togo",
    "Thailand",
    "Tajikistan",
    "Tokelau",
    "Timor-Leste",
    "Turkmenistan",
    "Tunisia",
    "Tonga",
    "Turkey",
    "Trinidad and Tobago",
    "Tuvalu",
    "Taiwan",
    "Tanzania",
    "Ukraine",
    "Uganda",
    "United States Minor Outlying Islands",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vatican City",
    "Saint Vincent and the Grenadines",
    "Venezuela",
    "British Virgin Islands",
    "US Virgin Islands",
    "Vietnam",
    "Vanuatu",
    "Wallis and Futuna",
    "Samoa",
    "Kosovo",
    "Yemen",
    "Mayotte",
    "South Africa",
    "Zambia",
    "Zimbabwe"
]

// PROFILES
let PROFILE_COMMON_DIMENSIONS = ['profile', 'profile_label']
let PROFILE_METRICS = {
    facebook: {
        'fans_change': PROFILE_COMMON_DIMENSIONS,
        'fans_lifetime': PROFILE_COMMON_DIMENSIONS,
        'insights_activity': PROFILE_COMMON_DIMENSIONS.concat(['activity_type']),
        'insights_activity_unique': PROFILE_COMMON_DIMENSIONS.concat(
            ['activity_type', 'gender_age', 'city', 'country', 'locale']
        ),
        'insights_engaged_users': PROFILE_COMMON_DIMENSIONS,
        'insights_fan_adds': PROFILE_COMMON_DIMENSIONS.concat(['like_source']),
        'insights_fan_adds_unique': PROFILE_COMMON_DIMENSIONS.concat(['like_source']),
        'insights_fan_removes': PROFILE_COMMON_DIMENSIONS,
        'insights_fan_removes_unique': PROFILE_COMMON_DIMENSIONS.concat(['unlike_source']),
        'insights_fans_lifetime': PROFILE_COMMON_DIMENSIONS.concat(['gender_age', 'city', 'country', 'locale']),
        'insights_fans_online': PROFILE_COMMON_DIMENSIONS.concat(['hour_of_day']),
        'insights_impressions': PROFILE_COMMON_DIMENSIONS.concat(['activity_type', 'post_attribution']),
        'insights_negative_feedback': PROFILE_COMMON_DIMENSIONS,
        'insights_positive_feedback': PROFILE_COMMON_DIMENSIONS.concat(['positive_feedback_type']),
        'insights_post_clicks': PROFILE_COMMON_DIMENSIONS.concat(['click_type']),
        'insights_post_clicks_unique': PROFILE_COMMON_DIMENSIONS.concat(['click_type']),
        'insights_post_impressions': PROFILE_COMMON_DIMENSIONS.concat(['post_attribution']),
        'insights_post_reach': PROFILE_COMMON_DIMENSIONS.concat(['post_attribution', 'frequency_distribution']),
        'insights_reach': PROFILE_COMMON_DIMENSIONS.concat(['gender_age', 'post_attribution']),
        'insights_reach_28_days': PROFILE_COMMON_DIMENSIONS.concat(['gender_age']),
        'insights_reach_7_days': PROFILE_COMMON_DIMENSIONS.concat(['gender_age']),
        'insights_reach_engagement': PROFILE_COMMON_DIMENSIONS,
        'insights_reactions': PROFILE_COMMON_DIMENSIONS.concat(['reaction_type']),
        'insights_video_complete_views_30s': PROFILE_COMMON_DIMENSIONS.concat(['play_type', 'post_attribution']),
        'insights_video_complete_views_30s_repeat_views': PROFILE_COMMON_DIMENSIONS,
        'insights_video_complete_views_30s_unique': PROFILE_COMMON_DIMENSIONS,
        'insights_video_repeat_views': PROFILE_COMMON_DIMENSIONS,
        'insights_video_views': PROFILE_COMMON_DIMENSIONS.concat(['play_type', 'post_attribution']),
        'insights_video_views_unique': PROFILE_COMMON_DIMENSIONS,
        'insights_views': PROFILE_COMMON_DIMENSIONS
    },
    instagram: {
        'followers_change': PROFILE_COMMON_DIMENSIONS,
        'followers_lifetime': PROFILE_COMMON_DIMENSIONS,
        'following_change': PROFILE_COMMON_DIMENSIONS,
        'following_lifetime': PROFILE_COMMON_DIMENSIONS,
        'insights_followers': PROFILE_COMMON_DIMENSIONS.concat(['country', 'locale', 'city', 'gender_age']),
        'insights_impressions': PROFILE_COMMON_DIMENSIONS,
        'insights_impressions_28_days': PROFILE_COMMON_DIMENSIONS,
        'insights_impressions_7_days': PROFILE_COMMON_DIMENSIONS,
        'insights_profile_clicks': PROFILE_COMMON_DIMENSIONS.concat(['click_target']),
        'insights_profile_views': PROFILE_COMMON_DIMENSIONS,
        'insights_reach': PROFILE_COMMON_DIMENSIONS,
        'insights_reach_28_days': PROFILE_COMMON_DIMENSIONS,
        'insights_reach_7_days': PROFILE_COMMON_DIMENSIONS
    },
    twitter: {
        'ff_ratio': PROFILE_COMMON_DIMENSIONS,
        'followers_change': PROFILE_COMMON_DIMENSIONS,
        'followers_lifetime': PROFILE_COMMON_DIMENSIONS,
        'following_change': PROFILE_COMMON_DIMENSIONS,
        'following_lifetime': PROFILE_COMMON_DIMENSIONS,
        'listed_change': PROFILE_COMMON_DIMENSIONS,
        'listed_lifetime': PROFILE_COMMON_DIMENSIONS
    },
    youtube: {
        'interaction_change': PROFILE_COMMON_DIMENSIONS.concat(['interaction_type']),
        'interactions_per_1k_fans': PROFILE_COMMON_DIMENSIONS,
        'subscribers_change': PROFILE_COMMON_DIMENSIONS,
        'subscribers_lifetime': PROFILE_COMMON_DIMENSIONS,
        'video_lifetime': PROFILE_COMMON_DIMENSIONS,
        'viewed_time_change': PROFILE_COMMON_DIMENSIONS,
        'views_change': PROFILE_COMMON_DIMENSIONS
    },
    linkedin: {
        'followers_change': PROFILE_COMMON_DIMENSIONS,
        'followers_lifetime': PROFILE_COMMON_DIMENSIONS
    },
    pinterest: {
        'boards_change': PROFILE_COMMON_DIMENSIONS,
        'boards_lifetime': PROFILE_COMMON_DIMENSIONS,
        'followers_change': PROFILE_COMMON_DIMENSIONS,
        'followers_lifetime': PROFILE_COMMON_DIMENSIONS,
        'following_change': PROFILE_COMMON_DIMENSIONS,
        'following_lifetime': PROFILE_COMMON_DIMENSIONS,
        'pins_lifetime': PROFILE_COMMON_DIMENSIONS
    }
}

// AGGREGATED POST
let common_agg_dimensions = ['platform', 'profile', 'post_labels', 'profile_label']
let insights_engagements = common_agg_dimensions.concat(['media_type', 'content_type'])
let engagement_rate = insights_engagements.concat(['published_status', 'sentiment_type'])
let insights_video_views = common_agg_dimensions.concat(['content_type', 'published_status', 'sentiment_type'])
let interactions = engagement_rate.concat(['interaction_type'])
let likes = common_agg_dimensions.concat(['media_type', 'sentiment_type'])
let sentiment_manual_auto = common_agg_dimensions.concat(['media_type', 'sentiment'])
let shares = insights_engagements.concat(['published_status'])
let user_posts_responded = insights_engagements.concat(['response_time'])

let AGGREGATED_POST_METRICS = {
    facebook: {
        'engagement_rate': engagement_rate,
        'insights_engagements': insights_engagements,
        'insights_impressions': engagement_rate,
        'insights_post_clicks': common_agg_dimensions.concat(['content_type', 'media_type', 'published_status']),
        'insights_reach_engagement': common_agg_dimensions.concat(['content_type', 'media_type', 'published_status']),
        'insights_reach_per_content': engagement_rate,
        'insights_video_views': insights_video_views,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'likes': likes,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'page_shares': common_agg_dimensions,
        'sentiment_manual_auto': sentiment_manual_auto,
        'shares': shares,
        'user_posts': insights_engagements,
        'user_posts_average_response_time': insights_engagements,
        'user_posts_responded': user_posts_responded,
        'user_posts_response_rate': insights_engagements,
        'user_questions_average_response_time': insights_engagements,
        'user_questions_responded': user_posts_responded,
        'user_questions_response_rate': engagement_rate
    },
    instagram: {
        'engagement_rate': engagement_rate,
        'insights_completion_rate': common_agg_dimensions.concat(['media_type']),
        'insights_engagements': insights_engagements,
        'insights_impressions': engagement_rate,
        'insights_reach_per_content': engagement_rate,
        'insights_story_exits': common_agg_dimensions.concat(['media_type']),
        'insights_story_taps_back': common_agg_dimensions.concat(['media_type']),
        'insights_story_taps_forward': common_agg_dimensions.concat(['media_type']),
        'insights_video_views': insights_video_views,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'likes': likes,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'sentiment_manual_auto': sentiment_manual_auto
    },
    twitter: {
        'engagement_rate': engagement_rate,
        'insights_engagements': insights_engagements,
        'insights_impressions': engagement_rate,
        'insights_media_views': common_agg_dimensions.concat(['content_type', 'media_type', 'sentiment_type']),
        'insights_video_views': insights_video_views,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'likes': likes,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'page_replies': common_agg_dimensions,
        'page_shares': common_agg_dimensions,
        'profile_tweets': common_agg_dimensions.concat(['media_type']),
        'sentiment_manual_auto': sentiment_manual_auto,
        'shares': shares,
        'user_posts': insights_engagements,
        'user_posts_average_response_time': insights_engagements,
        'user_posts_responded': user_posts_responded,
        'user_posts_response_rate': insights_engagements,
        'user_questions_average_response_time': insights_engagements,
        'user_questions_responded': user_posts_responded,
        'user_questions_response_rate': engagement_rate
    },
    youtube: {
        'engagement_rate': engagement_rate,
        'insights_video_views': insights_video_views,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'likes': likes,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate
    },
    linkedin: {
        'engagement_rate': engagement_rate,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'sentiment_manual_auto': sentiment_manual_auto
    },
    pinterest: {
        'interactions': interactions,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'page_shares': common_agg_dimensions,
        'shares': shares
    },
    vkontakte: {
        'engagement_rate': engagement_rate,
        'interactions': interactions,
        'interactions_per_1k_fans': engagement_rate,
        'number_of_comments': engagement_rate,
        'page_posts': engagement_rate,
        'shares': shares
    }
}

// POSTS
let ID_NAME_URL = {
    id: tableau.dataTypeEnum.string,
    name: tableau.dataTypeEnum.string,
    url: tableau.dataTypeEnum.string
}

let POSTS_SORT_FIELDS = {
    'comments': ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
    'created_time': ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
    'interactions': ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
    'interactions_per_1k_fans': ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
    'reactions': ['facebook', 'linkedin'],
    'reactions_by_type.anger': ['facebook'],
    'reactions_by_type.haha': ['facebook'],
    'reactions_by_type.like': ['facebook'],
    'reactions_by_type.love': ['facebook'],
    'reactions_by_type.sorry': ['facebook'],
    'reactions_by_type.wow': ['facebook'],
    'shares': ['facebook', 'pinterest', 'vkontakte'],
    'insights_engaged_users': ['facebook'],
    'insights_post_clicks': ['facebook'],
    'insights_reach_by_post_attribution.organic': ['facebook'],
    'insights_reach_by_post_attribution.paid': ['facebook'],
    'insights_reach_engagement_rate': ['facebook'],
    'insights_video_view_time_average': ['facebook'],
    'insights_video_views_10s': ['facebook'],
    'insights_video_views_by_post_attribution.organic': ['facebook'],
    'insights_video_views_by_post_attribution.paid': ['facebook'],
    'likes': ['instagram', 'youtube', 'vkontakte'],
    'insights_impressions': ['instagram'],
    'insights_reach': ['instagram'],
    'insights_saves': ['instagram'],
    'insights_story_completion_rate': ['instagram'],
    'insights_story_exits': ['instagram'],
    'insights_story_taps_back': ['instagram'],
    'insights_story_taps_forward': ['instagram'],
    'insights_video_views': ['instagram'],
    'dislikes': ['youtube'],
    'duration': ['youtube'],
    'video_view_time': ['youtube'],
    'video_views': ['youtube']
}

let POSTS_FILTER_FIELDS = {
    content_type: {
        facebook: ['post', 'shared'],
        instagram: ['post', 'story'],
        twitter: [],
        youtube: [],
        linkedin: [],
        pinterest: ['post', 'shared'],
        vkontakte: []
    },
    grade: {
        facebook: ['A+', 'A', 'B', 'C', 'D'],
        instagram: ['A+', 'A', 'B', 'C', 'D'],
        youtube: [],
        twitter: [],
        linkedin: [],
        pinterest: [],
        vkontakte: []
    },
    media_type: {
        facebook: ['status', 'link', 'video', 'note', 'poll', 'offer', 'photo', 'carousel'],
        instagram: ['video', 'photo', 'carousel'],
        youtube: ['video'],
        twitter: [],
        linkedin: ['status', 'link', 'video', 'photo', 'album', 'carousel'],
        pinterest: [],
        vkontakte: ['status', 'photo', 'video', 'link', 'note', 'poll', 'album']
    },
    origin: {
        facebook: ['User-Generated Content', 'Brand\'s Content'],
        instagram: [],
        youtube: [],
        twitter: ['User-Generated Content', 'Brand\'s Content'],
        linkedin: [],
        pinterest: [],
        vkontakte: ['User-Generated Content', 'Brand\'s Content']
    },
    post_attribution: {
        facebook: ['organic', 'paid'],
        instagram: ['organic', 'paid'],
        youtube: [],
        twitter: [],
        linkedin: [],
        pinterest: [],
        vkontakte: []
    },
    video_type: {
        facebook: ['crosspost', 'crosspostable', 'live', 'shared'],
        instagram: [],
        youtube: [],
        twitter: [],
        linkedin: [],
        pinterest: [],
        vkontakte: []
    },
    post_labels: { // From API
        facebook: [],
        instagram: [],
        youtube: [],
        twitter: [],
        linkedin: [],
        pinterest: [],
        vkontakte: []
    }
}

let POSTS_FIELDS = {
    attachments: {
        networks: ['facebook', 'instagram', 'linkedin', 'pinterest', 'vkontakte'],
        array: true,
        subfields: {
            title: tableau.dataTypeEnum.string,
            description: tableau.dataTypeEnum.string,
            type: tableau.dataTypeEnum.string,
            url: tableau.dataTypeEnum.string,
            image_url: tableau.dataTypeEnum.string
        }
    },
    author: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        subfields: ID_NAME_URL
    },
    channel: {networks: ['youtube'], subfields: ID_NAME_URL},
    comments: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.int
    },
    comments_sentiment: {
        networks: ['facebook'],
        subfields: {
            positive: tableau.dataTypeEnum.int,
            neutral: tableau.dataTypeEnum.int,
            negative: tableau.dataTypeEnum.int
        }
    },
    content: {networks: ['facebook', 'linkedin', 'pinterest', 'vkontakte'], type: tableau.dataTypeEnum.string},
    content_type: {
        networks: ['facebook', 'instagram', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.string
    },
    created_time: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.datetime
    },
    deleted: {networks: ['facebook'], type: tableau.dataTypeEnum.bool},
    description: {networks: ['youtube'], type: tableau.dataTypeEnum.string},
    dislikes: {networks: ['youtube'], type: tableau.dataTypeEnum.int},
    duration: {networks: ['youtube'], type: tableau.dataTypeEnum.int},
    grade: {networks: ['facebook', 'instagram'], type: tableau.dataTypeEnum.string},
    hidden: {networks: ['facebook'], type: tableau.dataTypeEnum.bool},
    id: {
        networks: ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.string
    },
    interactions: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.int
    },
    interactions_per_1k_fans: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.float
    },
    likes: {networks: ['instagram', 'youtube', 'vkontakte'], type: tableau.dataTypeEnum.int},
    media_type: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.string
    },
    origin: {networks: ['facebook', 'twitter', 'vkontakte'], type: tableau.dataTypeEnum.string},
    page: {networks: ['facebook', 'instagram', 'linkedin', 'vkontakte'], subfields: ID_NAME_URL},
    post_attribution: {
        networks: ['facebook', 'instagram'],
        subfields: {
            status: tableau.dataTypeEnum.string,
            type: tableau.dataTypeEnum.string
        }
    },
    post_labels: {
        networks: ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'pinterest', 'vkontakte'],
        array: true,
        subfields: {
            id: tableau.dataTypeEnum.string,
            name: tableau.dataTypeEnum.string
        }
    },
    profile: {networks: ['twitter', 'pinterest'], subfields: ID_NAME_URL},
    published: {networks: ['facebook'], type: tableau.dataTypeEnum.bool},
    reactions: {networks: ['facebook', 'linkedin'], type: tableau.dataTypeEnum.int},
    reactions_by_type: {
        networks: ['facebook'],
        subfields: {
            like: tableau.dataTypeEnum.int,
            love: tableau.dataTypeEnum.int,
            wow: tableau.dataTypeEnum.int,
            haha: tableau.dataTypeEnum.int,
            sorry: tableau.dataTypeEnum.int,
            anger: tableau.dataTypeEnum.int
        }
    },
    sentiment: {networks: ['facebook', 'instagram'], type: tableau.dataTypeEnum.string},
    shares: {networks: ['facebook', 'pinterest', 'vkontakte'], type: tableau.dataTypeEnum.int},
    spam: {networks: ['facebook'], type: tableau.dataTypeEnum.bool},
    universal_video_id: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    url: {
        networks: ['facebook', 'instagram', 'youtube', 'linkedin', 'pinterest', 'vkontakte'],
        type: tableau.dataTypeEnum.string
    },
    video: {
        networks: ['facebook'],
        subfields: {
            id: tableau.dataTypeEnum.string,
            length: tableau.dataTypeEnum.int,
            crosspost: tableau.dataTypeEnum.bool,
            crosspostable: tableau.dataTypeEnum.bool,
            live: tableau.dataTypeEnum.bool,
            shared: tableau.dataTypeEnum.bool
        }
    },
    video_view_time: {networks: ['youtube'], type: tableau.dataTypeEnum.int},
    video_views: {networks: ['youtube'], type: tableau.dataTypeEnum.int},
    insights_engaged_users: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_engagement: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_engagement_by_engagement_type: {
        networks: ['instagram'],
        subfields: {
            comments: tableau.dataTypeEnum.int,
            likes: tableau.dataTypeEnum.int,
            saves: tableau.dataTypeEnum.int
        }
    },
    insights_impressions: {networks: ['facebook', 'instagram'], type: tableau.dataTypeEnum.int},
    insights_impressions_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            paid: tableau.dataTypeEnum.int,
            organic: tableau.dataTypeEnum.int,
            viral: tableau.dataTypeEnum.int
        }
    },
    insights_interactions: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_interactions_by_interaction_type: {
        networks: ['facebook'],
        subfields: {
            comment: tableau.dataTypeEnum.int,
            like: tableau.dataTypeEnum.int,
            share: tableau.dataTypeEnum.int
        }
    },
    insights_negative_feedback_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_post_clicks: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_post_clicks_by_clicks_type: {
        networks: ['facebook'],
        subfields: {
            link_clicks: tableau.dataTypeEnum.int,
            button_clicks: tableau.dataTypeEnum.int,
            other_clicks: tableau.dataTypeEnum.int,
            photo_views: tableau.dataTypeEnum.int,
            video_plays: tableau.dataTypeEnum.int
        }
    },
    insights_post_clicks_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_reach: {networks: ['facebook', 'instagram'], type: tableau.dataTypeEnum.int},
    insights_reach_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            paid: tableau.dataTypeEnum.int,
            organic: tableau.dataTypeEnum.int,
            viral: tableau.dataTypeEnum.int
        }
    },
    insights_reach_engagement_rate: {networks: ['facebook'], type: tableau.dataTypeEnum.float},
    insights_reactions: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_reactions_by_type: {
        networks: ['facebook'],
        subfields: {
            like: tableau.dataTypeEnum.int,
            love: tableau.dataTypeEnum.int,
            wow: tableau.dataTypeEnum.int,
            haha: tableau.dataTypeEnum.int,
            sorry: tableau.dataTypeEnum.int,
            anger: tableau.dataTypeEnum.int
        }
    },
    insights_saves: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_story_completion_rate: {networks: ['instagram'], type: tableau.dataTypeEnum.float},
    insights_story_exits: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_story_replies: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_story_taps_back: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_story_taps_forward: {networks: ['instagram'], type: tableau.dataTypeEnum.int},
    insights_video_view_time: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_view_time_average: {networks: ['facebook'], type: tableau.dataTypeEnum.float},
    insights_video_view_time_by_distribution: {
        networks: ['facebook'],
        subfields: {
            owned: tableau.dataTypeEnum.int,
            shared: tableau.dataTypeEnum.int
        }
    },
    insights_video_view_time_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    country: {
        networks: ['facebook'],
        type: tableau.dataTypeEnum.string
    },
    insights_video_view_time_by_country: {
        networks: ['facebook'],
        type: tableau.dataTypeEnum.int
    },
    insights_video_view_time_by_gender_age: {
        networks: ['facebook'],
        subfields: {
            "U_55_64": tableau.dataTypeEnum.int,
            "M_55_64": tableau.dataTypeEnum.int,
            "U_35_44": tableau.dataTypeEnum.int,
            "F_45_54": tableau.dataTypeEnum.int,
            "M_35_44": tableau.dataTypeEnum.int,
            "M_18_24": tableau.dataTypeEnum.int,
            "F_25_34": tableau.dataTypeEnum.int,
            "U_65": tableau.dataTypeEnum.int,
            "M_25_34": tableau.dataTypeEnum.int,
            "U_18_24": tableau.dataTypeEnum.int,
            "F_65": tableau.dataTypeEnum.int,
            "U_45_54": tableau.dataTypeEnum.int,
            "F_13_17": tableau.dataTypeEnum.int,
            "F_55_64": tableau.dataTypeEnum.int,
            "M_65": tableau.dataTypeEnum.int,
            "F_35_44": tableau.dataTypeEnum.int,
            "M_13_17": tableau.dataTypeEnum.int,
            "U_25_34": tableau.dataTypeEnum.int,
            "M_45_54": tableau.dataTypeEnum.int,
            "F_18_24": tableau.dataTypeEnum.int,
        }
    },
    insights_video_views: {networks: ['facebook', 'instagram'], type: tableau.dataTypeEnum.int},
    insights_video_views_10s: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_10s_by_play_type: {
        networks: ['facebook'],
        subfields: {
            autoplayed: tableau.dataTypeEnum.int,
            click_to_play: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_10s_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_10s_by_sound: {
        networks: ['facebook'],
        subfields: {
            on: tableau.dataTypeEnum.int,
            off: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_10s_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_30s: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_30s_by_play_type: {
        networks: ['facebook'],
        subfields: {
            autoplayed: tableau.dataTypeEnum.int,
            click_to_play: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_30s_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_30s_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_average_completion: {networks: ['facebook'], type: tableau.dataTypeEnum.float},
    insights_video_views_by_play_type: {
        networks: ['facebook'],
        subfields: {
            autoplayed: tableau.dataTypeEnum.int,
            click_to_play: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_by_sound: {
        networks: ['facebook'],
        subfields: {
            on: tableau.dataTypeEnum.int,
            off: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_complete: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_complete_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_complete_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_complete_unique_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_distribution: {
        networks: ['facebook'],
        subfields: {
            owned: tableau.dataTypeEnum.int,
            shared: tableau.dataTypeEnum.int
        }
    },
    insights_video_views_unique: {networks: ['facebook'], type: tableau.dataTypeEnum.int},
    insights_video_views_unique_by_post_attribution: {
        networks: ['facebook'],
        subfields: {
            organic: tableau.dataTypeEnum.int,
            paid: tableau.dataTypeEnum.int
        }
    }
}
