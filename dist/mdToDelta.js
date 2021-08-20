var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import Delta from 'quill-delta';
import unified from 'unified';
import markdown from 'remark-parse';
var defaultOptions = {
    debug: false
};
var MarkdownToQuill = /** @class */ (function () {
    function MarkdownToQuill(options) {
        this.blocks = ['paragraph', 'code', 'list'];
        this.options = __assign(__assign({}, defaultOptions), options);
    }
    MarkdownToQuill.prototype.convert = function (text) {
        var processor = unified().use(markdown);
        var tree = processor.parse(text);
        if (this.options.debug) {
            console.log('tree', tree);
        }
        var delta = this.convertChildren(null, tree, {});
        return delta.ops;
    };
    MarkdownToQuill.prototype.convertChildren = function (parent, node, op, indent, extra) {
        var _this = this;
        if (op === void 0) { op = {}; }
        if (indent === void 0) { indent = 0; }
        var children = node.children;
        var delta = new Delta();
        if (children) {
            if (this.options.debug) {
                console.log('children:', children, extra);
            }
            var prevType_1;
            children.forEach(function (child, idx) {
                if (_this.isBlock(child.type) && _this.isBlock(prevType_1)) {
                    delta.insert('\n');
                }
                switch (child.type) {
                    case 'paragraph':
                        delta = delta.concat(_this.convertChildren(node, child, op, indent + 1));
                        if (!parent) {
                            delta.insert('\n');
                        }
                        break;
                    case 'code':
                        var lines = String(child.value).split('\n');
                        lines.forEach(function (line) {
                            if (line) {
                                delta.push({ insert: line });
                            }
                            delta.push({ insert: '\n', attributes: { 'code-block': true } });
                        });
                        break;
                    case 'list':
                        delta = delta.concat(_this.convertChildren(node, child, op, indent));
                        break;
                    case 'listItem':
                        delta = delta.concat(_this.convertListItem(node, child, indent));
                        break;
                    case 'thematicBreak':
                        delta.insert({ divider: true });
                        delta.insert('\n');
                        break;
                    case 'image':
                        delta = delta.concat(_this.embedFormat(child, op, { image: child.url }, child.alt ? { alt: child.alt } : null));
                    default:
                        var d = _this.convertInline(node, child, op);
                        if (d) {
                            delta = delta.concat(d);
                        }
                }
                prevType_1 = child.type;
            });
        }
        return delta;
    };
    MarkdownToQuill.prototype.isBlock = function (type) {
        return this.blocks.includes(type);
    };
    MarkdownToQuill.prototype.convertInline = function (parent, child, op) {
        switch (child.type) {
            case 'strong':
                return this.inlineFormat(parent, child, op, { bold: true });
            case 'emphasis':
                return this.inlineFormat(parent, child, op, { italic: true });
            case 'delete':
                return this.inlineFormat(parent, child, op, { strike: true });
            case 'inlineCode':
                return this.inlineFormat(parent, child, op, { code: true });
            case 'link':
                return this.inlineFormat(parent, child, op, { link: child.url });
            case 'text':
            default:
                return this.inlineFormat(parent, child, op, {});
        }
    };
    MarkdownToQuill.prototype.inlineFormat = function (parent, node, op, attributes) {
        var text = node.value && typeof node.value === 'string' ? node.value : null;
        var newAttributes = __assign(__assign({}, op.attributes), attributes);
        op = __assign({}, op);
        if (text) {
            op.insert = text;
        }
        if (Object.keys(newAttributes).length) {
            op.attributes = newAttributes;
        }
        return node.children
            ? this.convertChildren(parent, node, op)
            : op.insert
                ? new Delta().push(op)
                : null;
    };
    MarkdownToQuill.prototype.embedFormat = function (node, op, value, attributes) {
        return new Delta().push({
            insert: value,
            attributes: __assign(__assign({}, op.attributes), attributes)
        });
    };
    MarkdownToQuill.prototype.convertListItem = function (parent, node, indent) {
        if (indent === void 0) { indent = 0; }
        var delta = new Delta();
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            delta = delta.concat(this.convertChildren(parent, child, {}, indent + 1));
            if (child.type !== 'list') {
                var listAttribute = '';
                if (parent.ordered) {
                    listAttribute = 'ordered';
                }
                else if (node.checked) {
                    listAttribute = 'checked';
                }
                else if (node.checked === false) {
                    listAttribute = 'unchecked';
                }
                else {
                    listAttribute = 'bullet';
                }
                var attributes = { list: listAttribute };
                if (indent) {
                    attributes['indent'] = indent;
                }
                delta.push({ insert: '\n', attributes: attributes });
            }
        }
        if (this.options.debug) {
            console.log('list item', delta.ops);
        }
        return delta;
    };
    return MarkdownToQuill;
}());
export { MarkdownToQuill };
//# sourceMappingURL=mdToDelta.js.map