'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./libp2p_bundle')
const pull = require('pull-stream')
const async = require('async')
const chalk = require('chalk');
const emoji = require('node-emoji')
const Pushable = require('pull-pushable')
const p = Pushable()
let moonPeerId

async.parallel([
    (callback) => {
        PeerId.createFromJSON(require('../ids/earthId'), (err, earthPeerId) => {
            if (err) {
                throw err
            }
            callback(null, earthPeerId)
        })
    },
    (callback) => {
        PeerId.createFromJSON(require('../ids/moonId'), (err, moonPeerId) => {
            if (err) {
                throw err
            }
            callback(null, moonPeerId)
        })
    }
], (err, ids) => {
    if (err) throw err
    const earthPeerInfo = new PeerInfo(ids[0])
    earthPeerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/0')
    const nodeDialer = new Node({ peerInfo: earthPeerInfo })

    const moonPeerInfo = new PeerInfo(ids[1])
    moonPeerId = ids[1]
    moonPeerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/10333')
    nodeDialer.start((err) => {
        if (err) {
            throw err
        }

        console.log(emoji.get('large_blue_circle'), chalk.blue(' Earth Ready '),
                    emoji.get('headphones'), chalk.blue(' Listening on: '));

        nodeDialer.dialProtocol(moonPeerInfo, '/chat/1.0.0', (err, conn) => {
            if (err) {
                throw err
            }
            console.log('\n' + emoji.get('large_blue_circle'),
                        chalk.blue(' Earth dialed to Moon on protocol: /chat/1.0.0'));
            console.log(`${emoji.get('incoming_envelope')}
                         ${chalk.bold(`Type a message and press enter. See what happens...`)}`)
            // Write operation. Data sent as a buffer
            pull(
                p,
                conn
            )
            // Sink, data converted from buffer to utf8 string
            pull(
                conn,
                pull.map((data) => {
                    return data.toString('utf8').replace('\n', '')
                }),
                pull.drain(console.log)
            )

            process.stdin.setEncoding('utf8')
            process.openStdin().on('data', (chunk) => {
                var data = chunk.toString()
                var data = `${chalk.blue("Message received from Earth: ")}\n\n`
                + chunk.toString() + `\n${emoji.get('incoming_envelope')}
                ${chalk.blue("  Send message from Moon:")}`
                
                p.push(data)
            })
        })
    })
})