"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = undefined;
//test
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//test
var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _glShader = require("gl-shader");

var _glShader2 = _interopRequireDefault(_glShader);

var _Bus = require("./Bus");

var _Bus2 = _interopRequireDefault(_Bus);

var _Shaders = require("./Shaders");

var _Shaders2 = _interopRequireDefault(_Shaders);

var _Visitors = require("./Visitors");

var _Visitors2 = _interopRequireDefault(_Visitors);

var _webgltextureLoader = require("webgltexture-loader");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __DEV__ = process.env.NODE_ENV === "development";

var prependGLSLName = function prependGLSLName(glsl, name) {
  return !name ? glsl : "#define SHADER_NAME " + name + "\n" + glsl;
};

var SurfacePropTypes = {
  children: _propTypes2.default.any.isRequired,
  style: _propTypes2.default.any,
  preload: _propTypes2.default.array,
  onLoad: _propTypes2.default.func,
  onLoadError: _propTypes2.default.func,
  onContextLost: _propTypes2.default.func,
  onContextRestored: _propTypes2.default.func,
  visitor: _propTypes2.default.object,
  imgRatio:_propTypes2.default.number,

};

var surfaceId = 0;
var _instances = [];
var list = exports.list = function list() {
  return _instances.slice(0);
};

var allSurfaceProps = Object.keys(SurfacePropTypes);

