define(['jquery', 'ko'], function ($, ko) {
    return function () {
        var text = ko.observable('');
        var okButtonText = ko.observable('Yes');
        var closeModal = function () { $('.disabled').removeClass('disabled'); $('.modal').hide(); };
        var onOk = function() {};
        var okButton = function () {
            closeModal();
            onOk();
        };
        var cancelButtonText = ko.observable('No');
        var onCancel = function() {};
        var cancelButton = function() {
            closeModal();
            onCancel();
        };

        var showModal = function () { $('.modal').show(0, function () { $('.column').addClass('disabled'); }); };
        var askQuestion = function (confirmText, yesAction, noAction, yesText, noText) {
            text(confirmText);
            okButtonText(yesText == null ? 'Yes' : yesText);
            cancelButtonText(noText == null ? 'No' : noText);
            onOk = yesAction;
            onCancel = noAction;
            showModal();
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