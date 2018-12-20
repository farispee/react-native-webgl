"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactNative = require("react-native");

var _reactNativeWebgl = require("react-native-webgl");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  onContextCreate: _propTypes2.default.func.isRequired,
  onContextFailure: _propTypes2.default.func.isRequired,
  imgRatio: _propTypes2.default.number,
  style: _propTypes2.default.any
};

var GLViewNative = function (_Component) {
  _inherits(GLViewNative, _Component);

  function GLViewNative() {
    _classCallCheck(this, GLViewNative);

    return _possibleConstructorReturn(this, (GLViewNative.__proto__ || Object.getPrototypeOf(GLViewNative)).apply(this, arguments));
  }

  _createClass(GLViewNative, [{
    key: "afterDraw",
    value: function afterDraw(gl) {
      var rngl = gl.getExtension("RN");
      gl.flush();
      rngl.endFrame();
    }
  },
  {
    key: "capture",
    value:async function capture(texture,gl,location) {
      var rngl = gl.getExtension("RN");
      return await rngl.capture(texture,location);//actually _emptyTexture is not using this function
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          style = _props.style,
          onContextCreate = _props.onContextCreate,
          onContextFailure = _props.onContextFailure,
          children = _props.children,
          rest = _objectWithoutProperties(_props, ["style", "onContextCreate", "onContextFailure", "children"]);

      if (__DEV__) {
        if ("width" in rest || "height" in rest) {
          console.warn("gl-react-native <Surface>: no such width/height prop. instead you must use the style prop like for a <View>.");
        }
      }
      return _react2.default.createElement(
        _reactNative.View,
        _extends({}, rest, {
          style: [{ position: "relative", overflow: "hidden" }, style]
        }),
        _react2.default.createElement(_reactNativeWebgl.WebGLView, {
          style: [style, {
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0
          }],
          onContextCreate: onContextCreate,
          onContextFailure: onContextFailure,
          imgRatio:_props.imgRatio,
        }),
        _react2.default.createElement(
          _reactNative.View,
          { style: { opacity: 0 } },
          children
        )
      );
    }
  }]);

  return GLViewNative;
}(_react.Component);

GLViewNative.propTypes = propTypes;
exports.default = GLViewNative;
//# sourceMappingURL=GLViewNative.js.map