exports.default = function (_ref) {
  var _class, _temp2;

  var GLView = _ref.GLView,
      RenderLessElement = _ref.RenderLessElement,
      mapRenderableContent = _ref.mapRenderableContent,
      requestFrame = _ref.requestFrame,
      cancelFrame = _ref.cancelFrame;

  /**
   * **Renders the final tree of [Node](#node) in a WebGL Canvas / OpenGLView /...**
   *
   * `<Surface>` performs the final GL draws for a given implementation.
   *
   * `width` and `height` props are required for `gl-react-dom` and `gl-react-headless`, but are not supported for React Native, where the paradigm is to use `style` (and either use flexbox or set a width/height from there).
   *
   * > Surface is the only component that isn't "universal",
   * therefore **Surface is exposed by the platform implementation**
   * (`gl-react-dom` / `gl-react-native` / ...),
   * unlike the rest of the API exposed through `gl-react`.
   * Each platform have its own implementation but most props are shared.
   * If you write a gl-react library, you shouldn't use `<Surface>` but only
   * let the final user doing it. Therefore your code should remain platform-independant.
   *
   * @class Surface
   * @extends Component
   * @prop {any} children - a tree of React Element that renders some [Node](#node) and/or [Bus](#bus).
   * @prop {number} [width] **(only for DOM)** - width of the Surface. multiplied by `pixelRatio` for the actual canvas pixel size.
   * @prop {number} [height] **(only for DOM)** - height of the Surface. multiplied by `pixelRatio` for the actual canvas pixel size.
   * @prop {object} [style] - CSS styles that get passed to the underlying `<canvas/>` or `<View/>`
   * @prop {Array<any>} [preload] - an array of things to preload before the Surface start rendering. Help avoiding blinks and providing required textures to render an initial state.
   * @prop {function} [onLoad] - a callback called when Surface is ready and just after it rendered.
   * @prop {function(error:Error):void} [onLoadError] - a callback called when the Surface was not able to load initially.
   * @prop {function} [onContextLost] - a callback called when the Surface context was lost.
   * @prop {function} [onContextRestored] - a callback called when the Surface was restored and ready.
   * @prop {Visitor} [visitor] - an internal visitor used for logs and tests.
   *
   * @prop {WebGLContextAttributes} [webglContextAttributes] **(gl-react-dom only)** a optional set of attributes to init WebGL with.
   * @prop {number} [pixelRatio=window.devicePixelRatio] **(gl-react-dom only)** allows to override the pixelRatio. (default `devicePixelRatio`)
   *
   * @example
   *
   *  <Surface width={300} height={200}>
   *    <Node shader={shaders.helloGL} />
   *  </Surface>
   *
   * @example
   *
   *  <Surface width={200} height={100}>
   *    <HelloGL />
   *  </Surface>
   *
   * @example
   *
   *  <Surface width={200} height={100}>
   *    <Blur factor={2}>
   *      <Negative>
   *        https://i.imgur.com/wxqlQkh.jpg
   *      </Negative>
   *    </Blur>
   *  </Surface>
   */
  return _temp2 = _class = function (_Component) {
    _inherits(Surface, _Component);

    function Surface() {
      var _ref2;
      var _temp, _this, _ret;
      _classCallCheck(this, Surface);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Surface.__proto__ || Object.getPrototypeOf(Surface)).call.apply(_ref2, [this].concat(args))), _this), _this.id = ++surfaceId, _this.shaders = {}, _this._preparingGL = [], _this._needsRedraw = false, _this.state = {
        ready: false,
        rebootId: 0,
        debug: false
      }, _this.RenderLessElement = RenderLessElement, _this.mapRenderableContent = mapRenderableContent, _this.redraw = function () {
        _this._needsRedraw = true;
      }, _this.flush = function () {
        _this._draw();
      }, _this._onContextCreate = function (gl) {
        var onSuccess = function onSuccess() {
          _this.setState({
            ready: true
          }, function () {
            try {
              _this._handleLoad();
            } catch (e) {
              _this._handleError(e);
            }
          });
        };
        _this._prepareGL(gl, onSuccess, _this._handleError);
      }, _this._onContextFailure = function (e) {
        _this._handleError(e);
      }, _this._onContextLost = function () {
        if (_this.props.onContextLost) _this.props.onContextLost();
        _this._stopLoop();
        _this._destroyGL();
        if (_this.root) _this.root._onContextLost();
      }, _this._onContextRestored = function (gl) {
        if (_this.root) _this.root._onContextRestored(gl);
        _this._prepareGL(gl, _this._handleRestoredSuccess, _this._handleRestoredFailure);
      }, _this._onRef = function (ref) {
        _this.glView = ref;
      }, _this._handleError = function (e) {
        var onLoadError = _this.props.onLoadError;

        if (onLoadError) onLoadError(e);else {
          console.error(e);
        }
      }, _this._handleRestoredFailure = function () {
        // there is nothing we can do. it's a dead end.
      }, _this._handleRestoredSuccess = function () {
        _this.redraw();
        _this.flush();
        _this._startLoop();
        if (_this.props.onContextRestored) _this.props.onContextRestored();
      }, _this._handleLoad = function () {
        if (!_this.root) {
          console.warn(_this.getGLName() + " children does not contain any discoverable Node");
        }
        var onLoad = _this.props.onLoad;

        _this.redraw();
        _this.flush();
        _this._startLoop();
        if (onLoad) onLoad();
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Surface, [{
      key: "getChildContext",
      value: function getChildContext() {
        return {
          glParent: this,
          glSurface: this,
          glSizable: this
        };
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        _instances.push(this);
        this.getVisitors().forEach(function (v) {
          return v.onSurfaceMount(_this2);
        });
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var _this3 = this;

        this._stopLoop();
        this._destroyGL();
        var i = _instances.indexOf(this);
        if (i !== -1) _instances.splice(i, 1);
        this.getVisitors().forEach(function (v) {
          return v.onSurfaceUnmount(_this3);
        });
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        this.redraw();
      }
    }, {
      key: "render",
      value: function render() {
        var props = this.props,
            _state = this.state,
            ready = _state.ready,
            rebootId = _state.rebootId,
            debug = _state.debug;
        var children = props.children,
            style = props.style;

        // We allow to pass-in all props we don't know so you can hook to DOM events.

        var rest = {};
        Object.keys(props).forEach(function (key) {
          if (allSurfaceProps.indexOf(key) === -1) {
            rest[key] = props[key];
          }
        });

        return _react2.default.createElement(
          GLView,
          _extends({
            key: rebootId,
            debug: debug,
            ref: this._onRef,
            onContextCreate: this._onContextCreate,
            onContextFailure: this._onContextFailure,
            onContextLost: this._onContextLost,
            onContextRestored: this._onContextRestored,
            imgRatio:this.props.imgRatio,
            style: style
          }, rest),
          ready ? children : null
        );
      }
    }, {
      key: "rebootForDebug",
      value: function rebootForDebug() {
        // FIXME: there is a bug somewhere that breaks rendering if this is called at startup time.
        this._stopLoop();
        this._destroyGL();
        this.setState(function (_ref3) {
          var rebootId = _ref3.rebootId;
          return {
            rebootId: rebootId + 1,
            ready: false,
            debug: true
          };
        });
      }
    }, {
      key: "getVisitors",
      value: function getVisitors() {
        return _Visitors2.default.get().concat(this.props.visitor || []);
      }
    }, {
      key: "getGLSize",
      value: function getGLSize() {
        var gl = this.gl;

        return [gl ? gl.drawingBufferWidth : 0, gl ? gl.drawingBufferHeight : 0];
      }
    }, {
      key: "getGLName",
      value: function getGLName() {
        return "Surface#" + this.id;
      }
    }, {
      key: "getGLShortName",
      value: function getGLShortName() {
        return "Surface";
      }

      /**
       * see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
       * @param {string} mimeType (optional) the image MimeType
       * @param {number} quality (optional) the image quality
       * @memberof Surface
       * @instance
       */

    }, {
      key: "captureAsDataURL",
      value: function captureAsDataURL() {
        var glView = this.glView;

        (0, _invariant2.default)(glView, "GLView is mounted");
        (0, _invariant2.default)(glView.captureAsDataURL, "captureAsDataURL is not defined in %s", GLView.displayName || GLView.name);
        return glView.captureAsDataURL.apply(glView, arguments);
      }

      /**
       * see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
       * @param {string} mimeType (optional) the image MimeType
       * @param {number} quality (optional) the image quality
       * @memberof Surface
       * @instance
       */

    }, {
      key: "captureAsBlob",
      value: function captureAsBlob() {
        var glView = this.glView;

        (0, _invariant2.default)(glView, "GLView is mounted");
        (0, _invariant2.default)(glView.captureAsBlob, "captureAsBlob is not defined in %s", GLView.displayName || GLView.name);
        return glView.captureAsBlob.apply(glView, arguments);
      }

      /**
       * capture the root Node pixels. Make sure you have set `preserveDrawingBuffer: true` in `webglContextAttributes` prop.
       * @memberof Surface
       * @instance
       */

    }, {
      key: "capture",
      value: async function capture(location) {
        const { glView,gl,_texture } = this;
        return await  glView.capture(_texture,gl,location);
      }

      /**
       * Schedule a redraw of the Surface.
       * @memberof Surface
       * @instance
       * @function
       */


      /**
       * Force the redraw (if any) to happen now, synchronously.
       * @memberof Surface
       * @instance
       * @function
       */

    }, {
      key: "glIsAvailable",
      value: function glIsAvailable() {
        return !!this.gl;
      }
    }, {
      key: "getEmptyTexture",
      value: function getEmptyTexture() {
        var gl = this.gl,
            _emptyTexture = this._emptyTexture;

        (0, _invariant2.default)(gl, "getEmptyTexture called while gl was not defined");
        if (!_emptyTexture) {
          this._emptyTexture = _emptyTexture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, _emptyTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        }
        return _emptyTexture;
      }
    }, {
      key: "_destroyGL",
      value: function _destroyGL() {
        var _this4 = this;
        var gl = this.gl;

        if (gl) {
          this.gl = null;
          if (this._emptyTexture) {
            gl.deleteTexture(this._emptyTexture);
            this._emptyTexture = null;
          }
          if (this.loaderResolver) {
            this.loaderResolver.dispose();
          }
          for (var k in this.shaders) {
            this.shaders[k].dispose();
          }
          this.shaders = {};
          gl.deleteBuffer(this.buffer);
          this.getVisitors().map(function (v) {
            return v.onSurfaceGLContextChange(_this4, null);
          });
        }
      }
    }, {
      key: "_prepareGL",
      value: function _prepareGL(gl, onSuccess, onError) {

        var _this5 = this;
        this.gl = gl;
        this.getVisitors().map(function (v) {
          return v.onSurfaceGLContextChange(_this5, gl);
        });

        this.loaderResolver = new _webgltextureLoader.LoaderResolver(gl);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
        gl.STATIC_DRAW);
        this.buffer = buffer;

        var preload = this.props.preload;


        var all = [];

        (preload || []).forEach(function (raw) {
          if (!raw) {
            console.warn("Can't preload value", raw);
            return;
          }

          var _resolveTextureLoader2 = _this5._resolveTextureLoader(raw),
              loader = _resolveTextureLoader2.loader,
              input = _resolveTextureLoader2.input;
          if (!loader) {
            console.warn("Can't preload input", raw, input);
            return;
          }

          var loadedAlready = loader.get(input);
          if (loadedAlready) return;
          all.push(loader.load(input));
        });

        this._preparingGL = all;

        if (all.length > 0) {
          Promise.all(all).then(onSuccess, onError); // FIXME make sure this never finish if _prepareGL is called again.
        } else {
          onSuccess();
        }
      }
    }, {
      key: "_addGLNodeChild",
      value: function _addGLNodeChild(node) {
        (0, _invariant2.default)(!this.root, "Surface can only contains a single root. Got: %s", this.root && this.root.getGLName());
        this.root = node;
        node._addDependent(this);
        this.redraw();
      }
    }, {
      key: "_removeGLNodeChild",
      value: function _removeGLNodeChild(node) {
        this.root = null;
        this.redraw();
      }
    }, {
      key: "_resolveTextureLoader",
      value: function _resolveTextureLoader(raw) {
        var input = raw;

        var loader = this.loaderResolver && this.loaderResolver.resolve(input);
        if(loader.promises._mapData&&loader.promises._mapData.length>0)
        {
            var obj=loader.promises._mapData[loader.promises._mapData.length-1];
            var obj1=obj[1];
            var keys = Object.keys( obj1 );
            if(obj1[keys[2]]&&obj1[keys[2]].texture)
            {
              this._texture=obj1[keys[2]].texture;
            }
        }
        return { loader: loader, input: input };
      }
    }, {
      key: "_makeShader",
      value: function _makeShader(_ref4, name) {
        var frag = _ref4.frag,
            vert = _ref4.vert;
        var gl = this.gl;

        (0, _invariant2.default)(gl, "gl is not available");
        var shader = (0, _glShader2.default)(gl, prependGLSLName(vert, name), prependGLSLName(frag, name));
        shader.attributes._p.pointer();
        return shader;
      }
    }, {
      key: "_getShader",
      value: function _getShader(shaderId) {
        var shaders = this.shaders;

        return shaders[shaderId.id] || (shaders[shaderId.id] = this._makeShader(_Shaders2.default.get(shaderId), _Shaders2.default.getName(shaderId)));
      }
    }, {
      key: "_bindRootNode",
      value: function _bindRootNode() {
        var gl = this.gl;

        (0, _invariant2.default)(gl, "gl context not available");
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var _getGLSize = this.getGLSize(),
            _getGLSize2 = _slicedToArray(_getGLSize, 2),
            width = _getGLSize2[0],
            height = _getGLSize2[1];

        gl.viewport(0, 0, width, height);
      }
    }, {
      key: "_startLoop",
      value: function _startLoop() {
        var _this6 = this;

        cancelFrame(this._loopRaf);
        var loop = function loop() {
          _this6._loopRaf = requestFrame(loop);
          if (_this6._needsRedraw) _this6._draw();
        };
        this._loopRaf = requestFrame(loop);
      }
    }, {
      key: "_stopLoop",
      value: function _stopLoop() {
        cancelFrame(this._loopRaf);
      }
    }, {
      key: "_draw",
      value: function _draw() {
        var _this7 = this;

        var gl = this.gl,
            root = this.root,
            glView = this.glView;

        (0, _invariant2.default)(glView, "GLView is mounted");
        var visitors = this.getVisitors();
        if (!gl || !root || !this._needsRedraw) {
          visitors.forEach(function (v) {
            return v.onSurfaceDrawSkipped(_this7);
          });
          return;
        }
        this._needsRedraw = false;
        visitors.forEach(function (v) {
          return v.onSurfaceDrawStart(_this7);
        });
        if (glView.beforeDraw) glView.beforeDraw(gl);
        try {
          root._draw();
        } catch (e) {
          var silent = false;
          visitors.forEach(function (v) {
            silent = v.onSurfaceDrawError(e) || silent;
          });
          if (!silent) {
            if (__DEV__ && glView.debugError && e.longMessage /* duck typing an "interesting" GLError (from lib gl-shader) */
            ) {
                glView.debugError(e);
              } else {
              console.warn(e);
              throw e;
            }
          }
          return;
        }
        if (glView.afterDraw) glView.afterDraw(gl);
        visitors.forEach(function (v) {
          return v.onSurfaceDrawEnd(_this7);
        });
      }
    }]);

    return Surface;
  }(_react.Component), _class.propTypes = SurfacePropTypes, _class.childContextTypes = {
    glSurface: _propTypes2.default.object.isRequired,
    glParent: _propTypes2.default.object.isRequired,
    glSizable: _propTypes2.default.object.isRequired
  }, _temp2;
};
//# sourceMappingURL=createSurface.js.map