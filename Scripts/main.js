requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'lodash', 'heroes', 'cards', 'modal', 'conflict', 'constants', 'herofunctions', 'Cards/supply'],
    function($, ko, _, heroes, cards, modal, conflict, C$, hf, supply) {
        $(document)
            .ready(function () {

                var args = _(decodeURIComponent(location.search.slice(1)).split('&')).map(function(pair) { return pair.split('='); }).fromPairs().value(),
                    hero = _(heroes).find(function (h) { return h.imageName() === args.Hero;}),
                    possibleAbilities = _(hero.classCards).filter(function(c) { return c instanceof hf.Ability; }).value(),
                    possibleEquipment = _.concat(cards.Equipment, _(hero.classCards).filter(function (c) { return c instanceof hf.Equipment; }).value()),
                    possibleArmour = _.concat(cards.Armour, _(hero.classCards).filter(function(c) { return c instanceof hf.Armour; }).value()),
                    possibleWeapons = _.concat(cards.Weapons, _(hero.classCards).filter(function(c) { return c instanceof hf.Weapon }).value()),
                    possibleAttachments = _.concat(cards.Attachments, _(hero.classCards).filter(function (c) { return c instanceof hf.Attachment; }).value());

                _(args.Abilities.split(',')).compact().forEach(function(index) { hero.AddCard(possibleAbilities[index]); });
                _(args.External.split(',')).compact().forEach(function(index) { hero.AddCard(cards.External[index]); });
                _(args.Equipment.split(',')).compact().forEach(function(index) { hero.AddCard(possibleEquipment[index]); });
                if (args.Armour && args.Armour !== '') {
                    hero.AddCard(possibleArmour[args.Armour]);
                }

                _(args.Weapons.split(','))
                    .map(function(wepstring) { return wepstring.split('_'); })
                    .map(function (wepattpair) {
                        return {
                            WeaponIndex: wepattpair[0],
                            AttachmentIndices: (wepattpair[1] || '').split('-')
                        };
                    })
                    .forEach(function(wepappobj) {
                        var weapon = possibleWeapons[wepappobj.WeaponIndex];
                        hero.AddCard(weapon);
                        _(wepappobj.AttachmentIndices).compact().forEach(function(index) { weapon.attachments.push(possibleAttachments[index]); });
                    });

                var supplyCards = ko.observableArray(supply.Cards);
                var myViewModel = {
                    hero: hero,
                    modal: modal,
                    conflict: conflict,
                    supply: supplyCards,
                    CloseSupply: supply.Close,
                    AddSupply: function (card) {
                        supply.Close();
                        hero.AddCard(card);
                        hero.publishEventWithFollowOn(C$.SUPPLY);
                    },
                    C$: C$,
                    enfullscreenify: function() {
                        var html = $('html')[0];
                        html.webkitRequestFullScreen();
                    }
                };

                //set max height on operations container so that window scrollbar doesn't show
                var onCharacterCardLoaded = function() {
                    $('#operationsContainer').css('max-height', ($(window).height() * 0.99 - $('#operationsContainer').offset().top - 22));
                };
                $("#characterCard")
                    .one("load",
                        function() {
                            onCharacterCardLoaded();
                        })
                    .each(function() {
                        if (this.complete) {
                            //loaded from cache
                            onCharacterCardLoaded();
                        }
                    });

                ko.applyBindings(myViewModel);
            });
    });
