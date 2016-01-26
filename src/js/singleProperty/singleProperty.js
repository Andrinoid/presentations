import bindings from './../bindings';
import temporaryData from '../../../static/tests/json_structure/place';
import seller from '../../../static/tests/json_structure/user';

console.log(temporaryData);
console.log(seller);

var inline = new Inline({debug: true});

class SinglePropertyModel {
    constructor() {
    	var lang = 'en';
		rivets.bind($('#singlePropertyTmpl'),
			{
				beds: temporaryData.beds,
				rooms: temporaryData.rooms,
				type: temporaryData.type,
				pictures: temporaryData.pictures,
				title: temporaryData.title[lang],
				description: temporaryData.desc[lang],
				sellerName: seller.displayName,
				sellerPicture: seller.image,
			});
    }
}

new SinglePropertyModel();