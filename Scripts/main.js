﻿requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'lodash', 'heroes', 'cards', 'modal', 'conflict', 'constants', 'herofunctions', 'Cards/supply'],
    function($, ko, _, heroes, cards, modal, conflict, C$, hf, supply) {
        $(document)
            .ready(function () {

                var args = _(decodeURIComponent(location.search.slice(1)).split('&')).map(pair => pair.split('=')).fromPairs().value(),
                    hero = _(heroes).find(h => h.imageName() === args.Hero),
                    possibleAbilities = _(hero.classCards).filter(c => c instanceof hf.Ability).value(),
                    possibleEquipment = cards.Equipment,
                    possibleArmour = _.concat(cards.Armour, _(hero.classCards).filter(c => c instanceof hf.Armour).value()),
                    possibleWeapons = _.concat(cards.Weapons, _(hero.classCards).filter(c => c instanceof hf.Weapon).value()),
                    possibleAttachments = cards.Attachments;

                _(args.Abilities.split(',')).compact().forEach(index => hero.AddCard(possibleAbilities[index]));
                _(args.External.split(',')).compact().forEach(index => hero.AddCard(cards.External[index]));
                _(args.Equipment.split(',')).compact().forEach(index => hero.AddCard(possibleEquipment[index]));
                if (args.Armour && args.Armour !== '') {
                    hero.AddCard(possibleArmour[args.Armour]);
                }

                _(args.Weapons.split(','))
                    .map(wepstring => wepstring.split('_'))
                    .map(wepattpair => {
                        return {
                            WeaponIndex: wepattpair[0],
                            AttachmentIndices: (wepattpair[1] || '').split('-')
                        }
                    })
                    .forEach(wepappobj => {
                        var weapon = possibleWeapons[wepappobj.WeaponIndex];
                        hero.AddCard(weapon);
                        _(wepappobj.AttachmentIndices).compact().forEach(index => weapon.attachments.push(possibleAttachments[index]));
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
                        hero.event(C$.SUPPLY);
                    },
                    C$: C$
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
