/**
 * Created by Hayk on 1/04/2017.
 */

var $TIMER = $('.timer');
var TIMER;

var HpD = 24;
var MpH = 60;
var SpM = 60;
var MSpS = 1000;
var MAX_AGE = HpD * MpH * SpM * MSpS;
var MSpH = MSpS * SpM * MpH;
var MSpM = MSpS * SpM;
var MSpDS = 100;

var padN = function (value, size) {
    return pad(value + '', size, '0');
};

var pad = function (value, size, char) {
    for (var i = value.length; i < size; i++) {
        value = char + value;
    }
    return value;
};

var Timer = function (milliseconds) {
    this.totalMilliseconds = milliseconds;
    this.running = false;

    this.start = function () {
        this.running = true;
    };
    this.stop = function () {
        this.running = false;
    };
    this.expire = function () {
        this.running = false;
        this.totalMilliseconds = 0;
    };
    this.isUp = function () {
        return this.totalMilliseconds > 0;
    };
    this.totalHours = function () {
        return ~~(this.totalMilliseconds / MSpH);
    };

    this.hours = function () {
        return this.totalHours() % HpD;
    };

    this.totalMinutes = function () {
        return ~~(this.totalMilliseconds / MSpM);
    };

    this.minutes = function () {
        return this.totalMinutes() - this.totalHours() * MpH;
    };

    this.totalSeconds = function () {
        return ~~(this.totalMilliseconds / MSpS);
    };

    this.seconds = function () {
        return this.totalSeconds() - this.totalMinutes() * SpM;
    };

    this.milliseconds = function () {
        return this.totalMilliseconds - this.totalSeconds() * MSpS;
    };

    this.totalDeciseconds = function () {
        return ~~(this.totalMilliseconds / MSpDS);
    };

    this.deciseconds = function () {
        return ~~(this.milliseconds() / MSpDS);
    };


    this.fmtHours = function () {
        return padN(this.hours(), 2);
    };
    this.fmtMinutes = function () {
        return padN(this.minutes(), 2);
    };
    this.fmtSeconds = function () {
        return padN(this.seconds(), 2);
    };
    this.fmtDeciseconds = function () {
        return padN(this.deciseconds(), 2);
    };
    this.decrDeciseconds = function () {
        if (this.totalMilliseconds >= MSpDS) {
            this.totalMilliseconds -= MSpDS;
        } else {
            this.totalMilliseconds = 0;
        }

    };
    this.toString = function() {
        return this.fmtHours() + ':' + this.fmtMinutes() + ':' + this.fmtSeconds()
             + ':' + this.fmtDeciseconds() + ':' + this.milliseconds();
    }
};

var prepareThisTimer = function (e) {
    buildTimer();
    updateHours();
    updateMinutes();
    updateSeconds();
    updateDeciseconds();
    var age = parseInt($TIMER.attr('data-timer-age'));
    if (! isNaN(age) && age > 0) {
        var event = jQuery.Event('timer.ready');
        $TIMER.trigger(event);
    }
    if (TIMER.running) {
        stopThisTimer(e);
    }

};

var buildTimer = function(e) {
    var ms = 1;
    if ($TIMER != undefined) {
        ms = parseInt($TIMER.attr('data-timer-age'));
        ms = ~~(ms / MSpDS) * MSpDS;
        if (! isNaN(ms) && ms > MAX_AGE) {
            ms %= MAX_AGE;
        }
        $TIMER.attr('data-timer-age', ms);
    }
    if (TIMER == undefined) {
        TIMER = new Timer(ms);
    } else {
        TIMER.totalMilliseconds = ms;
    }
};

var updateHours = function () {
    var $hh = $TIMER.find('.timer-hh');
    if ($hh != undefined) {
        $hh.html(TIMER.fmtHours());
    }
};

var updateMinutes = function () {
    var $mm = $TIMER.find('.timer-mm');
    if ($mm != undefined) {
        $mm.html(TIMER.fmtMinutes());
    }
};

var updateSeconds = function () {
    var $ss = $TIMER.find('.timer-ss');
    if ($ss != undefined) {
        $ss.html(TIMER.fmtSeconds());
    }
};

var updateDeciseconds = function () {
    var $ds = $TIMER.find('.timer-ds');
    if ($ds != undefined) {
        $ds.html(TIMER.fmtDeciseconds());
    }
};

var checkAutoStart = function () {
    var $autostart = $('[data-timer-start]');
    if ($autostart != undefined && $autostart.attr('data-timer-start') == 'auto') {
        var delay = parseInt($TIMER.attr('data-timer-delay'));
        if (! isNaN(delay) && delay > 0) {
            window.setTimeout(startThisTimer, delay);
        } else {
            startThisTimer();
        }
    }
};


var startThisTimer = function (e) {
    if (e != undefined) {
        e.preventDefault();
    }
    TIMER.start();
    var event = jQuery.Event('timer.run');
    $TIMER.trigger(event);
    updateThisTimer();
};

var updateThisTimer = function () {
    if (TIMER.isUp() && TIMER.running) {
        TIMER.decrDeciseconds();
        window.setTimeout(function () {
            $TIMER.attr('data-timer-age', TIMER.totalMilliseconds);
            updateDeciseconds();
            if (TIMER.totalMilliseconds % (MSpS / MSpDS) == 0) {
                updateSeconds();
            }
            if (TIMER.totalMilliseconds % 60 == 0) {
                updateMinutes();
            }
            if (TIMER.totalMilliseconds % 360 == 0) {
                updateHours();
            }
            updateThisTimer();
        }, MSpDS);
    } else {
        if (!TIMER.isUp()) {
            var event = jQuery.Event('timer.expire');
            $TIMER.trigger(event);
        }
    }
};

var stopThisTimer = function (e) {
    e.preventDefault();
    TIMER.stop();
    if (TIMER.totalMilliseconds > 0) {
        var event = jQuery.Event('timer.stop');
        $TIMER.trigger(event);
    }
};

var expireThisTimer = function (e) {
    e.preventDefault();
    TIMER.expire();
    $TIMER.attr('data-timer-age', '0');
    stopThisTimer(e);
    prepareThisTimer(e);
};

var initTimer = function () {
    prepareThisTimer();
    checkAutoStart();
    $('[data-timer-control=stop]').on('click', stopThisTimer);
    $('[data-timer-control=start]').on('click', startThisTimer);
    $('[data-timer-control=expire]').on('click', expireThisTimer);
    $TIMER.on('timer.update.display', prepareThisTimer);
};

$(document).ready(initTimer);