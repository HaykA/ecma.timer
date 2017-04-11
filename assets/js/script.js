/**
 * Created by Hayk on 2/04/2017.
 */

var buildDigitsHolder = function (id) {
    var cssClass = 'timer-' + id;
    return $('<div data-toggle="modal" data-target="#timer-settings">').addClass(cssClass);
};

var updateTimerDisplay = function (e) {
    var $display = $('.timer-display').empty();
    $.each($('.timer-settings input[type=checkbox]'), function () {
        if ($(this).is(':checked')) {
            $display.append(buildDigitsHolder($(this).attr('id')));
        }
    });
    var event = jQuery.Event('timer.update.display');
    $('.timer').trigger(event);
};

var prepareModal = function (e) {
    var $settings = $('#timer-settings');
    var sender = $(this).attr('class');
    $settings.attr('data-update', sender);
    var id = sender.replace('timer-', '');
    var label = $('#' + id).next('label').text();
    var val = parseInt($(this).text());
    if (isNaN(val)) {
        val = 0;
    }
    $settings.find('.modal-title span').text(" Set " + label);
    $('[for=timer-setting]').text(label);
    $('#timer-setting').attr({
        placeholder: label,
        min: 0,
        max: getMaxFor(id)
    }).val(val);
    checkTimerSettingValue(e);
};

var getMaxFor = function (id) {
    switch (id) {
        case 'hh': return 24;
        case 'mm': return 60;
        case 'ss': return 60;
        case 'ds': return 10;
        default: return 0;
    }
};

var checkTimerSettingValue = function (e) {
    var $setting = $('#timer-setting');
    var val = parseInt($setting.val());
    var min = parseInt($setting.attr('min'));
    var max = parseInt($setting.attr('max'));
    var enabled = !isNaN(val) && !isNaN(min) && !isNaN(max) && val >= min && val <= max;
    $('#save-settings').prop("disabled", !enabled);
};

var updateSettings = function (e) {
    if ($('form')[0].checkValidity()) {
        var $settings = $('#timer-settings');
        var displayBlockSelector = '.' + $settings.attr('data-update');
        var oldVal = parseInt($(displayBlockSelector).text());
        var inputVal = parseInt($('#timer-setting').val());
        var unit = $settings.attr('data-update').replace('timer-', '');
        var newValInMs = calculateTimerSetting(inputVal - oldVal, unit);
        var $timer = $('.timer');
        var oldAge = parseInt($timer.attr('data-timer-age'));
        var newAge = oldAge + newValInMs;
        if (isNaN(oldAge)) {
            newAge = newValInMs;
        }
        var event = jQuery.Event('timer.update.display');
        $timer.attr('data-timer-age', newAge).trigger(event);
        $settings.modal('hide');
    }
};

var calculateTimerSetting = function (val, unit) {
    switch(unit) {
        case "hh": return MSpH * val;
        case "mm": return MSpM * val;
        case "ss": return MSpS * val;
        case "ds": return MSpDS * val;
        default: return 0;
    }
};

var resetTimerSettingsModal = function (e) {
    $('#timer-setting').val('').removeAttr('min').removeAttr('max');
    $('#timer-settings').removeAttr('data-update').find('.modal-title span').empty();
};

var prepareButtonsWhenExpired = function (e) {
    $('#start-timer').prop('disabled', true);
    $('#stop-timer').prop('disabled', true);
    $('#pause-timer').prop('disabled', true);
};

var prepareButtonsWhenRunning = function (e) {
    $('#start-timer').prop('disabled', true);
    $('#stop-timer').prop('disabled', false);
    $('#pause-timer').prop('disabled', false);
};

var prepareButtonsWhenPaused = function (e) {
    $('#start-timer').prop('disabled', false);
    $('#pause-timer').prop('disabled', true);
};

var prepareButtonsWhenReady = function (e) {
    $('#start-timer').prop('disabled', false);
    $('#stop-timer').prop('disabled', true);
    $('#pause-timer').prop('disabled', true);
};

var preventSubmit = function (e) {
    e.preventDefault();
};

var resetTimer = function (e) {
    var event = jQuery.Event('timer.update.display');
    $('.timer').attr('data-timer-age', '30000').trigger(event);
};

var init = function () {
    updateTimerDisplay();
    $('.timer-settings').on('change', updateTimerDisplay);
    $('.timer-display').on('click', '[data-target="#timer-settings"]', prepareModal);
    $('#timer-settings').on('hidden.bs.modal', resetTimerSettingsModal);
    $('#timer-setting').on('keyup', checkTimerSettingValue).
        on('change', checkTimerSettingValue);
    $('#save-settings').on('click', updateSettings);
    $('.timer').on('timer.expire', prepareButtonsWhenExpired)
        .on('timer.run', prepareButtonsWhenRunning)
        .on('timer.stop', prepareButtonsWhenPaused)
        .on('timer.ready', prepareButtonsWhenReady);
    $('form').on('submit', preventSubmit);
    $('#reset-timer').on('click', resetTimer);
};

$(document).ready(init);