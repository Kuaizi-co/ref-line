/*!
 * 原项目地址regex-cache <https://github.com/think2011/ref-line>
 * 筷子改造后项目地址 <https://github.com/Kuaizi-co/ref-line>
 * Copyright (c) 2015 yonghuang & ruilin.
 * Licensed under the MIT license.
 */

let lines = {
    xt: null,
    xc: null,
    xb: null,
    yl: null,
    yc: null,
    yr: null,
}

// 置入参考线
for (let p in lines) {
    let node = lines[p] = document.createElement('div')

    node.classList.add('ref-line', p)
    node.style.cssText = `display:none;opacity:0.7;position:absolute;background:#4DAEFF;z-index:199111250;${p[0] === 'x' ? 'width:100%;height:1px;left:0;' : 'width:1px;height:100%;top:0;'}`

    // 挂上一些辅助方法
    node.show   = function () {
        this.style.display = 'block'
    }
    node.hide   = function () {
        this.style.display = 'none'
    }
    node.isShow = function () {
        return this.style.display !== 'none'
    }
    document.body.appendChild(node)
}

class RefLine {
    constructor(options = {}) {
        this.options = Object.assign({
            gap: 3
        }, options)
    }

    /**
     * @param dragNode {Element} 拖拽元素的原生node
     * @param checkNodes {String|Element} 选择器 或者 原生node集合
     * @param relativeParent {String|Element} 选择器 或者 原生node集合 表示他绝对位置所在的父集元素，默认不传是body
     */
    check(options) {
        let {dragNode, checkNodes, relativeParent} = options
        // relativeParent  = typeof relativeParent === 'string' ? document.querySelectorAll(relativeParent) : relativeParent
        if (relativeParent) {
            relativeParent =  typeof relativeParent === 'string' ? document.querySelector(relativeParent) : relativeParent 
        } else {
          relativeParent = document.body
        }
        checkNodes      = typeof checkNodes === 'string' ? document.querySelectorAll(checkNodes) : checkNodes
        let dragRect    = dragNode.getBoundingClientRect()
        let relativeParentRect    = relativeParent.getBoundingClientRect()
        this.uncheck()
        Array.from(checkNodes).forEach((item) => {
            item.classList.remove('ref-line-active')

            if (item === dragNode) return
            // let {itemTop, height, itemBottom, itemLeft, width, itemRight} = item.getBoundingClientRect()
            let {top, height, bottom, left, width, right} = item.getBoundingClientRect()
            // 获取相对位置
            let dragWidthHalf                             = dragRect.width / 2
            let itemWidthHalf                             = width / 2
            let dragHeightHalf                            = dragRect.height / 2
            let itemHeightHalf                            = height / 2
            let conditions = {
                top: [
                    // xt-top 辅助线出现在非拖拽item的上方 拖拽元素的上方
                    {
                        isNearly : this._isNearly(dragRect.top, top),
                        lineNode : lines.xt,
                        lineValue: top,
                        dragValue: top - dragRect.top
                    },
                    // xt-bottom 辅助线出现在非拖拽item的上方 拖拽元素的下方
                    {
                        isNearly : this._isNearly(dragRect.bottom, top),
                        lineNode : lines.xt,
                        lineValue: top,
                        dragValue: top - dragRect.bottom
                    },
                    // xc 中心线
                    {
                        isNearly : this._isNearly(dragRect.top + dragHeightHalf, top + itemHeightHalf),
                        lineNode : lines.xc,
                        lineValue: top + itemHeightHalf,
                        dragValue: top + itemHeightHalf - dragHeightHalf - dragRect.top
                    },
                    // xb-top 辅助线出现在非拖拽item的下方 拖拽元素的下方
                    {
                        isNearly : this._isNearly(dragRect.bottom, bottom),
                        lineNode : lines.xb,
                        lineValue: bottom,
                        dragValue: bottom - dragRect.bottom
                    },
                    // xb-bottom 辅助线出现在非拖拽item的下方 拖拽元素的上方
                    {
                        isNearly : this._isNearly(dragRect.top, bottom),
                        lineNode : lines.xb,
                        lineValue: bottom,
                        dragValue: dragRect.top - bottom
                    },
                ],

                left: [
                    // yl-left 辅助线出现在非拖拽item的左方 拖拽元素的左方
                    {
                        isNearly : this._isNearly(dragRect.left, left),
                        lineNode : lines.yl,
                        lineValue: left,
                        dragValue: left - dragRect.left
                    },
                    // yl-right 辅助线出现在非拖拽item的左方 拖拽元素的右方
                    {
                        isNearly : this._isNearly(dragRect.right, left),
                        lineNode : lines.yl,
                        lineValue: left,
                        dragValue: left - dragRect.right
                    },
                    // yc 中心
                    {
                        isNearly : this._isNearly(dragRect.left + dragWidthHalf, left + itemWidthHalf),
                        lineNode : lines.yc,
                        lineValue: left + itemWidthHalf,
                        dragValue: left + itemWidthHalf - dragWidthHalf - dragRect.left
                    },
                    // yr-left 辅助线出现在非拖拽item的右方 拖拽元素的右方
                    {
                        isNearly : this._isNearly(dragRect.right, right),
                        lineNode : lines.yr,
                        lineValue: right,
                        dragValue: right - dragRect.right
                    },
                    // yr-right 辅助线出现在非拖拽item的右方 拖拽元素的左方
                    {
                        isNearly : this._isNearly(dragRect.left, right),
                        lineNode : lines.yr,
                        lineValue: right,
                        dragValue: right - dragRect.left
                    },
                ]
            }

            for (let key in conditions) {
                // 遍历符合的条件并处理
                conditions[key].forEach((condition, index) => {
                    if (!condition.isNearly) return
                    item.classList.add('ref-line-active')
                    // dragNode.style[key]           = `${parseInt(condition.dragValue) - parseInt(relativeParentRect[key])}px`
                    dragNode.style[key]           = `${parseInt(dragNode.style[key]) + parseInt(condition.dragValue)}px`
                    condition.lineNode.style[key] = `${condition.lineValue}px`
                    condition.lineNode.show()
                })
            }
        })
    }

    uncheck() {
        Object.values(lines).forEach((item) => item.hide())
        Array.from(document.querySelectorAll('.ref-line-active')).forEach((item) => item.classList.remove('ref-line-active'))
    }

    _isNearly(dragValue, targetValue) {
        return Math.abs(dragValue - targetValue) <= this.options.gap
    }
}

module.exports = RefLine