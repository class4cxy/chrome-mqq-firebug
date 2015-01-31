/**
 * by jdo
 * 
 * summary : for mqq debug
 */
;(function() { "use strict";

    var $firebug = $('mqq_firebug_logs');
    // dependent mqq.js
    if (!$firebug) return;

    function $(id) {
        return document.getElementById(id) || false;
    }

    function createElement (tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.classList.add(cls);
        if (text) node.innerText = text;
        return node;
    }

    function initConsolePanel () {

        var style = document.createElement("style");
        style.innerHTML = '\
            \n.mqq-debug-panel{\
            \n    position: fixed;\
            \n    top: 0;\
            \n    left: 0;\
            \n    right: 0;\
            \n    font-size: 10px;\
            \n    background-color: rgba(0,0,0,.7);\
            \n    color: #fff;\
            \n    z-index: 100000;\
            \n}\
            \n.mqq-debug-scroller{\
            \n    height: 150px;\
            \n    overflow: auto;\
            \n    padding: 5px 10px 15px;\
            \n    line-height: 16px;\
            \n    -webkit-overflow-scrolling: touch;\
            \n}\
            \n.mqq-debug-dragbar{\
            \n    position: absolute;\
            \n    margin: 0;\
            \n    height: 20px;\
            \n    width: 50px;\
            \n    background-color: rgba(18, 98, 168,.4);\
            \n    border-radius: 2px 2px 0 0;\
            \n    right: 10px;\
            \n    bottom: 0;\
            \n}\
            \n.mqq-debug-dragbar:after{\
            \n    position: absolute;\
            \n    left: 50%;\
            \n    top: 50%;\
            \n    content: "";\
            \n    border: #fff solid;\
            \n    border-width: 1px 0;\
            \n    width: 25px;\
            \n    height: 5px;\
            \n    margin: -3px 0 0 -13px;\
            \n}\
            \n.mqq-debug-clear,\
            \n.mqq-debug-watch{\
            \n    display: block;\
            \n    font-size: 9px;\
            \n    text-align: center;\
            \n    background-color: #eee;\
            \n    color: #333;\
            \n    margin: 0;\
            \n    position: absolute;\
            \n    bottom: 5px;\
            \n    left: 5px;\
            \n    height: 15px;\
            \n    width: 40px;\
            \n    line-height: 15px;\
            \n    border-radius: 10px;\
            \n    box-shadow: 0 0 3px rgba(0,0,0,.5)\
            \n}\
            \n.mqq-debug-watch{\
            \n    left: 50px;\
            \n    width: auto;\
            \n    padding: 0 8px;\
            \n}';
        document.getElementsByTagName("head")[0].appendChild(style);


        // 自定义通信事件
        var mqqEvent = document.createEvent('Event');
        mqqEvent.initEvent('chrome2mqq', true, true);
        // 通知MQQ开启调试模式
        $firebug.value = 'true';
        $firebug.dispatchEvent(mqqEvent);

        var $logPanel = createElement("div", "mqq-debug-panel");
        var $scroller = createElement("div", "mqq-debug-scroller");
        var $drapBar = createElement("p", "mqq-debug-dragbar");
        var $clear = createElement("p", "mqq-debug-clear", "清除");
        var $watch = createElement("p", "mqq-debug-watch", "筛选");

        $logPanel.appendChild($scroller);
        $logPanel.appendChild($drapBar);
        $logPanel.appendChild($clear);
        $logPanel.appendChild($watch);

        document.body.appendChild($logPanel);

        // addEventListener
        var starY, currHeight;
        $drapBar.addEventListener("touchstart", function (e) {
            // debugger;
            e.preventDefault()
            starY = e.touches[0].pageY;
            currHeight = $scroller.clientHeight;

        }, false);

        $drapBar.addEventListener("touchmove", function (e) {

            e.preventDefault();
            var currY = e.touches[0].pageY;
            $scroller.style.height = currHeight + (currY-starY) + 'px';

        }, false);

        $clear.addEventListener("touchstart", function () {

            firebug.clear();

        }, false);

        $watch.addEventListener("touchstart", function () {

            if ( this.classList.contains('mqq-debug-watching') ) {

                firebug.watch();
                this.innerText = "筛选";
                this.classList.remove('mqq-debug-watching');
            } else {

                var input = prompt('输入您要关注的接口，例如：ui.popBack');

                if ( firebug.watch(input) ) {
                    this.innerText = input;
                    this.classList.add('mqq-debug-watching');
                } else {
                    alert('您输入的接口格式不正确');
                }
            }

        }, false);


        // 监听mqq的日志
        $firebug.addEventListener('mqq2chrome', function () {
            if ( this.value !== '' ) {
                try {
                    var dat = JSON.parse(this.value);
                    firebug.log(dat);
                } catch (e) {}
            }
        }, false);

        return {
            logPanel : $logPanel,
            scroller : $scroller,
            drapBar  : $drapBar,
            clear    : $clear
        }

    }

    var firebug = function () {

        var $d = initConsolePanel();
        var watchList = [];
        var logText = '';
        var watching;

        return {
            log: function (params) {

                var _log = '';

                if ( watching && params.ns === watching.ns && params.method === watching.method || !watching ) {
                    for ( var i in params ) {
                        var _v = params[i];
                        if ( typeof _v === 'object' ) _v = JSON.stringify(_v);
                        _log += i + ': ' + decodeURIComponent(_v) + '\n';
                    }
                }

                if ( _log ) {

                    logText += _log + '======\n';

                    $d.scroller.innerText = logText;

                    setTimeout(function () {
                        
                        // $d.clear.classList.add("mqq-debug-clear-show");
                        $d.scroller.scrollTop = $d.scroller.scrollHeight;

                    }, 0)
                }
            },
            watch : function (api) {
                if ( api ) {
                    
                    if ( (api = api.split('.')).length === 2 ) {

                        watching = {
                            ns : api[0],
                            method : api[1]
                        }

                        return true;
                    }

                } else {
                    watching = null;
                }
                return false;
            },
            unwatch : function () {
                watchNs = '';
                watchMethod = '';
            },
            clear : function () {
                $d.scroller.innerText = logText = '';
            }
        }

    }();

})();