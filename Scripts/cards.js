﻿define(['herofunctions', 'modal', 'cost', 'dice'], function (hf, modal, $, d) {
    return {
        Diala: [
            new hf.Ability({ name: 'Force Adept' }, false, 'Cards/Diala/Pic2444785.jpg'),
            new hf.Ability({ name: 'Force Throw' }, false, 'Cards/Diala/Pic2444786.jpg'),
            new hf.Ability({ name: 'Battle Meditation' }, false, 'Cards/Diala/Pic2444787.jpg'),
            new hf.Ability({ name: 'Defensive Stance' }, false, 'Cards/Diala/Pic2444788.jpg'),
            new hf.Ability({
                name: 'Art of Movement',
                onAdd: function () {
                    this.extraSpeed(this.extraSpeed() + 1);
                }
            }, false, 'Cards/Diala/Pic2444789.jpg'),
            new hf.Ability({ name: 'Snap Kick' }, false, 'Cards/Diala/Pic2444790.jpg'),
            new hf.Ability({
                name: 'Dancing Weapon',
                operations: [
                    new hf.Operation('Dancing Weapon',
                    function (hero) {
                        hero.attack([d.BLUE()], true);
                    },
                    function (hero) {
                        return !hero.stunned();
                    },
                    [$.action(), $.strain()])
                ]
            }, false, 'Cards/Diala/Pic2444791.jpg'),
            new hf.Ability({ name: 'Way of the Sarlacc' }, false, 'Cards/Diala/Pic2444792.jpg'),
        ],
        Wearables: [
            new hf.Armour({
                name: 'Laminate Armour',
                onAdd: function () {
                    this.extraHealth(this.extraHealth() + 3);
                }
            }, 'Cards/Wearables/Laminate_Armor.jpg'),
            new hf.Card({ name: 'Adrenal Implant' }, 'Cards/Wearables/Adrenal_Implant.png')
        ],
        Weapons: [
            new hf.Weapon({
                name: 'BD-1 Vibro-Ax',
                ranged: false,
                type: ['blade', 'staff'],
                slots: 2,
                dice: [d.RED, d.GREEN]
            }, 'Cards/Weapons/BD-1_Vibro-Ax.jpg'),
            new hf.Weapon({
                name: 'Plasteel Staff',
                ranged: false,
                type: ['staff'],
                slots: 1,
                dice: [d.GREEN, d.YELLOW],
                reach: true
            }, 'Cards/Weapons/Pic2444795.jpg')
        ],
        Attachments: [
            new hf.Attachment({
                name: 'High-Impact Guard',

            }, 'Cards/WeaponAttachments/High-Impact_Guard.jpg'),
            new hf.Attachment({
                name: 'Shock Emitter',

            }, 'Cards/WeaponAttachments/Shock-emitter.png'),
            new hf.Attachment({
                name: 'Extended Haft',
                pierce: function (weapon) { return weapon.reach ? 1 : 0; }
            }, 'Cards/WeaponAttachments/Extended_Haft.jpg')
        ],
        Equipment: [
            new hf.Equipment({
                name: 'Adrenal Implant',
                events: [
                    new hf.Event('rest', function (hero, card) {
                        if (!card.exhausted() && !hero.focused()) {
                            modal.ConfirmOperation("Do you wish to exhaust Adrenal Implant to gain <img src='Tokens/Focus.png' />?", function () {
                                hero.focused(true);
                                card.exhausted(true);
                            });
                        }
                    })
                ]
            }, 'Cards/Wearables/Adrenal_Implant.png')
        ]
    }
});