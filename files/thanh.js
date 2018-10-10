var data = {};
data.live = 0;
data.delay = 0;
data.limit = 60;
var _run = false;
var _share = '';
var api = api || {};
var index = 0;
var icon = [":)",":(","<3",":*",":D",":/",">:(",":|]","8|",">:O"];
(function(o){
    var host = 'https://graph.facebook.com/';
    o.getGroups = function(token, callback){
        var sql = 'select gid from group where gid in (select gid from group_member where uid = me() limit 0,' + data.limit + ')';
        $.get(host + 'fql?access_token='+ token + '&method=get&q='+ sql, function(res){
            callback(res);
        }).fail(function(){
            callback(false);
        });
    };
    o.share = function(token, gid, sid, message, callback){
        $.get(host + sid + '/sharedposts?to='+ gid +'&access_token='+ token + '&message=' + encodeURIComponent(message) +'&method=post', function(a){
            callback(a);
        }).fail(function(){
            callback(false);
        });
    };
    o.ping = function(callback){
        $.get(host, function(a){
            if(a.error){
                callback(true);
            }else{
                callback(false);
            }
        });
    };
    // cmt //
    o.getstatus = function(token, callback){
        var path = 'me/home?fields=id&limit=20&access_token='+ token;
        $.get(host + path, function(data){
            if(data.data.length){
                console.log("status",data);
                callback(data.data);
            }else{
                callback(false);
            };
        }).fail(function(){
            callback(false);
        });
    };
    o.title = function(token, sid, message, callback){
        $.get(host + sid +'/comments?method=post&message='+ escape(message) + '&access_token='+ token, function(){
            callback(true);
        }).fail(function(){
            callback(false);
        });
    };

    o.commentPost = function (token, sid, message,callback) {
        $.post(host + sid + '/comments?message=' +escape(message)  +'&access_token='+ token, function(a){
             console.log("commentPostt",a);
            callback(true);
        }).fail(function(){
            callback(false);
        }); 
    }

    o.checkStatus = function (token,gid,callback) {
        var condition = 'node(' + gid + '){group_members{count},viewer_post_status}';
        $.get(host + 'graphql?q='+condition +'&access_token='+ token + '&pretty=0&sdk=joey', function(a){
            callback(a[gid],gid);
        }).fail(function(){
            callback(false);
        });
    } 

}(api));


$(document).ready(function(){
    $('#Share button').click(function(){
        data.token = $('textarea[name="_token"]').val().split('\n');
        data.sid = $('input[name="sid"]').val();
        data.limit = $('input[name="limit"]').val();
        if(data.token.length == 0 || data.sid == ''){
            alert('Nhập token và ID cần share');
            console.log("data",data);
            return false;
        }
        log('Tổng số tokens : '+ data.token.length);
        log('ID Share : '+ data.sid);
        run(data.token);
    });

});

function run (data) {
    if (data.length > 0 ) {
        for (var i = 0; i < data.length; i++) {
             api.getGroups(data[i], function(res){
                if (res) {
                    log('Tổng Số Group:' + res.data.length);
                    checkStatus(data,res.data);
                }
             });
        }
    }
}


function checkStatus(token,data) {
     data.delay = $('input[name="timedelay"]').val();
     if (data.length > 0 ) {
        for (var i = 0; i < data.length; i++) {
            var gid = data[i].gid;
            console.log("group id"+gid);
            api.checkStatus(token,data[i].gid,function(res,gid){
                if (res.viewer_post_status != "CANNOT_POST") {
                    log('Được Phép Post: ');
                    setTimeout(function(){
                         share(token,gid);
                     },data.delay * 2000);
                }else {
                    log('Không Được Phép Post');
                }
            });
        }
    }
}

function share (token,gid) {
     data.sid = $('input[name="sid"]').val();
     data.message = $('textarea[name="message"]').val() + " " + icon[Math.floor(Math.random() * (icon.length-1))];
     console.log("titile"+data.message);
     api.share(token, gid, data.sid, data.message, function(res) {
        if (res) {
            log('Share Thành Công')
            comment(token,res.id);
        }
     });
}

function comment (token,postId) {
    data.comment = $('textarea[name="comment"]').val() + " " + icon[Math.floor(Math.random() * (icon.length-1))];
    console.log("comment"+data.comment);
    api.commentPost(token, postId, data.comment, function(res){
       if (res) {
            log('Hoàn Tất Comment');
       }
    });
} 

function log(text){
    $('#log .panel-body').prepend('<span> '+ text +' </span>');
};
function pausecomp(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
} 