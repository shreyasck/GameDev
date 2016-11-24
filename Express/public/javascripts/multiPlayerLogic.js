/**
 * Created by Nasir on 11/24/2016.
 */
var socket = io();
$('form').submit(function(){
    /* socket.emit('fromClientToServer', $('#m').val(), function (data) {
     $('#messages').append($('<li>').text('reply from server'));
     $('#messages').append($('<li>').text(data));
     });
     // $('#m').val('');
     return false;
     });*/

    socket.emit('fromClientToClient', $('#m').val(), function (data) {
        $('#messages').append($('<li>').text('reply from server: '+ data));
    });
    // $('#m').val('');
    return false;
});

socket.on('welcomeMessage', function(msg){
    $('#messages').append($('<li>').text(msg));
    //alert(socket.id);
    // alert();

    socket.emit('newClient', ' ', function (data) {
        $('#messages').append($('<li>').text('Message from server: ' + data));
    });
});

socket.on('privateMessage', function(msg){
    $('#messages').append($('<li>').text(msg));
    //alert(socket.id);
    // alert();

    socket.emit('newClient', ' ', function (data) {
        $('#messages').append($('<li>').text('private Message: '+ data));
    });
});
