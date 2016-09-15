requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'lodash', 'heroes', 'cards', 'herofunctions'],
    function ($, ko, _, heroes, cards, hf) {
        var C$ = {
            HERO: 1,
            ABILITY: 2,
            EQUIPMENT: 3,
            ARMOUR: 4,
            WEAPON: 5,
            ATTACHMENT: 6,
            EXTERNAL: 7
        };

        var showModal = function () { $('.modal-over').css('display', 'inline-flex'); };

        var mode = ko.observable(C$.HERO);


        $(document)
            .ready(function () {

                var close = function() { $('.modal-over').hide(); },
                    hero = ko.observable(null),
                    setHero = function(h) {
                        hero(h);
                        close();
                    },
                    attachmentsForWeapon = ko.observable(null);

                var weapons = ko.pureComputed(function() {
                        return _.concat(cards.Weapons, _(hero().classCards).filter(function(c) { return c instanceof hf.Weapon; }).value());
                    }),
                    attachments = ko.pureComputed(function() {
                        return _.concat(cards.Attachments, _(hero().classCards).filter(function(c) { return c instanceof hf.Attachment; }).value());
                    }),
                    armour = ko.pureComputed(function() {
                        return _.concat(cards.Armour, _(hero().classCards).filter(function(c) { return c instanceof hf.Armour; }).value());
                    }),
                    equipment = ko.pureComputed(function () {
                        return _.concat(cards.Equipment, _(hero().classCards).filter(function (c) { return c instanceof hf.Equipment; }).value());
                    }),
                    abilities = ko.pureComputed(function() {
                        return _(hero().classCards).filter(function(c) { return c instanceof hf.Ability; }).value();
                    });

                var myViewModel = {
                    hero: hero,
                    heroes: heroes,
                    C$: C$,
                    Mode: mode,
                    ShowHeroes: function() {
                        mode(C$.HERO);
                        showModal();
                    },
                    ShowAbilities: function() {
                        mode(C$.ABILITY);
                        showModal();
                    },
                    ShowEquipment: function () {
                        mode(C$.EQUIPMENT);
                        showModal();
                    },
                    ShowArmour: function () {
                        mode(C$.ARMOUR);
                        showModal();
                    },
                    ShowWeapons: function () {
                        mode(C$.WEAPON);
                        showModal();
                    },
                    ShowAttachments: function (weapon) {
                        attachmentsForWeapon(weapon);
                        mode(C$.ATTACHMENT);
                        showModal();
                    },
                    ShowExternal: function() {
                        mode(C$.EXTERNAL);
                        showModal();
                    },
                    Close: close,
                    SetHero: setHero,
                    AvailableAbilities: ko.pureComputed(function() {
                        return hero() != null ? _.difference(abilities(), hero().purchasedAbilities()) : [];
                    }),
                    AvailableEquipment: ko.pureComputed(function() {
                        return hero() != null ? _.difference(equipment(), hero().equipment()) : [];
                    }),
                    AvailableArmour: ko.pureComputed(function() { return hero() != null ? armour() : []; }),
                    AvailableMelee: ko.pureComputed(function () {
                        return hero() != null ? _.difference(_.filter(weapons(), ['ranged', false]), hero().weapons()) : [];
                    }),
                    AvailableRanged: ko.pureComputed(function () {
                        return hero() != null ? _.difference(_.filter(weapons(), 'ranged'), hero().weapons()) : [];
                    }),
                    AttachmentsForWeapon: attachmentsForWeapon,
                    AvailableAttachments: ko.pureComputed(function() {
                        return hero() != null && attachmentsForWeapon() != null
                            ? function () {
                                var existingTraits = _(attachmentsForWeapon().attachments()).flatMap(function(a) { return a.trait; }).value();
                                //cannot choose an attachment already in use or with the same trait as one on this weapon
                                return _.difference(_(attachments())
                                    .filter(function(a) {
                                        return a.ranged === attachmentsForWeapon().ranged && _(a.trait).every(function(t) { return !_(existingTraits).includes(t); });
                                    })
                                    .value(),
                                    _(hero().weapons()).flatMap(function(w) { return w.attachments(); }).value());
                            }()
                            : [];
                    }),
                    AvailableExternal: ko.pureComputed(function() {
                        return hero() != null
                            ? _(cards.External).filter(function(card) { return card.owner !== hero().imageName(); }).difference(hero().purchasedAbilities()).value()
                            : [];
                    }),
                    AddCard: function (card) {
                        hero().AddCard(card);
                        close();
                    },
                    AddAttachment: function(card) {
                        attachmentsForWeapon().attachments.push(card);
                        close();
                    },
                    RemoveCard: function(card) {
                        //if weapon, remove attachments
                        _(_(card).get('attachments', {})).result('removeAll', null);
                        //no onRemove on cards, so remove all, reset hero extras and readd
                        var c = hero().cards().slice();
                        hero().cards.removeAll();
                        hero().extraEndurance(0);
                        hero().extraHealth(0);
                        hero().extraSpeed(0);
                        _.remove(c, card);
                        _(c).forEach(hero().AddCard);
                    },
                    Finished: function () {
                        var page = _.initial(location.href.split('/')).join('/') + '/Hero.html?';
                        var arguments = [
                            'Hero=' + hero().imageName(),
                            'Abilities=' + _(hero().purchasedAbilities()).filter(function(card) { return !card.isExternal; }).map(function(ability) { return abilities().indexOf(ability); }).join(','),
                            'External=' + _(hero().purchasedAbilities()).filter(function(card) { return card.isExternal; }).map(function(ability) { return cards.External.indexOf(ability); }).join(','),
                            'Equipment=' + _(hero().equipment()).map(function(item) { return equipment().indexOf(item); }).join(','),
                            'Armour=' + (hero().armour() ? armour().indexOf(hero().armour()) : ''),
                            'Weapons=' + _(hero().weapons()).map(function(weapon) {
                                return weapons().indexOf(weapon) +
                                    '_' +
                                    _(weapon.attachments()).map(function(attachment) { return attachments().indexOf(attachment); }).join('-');
                            }).join(',')
                        ];
                        location.replace(page + encodeURIComponent(_(arguments).join('&')));
                    }
                };

                ko.applyBindings(myViewModel);
            });
    });
