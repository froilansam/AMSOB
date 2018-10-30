$(document).ready(function(){
    var notifCount=0;

    $(document).on('click', '.notifArticle', function(){
        var url = $(this).attr('url');
        var notifMessage = $(this).attr('notifmessage');

        $.post('/read/notif', {
            notifMessage: notifMessage,
        }).then(function(data){
            if(data.indicator){
                location.href = url;
            }
        })
        

    })

    $.post('/get/notif').then(function(data){
        if(data.indicator){
            notifCount = data.notifications.length;
            $('#numberNotif').text(notifCount);						
            console.log(data.notifications.length)
                
            for(var i = 0; i < notifCount; i++){
                console.log(data.notifications[i].strNotifMessage)
                if(data.notifications[i].strNotifMessage == 'New Consignor sent an application.'){	
                    $('#notificationField').append(`<a class="notifArticle" notifmessage="${data.notifications[i].strNotifMessage}" url="/evaluation/consignor">
                        <div class="media">
                            <div class="media-left align-self-center"><i class="ft-user-plus icon-bg-circle bg-gradient-x-blue"></i></div>									
                            <div class="media-body">
                                <h6 class="media-heading">${data.notifications[i].strNotifMessage}</h6>
                                <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${data.notifications[i].datNotifDate}</time></small></div>
                        </div>
                    </a>`)
                }
                else if(data.notifications[i].strNotifMessage == 'New Bidder sent an application.'){
                    $('#notificationField').append(`<a class="notifArticle" notifmessage="${data.notifications[i].strNotifMessage}" url="/evaluation/bidder">
                        <div class="media">
                            <div class="media-left align-self-center"><i class="ft-user-plus icon-bg-circle bg-gradient-x-yellow"></i></div>
                            <div class="media-body">
                                <h6 class="media-heading">${data.notifications[i].strNotifMessage}</h6>
                                <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${data.notifications[i].datNotifDate}</time></small></div>
                        </div>
                    </a>`)
                }
                else if(data.notifications[i].strNotifMessage == 'New pending award payment.'){
                    $('#notificationField').append(`<a class="notifArticle" notifmessage="${data.notifications[i].strNotifMessage}" url="/awards">
                        <div class="media">
                            <div class="media-left align-self-center"><i class="ft-credit-card icon-bg-circle bg-gradient-x-yellow"></i></div>								
                            <div class="media-body">
                                <h6 class="media-heading">${data.notifications[i].strNotifMessage}</h6>
                                <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${data.notifications[i].datNotifDate}</time></small></div>
                        </div>
                    </a>`)
                }
                else if(data.notifications[i].strNotifMessage == 'New pending registration payment.'){
                    $('#notificationField').append(`<a class="notifArticle" notifmessage="${data.notifications[i].strNotifMessage}" url="/verify/bidder">
                        <div class="media">
                            <div class="media-left align-self-center"><i class="ft-credit-card icon-bg-circle bg-gradient-x-blue"></i></div>								
                            <div class="media-body">
                                <h6 class="media-heading">${data.notifications[i].strNotifMessage}</h6>
                                <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${data.notifications[i].datNotifDate}</time></small></div>
                        </div>
                    </a>`)

                }
            }
        }
    })

    var hostname = $('#hostname').val();
    var port = $('#port').val();
    var socket = io(`http://${hostname}:${port}`);

    socket.on('newNotif', function(message, read, date){

        var snd = new Audio("/notif.mp3");
        snd.play();
        snd.currentTime=0;

        if(message == 'New Consignor sent an application.'){
            $('#notificationField').append(`<a class="notifArticle" notifmessage="${message}" url="/evaluation/consignor">
                <div class="media">
                    <div class="media-left align-self-center"><i class="ft-user-plus icon-bg-circle bg-gradient-x-blue"></i></div>
                    <div class="media-body">
                        <h6 class="media-heading">${message}</h6>
                        <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${date}</time></small></div>
                </div>
            </a>`)
            notifCount++
            $('#numberNotif').text(notifCount);
        }
        else if(message == 'New pending award payment.'){
            $('#notificationField').append(`<a class="notifArticle" notifmessage="${message}" url="/awards">
                <div class="media">
                    <div class="media-left align-self-center"><i class="ft-credit-card icon-bg-circle bg-gradient-x-yellow"></i></div>								
                    <div class="media-body">
                        <h6 class="media-heading">${message}</h6>
                        <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${date}</time></small></div>
                </div>
            </a>`)
            notifCount++
            $('#numberNotif').text(notifCount);
        }
        else if(message == 'New Bidder sent an application.'){
            $('#notificationField').append(`<a class="notifArticle" notifmessage="${message}" url="/evaluation/bidder">
                <div class="media">
                    <div class="media-left align-self-center"><i class="ft-user-plus icon-bg-circle bg-gradient-x-yellow"></i></div>								
                    <div class="media-body">
                        <h6 class="media-heading">${message}</h6>
                        <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${date}</time></small></div>
                </div>
            </a>`)
            notifCount++
            $('#numberNotif').text(notifCount);

        }
        else if(message == 'New pending registration payment.'){
            $('#notificationField').append(`<a class="notifArticle" notifmessage="${message}" url="/verify/bidder">
                <div class="media">
                    <div class="media-left align-self-center"><i class="ft-credit-card icon-bg-circle bg-gradient-x-blue"></i></div>								
                    <div class="media-body">
                        <h6 class="media-heading">${message}</h6>
                        <p class="notification-text font-small-3 text-muted">Unread</p><small><time class="media-meta text-muted" datetime="2015-06-11T18:29:20+08:00">${date}</time></small></div>
                </div>
            </a>`)
            notifCount++
            $('#numberNotif').text(notifCount);

        }
    })		
})