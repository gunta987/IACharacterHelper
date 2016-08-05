requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'heroes'], function ($, ko, heroes) {
    $(document).ready(function () {

        var myViewModel = {
            hero: heroes[0]
        };

        ko.applyBindings(myViewModel);
    });
})
