define(['jquery', 'ko'], function ($, ko) {
    return function () {
        var text = ko.observable('');
        var okButtonText = ko.observable('Yes');
        var closeModal = function () { $('.disabled').removeClass('disabled'); $('.modal').hide(); };
        var showModal = function () { $('.modal').show(0, function () { $('.column').addClass('disabled'); }); };

        var modals = ko.observableArray([]);
        var index = ko.observable(0);
        var currentModal = ko.pureComputed(function () {
            return modals()[index()];
        });

        var removeCurrent = function() {
            _.pullAt(modals(), index());
            index(Math.max(index() - 1, 0));
            modals.notifySubscribers();
        }

        var onOk = function() {};
        var okButton = function () {
            onOk();
            removeCurrent();
        };
        var cancelButtonText = ko.observable('No');
        var onCancel = function() {};
        var cancelButton = function() {
            onCancel();
            removeCurrent();
        };

        modals.subscribe(function() {
            if (modals().length > 0) {
                showModal();
                currentModal()();
            } else {
                closeModal();
            }
        });
        index.subscribe(function () {
            if (modals().length > 0) {
                currentModal()();
            }
        });

        var askQuestion = function (confirmText, yesAction, noAction, yesText, noText) {
            modals.push(function() {
                text(confirmText);
                okButtonText(yesText == null ? 'Yes' : yesText);
                cancelButtonText(noText == null ? 'No' : noText);
                onOk = yesAction;
                onCancel = noAction;
            });
            //showModal();
        };
        var confirmOperation = function (confirmText, action, yesText, noText) {
            askQuestion(confirmText, action, function() {}, yesText, noText);
        };
        var showInformation = function(infoText) {
            askQuestion(infoText, function() {}, function() {}, 'OK', '');
        };

        return {
            text: text,
            okButtonText: okButtonText,
            okButton: okButton,
            cancelButtonText: cancelButtonText,
            cancelButton: cancelButton,
            ConfirmOperation: confirmOperation,
            AskQuestion: askQuestion,
            ShowInformation: showInformation
        }
    }();
})