define(['ko', 'jquery', 'dice', 'lodash', 'constants'], function (ko, $, d, _, C$) {
    return function () {
        var self = this;
        var myDice = ko.observableArray([]);
        var weapon = ko.observable({});
        var opponentDice = ko.observableArray([]);
        var extraBlock = ko.observable(0);
        var extraPierce = ko.observable(0);
        var block = ko.pureComputed(function () {
            var block = _.reduce(opponentDice(), function (sum, die) { return sum + ((die.selectedFace() || {}).block || 0); }, 0) + extraBlock();
            var pierce = extraPierce();
            return Math.max(block - pierce, 0);
        })
        var extraEvade = ko.observable(0);
        var rollFinished = ko.pureComputed(function () {
            return _.every(myDice(), function (die) { return die.selectedFace() != null; }) &&
                _.every(opponentDice(), function (die) { return die.selectedFace() != null; })
        });
        var requiredAccuracy = ko.observable(0);
        var extraAccuracy = ko.observable(0);
        var accuracy = ko.pureComputed(function () {
            return _.reduce(myDice(), function (sum, die) { return sum + ((die.selectedFace() || {}).accuracy || 0); }, 0) + extraAccuracy();
        });
        var extraDamage = ko.observable(0);
        var damage = ko.pureComputed(function () {
            if (_.some(opponentDice(), function(die) { return (die.selectedFace() || {}).dodge; })) {
                return 0;
            }
            var damage = _.reduce(myDice(), function (sum, die) { return sum + ((die.selectedFace() || {}).damage || 0); }, 0) + extraDamage();
            return accuracy() < requiredAccuracy() ? 0 : Math.max(damage - block(), 0);
        });
        var extraSurges = ko.observable(0);
        var selectedSurges = ko.observableArray([]);
        var surges = ko.pureComputed(function () {
            if (_.some(opponentDice(), function(die) { return (die.selectedFace() || {}).dodge; })) {
                return 0;
            }
            var surge = _.reduce(myDice(), function (sum, die) { return sum + ((die.selectedFace() || {}).surge || 0); }, 0) + extraSurges() - selectedSurges().length;
            var evade = _.reduce(opponentDice(), function (sum, die) { return sum + ((die.selectedFace() || {}).evade || 0); }, 0);
            return Math.max(surge - evade - extraEvade(), 0);
        });
        var bleed = ko.observable(0);
        var stun = ko.observable(0);
        var regainStrain = ko.observable(false);

        var caption = ko.observable('');
        var conflictStage = ko.observable(C$.RANGE);

        var button1Text = ko.observable('');
        var button1 = function () { };
        var canButton1 = function () { return true; };
        var showButton1 = ko.pureComputed(function () {
            return button1Text().length > 0;
        });
        var button2Text = ko.observable('');
        var button2 = function () { };
        var canButton2 = function () { return true; };
        var showButton2 = ko.pureComputed(function () {
            return button2Text().length > 0;
        });

        var showModal = function () { $('#conflictSection').show(0, function () { $('.column').addClass('conflict'); }); };
        var closeModal = function () { $('.conflict').removeClass('conflict'); $('#conflictSection').hide(); };

        var attackSelection = [
            d.RED(),
            d.BLUE(),
            d.GREEN(),
            d.YELLOW()
        ];
        var defenceSelection = [
            d.BLACK(),
            d.WHITE()
        ];

        self.rollDice = function () {
            conflictStage(C$.ROLL);
            caption('Roll all dice and record the results below')
        };

        var selectOpponentDice = function () {
            conflictStage(C$.DICE);
            caption("Select target's dice (click to add to pool, click on die in pool to remove)");
            button1Text('Continue');
            button1 = function () {
                self.rollDice();
            }
            canButton1 = function () {
                return true;
            }
        };

        var attackStart = function (hero, ranged, dice, additional, wpn) {
            showModal();
            hero.inConflict(true);
            myDice(dice);
            weapon(wpn);
            extraPierce(additional.pierce);
            extraDamage(additional.damage);
            extraAccuracy(additional.accuracy);

            requiredAccuracy(0);
            if (ranged) {
                conflictStage(C$.RANGE);
                caption("Select target's range");
                button1Text('Continue');
                button1 = function () {
                    selectOpponentDice();
                }
                canButton1 = function () {
                    return requiredAccuracy() > 0;
                }
            }
            else {
                selectOpponentDice();
            }
        };

        return {
            Stage: conflictStage,
            Attack: attackStart,
            Defend: function (hero, dice) {
                showModal();
                hero.inConflict(true);
                myDice(dice);
                opponentDice(attackSelection);
            },
            AttackSelection: attackSelection,
            DefenceSelection: defenceSelection,
            addOpponentDie: function (die) {
                opponentDice.push(die.copy());
            },
            MyDice: myDice,
            AttackWeapon: weapon,
            ExtraPierce: extraPierce,
            ExtraDamage: extraDamage,
            ExtraAccuracy: extraAccuracy,
            MyAttack: {
                damage: damage,
                surges: surges,
                accuracy: accuracy,
                requiredAccuracy: requiredAccuracy,
                bleed: ko.pureComputed(function() { return bleed() > 0;}),
                stun: ko.pureComputed(function() { return stun() > 0;}),
                strain: regainStrain
            },
            SelectedSurges: selectedSurges,
            Bleed: bleed,
            Stun: stun,
            RegainStrain: regainStrain,
            OpponentDice: opponentDice,
            ExtraBlock: extraBlock,
            ExtraEvade: extraEvade,
            caption: caption,
            requiredAccuracy: requiredAccuracy,
            button1Text: button1Text,
            button1: function () { if (canButton1()) { button1(); } },
            showButton1: showButton1,
            button2Text: button2Text,
            button2: function () { if (canButton2()) { button2(); } },
            showButton2: showButton2,
        };
    }();
});