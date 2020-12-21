
(function () {


    //websocket-session链接对象
    var _wsSession = function () {

        this._conn = null
        this._lock = null
        this._timer = null;
        this._start = function () {
            var _self = this;
            _self._timer = setTimeout(function () {

                _self._conn.send("ping")
                console.log("ping");

            }, 3000)
            return _self
        };
        this._reset = function () {
            clearTimeout(this._timer);
            return this
        }

    }

    _wsSession.prototype = {

        //创建链接
        _create: function (opt) {
            //_opts.openEvent,_opts.messageEvent,_opts.closeEvent,_opts.errorEvent
            try {
                if ("WebSocket" in window) {
                    this._conn = new WebSocket(opt.url);
                    this._event(opt);

                }
            } catch (error) {
                this._reconn(opt);

            }

        },

        //事件注册
        _event: function (opt) {

            var _self = this;
            _self._conn.onopen = function () {

                opt.openEvent()
                _self._reset()._start()
            }

            _self._conn.onmessage = function (e) {

                opt.messageEvent(e)
                _self._reset()._start()

            }

            _self._conn.onclose = function (e) {
                opt.closeEvent(e)
                _self._reconn(opt);
            }

            _self._conn.onerror = function (e) {
                opt.errorEvent(e)
                _self._reconn(opt);
            }

        },
        //重连机制
        _reconn: function (opt) {

            var _self = this;
            if (_self._lock) {
                return
            }
            _self._lock = true;
            setTimeout(function () {
                _self._create(opt);
                _self._lock = false;
            }, 3000);

        }

    }



    //websocket构造工厂

    var WSFactory = function () { }

    WSFactory.prototype = {

        //初始化session链接
        init: function (params) {
            var _opt = {
                openEvent: params._open,
                messageEvent: params._message,
                url: params._url,
                errorEvent: params._error,
                closeEvent: params._close
            }
            //获取一个websocket的实例
            var _session = new _wsSession()
            _session._create(_opt);
            return {

                _sendTxt: function (txt) {
                    _session._conn.send(txt);
                },

            }

        }

    }

    window._wsFactory = new WSFactory();


})()










