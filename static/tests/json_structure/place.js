
// full place object
var place = {
    id: 471,
    ownerId: 24,
    isDirectOrder: true,
    rank: 1,
    complete: 75,
    views: 1235,
    type: 'House',
    title: {
        en: 'Vorubrunir', 
        is: 'Vorubrunir'
    }, 
    desc: {
        en: 'Huggulegur heilsarsbustaur i vel gronu ...', 
        is: 'Huggulegur heilsarsbustaur i vel gronu ...',
    },
    delivery: {
        en: 'Keys are delivered ...', 
        is: 'Lyklar eru afhentir ...',
    },
    street: 'Laugavegur',
    number: '2', 
    postal: '801',
    locality: 'Selfoss',
    region: 'South',
    group: '',
    geo: {
        lat: 64.2589127, 
        lng: -20.5059814
    }, 
    price: {
        swd: 25000, 
        swe: 22000, 
        wwd: 21000, 
        wwe: 19000
    },
    placeType: 'house',
    rooms: 4,
    beds: 4,
    pictures: [
        {
            id: 6518,
            small: '6518_small.jpg',
            medium: '6518_medium.jpg',
            large: '6518_large.jpg', 
            path: '/media/images/',
            subject: 'summer' // ['summer', 'winter', 'inside', 'nearby']
        },

        {
            id: 6518,
            small: '6518_small.jpg',
            medium: '6518_medium.jpg',
            large: '6518_large.jpg', 
            path: '/media/images/',
            subject: 'summer' // ['summer', 'winter', 'inside', 'nearby']
        },

        {
            id: 6518,
            small: '6518_small.jpg',
            medium: '6518_medium.jpg',
            large: '6518_large.jpg', 
            path: '/media/images/',
            subject: 'summer' // ['summer', 'winter', 'inside', 'nearby']
        },

        {
            id: 6518,
            small: '6518_small.jpg',
            medium: '6518_medium.jpg',
            large: '6518_large.jpg', 
            path: '/media/images/',
            subject: 'summer' // ['summer', 'winter', 'inside', 'nearby']
        },

        {
            id: 6518,
            small: '6518_small.jpg',
            medium: '6518_medium.jpg',
            large: '6518_large.jpg', 
            path: '/media/images/',
            subject: 'summer' // ['summer', 'winter', 'inside', 'nearby']
        },
    ],
    videos: [
        'mfkh4kof',
    ],
    features: [
        34, 
        25, 
        5 
    ], 
    discounts: [ // min days discount
        {
            days: 10,
            discount: 15
        }
    ],
    conditions: [    
        {
            is: 'reykingar bannaðar',
            en: 'no smoking'
        }
    ],
    extra: {
        foo: 'bar'
    },
    created: '2015-02-02T15:30',
    modified: '2015-03-03T17:30',
    isActive: true
}

// slim place object for list
var slimPlace = {
    id: 471,
    ownerId: 24,
    directOrder: true,
    rank: 1,
    complete: 75,
    views: 1235,
    title: {
        en: 'Vorubrunir', 
        is: 'Vorubrunir'
    }, 
    desc: {
        en: 'Huggulegur heilsarsbustaur i vel gronu ...', 
        is: 'Huggulegur heilsarsbustaur i vel gronu ...',
    },
    picture: {
        id: 6518,
        small: '6518_small.jpg',
        medium: '6518_medium.jpg',
        large: '6518_large.jpg', 
        path: '/media/images/',
    },
    locality: 'Selfoss',
    group: '',
    street: 'Laugavegur',
    number: '2', 
    postal: '801',
    region: {
        is: 'Suðurland',
        en: 'South'
    },
    price: {
        swd: 25000, 
        swe: 22000, 
        wwd: 21000, 
        wwe: 19000
    },
    rooms: 4,
    beds: 4,
}

export default place;
