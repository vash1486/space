const jwt = require('socketio-jwt');

module.exports = function(io) {
    io.sockets
        .on('connection', jwt.authorize({
            secret: 'chiave-segretissima',
            timeout: 15000 // 15 seconds to send the authentication message
        }))
        .on('authenticated', function(socket) {
            console.log('loggato!');
            console.log(socket.decoded_token);
            socket.emit('connected');
            // socket.broadcast.emit('character-connected', socket.handshake.query.user);

            socket
                .on('disconnect', function() {
                    console.log('disconnesso!');
                })
                .on('chat-message', function(msg) {
                    io.emit('chat-message', socket.decoded_token.user.username, msg);
                });
        });
};

/*
    socket.emit('connected');
    socket.emit('contact-list', getUsers());

    for (let a = 0; a < users[uname].messages.length; a++) {
        socket.emit('chat-message', users[uname].messages[a].s, users[uname].messages[a].m);
    }

    socket.on('disconnect', function() {
        let uname = socket.handshake.query.user;
        if (typeof users[uname] === 'undefined')
            return;
        let id = users[uname].connections.indexOf(socket);
        if (id > -1)
            users[uname].connections.splice(id, 1);
        if (users[uname].connections.length < 1)
            socket.broadcast.emit('contact-disconnected', uname);
    });

    socket.on('chat-message', function(sender, target, msg) {
        if (typeof users[target] === 'undefined')
            return;
        users[target].messages.push({
            s: sender,
            m: msg
        });

        for (let a in users[target].connections) {
            users[target].connections[a].emit('chat-message', sender, msg);
        }
    });

    socket.on('broadcast-message', function(sender, msg) {
        io.emit('chat-message', sender, msg);
    });

    socket.on('chat-typing', function(sender, target) {
        if (typeof users[target] === 'undefined')
            return;

        for (let a in users[target].connections) {
            users[target].connections[a].emit('chat-typing', sender);
        }
    });
    */
