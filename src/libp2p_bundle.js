const Multiplex = require('libp2p-mplex') 
const SECIO = require('libp2p-secio')
const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const defaultsDeep = require('@nodeutils/defaults-deep')
const DEFAULT_OPTS = {
  modules: {
    transport: [
      TCP
    ],
    connEncryption: [
      SECIO
    ],
    streamMuxer: [
      Multiplex
    ]
  }
}
class P2PNode extends Libp2p {
  constructor (opts) {
    super(defaultsDeep(opts, DEFAULT_OPTS))
  }
}
module.exports = P2PNode