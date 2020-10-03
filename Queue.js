const VALUE = 0
const NEXT = 1
module.exports = class Queue {
    constructor (value) {
        let node = (value == null) ? null : this.node(value)
        this._head = node
        this._tail = node
        this.length = node ? 1 : 0
    }

    node (value) {
        return [value, null]
    }

    enqueue (value) {
        const node = this.node(value)
        if (this.length === 0) {
            this._head = node
            this._tail = node
        } else {
            this._tail[NEXT] = node
            this._tail = node
        }

        this.length += 1
    }

    dequeue () {
        if (this.length) {
            const value = this._head[VALUE]
            this._head = this._head[NEXT]
            if (this._head == null) this._tail = null
            this.length -= 1
            return value
        }
    }
}