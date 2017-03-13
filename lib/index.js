'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  function getValue(src, name, key) {
    var basePath = _path2.default.resolve(src);
    var pkg = require(_path2.default.join(basePath, '..', name));

    return pkg[key];
  }

  function isPackageJSON(node) {
    return t.isLiteral(node) && /package\.json$/.test(node.value);
  }

  return {
    visitor: {
      ImportDeclaration: function importDeclaration(treePath) {
        var node = treePath.node;
        var src = this.file.opts.filename;

        if (!isPackageJSON(node.source)) {
          return;
        }

        var variables = node.specifiers.filter(t.isImportSpecifier).map(function (specifier) {
          var value = getValue(src, node.source.value, specifier.local.name);

          return t.variableDeclaration('const', [t.variableDeclarator(specifier.local, t.valueToNode(value))]);
        });

        if (!variables.length) {
          return;
        }

        return treePath.replaceWithMultiple(variables);
      },

      MemberExpression: function MemberExpression(treePath) {
        var node = treePath.node;
        var src = this.file.opts.filename;

        if (!t.isCallExpression(node.object) || !t.isIdentifier(node.object.callee, { name: 'require' }) || !isPackageJSON(node.object.arguments[0])) {
          return;
        }

        var value = getValue(src, node.object.arguments[0].value, node.property.name);

        return treePath.replaceWith(t.expressionStatement(t.valueToNode(value)));
      }
    }
  };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

