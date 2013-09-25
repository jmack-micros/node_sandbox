(function(exports) {

	exports.sampleData = {
    "name": {
        "first": "Lloyd",
        "last": "Hilaiel"
    },
    "favoriteColor": "yellow",
    "languagesSpoken": [
        {
            "lang": "Bulgarian",
            "level": "advanced"
        },
        {
            "lang": "English",
            "level": "native",
            "preferred": true
        },
        {
            "lang": "Spanish",
            "level": "beginner"
        }
    ],
    "seatingPreference": [
        "window",
        "aisle"
    ],
    "drinkPreference": [
        "whiskey",
        "beer",
        "wine"
    ],
    "weight": 172
    };
    
    exports.theAnswer = function(question) {
    	return 42;
    };

})(exports);
